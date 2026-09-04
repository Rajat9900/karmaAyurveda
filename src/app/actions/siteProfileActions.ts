'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface SiteProfileItem {
  id: number;
  name: string;
  logo: string;
  favicon: string;
  email: string;
  phone: string;
  us_phone: string;
  address: string;
  x_link?: string;
  fb_link?: string;
  ig_link?: string;
  yt_link?: string;
  wa_number?: string;
  wa_channel?: string;
  nabh_logo?: string;
  nabh_cert_num?: string;
  nabh_duration?: string;
  total_hospitals: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch the global site profile settings (ID = 1).
 */
export async function getSiteProfileAction(): Promise<SiteProfileItem | null> {
  try {
    const profiles = await query<SiteProfileItem[]>(
      'SELECT * FROM site_profile WHERE id = 1 LIMIT 1'
    );
    if (profiles.length > 0) {
      return profiles[0];
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch site profile:', error);
    return null;
  }
}

/**
 * Update the global site profile settings (ID = 1).
 */
export async function updateSiteProfileAction(profileData: Omit<SiteProfileItem, 'id' | 'created_at' | 'updated_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const {
    name, logo, favicon, email, phone, us_phone, address,
    x_link, fb_link, ig_link, yt_link, wa_number, wa_channel,
    nabh_logo, nabh_cert_num, nabh_duration, total_hospitals
  } = profileData;

  if (!name || !logo || !favicon || !email || !phone || !us_phone || !address) {
    return { success: false, error: 'Name, Logo, Favicon, Email, Phone, US Phone, and Address are required fields.' };
  }

  try {
    // Check if ID 1 exists, if not insert, else update
    const existing = await query('SELECT id FROM site_profile WHERE id = 1 LIMIT 1');
    
    if (existing.length === 0) {
      await query(`
        INSERT INTO site_profile (
          id, name, logo, favicon, email, phone, us_phone, address,
          x_link, fb_link, ig_link, yt_link, wa_number, wa_channel,
          nabh_logo, nabh_cert_num, nabh_duration, total_hospitals
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name, logo, favicon, email, phone, us_phone, address,
        x_link || null, fb_link || null, ig_link || null, yt_link || null,
        wa_number || null, wa_channel || null, nabh_logo || null,
        nabh_cert_num || null, nabh_duration || null,
        total_hospitals !== undefined && total_hospitals !== null ? Number(total_hospitals) : 0
      ]);
    } else {
      await query(`
        UPDATE site_profile SET
          name = ?, logo = ?, favicon = ?, email = ?, phone = ?, us_phone = ?, address = ?,
          x_link = ?, fb_link = ?, ig_link = ?, yt_link = ?, wa_number = ?, wa_channel = ?,
          nabh_logo = ?, nabh_cert_num = ?, nabh_duration = ?, total_hospitals = ?
        WHERE id = 1
      `, [
        name, logo, favicon, email, phone, us_phone, address,
        x_link || null, fb_link || null, ig_link || null, yt_link || null,
        wa_number || null, wa_channel || null, nabh_logo || null,
        nabh_cert_num || null, nabh_duration || null,
        total_hospitals !== undefined && total_hospitals !== null ? Number(total_hospitals) : 0
      ]);
    }

    revalidatePath('/admin/site-profile');
    return { success: true };
  } catch (error) {
    console.error('Failed to update site profile:', error);
    return { success: false, error: 'Failed to save settings to the database.' };
  }
}
