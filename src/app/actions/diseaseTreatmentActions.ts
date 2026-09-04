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
