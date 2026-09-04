'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface SiteFaqItem {
  id: number;
  question: string;
  answer: string;
  sorting: number;
  created_at?: string;
}

/**
 * Public Server Action to fetch all site FAQs.
 * Sorted by sorting ASC, then id DESC.
 */
export async function getSiteFaqsAction(): Promise<SiteFaqItem[]> {
  try {
    const faqs = await query<SiteFaqItem[]>(
      'SELECT * FROM site_faq ORDER BY sorting ASC, id DESC'
    );
    return faqs;
  } catch (error) {
    console.error('Failed to fetch site FAQs:', error);
    return [];
  }
}

/**
 * Admin Server Action to create a new site FAQ.
 */
export async function createSiteFaqAction(faqData: Omit<SiteFaqItem, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { question, answer, sorting } = faqData;

  if (!question || !answer) {
    return { success: false, error: 'Question and Answer are required fields.' };
  }

  try {
    await query(
      `INSERT INTO site_faq (question, answer, sorting) VALUES (?, ?, ?)`,
      [
        question,
        answer,
        sorting !== undefined && sorting !== null ? Number(sorting) : 0
      ]
    );

    revalidatePath('/admin/site-faqs');
    return { success: true };
  } catch (error) {
    console.error('Failed to create site FAQ:', error);
    return { success: false, error: 'Failed to write site FAQ to database.' };
  }
}

/**
 * Admin Server Action to update an existing site FAQ.
 */
export async function updateSiteFaqAction(id: number | string, faqData: Partial<Omit<SiteFaqItem, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(faqData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(key === 'sorting' ? Number(val) : val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  try {
    params.push(id);
    await query(`UPDATE site_faq SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/site-faqs');
    return { success: true };
  } catch (error) {
    console.error('Failed to update site FAQ:', error);
    return { success: false, error: 'Failed to update site FAQ in database.' };
  }
}

/**
 * Admin Server Action to delete a site FAQ.
 */
export async function deleteSiteFaqAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM site_faq WHERE id = ?', [id]);
    revalidatePath('/admin/site-faqs');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete site FAQ:', error);
    return { success: false, error: 'Failed to delete site FAQ from database.' };
  }
}
