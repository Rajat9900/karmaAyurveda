'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';
import { Clinic, ClinicTag, ClinicGalleryImage, ClinicDoctor } from '@/lib/clinicData';

/**
 * Public Server Action to fetch all clinics, joined with their linked tags.
 */
export async function getClinicsAction(): Promise<Clinic[]> {
  try {
    const clinics = await query<any[]>(
      `SELECT c.id, c.slug, c.name, c.address, c.city, c.phone, c.email, c.map_url, c.image, c.video_url, c.created_at,
        (SELECT GROUP_CONCAT(clinic_tag_id) FROM clinic_clinic_tags WHERE clinic_id = c.id) AS tag_ids_str,
        (SELECT GROUP_CONCAT(ct.name) FROM clinic_clinic_tags cct JOIN clinic_tags ct ON cct.clinic_tag_id = ct.id WHERE cct.clinic_id = c.id) AS tag_names_str
       FROM clinics c
       ORDER BY c.id DESC`
    );
    return clinics.map(c => ({
      ...c,
      tag_ids: c.tag_ids_str ? c.tag_ids_str.split(',').map((id: string) => parseInt(id)) : [],
      tag_names: c.tag_names_str ? c.tag_names_str.split(',') : []
    }));
  } catch (error) {
    console.error('Failed to fetch clinics from DB:', error);
    return [];
  }
}

/**
 * Admin Server Action to get a single clinic by ID, including its linked tag IDs.
 */
export async function getClinicByIdAction(id: string): Promise<Clinic | undefined> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return undefined;
  }
  try {
    const clinics = await query<any[]>(
      `SELECT c.id, c.slug, c.name, c.address, c.city, c.phone, c.email, c.map_url, c.image, c.video_url, c.created_at,
        (SELECT GROUP_CONCAT(clinic_tag_id) FROM clinic_clinic_tags WHERE clinic_id = c.id) AS tag_ids_str
       FROM clinics c
       WHERE c.id = ? LIMIT 1`,
      [id]
    );
    if (!clinics[0]) return undefined;
    return {
      ...clinics[0],
      tag_ids: clinics[0].tag_ids_str ? clinics[0].tag_ids_str.split(',').map((tid: string) => parseInt(tid)) : []
    };
  } catch (error) {
    console.error(`Failed to fetch clinic with ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new clinic.
 */
export async function createClinicAction(clinicData: Omit<Clinic, 'id' | 'tag_ids' | 'tag_names'>, tagIds: number[] = []) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { slug, name, address, city, phone, email, map_url, image, video_url } = clinicData;

  if (!slug || !name || !address || !city || !phone || !email) {
    return { success: false, error: 'Slug, Name, Address, City, Phone, and Email are required fields.' };
  }

  try {
    // Check if slug is unique
    const existing = await query('SELECT id FROM clinics WHERE slug = ? LIMIT 1', [slug]);
    if (existing.length > 0) {
      return { success: false, error: 'A clinic location with this slug already exists.' };
    }

    const result = await query<any>(
      `INSERT INTO clinics (slug, name, address, city, phone, email, map_url, image, video_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        name,
        address,
        city,
        phone,
        email,
        map_url || '',
        image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
        video_url || ''
      ]
    );

    const newClinicId = result.insertId;
    if (newClinicId && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await query('INSERT INTO clinic_clinic_tags (clinic_id, clinic_tag_id) VALUES (?, ?)', [newClinicId, tagId]);
      }
    }

    revalidatePath('/our-clinics');
    revalidatePath('/admin/dashboard');

    return { success: true, id: newClinicId as number };
  } catch (error) {
    console.error('Failed to create clinic:', error);
    return { success: false, error: 'Failed to write clinic location to database.' };
  }
}

/**
 * Admin Server Action to update an existing clinic.
 */
export async function updateClinicAction(id: string, clinicData: Partial<Omit<Clinic, 'id' | 'tag_ids' | 'tag_names'>>, tagIds?: number[]) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(clinicData).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val);
    }
  });

  if (fields.length === 0 && tagIds === undefined) {
    return { success: false, error: 'No fields to update.' };
  }

  if (clinicData.slug) {
    const existing = await query('SELECT id FROM clinics WHERE slug = ? AND id != ? LIMIT 1', [clinicData.slug, id]);
    if (existing.length > 0) {
      return { success: false, error: 'Another clinic location is already using this slug.' };
    }
  }

  try {
    if (fields.length > 0) {
      params.push(id);
      await query(`UPDATE clinics SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    if (tagIds !== undefined) {
      await query('DELETE FROM clinic_clinic_tags WHERE clinic_id = ?', [id]);
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          await query('INSERT INTO clinic_clinic_tags (clinic_id, clinic_tag_id) VALUES (?, ?)', [id, tagId]);
        }
      }
    }

    revalidatePath('/our-clinics');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to update clinic:', error);
    return { success: false, error: 'Failed to update clinic location in database.' };
  }
}

/**
 * Admin Server Action to delete a clinic.
 */
export async function deleteClinicAction(id: string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM clinics WHERE id = ?', [id]);

    revalidatePath('/our-clinics');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete clinic:', error);
    return { success: false, error: 'Failed to delete clinic location from database.' };
  }
}

/**
 * Admin Server Action to upload a clinic featured image and save it in public/upload/clinic
 */
export async function uploadClinicImageAction(formData: FormData) {
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

    const uploadDir = path.join(process.cwd(), 'public', 'upload', 'clinic');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return { success: true, url: `/upload/clinic/${filename}` };
  } catch (error) {
    console.error('Clinic image upload error:', error);
    return { success: false, error: 'Failed to save uploaded image.' };
  }
}

// ==========================================
// Clinic Tags Server Actions
// ==========================================

/**
 * Public Server Action to fetch all clinic tags.
 */
export async function getClinicTagsAction(): Promise<ClinicTag[]> {
  try {
    const tags = await query<ClinicTag[]>('SELECT * FROM clinic_tags ORDER BY name ASC');
    return tags;
  } catch (error) {
    console.error('Failed to fetch clinic tags:', error);
    return [];
  }
}

/**
 * Admin Server Action to create a new clinic tag.
 */
export async function createClinicTagAction(tagData: Omit<ClinicTag, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { name, slug } = tagData;
  if (!name || !slug) {
    return { success: false, error: 'Tag name and slug are required.' };
  }

  try {
    const existing = await query('SELECT id FROM clinic_tags WHERE slug = ? LIMIT 1', [slug.toLowerCase()]);
    if (existing.length > 0) {
      return { success: false, error: 'A tag with this slug already exists.' };
    }

    await query('INSERT INTO clinic_tags (name, slug) VALUES (?, ?)', [name, slug.toLowerCase()]);

    revalidatePath('/admin/clinic-tags');
    revalidatePath('/admin/clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to create clinic tag:', error);
    return { success: false, error: 'Failed to write tag to database.' };
  }
}

/**
 * Admin Server Action to update an existing clinic tag.
 */
export async function updateClinicTagAction(id: number | string, tagData: Partial<Omit<ClinicTag, 'id' | 'created_at'>>) {
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
      'SELECT id FROM clinic_tags WHERE slug = ? AND id != ? LIMIT 1',
      [tagData.slug.toLowerCase(), id]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Another tag is already using this slug.' };
    }
  }

  try {
    params.push(id);
    await query(`UPDATE clinic_tags SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/clinic-tags');
    revalidatePath('/admin/clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to update clinic tag:', error);
    return { success: false, error: 'Failed to update tag in database.' };
  }
}

/**
 * Admin Server Action to delete a clinic tag.
 */
export async function deleteClinicTagAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM clinic_tags WHERE id = ?', [id]);
    revalidatePath('/admin/clinic-tags');
    revalidatePath('/admin/clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete clinic tag:', error);
    return { success: false, error: 'Failed to delete tag from database.' };
  }
}

// ==========================================
// Clinic Gallery Server Actions
// ==========================================

/**
 * Public Server Action to fetch every gallery image for a clinic.
 */
export async function getClinicGalleryAction(clinicId: number | string): Promise<ClinicGalleryImage[]> {
  try {
    const images = await query<ClinicGalleryImage[]>(
      'SELECT * FROM clinic_gallery WHERE clinic_id = ? ORDER BY sort_order ASC, id ASC',
      [clinicId]
    );
    return images;
  } catch (error) {
    console.error(`Failed to fetch gallery for clinic "${clinicId}":`, error);
    return [];
  }
}

/**
 * Admin Server Action to upload and attach a gallery photo to a clinic.
 * Combines the file upload + DB row insert in one call so the client
 * immediately gets back a real row (with its own id) to render/delete.
 */
export async function addClinicGalleryImageAction(clinicId: number | string, formData: FormData) {
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

    const uploadDir = path.join(process.cwd(), 'public', 'upload', 'clinic-gallery');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/upload/clinic-gallery/${filename}`;

    const [{ nextOrder }] = await query<{ nextOrder: number }[]>(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS nextOrder FROM clinic_gallery WHERE clinic_id = ?',
      [clinicId]
    );

    const result = await query<any>(
      'INSERT INTO clinic_gallery (clinic_id, image, sort_order) VALUES (?, ?, ?)',
      [clinicId, imageUrl, nextOrder]
    );

    revalidatePath('/our-clinics');
    revalidatePath('/admin/clinics');

    return {
      success: true,
      image: { id: result.insertId, clinic_id: Number(clinicId), image: imageUrl, sort_order: nextOrder } as ClinicGalleryImage
    };
  } catch (error) {
    console.error('Clinic gallery image upload error:', error);
    return { success: false, error: 'Failed to save uploaded image.' };
  }
}

/**
 * Admin Server Action to remove a single gallery photo.
 */
export async function deleteClinicGalleryImageAction(imageId: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM clinic_gallery WHERE id = ?', [imageId]);
    revalidatePath('/our-clinics');
    revalidatePath('/admin/clinics');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete clinic gallery image:', error);
    return { success: false, error: 'Failed to delete image from database.' };
  }
}

// ==========================================
// Clinic Doctors Server Actions
// (lightweight, clinic-specific entries — separate from the global "doctors" table)
// ==========================================

/**
 * Public Server Action to fetch the doctor entries listed for one clinic.
 */
export async function getClinicDoctorsAction(clinicId: number | string): Promise<ClinicDoctor[]> {
  try {
    const doctors = await query<ClinicDoctor[]>(
      'SELECT * FROM clinic_doctors WHERE clinic_id = ? ORDER BY sort_order ASC, id ASC',
      [clinicId]
    );
    return doctors;
  } catch (error) {
    console.error(`Failed to fetch doctors for clinic "${clinicId}":`, error);
    return [];
  }
}

/**
 * Admin Server Action to replace a clinic's full doctor list in one go.
 * Deletes all existing entries for the clinic and re-inserts the given list,
 * matching the "full replace" pattern already used for clinic tags.
 */
export async function setClinicDoctorsListAction(
  clinicId: number | string,
  doctors: { name: string; designation: string; about: string; image?: string }[]
) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM clinic_doctors WHERE clinic_id = ?', [clinicId]);

    for (let i = 0; i < doctors.length; i++) {
      const doc = doctors[i];
      if (!doc.name.trim()) continue;
      await query(
        'INSERT INTO clinic_doctors (clinic_id, name, designation, about, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [clinicId, doc.name.trim(), doc.designation.trim(), doc.about.trim(), doc.image || null, i]
      );
    }

    revalidatePath('/our-clinics');
    revalidatePath('/admin/clinics');
    return { success: true };
  } catch (error) {
    console.error(`Failed to set doctors for clinic "${clinicId}":`, error);
    return { success: false, error: 'Failed to save the clinic\'s doctor list.' };
  }
}

/**
 * Admin Server Action to upload a clinic-specific doctor's photo and save it in public/upload/clinic-doctors
 */
export async function uploadClinicDoctorImageAction(formData: FormData) {
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

    const uploadDir = path.join(process.cwd(), 'public', 'upload', 'clinic-doctors');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return { success: true, url: `/upload/clinic-doctors/${filename}` };
  } catch (error) {
    console.error('Clinic doctor image upload error:', error);
    return { success: false, error: 'Failed to save uploaded image.' };
  }
}
