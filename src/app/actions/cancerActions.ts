'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface CancerClinic {
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

export interface CancerTag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

// ==========================================
// 1. Cancer Clinics Server Actions
// ==========================================

export async function getCancerClinicsAction(): Promise<CancerClinic[]> {
  try {
    const clinics = await query<any[]>(
      `SELECT cc.*, d.name AS disease_name,
        (SELECT GROUP_CONCAT(cancer_tag_id) FROM cancer_clinic_tags WHERE cancer_clinic_id = cc.id) AS tag_ids_str,
        (SELECT GROUP_CONCAT(ct.name) FROM cancer_clinic_tags cct JOIN cancer_tags ct ON cct.cancer_tag_id = ct.id WHERE cct.cancer_clinic_id = cc.id) AS tag_names_str
       FROM cancer_clinics cc 
       LEFT JOIN diseases d ON cc.disease_id = d.id 
       ORDER BY cc.name ASC`
    );

    return clinics.map(c => ({
      ...c,
      tag_ids: c.tag_ids_str ? c.tag_ids_str.split(',').map((id: string) => parseInt(id)) : [],
      tag_names: c.tag_names_str ? c.tag_names_str.split(',') : []
    }));
  } catch (error) {
    console.error('Failed to fetch cancer clinics:', error);
    return [];
  }
}

export async function createCancerClinicAction(
  clinicData: Omit<CancerClinic, 'id' | 'created_at' | 'tag_ids' | 'tag_names'>,
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
    const existing = await query('SELECT id FROM cancer_clinics WHERE slug = ? LIMIT 1', [slug.toLowerCase()]);
    if (existing.length > 0) {
      return { success: false, error: 'A clinic location with this slug already exists.' };
    }

    // Insert clinic
    const result = await query<any>(
      `INSERT INTO cancer_clinics (name, slug, address, city, phone, email, map_url, image, disease_id) 
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
          'INSERT INTO cancer_clinic_tags (cancer_clinic_id, cancer_tag_id) VALUES (?, ?)',
          [newClinicId, tagId]
        );
      }
    }

    revalidatePath('/admin/cancer-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to create cancer clinic:', error);
    return { success: false, error: 'Failed to write clinic location to database.' };
  }
}

export async function updateCancerClinicAction(
  id: number | string, 
  clinicData: Partial<Omit<CancerClinic, 'id' | 'created_at' | 'tag_ids' | 'tag_names'>>,
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
      'SELECT id FROM cancer_clinics WHERE slug = ? AND id != ? LIMIT 1',
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
      await query(`UPDATE cancer_clinics SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    // 2. Update tag mappings in junction table if tagIds is provided
    if (tagIds !== undefined) {
      // Clear old mappings
      await query('DELETE FROM cancer_clinic_tags WHERE cancer_clinic_id = ?', [id]);
      
      // Insert new mappings
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          await query(
            'INSERT INTO cancer_clinic_tags (cancer_clinic_id, cancer_tag_id) VALUES (?, ?)',
            [id, tagId]
          );
        }
      }
    }

    revalidatePath('/admin/cancer-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to update cancer clinic:', error);
    return { success: false, error: 'Failed to update clinic in database.' };
  }
}

export async function deleteCancerClinicAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM cancer_clinics WHERE id = ?', [id]);
    revalidatePath('/admin/cancer-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete cancer clinic:', error);
    return { success: false, error: 'Failed to delete clinic from database.' };
  }
}

// ==========================================
// 2. Cancer Tags Server Actions
// ==========================================

export async function getCancerTagsAction(): Promise<CancerTag[]> {
  try {
    const tags = await query<CancerTag[]>(
      `SELECT * FROM cancer_tags ORDER BY name ASC`
    );
    return tags;
  } catch (error) {
    console.error('Failed to fetch cancer tags:', error);
    return [];
  }
}

export async function createCancerTagAction(tagData: Omit<CancerTag, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug } = tagData;

  if (!name || !slug) {
    return { success: false, error: 'Tag name and slug are required.' };
  }

  try {
    const existing = await query('SELECT id FROM cancer_tags WHERE slug = ? LIMIT 1', [slug.toLowerCase()]);
    if (existing.length > 0) {
      return { success: false, error: 'A tag with this slug already exists.' };
    }

    await query(
      `INSERT INTO cancer_tags (name, slug) VALUES (?, ?)`,
      [name, slug.toLowerCase()]
    );

    revalidatePath('/admin/cancer-tags');
    revalidatePath('/admin/cancer-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to create cancer tag:', error);
    return { success: false, error: 'Failed to write tag to database.' };
  }
}

export async function updateCancerTagAction(id: number | string, tagData: Partial<Omit<CancerTag, 'id' | 'created_at'>>) {
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
      'SELECT id FROM cancer_tags WHERE slug = ? AND id != ? LIMIT 1',
      [tagData.slug.toLowerCase(), id]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Another tag is already using this slug.' };
    }
  }

  try {
    params.push(id);
    await query(`UPDATE cancer_tags SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/cancer-tags');
    revalidatePath('/admin/cancer-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to update cancer tag:', error);
    return { success: false, error: 'Failed to update tag in database.' };
  }
}

export async function deleteCancerTagAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM cancer_tags WHERE id = ?', [id]);
    revalidatePath('/admin/cancer-tags');
    revalidatePath('/admin/cancer-clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete cancer tag:', error);
    return { success: false, error: 'Failed to delete tag from database.' };
  }
}
