'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';

export interface CourseItem {
  id: number;
  title: string;
  link: string;
  image: string;
  description?: string;
  price?: string;
  eligibility?: string;
  mode?: string;
  duration?: string;
  sort: number;
  created_at?: string;
}

/**
 * Public/Admin Server Action to fetch all courses from the database.
 * Sorted by sort ASC, then by id DESC.
 */
export async function getCoursesAction(): Promise<CourseItem[]> {
  try {
    const courses = await query<CourseItem[]>(
      'SELECT * FROM courses ORDER BY sort ASC, id DESC'
    );
    return courses;
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return [];
  }
}

/**
 * Admin Server Action to create a new course.
 */
export async function createCourseAction(courseData: Omit<CourseItem, 'id' | 'created_at'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { title, link, image, description, price, eligibility, mode, duration, sort } = courseData;

  if (!title || !link || !image) {
    return { success: false, error: 'Title, Link, and Image are required fields.' };
  }

  try {
    await query(
      `INSERT INTO courses (title, link, image, description, price, eligibility, mode, duration, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        link,
        image,
        description || '',
        price || '',
        eligibility || '',
        mode || '',
        duration || '',
        sort !== undefined && sort !== null ? Number(sort) : 0
      ]
    );

    revalidatePath('/admin/courses');
    revalidatePath('/our-courses');
    return { success: true };
  } catch (error) {
    console.error('Failed to create course:', error);
    return { success: false, error: 'Failed to write course to database.' };
  }
}

/**
 * Admin Server Action to update an existing course.
 */
export async function updateCourseAction(id: number | string, courseData: Partial<Omit<CourseItem, 'id' | 'created_at'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(courseData).forEach(([key, val]) => {
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
    await query(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, params);

    revalidatePath('/admin/courses');
    revalidatePath('/our-courses');
    return { success: true };
  } catch (error) {
    console.error('Failed to update course:', error);
    return { success: false, error: 'Failed to update course in database.' };
  }
}

/**
 * Admin Server Action to delete a course.
 */
export async function deleteCourseAction(id: number | string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await query('DELETE FROM courses WHERE id = ?', [id]);
    revalidatePath('/admin/courses');
    revalidatePath('/our-courses');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete course:', error);
    return { success: false, error: 'Failed to delete course from database.' };
  }
}
