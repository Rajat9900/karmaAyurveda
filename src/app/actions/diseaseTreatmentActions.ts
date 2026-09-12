'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface DiseaseTreatment {
  id: number;
  disease_id: number;
  title: string;
  slug: string;
  image: string;
  short_description: string;
  content: string; // rich-text HTML body
  meta_title?: string;
  meta_des?: string;
  sort_order: number;
  created_at?: string;
}

export interface DiseaseTreatmentWithDisease extends DiseaseTreatment {
  disease_name: string;
  disease_slug: string;
}

/**
 * Public Server Action to fetch a single treatment sub-page by its URL slug,
 * joined with its parent disease's name/slug for breadcrumbs.
 */
export async function getDiseaseTreatmentBySlugAction(slug: string): Promise<DiseaseTreatmentWithDisease | undefined> {
  try {
    const rows = await query<DiseaseTreatmentWithDisease[]>(
      `SELECT dt.*, d.name AS disease_name, d.slug AS disease_slug
       FROM disease_treatments dt
       INNER JOIN diseases d ON d.id = dt.disease_id
       WHERE dt.slug = ? LIMIT 1`,
      [slug.toLowerCase()]
    );
    return rows[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch treatment sub-page by slug "${slug}":`, error);
    return undefined;
  }
}

/**
 * Public Server Action to fetch the treatment sub-pages belonging to one disease,
 * for rendering that disease's "Treatments We Offer" card grid.
 */
export async function getDiseaseTreatmentsForDiseaseAction(diseaseId: number | string): Promise<DiseaseTreatment[]> {
  try {
    const rows = await query<DiseaseTreatment[]>(
      'SELECT * FROM disease_treatments WHERE disease_id = ? ORDER BY sort_order ASC, title ASC',
      [diseaseId]
    );
    return rows;
  } catch (error) {
    console.error(`Failed to fetch treatments for disease "${diseaseId}":`, error);
    return [];
  }
}

/**
 * Admin Server Action to fetch every treatment sub-page, joined with its parent disease name.
 */
export async function getDiseaseTreatmentsAction(): Promise<DiseaseTreatmentWithDisease[]> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return [];
  }
  try {
    const rows = await query<DiseaseTreatmentWithDisease[]>(
      `SELECT dt.*, d.name AS disease_name, d.slug AS disease_slug
       FROM disease_treatments dt
       INNER JOIN diseases d ON d.id = dt.disease_id
       ORDER BY d.name ASC, dt.sort_order ASC, dt.title ASC`
    );
    return rows;
  } catch (error) {
    console.error('Failed to fetch disease treatments:', error);
    return [];
  }
}

/**
 * Admin Server Action to fetch a single treatment sub-page by its primary key ID.
 */
export async function getDiseaseTreatmentByIdAction(id: number | string): Promise<DiseaseTreatment | undefined> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return undefined;
  }
  try {
    const rows = await query<DiseaseTreatment[]>(
      'SELECT * FROM disease_treatments WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch disease treatment by ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new treatment sub-page.
 */
export async function createDiseaseTreatmentAction(data: Omit<DiseaseTreatment, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { disease_id, title, slug, image, short_description, content, meta_title, meta_des, sort_order } = data;

  if (!disease_id || !title || !slug) {
    return { success: false, error: 'Disease, title, and slug are required fields.' };
  }

  try {
    const existing = await query(
      'SELECT id FROM disease_treatments WHERE slug = ? LIMIT 1',
      [slug.toLowerCase()]
    );
    if (existing.length > 0) {
      return { success: false, error: 'A treatment sub-page with this URL slug already exists.' };
    }

    const existingDiseaseSlug = await query(
      'SELECT id FROM diseases WHERE slug = ? LIMIT 1',
      [slug.toLowerCase()]
    );
    if (existingDiseaseSlug.length > 0) {
      return { success: false, error: 'This slug is already used by a disease page.' };
    }

    await query(
      `INSERT INTO disease_treatments (disease_id, title, slug, image, short_description, content, meta_title, meta_des, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        disease_id,
        title,
        slug.toLowerCase(),
        image || '',
        short_description || '',
        content || '',
        meta_title || `${title} | Ayurvedic Treatment`,
        meta_des || '',
        sort_order ?? 0
      ]
    );

    revalidatePath(`/${slug}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to create disease treatment:', error);
    return { success: false, error: 'Failed to write treatment sub-page to database.' };
  }
}

/**
 * Admin Server Action to update an existing treatment sub-page.
 */
export async function updateDiseaseTreatmentAction(id: number | string, data: Partial<Omit<DiseaseTreatment, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  if (data.slug) {
    const existing = await query(
      'SELECT id FROM disease_treatments WHERE slug = ? AND id != ? LIMIT 1',
      [data.slug.toLowerCase(), id]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Another treatment sub-page is already using this slug.' };
    }
  }

  try {
    params.push(id);
    await query(`UPDATE disease_treatments SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/all-diseases');
    if (data.slug) {
      revalidatePath(`/${data.slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to update disease treatment:', error);
    return { success: false, error: 'Failed to update treatment sub-page in database.' };
  }
}

/**
 * Admin Server Action to delete a treatment sub-page.
 */
export async function deleteDiseaseTreatmentAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM disease_treatments WHERE id = ?', [id]);
    revalidatePath('/all-diseases');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete disease treatment:', error);
    return { success: false, error: 'Failed to delete treatment sub-page from database.' };
  }
}

// ==========================================
// Bulk Import
// ==========================================

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

// Unlike locations (which always store a bare last-segment slug), treatment pages can
// intentionally live under a category prefix stored right in the slug itself — e.g.
// "therapy/kashaya-basti-therapy" is served by /therapy/[slug]/page.tsx, which looks up
// `therapy/${slug}`. So preserve any "/" the source column already has (slugifying each
// segment individually) instead of collapsing it — only a full absolute URL gets reduced
// down to its path, since that's the whole page URL rather than an intentional slug value.
const normalizeSlugInput = (value: string) => {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const segments = new URL(trimmed).pathname.split('/').filter(Boolean);
      return segments.map(slugify).join('/');
    } catch {
      // fall through to the relative-path handling below
    }
  }
  return trimmed.split('/').filter(Boolean).map(slugify).join('/');
};

export interface BulkDiseaseTreatmentRow {
  title?: string;
  slug?: string;
  short_description?: string;
  content?: string;
  image?: string;
  meta_title?: string;
  meta_des?: string;
}

export interface BulkTreatmentImportResult {
  success: boolean;
  created: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

/**
 * Admin Server Action to bulk-import "Treatment Pages" sub-pages from a parsed CSV/Excel file.
 * The client parses the file and maps its columns to these field names before calling this
 * action, so each row here already matches the BulkDiseaseTreatmentRow shape.
 *
 * Unlike locations (many-to-many with diseases), every treatment sub-page belongs to exactly
 * one disease (`disease_id` is a single FK), so the whole batch is linked to one `diseaseId`
 * chosen once in the admin UI — matching the single "Parent Disease" dropdown on the manual
 * create/edit form.
 */
export async function bulkImportDiseaseTreatmentsAction(
  rows: BulkDiseaseTreatmentRow[],
  rowOffset: number = 0,
  diseaseId: number
): Promise<BulkTreatmentImportResult> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, created: 0, skipped: 0, errors: [{ row: 0, reason: 'Unauthorized' }] };
  }

  if (!diseaseId) {
    return { success: false, created: 0, skipped: 0, errors: [{ row: 0, reason: 'A parent disease must be selected.' }] };
  }

  let created = 0;
  let skipped = 0;
  const errors: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = rowOffset + i + 2; // +1 for header row, +1 for 1-indexing — matches the row number the admin sees in their spreadsheet

    try {
      const title = (row.title || '').trim();

      if (!title) {
        skipped++;
        errors.push({ row: rowNum, reason: 'Missing Title — row skipped.' });
        continue;
      }

      const slug = (row.slug && row.slug.trim() && normalizeSlugInput(row.slug)) || slugify(title);

      const existingTreatment = await query('SELECT id FROM disease_treatments WHERE slug = ? LIMIT 1', [slug]);
      if (existingTreatment.length > 0) {
        skipped++;
        errors.push({ row: rowNum, reason: `Slug "${slug}" already exists as a treatment page — row skipped.` });
        continue;
      }

      const existingDisease = await query('SELECT id FROM diseases WHERE slug = ? LIMIT 1', [slug]);
      if (existingDisease.length > 0) {
        skipped++;
        errors.push({ row: rowNum, reason: `Slug "${slug}" is already used by a disease page — row skipped.` });
        continue;
      }

      await query(
        `INSERT INTO disease_treatments (disease_id, title, slug, image, short_description, content, meta_title, meta_des, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          diseaseId,
          title,
          slug,
          (row.image || '').trim(),
          (row.short_description || '').trim(),
          (row.content || '').trim(),
          (row.meta_title || '').trim() || `${title} | Ayurvedic Treatment`,
          (row.meta_des || '').trim()
        ]
      );

      created++;
    } catch (error) {
      console.error(`Bulk treatment page import failed on row ${rowNum}:`, error);
      skipped++;
      errors.push({ row: rowNum, reason: 'Unexpected error while saving this row.' });
    }
  }

  revalidatePath('/all-diseases');
  revalidatePath('/admin/treatment-pages');
  revalidatePath('/admin/dashboard');

  return { success: true, created, skipped, errors };
}
