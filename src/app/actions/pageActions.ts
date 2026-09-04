'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface PageItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Public/Admin Server Action to fetch all custom pages.
 * Sorted by name ASC.
 */
export async function getPagesAction(): Promise<PageItem[]> {
  try {
    const pages = await query<PageItem[]>(
      'SELECT * FROM pages ORDER BY name ASC'
    );
    return pages;
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return [];
  }
}

/**
 * Admin Server Action to create a new page.
 */
export async function createPageAction(pageData: Omit<PageItem, 'id' | 'created_at' | 'updated_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug, description } = pageData;

  if (!name || !slug || !description) {
    return { success: false, error: 'Name, Slug, and Description are required fields.' };
  }

  try {
    // Check unique constraints for name and slug
    const existing = await query(
      'SELECT id FROM pages WHERE name = ? OR slug = ? LIMIT 1',
      [name, slug]
    );
    if (existing.length > 0) {
      return { success: false, error: 'A page with this name or slug already exists.' };
    }

    await query(
      `INSERT INTO pages (name, slug, description) VALUES (?, ?, ?)`,
      [name, slug, description]
    );

    revalidatePath('/admin/pages');
    revalidatePath(`/${slug}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to create page:', error);
    return { success: false, error: 'Failed to write page to database.' };
  }
}

/**
 * Admin Server Action to update an existing page.
 */
export async function updatePageAction(id: number | string, pageData: Partial<Omit<PageItem, 'id' | 'created_at' | 'updated_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug, description } = pageData;

  // Validate requirements if provided
  if (name === '' || slug === '' || description === '') {
    return { success: false, error: 'Required fields cannot be empty.' };
  }

  try {
    // Check duplicates
    if (name || slug) {
      const duplicates = await query(
        'SELECT id FROM pages WHERE (name = ? OR slug = ?) AND id != ? LIMIT 1',
        [name || '', slug || '', id]
      );
      if (duplicates.length > 0) {
        return { success: false, error: 'Another page is already using this name or slug.' };
      }
    }

    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(pageData).forEach(([key, val]) => {
      if (val !== undefined) {
        fields.push(`\`${key}\` = ?`);
        params.push(val);
      }
    });

    if (fields.length === 0) {
      return { success: false, error: 'No fields provided to update.' };
    }

    params.push(id);
    await query(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/pages');
    if (slug) {
      revalidatePath(`/${slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to update page:', error);
    return { success: false, error: 'Failed to update page in database.' };
  }
}

/**
 * Admin Server Action to delete a page.
 */
export async function deletePageAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get slug before delete for revalidation
    const rows = await query('SELECT slug FROM pages WHERE id = ? LIMIT 1', [id]);
    const slug = rows.length > 0 ? rows[0].slug : null;

    await query('DELETE FROM pages WHERE id = ?', [id]);

    revalidatePath('/admin/pages');
    if (slug) {
      revalidatePath(`/${slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete page:', error);
    return { success: false, error: 'Failed to delete page from database.' };
  }
}
