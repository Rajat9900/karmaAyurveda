'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface KneeClinic {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  map_url: string | null;
  image: string | null;
  disease_id: number | null;
  disease_name?: string;
  tag_ids?: number[]; // parsed array of tag IDs
  tag_names?: string[]; // parsed array of tag names
  created_at?: string;
}

export interface KneeTag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

// ==========================================
// 1. Knee Clinics Server Actions
// ==========================================

export async function getKneeClinicsAction(): Promise<KneeClinic[]> {
  try {
    const clinics = await query<any[]>(
      `SELECT kc.*, d.name AS disease_name,
        (SELECT GROUP_CONCAT(knee_tag_id) FROM knee_clinic_tags WHERE knee_clinic_id = kc.id) AS tag_ids_str,
        (SELECT GROUP_CONCAT(kt.name) FROM knee_clinic_tags kct JOIN knee_tags kt ON kct.knee_tag_id = kt.id WHERE kct.knee_clinic_id = kc.id) AS tag_names_str
       FROM knee_clinics kc 
       LEFT JOIN diseases d ON kc.disease_id = d.id 
       ORDER BY kc.name ASC`
    );

    return clinics.map(c => ({
      ...c,
      tag_ids: c.tag_ids_str ? c.tag_ids_str.split(',').map((id: string) => parseInt(id)) : [],
      tag_names: c.tag_names_str ? c.tag_names_str.split(',') : []
    }));
  } catch (error) {
    console.error('Failed to fetch knee clinics:', error);
    return [];
  }
}

export async function createKneeClinicAction(
  clinicData: Omit<KneeClinic, 'id' | 'created_at' | 'tag_ids' | 'tag_names'>,
  tagIds: number[]
) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug, address, city, phone, email, map_url, image, disease_id } = clinicData;

  if (!name || !slug || !address || !city || !phone || !email) {
    return { success: false, error: 'Name, slug, address, city, phone, and email are required fields.' };
  }

  try {
    const existing = await query('SELECT id FROM knee_clinics WHERE slug = ? LIMIT 1', [slug.toLowerCase()]);
    if (existing.length > 0) {
      return { success: false, error: 'A clinic location with this slug already exists.' };
    }

    // Insert clinic
    const result = await query<any>(
      `INSERT INTO knee_clinics (name, slug, address, city, phone, email, map_url, image, disease_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug.toLowerCase(),
        address,
        city,
        phone,
        email,
        map_url || '',
        image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
        disease_id || null
      ]
    );

    const newClinicId = result.insertId;

    // Link selected tags in junction table
    if (newClinicId && tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await query(
          'INSERT INTO knee_clinic_tags (knee_clinic_id, knee_tag_id) VALUES (?, ?)',
          [newClinicId, tagId]
        );
      }
    }

    revalidatePath('/admin/knee-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to create knee clinic:', error);
    return { success: false, error: 'Failed to write clinic location to database.' };
  }
}

export async function updateKneeClinicAction(
  id: number | string, 
  clinicData: Partial<Omit<KneeClinic, 'id' | 'created_at' | 'tag_ids' | 'tag_names'>>,
  tagIds?: number[]
) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(clinicData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val === '' && key === 'disease_id' ? null : val);
    }
  });

  if (fields.length === 0 && !tagIds) {
    return { success: false, error: 'No fields to update.' };
  }

  if (clinicData.slug) {
    const existing = await query(
      'SELECT id FROM knee_clinics WHERE slug = ? AND id != ? LIMIT 1',
      [clinicData.slug.toLowerCase(), id]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Another clinic is already using this slug.' };
    }
  }

  try {
    // 1. Update clinic fields if any
    if (fields.length > 0) {
      params.push(id);
      await query(`UPDATE knee_clinics SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    // 2. Update tag mappings in junction table if tagIds is provided
    if (tagIds !== undefined) {
      // Clear old mappings
      await query('DELETE FROM knee_clinic_tags WHERE knee_clinic_id = ?', [id]);
      
      // Insert new mappings
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          await query(
            'INSERT INTO knee_clinic_tags (knee_clinic_id, knee_tag_id) VALUES (?, ?)',
            [id, tagId]
          );
        }
      }
    }

    revalidatePath('/admin/knee-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to update knee clinic:', error);
    return { success: false, error: 'Failed to update clinic in database.' };
  }
}

export async function deleteKneeClinicAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM knee_clinics WHERE id = ?', [id]);
    revalidatePath('/admin/knee-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete knee clinic:', error);
    return { success: false, error: 'Failed to delete clinic from database.' };
  }
}

// ==========================================
// 2. Knee Tags Server Actions
// ==========================================

export async function getKneeTagsAction(): Promise<KneeTag[]> {
  try {
    const tags = await query<KneeTag[]>(
      `SELECT * FROM knee_tags ORDER BY name ASC`
    );
    return tags;
  } catch (error) {
    console.error('Failed to fetch knee tags:', error);
    return [];
  }
}

export async function createKneeTagAction(tagData: Omit<KneeTag, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug } = tagData;

  if (!name || !slug) {
    return { success: false, error: 'Tag name and slug are required.' };
  }

  try {
    const existing = await query('SELECT id FROM knee_tags WHERE slug = ? LIMIT 1', [slug.toLowerCase()]);
    if (existing.length > 0) {
      return { success: false, error: 'A tag with this slug already exists.' };
    }

    await query(
      `INSERT INTO knee_tags (name, slug) VALUES (?, ?)`,
      [name, slug.toLowerCase()]
    );

    revalidatePath('/admin/knee-tags');
    revalidatePath('/admin/knee-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to create knee tag:', error);
    return { success: false, error: 'Failed to write tag to database.' };
  }
}

export async function updateKneeTagAction(id: number | string, tagData: Partial<Omit<KneeTag, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(tagData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val);
    }
  });

  if (fields.length === 0) {
    return { success: false, error: 'No fields to update.' };
  }

  if (tagData.slug) {
    const existing = await query(
      'SELECT id FROM knee_tags WHERE slug = ? AND id != ? LIMIT 1',
      [tagData.slug.toLowerCase(), id]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Another tag is already using this slug.' };
    }
  }

  try {
    params.push(id);
    await query(`UPDATE knee_tags SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/knee-tags');
    revalidatePath('/admin/knee-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to update knee tag:', error);
    return { success: false, error: 'Failed to update tag in database.' };
  }
}

export async function deleteKneeTagAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM knee_tags WHERE id = ?', [id]);
    revalidatePath('/admin/knee-tags');
    revalidatePath('/admin/knee-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete knee tag:', error);
    return { success: false, error: 'Failed to delete tag from database.' };
  }
}
