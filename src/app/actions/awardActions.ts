'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface AwardItem {
  id: number;
  title: string;
  image: string;
  date: string;
  sorting: number;
  created_at?: string;
}

/**
 * Public Server Action to fetch all awards from the database.
 * Sorted by sorting ASC, then by id DESC.
 */
export async function getAwardsAction(): Promise<AwardItem[]> {
  try {
    const awards = await query<AwardItem[]>(
      'SELECT * FROM awards ORDER BY sorting ASC, id DESC'
    );
    return awards;
  } catch (error) {
    console.error('Failed to fetch awards:', error);
    return [];
  }
}

/**
 * Admin Server Action to create a new award.
 */
export async function createAwardAction(awardData: Omit<AwardItem, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { title, image, date, sorting } = awardData;

  if (!title || !image || !date) {
    return { success: false, error: 'Title, Image, and Date are required fields.' };
  }

  try {
    await query(
      `INSERT INTO awards (title, image, date, sorting) VALUES (?, ?, ?, ?)`,
      [
        title,
        image,
        date,
        sorting !== undefined && sorting !== null ? Number(sorting) : 0
      ]
    );

    revalidatePath('/admin/awards');
    return { success: true };
  } catch (error) {
    console.error('Failed to create award:', error);
    return { success: false, error: 'Failed to write award to database.' };
  }
}

/**
 * Admin Server Action to update an existing award.
 */
export async function updateAwardAction(id: number | string, awardData: Partial<Omit<AwardItem, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(awardData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(key === 'sorting' ? Number(val) : val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  try {
    params.push(id);
    await query(`UPDATE awards SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/awards');
    return { success: true };
  } catch (error) {
    console.error('Failed to update award:', error);
    return { success: false, error: 'Failed to update award in database.' };
  }
}

/**
 * Admin Server Action to delete an award.
 */
export async function deleteAwardAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM awards WHERE id = ?', [id]);
    revalidatePath('/admin/awards');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete award:', error);
    return { success: false, error: 'Failed to delete award from database.' };
  }
}
