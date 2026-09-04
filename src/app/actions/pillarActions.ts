'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface Pillar {
  id: number;
  pillar_key: string;
  number: string;
  name: string;
  subtitle: string;
  badge: string;
  icon: string;
  image: string;
  description: string;
  categories: string; // stringified JSON array of { title, subtitle, therapies: [...] }
  sort_order: number;
  created_at?: string;
}

/**
 * Public Server Action to fetch all pillars, ordered for display.
 */
export async function getPillarsAction(): Promise<Pillar[]> {
  try {
    const pillars = await query<Pillar[]>(
      'SELECT * FROM pillars ORDER BY sort_order ASC, number ASC'
    );
    return pillars;
  } catch (error) {
    console.error('Failed to fetch pillars:', error);
    return [];
  }
}

/**
 * Public Server Action to fetch only the pillars linked to a specific disease,
 * for rendering the "How We Reverse Diseases" section on that disease's page.
 */
export async function getPillarsForDiseaseAction(diseaseId: number | string): Promise<Pillar[]> {
  try {
    const pillars = await query<Pillar[]>(
      `SELECT p.* FROM pillars p
       INNER JOIN disease_pillars dp ON dp.pillar_id = p.id
       WHERE dp.disease_id = ?
       ORDER BY p.sort_order ASC, p.number ASC`,
      [diseaseId]
    );
    return pillars;
  } catch (error) {
    console.error(`Failed to fetch pillars for disease "${diseaseId}":`, error);
    return [];
  }
}

/**
 * Admin Server Action to fetch every pillar -> linked disease IDs mapping in one query,
 * used to pre-fill the "Linked Diseases" checkboxes when editing a pillar.
 */
export async function getPillarDiseaseLinksAction(): Promise<Record<number, number[]>> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return {};
  }
  try {
    const rows = await query<{ disease_id: number; pillar_id: number }[]>(
      'SELECT disease_id, pillar_id FROM disease_pillars'
    );
    const map: Record<number, number[]> = {};
    for (const row of rows) {
      if (!map[row.pillar_id]) map[row.pillar_id] = [];
      map[row.pillar_id].push(row.disease_id);
    }
    return map;
  } catch (error) {
    console.error('Failed to fetch pillar-disease links:', error);
    return {};
  }
}

/**
 * Admin Server Action to replace the set of diseases linked to a pillar.
 */
export async function setPillarDiseaseLinksAction(pillarId: number | string, diseaseIds: number[]) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }
  try {
    await query('DELETE FROM disease_pillars WHERE pillar_id = ?', [pillarId]);
    for (const diseaseId of diseaseIds) {
      await query(
        'INSERT IGNORE INTO disease_pillars (disease_id, pillar_id) VALUES (?, ?)',
        [diseaseId, pillarId]
      );
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to set disease links for pillar "${pillarId}":`, error);
    return { success: false, error: 'Failed to update linked diseases.' };
  }
}

/**
 * Admin Server Action to fetch a single pillar by its primary key ID.
 */
export async function getPillarByIdAction(id: number | string): Promise<Pillar | undefined> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return undefined;
  }
  try {
    const pillars = await query<Pillar[]>(
      'SELECT * FROM pillars WHERE id = ? LIMIT 1',
      [id]
    );
    return pillars[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch pillar by ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new pillar.
 */
export async function createPillarAction(pillarData: Omit<Pillar, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const {
    pillar_key,
    number,
    name,
    subtitle,
    badge,
    icon,
    image,
    description,
    categories,
    sort_order
  } = pillarData;

  if (!pillar_key || !number || !name || !description) {
    return { success: false, error: 'Key, number, name, and description are required fields.' };
  }

  try {
    const existing = await query(
      'SELECT id FROM pillars WHERE pillar_key = ? LIMIT 1',
      [pillar_key.toLowerCase()]
    );
    if (existing.length > 0) {
      return { success: false, error: 'A pillar with this key already exists.' };
    }

    const result = await query<{ insertId: number }>(
      `INSERT INTO pillars (pillar_key, number, name, subtitle, badge, icon, image, description, categories, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pillar_key.toLowerCase(),
        number,
        name,
        subtitle || '',
        badge || '',
        icon || 'Sparkles',
        image || '',
        description,
        categories || '[]',
        sort_order ?? 0
      ]
    );

    revalidatePath('/all-diseases');
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error('Failed to create pillar:', error);
    return { success: false, error: 'Failed to write pillar to database.' };
  }
}

/**
 * Admin Server Action to update an existing pillar.
 */
export async function updatePillarAction(id: number | string, pillarData: Partial<Omit<Pillar, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(pillarData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  if (pillarData.pillar_key) {
    const existing = await query(
      'SELECT id FROM pillars WHERE pillar_key = ? AND id != ? LIMIT 1',
      [pillarData.pillar_key.toLowerCase(), id]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Another pillar is already using this key.' };
    }
  }

  try {
    params.push(id);
    await query(`UPDATE pillars SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/all-diseases');
    return { success: true };
  } catch (error) {
    console.error('Failed to update pillar:', error);
    return { success: false, error: 'Failed to update pillar in database.' };
  }
}

/**
 * Admin Server Action to delete a pillar.
 */
export async function deletePillarAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM pillars WHERE id = ?', [id]);
    revalidatePath('/all-diseases');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete pillar:', error);
    return { success: false, error: 'Failed to delete pillar from database.' };
  }
}
