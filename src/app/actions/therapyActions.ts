'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface Therapy {
  id: number;
  name: string;
  slug: string;
  image: string;
  image_alt: string;
  short_des: string;
  long_des: string;
  meta_title: string;
  meta_keywords: string;
  meta_des: string;
  disease_id: number | null;
  disease_name?: string; // joined
  created_at?: string;
}

/**
 * Public Server Action to fetch all therapies joined with associated disease details.
 */
export async function getTherapiesAction(): Promise<Therapy[]> {
  try {
    const therapies = await query<Therapy[]>(
      `SELECT t.*, d.name AS disease_name 
       FROM therapies t 
       LEFT JOIN diseases d ON t.disease_id = d.id 
       ORDER BY t.name ASC`
    );
    return therapies;
  } catch (error) {
    console.error('Failed to fetch therapies:', error);
    return [];
  }
}

/**
 * Admin Server Action to fetch a single therapy by primary key ID.
 */
export async function getTherapyByIdAction(id: number | string): Promise<Therapy | undefined> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return undefined;
  }
  try {
    const therapies = await query<Therapy[]>(
      'SELECT * FROM therapies WHERE id = ? LIMIT 1',
      [id]
    );
    return therapies[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch therapy by ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to upload a therapy's featured image.
 */
export async function uploadTherapyImageAction(formData: FormData) {
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

    const uploadDir = path.join(process.cwd(), 'public', 'upload', 'therapies');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return { success: true, url: `/upload/therapies/${filename}` };
  } catch (error) {
    console.error('Therapy image upload error:', error);
    return { success: false, error: 'Failed to save uploaded image.' };
  }
}

/**
 * Admin Server Action to create a new therapy condition.
 */
export async function createTherapyAction(therapyData: Omit<Therapy, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const {
    name,
    slug,
    image,
    image_alt,
    short_des,
    long_des,
    meta_title,
    meta_keywords,
    meta_des,
    disease_id
  } = therapyData;

  if (!name || !slug || !short_des || !long_des) {
    return { success: false, error: 'Name, slug, short description, and long description details are required.' };
  }

  try {
    const existing = await query(
      'SELECT id FROM therapies WHERE slug = ? LIMIT 1',
      [slug.toLowerCase()]
    );
    if (existing.length > 0) {
      return { success: false, error: 'A therapy with this URL slug already exists.' };
    }

    await query(
      `INSERT INTO therapies (name, slug, image, image_alt, short_des, long_des, meta_title, meta_keywords, meta_des, disease_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug.toLowerCase(),
        image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
        image_alt || name,
        short_des,
        long_des,
        meta_title || name,
        meta_keywords || '',
        meta_des || short_des,
        disease_id || null
      ]
    );

    revalidatePath('/admin/panchkarma-therapy');
    return { success: true };
  } catch (error) {
    console.error('Failed to create therapy:', error);
    return { success: false, error: 'Failed to write therapy to database.' };
  }
}

/**
 * Admin Server Action to update an existing therapy condition.
 */
export async function updateTherapyAction(id: number | string, therapyData: Partial<Omit<Therapy, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(therapyData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val === '' && key === 'disease_id' ? null : val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  if (therapyData.slug) {
    const existing = await query(
      'SELECT id FROM therapies WHERE slug = ? AND id != ? LIMIT 1',
      [therapyData.slug.toLowerCase(), id]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Another therapy is already using this URL slug.' };
    }
  }

  try {
    params.push(id);
    await query(`UPDATE therapies SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/panchkarma-therapy');
    return { success: true };
  } catch (error) {
    console.error('Failed to update therapy:', error);
    return { success: false, error: 'Failed to update therapy in database.' };
  }
}

/**
 * Admin Server Action to delete a therapy.
 */
export async function deleteTherapyAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM therapies WHERE id = ?', [id]);

    revalidatePath('/admin/panchkarma-therapy');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete therapy:', error);
    return { success: false, error: 'Failed to delete therapy from database.' };
  }
}
