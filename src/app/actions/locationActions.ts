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
  tag_ids?: number[];
  tag_names?: string[];
}

/**
 * Public Server Action to fetch all "Other Locations We Serve" entries, joined with their
 * linked tags (shared clinic_tags pool via the location_clinic_tags junction table).
 */
export async function getLocationsAction(): Promise<ServiceLocation[]> {
  try {
    const locations = await query<any[]>(
      `SELECT sl.id, sl.slug, sl.name, sl.title, sl.content, sl.address, sl.city, sl.phone, sl.email, sl.map_url, sl.image, sl.created_at,
        (SELECT GROUP_CONCAT(clinic_tag_id) FROM location_clinic_tags WHERE location_id = sl.id) AS tag_ids_str,
        (SELECT GROUP_CONCAT(ct.name) FROM location_clinic_tags lct JOIN clinic_tags ct ON lct.clinic_tag_id = ct.id WHERE lct.location_id = sl.id) AS tag_names_str
       FROM service_locations sl
       ORDER BY sl.id DESC`
    );
    return locations.map(l => ({
      ...l,
      tag_ids: l.tag_ids_str ? l.tag_ids_str.split(',').map((id: string) => parseInt(id)) : [],
      tag_names: l.tag_names_str ? l.tag_names_str.split(',') : []
    }));
  } catch (error) {
    console.error('Failed to fetch service locations from DB:', error);
    return [];
  }
}

/**
 * Public Server Action to fetch the "Other Locations We Serve" entries shown on /our-clinics:
 * only the "Ayurvedic Hospital in {city}" branch pages (slug prefixed accordingly) that are also
 * NOT linked to any disease. Locations linked to a disease already show up on that disease's own
 * page (under its "Locations We Serve" section), so this listing only needs to surface the
 * generic hospital-branch pages that wouldn't otherwise appear anywhere else on the site.
 */
export async function getUnlinkedLocationsAction(): Promise<ServiceLocation[]> {
  try {
    const locations = await query<any[]>(
      `SELECT sl.id, sl.slug, sl.name, sl.title, sl.content, sl.address, sl.city, sl.phone, sl.email, sl.map_url, sl.image, sl.created_at,
        (SELECT GROUP_CONCAT(clinic_tag_id) FROM location_clinic_tags WHERE location_id = sl.id) AS tag_ids_str,
        (SELECT GROUP_CONCAT(ct.name) FROM location_clinic_tags lct JOIN clinic_tags ct ON lct.clinic_tag_id = ct.id WHERE lct.location_id = sl.id) AS tag_names_str
       FROM service_locations sl
       WHERE sl.slug LIKE 'ayurvedic-hospital-in-%'
         AND NOT EXISTS (SELECT 1 FROM location_diseases ld WHERE ld.location_id = sl.id)
       ORDER BY sl.id DESC`
    );
    return locations.map(l => ({
      ...l,
      tag_ids: l.tag_ids_str ? l.tag_ids_str.split(',').map((id: string) => parseInt(id)) : [],
      tag_names: l.tag_names_str ? l.tag_names_str.split(',') : []
    }));
  } catch (error) {
    console.error('Failed to fetch unlinked service locations from DB:', error);
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
    const locations = await query<any[]>(
      `SELECT sl.id, sl.slug, sl.name, sl.title, sl.content, sl.address, sl.city, sl.phone, sl.email, sl.map_url, sl.image, sl.created_at,
        (SELECT GROUP_CONCAT(clinic_tag_id) FROM location_clinic_tags WHERE location_id = sl.id) AS tag_ids_str
       FROM service_locations sl
       WHERE sl.id = ? LIMIT 1`,
      [id]
    );
    if (!locations[0]) return undefined;
    return {
      ...locations[0],
      tag_ids: locations[0].tag_ids_str ? locations[0].tag_ids_str.split(',').map((tid: string) => parseInt(tid)) : []
    };
  } catch (error) {
    console.error(`Failed to fetch service location with ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new service location.
 */
export async function createLocationAction(locationData: Omit<ServiceLocation, 'id' | 'tag_ids' | 'tag_names'>, tagIds: number[] = []) {
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

    const newLocationId = result.insertId;
    if (newLocationId && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await query('INSERT INTO location_clinic_tags (location_id, clinic_tag_id) VALUES (?, ?)', [newLocationId, tagId]);
      }
    }

    revalidatePath('/our-clinics');
    revalidatePath('/admin/dashboard');

    return { success: true, id: newLocationId as number };
  } catch (error) {
    console.error('Failed to create service location:', error);
    return { success: false, error: 'Failed to write location to database.' };
  }
}

/**
 * Admin Server Action to update an existing service location.
 */
export async function updateLocationAction(id: string, locationData: Partial<Omit<ServiceLocation, 'id' | 'tag_ids' | 'tag_names'>>, tagIds?: number[]) {
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

  if (fields.length === 0 && tagIds === undefined) {
    return { success: false, error: 'No fields to update.' };
  }

  if (locationData.slug) {
    const existing = await query('SELECT id FROM service_locations WHERE slug = ? AND id != ? LIMIT 1', [locationData.slug, id]);
    if (existing.length > 0) {
      return { success: false, error: 'Another location is already using this slug.' };
    }
  }

  try {
    if (fields.length > 0) {
      params.push(id);
      await query(`UPDATE service_locations SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    if (tagIds !== undefined) {
      await query('DELETE FROM location_clinic_tags WHERE location_id = ?', [id]);
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          await query('INSERT INTO location_clinic_tags (location_id, clinic_tag_id) VALUES (?, ?)', [id, tagId]);
        }
      }
    }

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

const slugify = (text: string) =>
  text.toLowerCase().replace(/\//g, '-').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

// If a "Slug" column is mapped to a full URL column (e.g. a source CMS's page link) instead of
// a bare slug, take just the last path segment rather than storing the whole URL as the slug.
const normalizeSlugInput = (value: string) => {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return slugify(trimmed);
  try {
    const segments = new URL(trimmed).pathname.split('/').filter(Boolean);
    return slugify(segments[segments.length - 1] || '');
  } catch {
    const segments = trimmed.split('/').filter(Boolean);
    return slugify(segments[segments.length - 1] || '');
  }
};

export interface BulkLocationRow {
  name?: string;
  slug?: string;
  title?: string;
  content?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  map_url?: string;
  image?: string;
  tags?: string; // comma-separated tag names, resolved against the shared clinic_tags pool
}

export interface BulkImportResult {
  success: boolean;
  created: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

/**
 * Admin Server Action to bulk-import "Other Locations We Serve" entries from a parsed
 * CSV/Excel file. The client parses the file and maps its columns to these field names
 * before calling this action, so each row here already matches the BulkLocationRow shape.
 * Rows are processed independently — one bad row doesn't abort the whole import.
 *
 * The client sends rows in small batches rather than the whole file at once, since a
 * single large request/response for a big CSV can get truncated in transit. `rowOffset`
 * lets each batch report spreadsheet row numbers that stay accurate across batches.
 *
 * `diseaseIds` is a fixed set of diseases (chosen once in the admin UI) linked to every
 * location created in this batch — useful when a whole file is, say, all cancer-treatment
 * location pages that should all show up under the "Cancer" disease's Locations We Serve.
 */
export async function bulkImportLocationsAction(rows: BulkLocationRow[], rowOffset: number = 0, diseaseIds: number[] = []): Promise<BulkImportResult> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, created: 0, skipped: 0, errors: [{ row: 0, reason: 'Unauthorized' }] };
  }

  let created = 0;
  let skipped = 0;
  const errors: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = rowOffset + i + 2; // +1 for header row, +1 for 1-indexing — matches the row number the admin sees in their spreadsheet

    try {
      const name = (row.name || '').trim();
      const address = (row.address || '').trim();
      const city = (row.city || '').trim();
      const phone = (row.phone || '').trim();
      const email = (row.email || '').trim();

      // Only Name is required for bulk import — Address/City/Phone/Email are filled in from
      // the admin side later if the source file doesn't carry them (e.g. content-only CSVs).
      if (!name) {
        skipped++;
        errors.push({ row: rowNum, reason: 'Missing Name — row skipped.' });
        continue;
      }

      const slug = (row.slug && row.slug.trim() && normalizeSlugInput(row.slug)) || slugify(name);

      const existing = await query('SELECT id FROM service_locations WHERE slug = ? LIMIT 1', [slug]);
      if (existing.length > 0) {
        skipped++;
        errors.push({ row: rowNum, reason: `Slug "${slug}" already exists — row skipped.` });
        continue;
      }

      const image = (row.image && row.image.trim()) || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80';

      const insertResult = await query<any>(
        `INSERT INTO service_locations (slug, name, title, content, address, city, phone, email, map_url, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          slug,
          name,
          (row.title || '').trim(),
          (row.content || '').trim(),
          address,
          city,
          phone,
          email,
          (row.map_url || '').trim(),
          image
        ]
      );

      const locationId = insertResult.insertId;

      // Resolve comma-separated tag names to clinic_tag IDs, creating any tags that don't exist yet
      const tagNames = (row.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      for (const tagName of tagNames) {
        let tagRows = await query<{ id: number }[]>('SELECT id FROM clinic_tags WHERE name = ? LIMIT 1', [tagName]);
        let tagId: number;
        if (tagRows.length === 0) {
          const tagSlug = slugify(tagName);
          const tagResult = await query<any>('INSERT INTO clinic_tags (name, slug) VALUES (?, ?)', [tagName, tagSlug]);
          tagId = tagResult.insertId;
        } else {
          tagId = tagRows[0].id;
        }
        await query('INSERT IGNORE INTO location_clinic_tags (location_id, clinic_tag_id) VALUES (?, ?)', [locationId, tagId]);
      }

      // Link this location to the diseases selected for the whole batch
      for (const diseaseId of diseaseIds) {
        await query('INSERT IGNORE INTO location_diseases (location_id, disease_id) VALUES (?, ?)', [locationId, diseaseId]);
      }

      created++;
    } catch (error) {
      console.error(`Bulk location import failed on row ${rowNum}:`, error);
      skipped++;
      errors.push({ row: rowNum, reason: 'Unexpected error while saving this row.' });
    }
  }

  revalidatePath('/our-clinics');
  revalidatePath('/admin/locations-we-serve');
  revalidatePath('/admin/clinic-tags');
  revalidatePath('/admin/dashboard');
  revalidatePath('/all-diseases');

  return { success: true, created, skipped, errors };
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
