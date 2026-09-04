'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface Doctor {
  id: number;
  name: string;
  education: string;
  designation: string;
  detail: string;
  image: string;
  clinic_id: number | null;
  is_owner: number; // 0 or 1
  clinic_name?: string; // joined
  clinic_city?: string; // joined
  created_at?: string;
}

/**
 * Public Server Action to fetch all doctors joined with their clinic info.
 */
export async function getDoctorsAction(): Promise<Doctor[]> {
  try {
    const doctors = await query<Doctor[]>(
      `SELECT d.*, c.name AS clinic_name, c.city AS clinic_city 
       FROM doctors d 
       LEFT JOIN clinics c ON d.clinic_id = c.id 
       ORDER BY d.is_owner DESC, d.name ASC`
    );
    return doctors;
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return [];
  }
}

/**
 * Admin Server Action to fetch a single doctor by ID.
 */
export async function getDoctorByIdAction(id: number | string): Promise<Doctor | undefined> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return undefined;
  }
  try {
    const doctors = await query<Doctor[]>(
      'SELECT * FROM doctors WHERE id = ? LIMIT 1',
      [id]
    );
    return doctors[0] || undefined;
  } catch (error) {
    console.error(`Failed to fetch doctor by ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new doctor profile.
 */
export async function createDoctorAction(doctorData: Omit<Doctor, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, education, designation, detail, image, clinic_id, is_owner } = doctorData;

  if (!name || !education || !designation || !detail) {
    return { success: false, error: 'Name, education, designation, and detail bio are required fields.' };
  }

  try {
    await query(
      `INSERT INTO doctors (name, education, designation, detail, image, clinic_id, is_owner) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        education,
        designation,
        detail,
        image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
        clinic_id || null,
        is_owner ? 1 : 0
      ]
    );

    revalidatePath('/doctor');
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch (error) {
    console.error('Failed to create doctor:', error);
    return { success: false, error: 'Failed to write doctor to database.' };
  }
}

/**
 * Admin Server Action to update a doctor profile.
 */
export async function updateDoctorAction(id: number | string, doctorData: Partial<Omit<Doctor, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(doctorData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val === '' && key === 'clinic_id' ? null : val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields to update.' };
  }

  try {
    params.push(id);
    await query(`UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/doctor');
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch (error) {
    console.error('Failed to update doctor:', error);
    return { success: false, error: 'Failed to update doctor in database.' };
  }
}

/**
 * Admin Server Action to delete a doctor profile.
 */
export async function deleteDoctorAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM doctors WHERE id = ?', [id]);

    revalidatePath('/doctor');
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete doctor:', error);
    return { success: false, error: 'Failed to delete doctor from database.' };
  }
}
