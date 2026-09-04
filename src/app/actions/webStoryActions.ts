'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface WebStoryPanel {
  id: number;
  story_id: number;
  image: string;
  heading: string;
  paragraph: string;
  sort_order: number;
  created_at?: string;
}

export interface WebStory {
  id: number;
  slug: string;
  meta_title: string;
  meta_des: string;
  meta_keywords: string;
  cover_image: string;
  created_at?: string;
  panel_count?: number; // populated in getWebStoriesAction
  panels?: WebStoryPanel[]; // populated in single-story fetches
}

/**
 * Admin Server Action to fetch all web stories with their panel counts, for the listing page.
 */
export async function getWebStoriesAction(): Promise<WebStory[]> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return [];
  }
  try {
    const stories = await query<WebStory[]>(
      `SELECT s.*, COUNT(p.id) AS panel_count
       FROM web_stories s
       LEFT JOIN web_story_panels p ON p.story_id = s.id
       GROUP BY s.id
       ORDER BY s.id DESC`
    );
    return stories;
  } catch (error) {
    console.error('Failed to fetch web stories:', error);
    return [];
  }
}

/**
 * Public Server Action to fetch all web stories (cover + meta only), used for the
 * "Web Stories" slider on the blog detail page. No panel content included.
 */
export async function getPublicWebStoriesAction(): Promise<WebStory[]> {
  try {
    const stories = await query<WebStory[]>(
      `SELECT s.id, s.slug, s.meta_title, s.meta_des, s.meta_keywords, s.cover_image, s.created_at, COUNT(p.id) AS panel_count
       FROM web_stories s
       LEFT JOIN web_story_panels p ON p.story_id = s.id
       GROUP BY s.id
       ORDER BY s.id DESC`
    );
    return stories;
  } catch (error) {
    console.error('Failed to fetch public web stories:', error);
    return [];
  }
}

/**
 * Admin Server Action to fetch a single web story by ID, including its ordered panels.
 */
export async function getWebStoryByIdAction(id: number | string): Promise<WebStory | undefined> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return undefined;
  }
  try {
    const stories = await query<WebStory[]>('SELECT * FROM web_stories WHERE id = ? LIMIT 1', [id]);
    if (stories.length === 0) return undefined;

    const panels = await query<WebStoryPanel[]>(
      'SELECT * FROM web_story_panels WHERE story_id = ? ORDER BY sort_order ASC, id ASC',
      [id]
    );

    return { ...stories[0], panels };
  } catch (error) {
    console.error(`Failed to fetch web story by ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Public Server Action to fetch a single web story by slug, including its ordered panels.
 */
export async function getWebStoryBySlugAction(slug: string): Promise<WebStory | undefined> {
  try {
    const stories = await query<WebStory[]>('SELECT * FROM web_stories WHERE slug = ? LIMIT 1', [slug]);
    if (stories.length === 0) return undefined;

    const panels = await query<WebStoryPanel[]>(
      'SELECT * FROM web_story_panels WHERE story_id = ? ORDER BY sort_order ASC, id ASC',
      [stories[0].id]
    );

    return { ...stories[0], panels };
  } catch (error) {
    console.error(`Failed to fetch web story by slug "${slug}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new web story.
 */
export async function createWebStoryAction(storyData: Omit<WebStory, 'id' | 'created_at' | 'panel_count' | 'panels'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { slug, meta_title, meta_des, meta_keywords, cover_image } = storyData;

  if (!slug) {
    return { success: false, error: 'Slug is a required field.' };
  }

  try {
    const existing = await query('SELECT id FROM web_stories WHERE slug = ? LIMIT 1', [slug]);
    if (existing.length > 0) {
      return { success: false, error: 'A web story with this slug already exists.' };
    }

    const result = await query<any>(
      `INSERT INTO web_stories (slug, meta_title, meta_des, meta_keywords, cover_image)
       VALUES (?, ?, ?, ?, ?)`,
      [slug, meta_title || '', meta_des || '', meta_keywords || '', cover_image || '']
    );

    revalidatePath('/admin/admin_view_stories');

    return { success: true, id: result.insertId };
  } catch (error) {
    console.error('Failed to create web story:', error);
    return { success: false, error: 'Failed to write web story to database.' };
  }
}

/**
 * Admin Server Action to update an existing web story.
 */
export async function updateWebStoryAction(id: number | string, storyData: Partial<Omit<WebStory, 'id' | 'created_at' | 'panel_count' | 'panels'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(storyData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields to update.' };
  }

  if (storyData.slug) {
    const existing = await query('SELECT id FROM web_stories WHERE slug = ? AND id != ? LIMIT 1', [storyData.slug, id]);
    if (existing.length > 0) {
      return { success: false, error: 'Another web story is already using this slug.' };
    }
  }

  try {
    params.push(id);
    await query(`UPDATE web_stories SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/admin_view_stories');

    return { success: true };
  } catch (error) {
    console.error('Failed to update web story:', error);
    return { success: false, error: 'Failed to update web story in database.' };
  }
}

/**
 * Admin Server Action to delete a web story (cascades to its panels).
 */
export async function deleteWebStoryAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM web_stories WHERE id = ?', [id]);

    revalidatePath('/admin/admin_view_stories');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete web story:', error);
    return { success: false, error: 'Failed to delete web story from database.' };
  }
}

/**
 * Admin Server Action to replace a story's full panel list in one go.
 * Deletes all existing panels for the story and re-inserts the given list,
 * matching the "full replace" pattern already used for clinic doctors/tags.
 */
export async function setWebStoryPanelsAction(
  storyId: number | string,
  panels: { image: string; heading: string; paragraph: string }[]
) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM web_story_panels WHERE story_id = ?', [storyId]);

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      await query(
        'INSERT INTO web_story_panels (story_id, image, heading, paragraph, sort_order) VALUES (?, ?, ?, ?, ?)',
        [storyId, panel.image || '', panel.heading || '', panel.paragraph || '', i]
      );
    }

    revalidatePath('/admin/admin_view_stories');

    return { success: true };
  } catch (error) {
    console.error(`Failed to set panels for web story "${storyId}":`, error);
    return { success: false, error: 'Failed to save the story\'s panel list.' };
  }
}

/**
 * Admin Server Action to upload a web story's cover image or panel image.
 */
export async function uploadWebStoryImageAction(formData: FormData) {
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

    const uploadDir = path.join(process.cwd(), 'public', 'upload', 'web-stories');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return { success: true, url: `/upload/web-stories/${filename}` };
  } catch (error) {
    console.error('Web story image upload error:', error);
    return { success: false, error: 'Failed to save uploaded image.' };
  }
}
