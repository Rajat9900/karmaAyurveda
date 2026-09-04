'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface ServiceLocation {
  id: string;
  slug: string;
  name: string;
  title?: string;
  content?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  map_url?: string;
  image?: string;
  created_at?: string;
}

/**
 * Public Server Action to fetch all "Other Locations We Serve" entries.
 */
export async function getLocationsAction(): Promise<ServiceLocation[]> {
  try {
    const locations = await query<ServiceLocation[]>(
      'SELECT id, slug, name, title, content, address, city, phone, email, map_url, image, created_at FROM service_locations ORDER BY id DESC'
    );
    return locations;
  } catch (error) {
    console.error('Failed to fetch service locations from DB:', error);
    return [];
  }
}

/**
 * Public Server Action to fetch a single service location by its slug,
 * used for the location's own detail page (e.g. /panchkarma-center/{slug}).
 */
export async function getLocationBySlugAction(slug: string): Promise<ServiceLocation | undefined> {
  try {
    const locations = await query<ServiceLocation[]>(
      'SELECT id, slug, name, title, content, address, city, phone, email, map_url, image, created_at FROM service_locations WHERE slug = ? LIMIT 1',
      [slug]
    );
    return locations[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch service location with slug "${slug}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to get a single service location by ID.
 */
export async function getLocationByIdAction(id: string): Promise<ServiceLocation | undefined> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return undefined;
  }
  try {
    const locations = await query<ServiceLocation[]>(
      'SELECT id, slug, name, title, content, address, city, phone, email, map_url, image, created_at FROM service_locations WHERE id = ? LIMIT 1',
      [id]
    );
    return locations[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch service location with ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new service location.
 */
export async function createLocationAction(locationData: Omit<ServiceLocation, 'id'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { slug, name, title, content, address, city, phone, email, map_url, image } = locationData;

  if (!slug || !name || !address || !city || !phone || !email) {
    return { success: false, error: 'Slug, Name, Address, City, Phone, and Email are required fields.' };
  }

  try {
    const existing = await query('SELECT id FROM service_locations WHERE slug = ? LIMIT 1', [slug]);
    if (existing.length > 0) {
      return { success: false, error: 'A location with this slug already exists.' };
    }

    const result = await query<any>(
      `INSERT INTO service_locations (slug, name, title, content, address, city, phone, email, map_url, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        name,
        title || '',
        content || '',
        address,
        city,
        phone,
        email,
        map_url || '',
        image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
      ]
    );

    revalidatePath('/our-clinics');
    revalidatePath('/admin/dashboard');

    return { success: true, id: result.insertId };
  } catch (error) {
    console.error('Failed to create service location:', error);
    return { success: false, error: 'Failed to write location to database.' };
  }
}

/**
 * Admin Server Action to update an existing service location.
 */
export async function updateLocationAction(id: string, locationData: Partial<Omit<ServiceLocation, 'id'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(locationData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields to update.' };
  }

  if (locationData.slug) {
    const existing = await query('SELECT id FROM service_locations WHERE slug = ? AND id != ? LIMIT 1', [locationData.slug, id]);
    if (existing.length > 0) {
      return { success: false, error: 'Another location is already using this slug.' };
    }
  }

  try {
    params.push(id);
    await query(`UPDATE service_locations SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/our-clinics');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to update service location:', error);
    return { success: false, error: 'Failed to update location in database.' };
  }
}

/**
 * Admin Server Action to delete a service location.
 */
export async function deleteLocationAction(id: string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM service_locations WHERE id = ?', [id]);

    revalidatePath('/our-clinics');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete service location:', error);
    return { success: false, error: 'Failed to delete location from database.' };
  }
}

/**
 * Admin Server Action to upload a service location's featured image.
 */
export async function uploadLocationImageAction(formData: FormData) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const file = formData.get('image') as File;
  if (!file || file.size === 0) {
    return { success: false, error: 'No file uploaded.' };
  }

  try {
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'upload', 'locations');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return { success: true, url: `/upload/locations/${filename}` };
  } catch (error) {
    console.error('Location image upload error:', error);
    return { success: false, error: 'Failed to save uploaded image.' };
  }
}

// ==========================================
// Location <-> Disease Links
// (which "locations we serve" should show up on a given disease's page)
// ==========================================

/**
 * Admin Server Action to fetch every location -> linked disease IDs mapping in one query,
 * used to pre-fill the "Linked Diseases" checkboxes when editing a location.
 */
export async function getLocationDiseaseLinksAction(): Promise<Record<number, number[]>> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return {};
  }
  try {
    const rows = await query<{ location_id: number; disease_id: number }[]>(
      'SELECT location_id, disease_id FROM location_diseases'
    );
    const map: Record<number, number[]> = {};
    for (const row of rows) {
      if (!map[row.location_id]) map[row.location_id] = [];
      map[row.location_id].push(row.disease_id);
    }
    return map;
  } catch (error) {
    console.error('Failed to fetch location-disease links:', error);
    return {};
  }
}

/**
 * Admin Server Action to replace the set of diseases linked to a location.
 */
export async function setLocationDiseaseLinksAction(locationId: number | string, diseaseIds: number[]) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }
  try {
    await query('DELETE FROM location_diseases WHERE location_id = ?', [locationId]);
    for (const diseaseId of diseaseIds) {
      await query(
        'INSERT IGNORE INTO location_diseases (location_id, disease_id) VALUES (?, ?)',
        [locationId, diseaseId]
      );
    }
    revalidatePath('/all-diseases');
    return { success: true };
  } catch (error) {
    console.error(`Failed to set disease links for location "${locationId}":`, error);
    return { success: false, error: 'Failed to update linked diseases.' };
  }
}

/**
 * Public Server Action to fetch every location linked to a given disease,
 * used on the disease detail page's "Locations We Serve" section.
 */
export async function getLocationsForDiseaseAction(diseaseId: number | string): Promise<ServiceLocation[]> {
  try {
    const locations = await query<ServiceLocation[]>(
      `SELECT sl.id, sl.slug, sl.name, sl.title, sl.content, sl.address, sl.city, sl.phone, sl.email, sl.map_url, sl.image, sl.created_at
       FROM service_locations sl
       INNER JOIN location_diseases ld ON ld.location_id = sl.id
       WHERE ld.disease_id = ?
       ORDER BY sl.name ASC`,
      [diseaseId]
    );
    return locations;
  } catch (error) {
    console.error(`Failed to fetch locations for disease "${diseaseId}":`, error);
    return [];
  }
}
