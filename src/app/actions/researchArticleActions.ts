'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface ResearchArticleItem {
  id: number;
  title: string;
  short_title?: string;
  research_details?: string;
  link: string;
  image: string;
  sort: number;
  created_at?: string;
}

/**
 * Public/Admin Server Action to fetch all research articles from the database.
 * Sorted by sort ASC, then by id DESC.
 */
export async function getResearchArticlesAction(): Promise<ResearchArticleItem[]> {
  try {
    const articles = await query<ResearchArticleItem[]>(
      'SELECT * FROM research_articles ORDER BY sort ASC, id DESC'
    );
    return articles;
  } catch (error) {
    console.error('Failed to fetch research articles:', error);
    return [];
  }
}

/**
 * Admin Server Action to create a new research article.
 */
export async function createResearchArticleAction(articleData: Omit<ResearchArticleItem, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { title, short_title, research_details, link, image, sort } = articleData;

  if (!title || !link || !image) {
    return { success: false, error: 'Title, Link, and Image are required fields.' };
  }

  try {
    await query(
      `INSERT INTO research_articles (title, short_title, research_details, link, image, sort) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        short_title || '',
        research_details || '',
        link,
        image,
        sort !== undefined && sort !== null ? Number(sort) : 0
      ]
    );

    revalidatePath('/admin/research-articles');
    revalidatePath('/research-articles');
    return { success: true };
  } catch (error) {
    console.error('Failed to create research article:', error);
    return { success: false, error: 'Failed to write research article to database.' };
  }
}

/**
 * Admin Server Action to update an existing research article.
 */
export async function updateResearchArticleAction(id: number | string, articleData: Partial<Omit<ResearchArticleItem, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(articleData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(key === 'sort' ? Number(val) : val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  try {
    params.push(id);
    await query(`UPDATE research_articles SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/research-articles');
    revalidatePath('/research-articles');
    return { success: true };
  } catch (error) {
    console.error('Failed to update research article:', error);
    return { success: false, error: 'Failed to update research article in database.' };
  }
}

/**
 * Admin Server Action to delete a research article.
 */
export async function deleteResearchArticleAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM research_articles WHERE id = ?', [id]);
    revalidatePath('/admin/research-articles');
    revalidatePath('/research-articles');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete research article:', error);
    return { success: false, error: 'Failed to delete research article from database.' };
  }
}
