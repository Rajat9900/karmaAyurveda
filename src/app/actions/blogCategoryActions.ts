'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  blog_count?: number; // populated dynamically in getBlogCategoriesAction
}

/**
 * Admin/Public Server Action to fetch all categories, including counts of blogs in each.
 */
export async function getBlogCategoriesAction(): Promise<BlogCategory[]> {
  try {
    const categories = await query<BlogCategory[]>(
      `SELECT c.id, c.name, c.slug, c.created_at, COUNT(b.id) AS blog_count 
       FROM blog_categories c 
       LEFT JOIN blogs b ON b.category = c.name 
       GROUP BY c.id, c.name, c.slug, c.created_at
       ORDER BY c.name ASC`
    );
    return categories;
  } catch (error) {
    console.error('Failed to fetch blog categories:', error);
    return [];
  }
}

/**
 * Public Server Action to fetch a single category by its slug, used for the category listing page.
 */
export async function getBlogCategoryBySlugAction(slug: string): Promise<BlogCategory | undefined> {
  try {
    const categories = await query<BlogCategory[]>(
      `SELECT c.id, c.name, c.slug, c.created_at, COUNT(b.id) AS blog_count
       FROM blog_categories c
       LEFT JOIN blogs b ON b.category = c.name
       WHERE c.slug = ?
       GROUP BY c.id, c.name, c.slug, c.created_at
       LIMIT 1`,
      [slug]
    );
    return categories[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch blog category by slug "${slug}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new category.
 */
export async function createBlogCategoryAction(categoryData: { name: string; slug: string }) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug } = categoryData;
  if (!name || !slug) {
    return { success: false, error: 'Name and slug are required fields.' };
  }

  try {
    // Check if category name or slug already exists
    const existing = await query(
      'SELECT id FROM blog_categories WHERE name = ? OR slug = ? LIMIT 1',
      [name, slug]
    );
    if (existing.length > 0) {
      return { success: false, error: 'A category with this name or slug already exists.' };
    }

    await query(
      'INSERT INTO blog_categories (name, slug) VALUES (?, ?)',
      [name, slug]
    );

    revalidatePath('/blogs');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to write category to database.' };
  }
}

/**
 * Admin Server Action to update an existing category.
 */
export async function updateBlogCategoryAction(id: number | string, categoryData: { name: string; slug: string }) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug } = categoryData;
  if (!name || !slug) {
    return { success: false, error: 'Name and slug are required fields.' };
  }

  try {
    // Find current category name
    const existing = await query<{ name: string }[]>(
      'SELECT name FROM blog_categories WHERE id = ? LIMIT 1',
      [id]
    );
    if (existing.length === 0) {
      return { success: false, error: 'Category not found.' };
    }
    const oldName = existing[0].name;

    // Check unique constraint for name/slug for other categories
    const duplicates = await query(
      'SELECT id FROM blog_categories WHERE (name = ? OR slug = ?) AND id != ? LIMIT 1',
      [name, slug, id]
    );
    if (duplicates.length > 0) {
      return { success: false, error: 'Another category is already using this name or slug.' };
    }

    // Update category
    await query(
      'UPDATE blog_categories SET name = ?, slug = ? WHERE id = ?',
      [name, slug, id]
    );

    // Self-healing: update category string in blogs table
    await query(
      'UPDATE blogs SET category = ? WHERE category = ?',
      [name, oldName]
    );

    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category in database.' };
  }
}

/**
 * Admin Server Action to delete a category.
 */
export async function deleteBlogCategoryAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Find category name first
    const existing = await query<{ name: string }[]>(
      'SELECT name FROM blog_categories WHERE id = ? LIMIT 1',
      [id]
    );
    if (existing.length === 0) {
      return { success: false, error: 'Category not found.' };
    }
    const categoryName = existing[0].name;

    // Ensure fallback category "General" exists so we can reassign orphaned blogs to it
    const generalCheck = await query<{ id: number }[]>(
      'SELECT id FROM blog_categories WHERE name = ? LIMIT 1',
      ['General']
    );
    if (generalCheck.length === 0 && categoryName !== 'General') {
      // Create General category as fallback
      await query(
        "INSERT INTO blog_categories (name, slug) VALUES ('General', 'general')"
      );
    }

    // Reassign blogs using this category to "General"
    if (categoryName !== 'General') {
      await query(
        "UPDATE blogs SET category = 'General' WHERE category = ?",
        [categoryName]
      );
    } else {
      // Prevent deleting General category if there are blogs using it to avoid orphaned state
      const blogCountResult = await query<{ cnt: number }[]>(
        "SELECT COUNT(*) as cnt FROM blogs WHERE category = 'General'"
      );
      if (blogCountResult[0]?.cnt > 0) {
        return { success: false, error: 'Cannot delete the fallback category "General" when there are blogs assigned to it.' };
      }
    }

    // Delete category
    await query('DELETE FROM blog_categories WHERE id = ?', [id]);

    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category from database.' };
  }
}
