'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface Disease {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  title: string;
  subtitle: string;
  what_is_title: string;
  bullets: string; // stringified JSON array
  main_image: string;
  treatment_focus: string; // stringified JSON array of {title, desc}
  testimonials: string; // stringified JSON array of {caption, patientName, comparisonImg, videoId, duration}
  content?: string; // rich-text HTML body, shown after Treatments We Offer
  sort_order?: number; // display order in Disease Management; managed via reorderDiseasesAction
  meta_title?: string;
  meta_keywords?: string;
  meta_des?: string;
  created_at?: string;
}

/**
 * Public Server Action to fetch all diseases from the database, in admin-defined order.
 */
export async function getDiseasesAction(): Promise<Disease[]> {
  try {
    const diseases = await query<Disease[]>(
      'SELECT * FROM diseases ORDER BY sort_order ASC, name ASC'
    );
    return diseases;
  } catch (error) {
    console.error('Failed to fetch diseases:', error);
    return [];
  }
}

/**
 * Public Server Action to fetch a single disease by its URL slug.
 */
export async function getDiseaseBySlugAction(slug: string): Promise<Disease | undefined> {
  try {
    const diseases = await query<Disease[]>(
      'SELECT * FROM diseases WHERE slug = ? LIMIT 1',
      [slug.toLowerCase()]
    );
    return diseases[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch disease by slug "${slug}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to fetch a single disease by its primary key ID.
 */
export async function getDiseaseByIdAction(id: number | string): Promise<Disease | undefined> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return undefined;
  }
  try {
    const diseases = await query<Disease[]>(
      'SELECT * FROM diseases WHERE id = ? LIMIT 1',
      [id]
    );
    return diseases[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch disease by ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new disease condition.
 */
export async function createDiseaseAction(diseaseData: Omit<Disease, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const {
    name,
    slug,
    icon,
    description,
    title,
    subtitle,
    what_is_title,
    bullets,
    main_image,
    treatment_focus,
    testimonials,
    content,
    meta_title,
    meta_keywords,
    meta_des
  } = diseaseData;

  if (!name || !slug || !icon || !description) {
    return { success: false, error: 'Name, slug, icon, and list description are required fields.' };
  }

  try {
    // Check slug uniqueness
    const existing = await query(
      'SELECT id FROM diseases WHERE slug = ? LIMIT 1',
      [slug.toLowerCase()]
    );
    if (existing.length > 0) {
      return { success: false, error: 'A disease condition with this URL slug already exists.' };
    }

    // New diseases are appended to the end of the admin-defined order
    const [orderResult] = await query<{ nextOrder: number }[]>(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS nextOrder FROM diseases'
    );

    await query(
      `INSERT INTO diseases (name, slug, icon, description, title, subtitle, what_is_title, bullets, main_image, treatment_focus, testimonials, content, sort_order, meta_title, meta_keywords, meta_des)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug.toLowerCase(),
        icon,
        description,
        title || `${name} Treatment`,
        subtitle || 'Holistic Ayurvedic Care and Natural Healing',
        what_is_title || `What is ${name}?`,
        bullets || '[]',
        main_image || 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
        treatment_focus || '[]',
        testimonials || '[]',
        content || '',
        orderResult.nextOrder,
        meta_title || title || `${name} Treatment`,
        meta_keywords || `${name.toLowerCase()}, treatment, ayurveda, healing`,
        meta_des || description
      ]
    );

    revalidatePath('/all-diseases');
    revalidatePath(`/${slug}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to create disease:', error);
    return { success: false, error: 'Failed to write disease to database.' };
  }
}

/**
 * Admin Server Action to update an existing disease condition.
 */
export async function updateDiseaseAction(id: number | string, diseaseData: Partial<Omit<Disease, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(diseaseData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  // Check unique slug if it is being changed
  if (diseaseData.slug) {
    const existing = await query(
      'SELECT id FROM diseases WHERE slug = ? AND id != ? LIMIT 1',
      [diseaseData.slug.toLowerCase(), id]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Another disease condition is already using this URL slug.' };
    }
  }

  try {
    params.push(id);
    await query(`UPDATE diseases SET ${fields.join(', ')} WHERE id = ?`, params);

    // Revalidate paths
    revalidatePath('/all-diseases');
    if (diseaseData.slug) {
      revalidatePath(`/${diseaseData.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update disease:', error);
    return { success: false, error: 'Failed to update disease in database.' };
  }
}

/**
 * Admin Server Action to upload an image for a "Treatment We Offer" entry.
 */
export async function uploadDiseaseTreatmentImageAction(formData: FormData) {
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

    const uploadDir = path.join(process.cwd(), 'public', 'upload', 'diseases', 'treatments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return { success: true, url: `/upload/diseases/treatments/${filename}` };
  } catch (error) {
    console.error('Treatment image upload error:', error);
    return { success: false, error: 'Failed to save uploaded image.' };
  }
}

/**
 * Admin Server Action to persist a new display order for the Disease Directory.
 * Accepts the full list of disease IDs in their new order; each row's
 * sort_order is set to its index in that list.
 */
export async function reorderDiseasesAction(orderedIds: (number | string)[]) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await query('UPDATE diseases SET sort_order = ? WHERE id = ?', [i, orderedIds[i]]);
    }
    revalidatePath('/all-diseases');
    return { success: true };
  } catch (error) {
    console.error('Failed to reorder diseases:', error);
    return { success: false, error: 'Failed to save the new order.' };
  }
}

/**
 * Admin Server Action to delete a disease condition.
 */
export async function deleteDiseaseAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get slug first to revalidate paths
    const result = await query<{ slug: string }[]>(
      'SELECT slug FROM diseases WHERE id = ? LIMIT 1',
      [id]
    );
    const slug = result[0]?.slug;

    await query('DELETE FROM diseases WHERE id = ?', [id]);

    revalidatePath('/all-diseases');
    if (slug) {
      revalidatePath(`/${slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete disease:', error);
    return { success: false, error: 'Failed to delete disease from database.' };
  }
}
