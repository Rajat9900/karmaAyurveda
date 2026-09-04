'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  blog_count?: number; // populated dynamically in getBlogTagsAction
}

/**
 * Admin/Public Server Action to fetch all tags, including counts of blogs in each.
 */
export async function getBlogTagsAction(): Promise<BlogTag[]> {
  try {
    const tags = await query<BlogTag[]>(
      `SELECT t.id, t.name, t.slug, t.created_at, COUNT(pt.blog_id) AS blog_count 
       FROM blog_tags t 
       LEFT JOIN blog_post_tags pt ON pt.tag_id = t.id 
       GROUP BY t.id, t.name, t.slug, t.created_at
       ORDER BY t.name ASC`
    );
    return tags;
  } catch (error) {
    console.error('Failed to fetch blog tags:', error);
    return [];
  }
}

/**
 * Public Server Action to fetch a single tag by its slug, used for the tag listing page.
 */
export async function getBlogTagBySlugAction(slug: string): Promise<BlogTag | undefined> {
  try {
    const tags = await query<BlogTag[]>(
      `SELECT t.id, t.name, t.slug, t.created_at, COUNT(pt.blog_id) AS blog_count
       FROM blog_tags t
       LEFT JOIN blog_post_tags pt ON pt.tag_id = t.id
       WHERE t.slug = ?
       GROUP BY t.id, t.name, t.slug, t.created_at
       LIMIT 1`,
      [slug]
    );
    return tags[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch blog tag by slug "${slug}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new tag.
 */
export async function createBlogTagAction(tagData: { name: string; slug: string }) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug } = tagData;
  if (!name || !slug) {
    return { success: false, error: 'Name and slug are required fields.' };
  }

  try {
    // Check if tag name or slug already exists
    const existing = await query(
      'SELECT id FROM blog_tags WHERE name = ? OR slug = ? LIMIT 1',
      [name, slug]
    );
    if (existing.length > 0) {
      return { success: false, error: 'A tag with this name or slug already exists.' };
    }

    await query(
      'INSERT INTO blog_tags (name, slug) VALUES (?, ?)',
      [name, slug]
    );

    revalidatePath('/blogs');
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    console.error('Failed to create tag:', error);
    return { success: false, error: 'Failed to write tag to database.' };
  }
}

/**
 * Admin Server Action to update an existing tag.
 */
export async function updateBlogTagAction(id: number | string, tagData: { name: string; slug: string }) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug } = tagData;
  if (!name || !slug) {
    return { success: false, error: 'Name and slug are required fields.' };
  }

  try {
    // Check unique constraint for name/slug for other tags
    const duplicates = await query(
      'SELECT id FROM blog_tags WHERE (name = ? OR slug = ?) AND id != ? LIMIT 1',
      [name, slug, id]
    );
    if (duplicates.length > 0) {
      return { success: false, error: 'Another tag is already using this name or slug.' };
    }

    // Update tag
    await query(
      'UPDATE blog_tags SET name = ?, slug = ? WHERE id = ?',
      [name, slug, id]
    );

    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    console.error('Failed to update tag:', error);
    return { success: false, error: 'Failed to update tag in database.' };
  }
}

/**
 * Admin Server Action to delete a tag.
 */
export async function deleteBlogTagAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Delete tag (cascade constraint handles cleaning up blog_post_tags)
    await query('DELETE FROM blog_tags WHERE id = ?', [id]);

    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return { success: false, error: 'Failed to delete tag from database.' };
  }
}
