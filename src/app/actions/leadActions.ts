'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface Lead {
  id: number;
  name: string;
  phone: string;
  disease: string;
  message: string;
  status: 'Pending' | 'Contacted' | 'Closed';
  created_at: string;
}

/**
 * Public Server Action to submit a lead (enquiry form).
 */
export async function submitLeadAction(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const disease = (formData.get('disease') as string) || 'Other';
  const message = (formData.get('message') as string) || '';

  if (!name || !phone) {
    return { success: false, error: 'Name and Phone are required fields.' };
  }

  try {
    await query(
      'INSERT INTO leads (name, phone, disease, message, status) VALUES (?, ?, ?, ?, ?)',
      [name, phone, disease, message, 'Pending']
    );

    // Revalidate dashboard so the admin immediately sees the new lead if they are active
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to submit lead:', error);
    return { success: false, error: 'Could not submit your inquiry. Please try again later.' };
  }
}

/**
 * Admin Server Action to retrieve all leads.
 */
export async function getLeadsAction(): Promise<Lead[]> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }

  try {
    const leads = await query<Lead[]>(
      'SELECT id, name, phone, disease, message, status, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") as created_at FROM leads ORDER BY id DESC'
    );
    return leads;
  } catch (error) {
    console.error('Failed to get leads:', error);
    return [];
  }
}

/**
 * Admin Server Action to update the status of a lead.
 */
export async function updateLeadStatusAction(id: number, status: 'Pending' | 'Contacted' | 'Closed') {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('UPDATE leads SET status = ? WHERE id = ?', [status, id]);
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to update lead status:', error);
    return { success: false, error: 'Failed to update lead status in database.' };
  }
}

/**
 * Admin Server Action to delete a lead.
 */
export async function deleteLeadAction(id: number) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM leads WHERE id = ?', [id]);
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return { success: false, error: 'Failed to delete lead from database.' };
  }
}
