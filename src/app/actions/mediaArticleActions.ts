'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface MediaArticleItem {
  id: number;
  title: string;
  article_link: string;
  image: string;
  sort: number;
  created_at?: string;
}

/**
 * Public/Admin Server Action to fetch all media articles from the database.
 * Sorted by sort ASC, then by id DESC.
 */
export async function getMediaArticlesAction(): Promise<MediaArticleItem[]> {
  try {
    const articles = await query<MediaArticleItem[]>(
      'SELECT * FROM media_articles ORDER BY sort ASC, id DESC'
    );
    return articles;
  } catch (error) {
    console.error('Failed to fetch media articles:', error);
    return [];
  }
}

/**
 * Admin Server Action to create a new media article.
 */
export async function createMediaArticleAction(articleData: Omit<MediaArticleItem, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { title, article_link, image, sort } = articleData;

  if (!title || !article_link || !image) {
    return { success: false, error: 'Title, Article Link, and Image are required fields.' };
  }

  try {
    await query(
      `INSERT INTO media_articles (title, article_link, image, sort) VALUES (?, ?, ?, ?)`,
      [
        title,
        article_link,
        image,
        sort !== undefined && sort !== null ? Number(sort) : 0
      ]
    );

    revalidatePath('/admin/media-articles');
    return { success: true };
  } catch (error) {
    console.error('Failed to create media article:', error);
    return { success: false, error: 'Failed to write media article to database.' };
  }
}

/**
 * Admin Server Action to update an existing media article.
 */
export async function updateMediaArticleAction(id: number | string, articleData: Partial<Omit<MediaArticleItem, 'id' | 'created_at'>>) {
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
    await query(`UPDATE media_articles SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/media-articles');
    return { success: true };
  } catch (error) {
    console.error('Failed to update media article:', error);
    return { success: false, error: 'Failed to update media article in database.' };
  }
}

/**
 * Admin Server Action to delete a media article.
 */
export async function deleteMediaArticleAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM media_articles WHERE id = ?', [id]);
    revalidatePath('/admin/media-articles');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete media article:', error);
    return { success: false, error: 'Failed to delete media article from database.' };
  }
}
