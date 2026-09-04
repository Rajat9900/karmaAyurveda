'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';
import { BlogPost } from '@/lib/blogData';

/**
 * Public Server Action to get all blog posts, including their tag associations.
 */
export async function getBlogsAction(): Promise<BlogPost[]> {
  try {
    const blogs = await query<any[]>(
      `SELECT b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, c.slug AS category_slug,
              b.meta_title, b.meta_keywords, b.meta_des,
              GROUP_CONCAT(DISTINCT t.name) AS tag_names, GROUP_CONCAT(DISTINCT t.id) AS tag_ids, GROUP_CONCAT(DISTINCT t.slug) AS tag_slug_list
       FROM blogs b
       LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id
       LEFT JOIN blog_tags t ON pt.tag_id = t.id
       LEFT JOIN blog_categories c ON c.name = b.category
       GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, c.slug, b.meta_title, b.meta_keywords, b.meta_des
       ORDER BY b.id DESC`
    );
    return blogs.map(row => ({
      ...row,
      tags: row.tag_names ? row.tag_names.split(',') : [],
      tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : [],
      tag_slugs: row.tag_slug_list ? row.tag_slug_list.split(',') : []
    }));
  } catch (error) {
    console.error('Failed to get blogs from DB:', error);
    return [];
  }
}

/**
 * Public Server Action to get every blog post belonging to a given category,
 * resolved by the category's slug (blogs.category stores the category name, not an ID).
 */
export async function getBlogsByCategoryAction(categorySlug: string): Promise<BlogPost[]> {
  try {
    const blogs = await query<any[]>(
      `SELECT b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, c.slug AS category_slug,
              b.meta_title, b.meta_keywords, b.meta_des,
              GROUP_CONCAT(DISTINCT t.name) AS tag_names, GROUP_CONCAT(DISTINCT t.id) AS tag_ids, GROUP_CONCAT(DISTINCT t.slug) AS tag_slug_list
       FROM blogs b
       LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id
       LEFT JOIN blog_tags t ON pt.tag_id = t.id
       INNER JOIN blog_categories c ON c.name = b.category
       WHERE c.slug = ?
       GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, c.slug, b.meta_title, b.meta_keywords, b.meta_des
       ORDER BY b.id DESC`,
      [categorySlug]
    );
    return blogs.map(row => ({
      ...row,
      tags: row.tag_names ? row.tag_names.split(',') : [],
      tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : [],
      tag_slugs: row.tag_slug_list ? row.tag_slug_list.split(',') : []
    }));
  } catch (error) {
    console.error(`Failed to get blogs for category "${categorySlug}":`, error);
    return [];
  }
}

/**
 * Public Server Action to get every blog post tagged with a given tag, resolved by the tag's slug.
 */
export async function getBlogsByTagAction(tagSlug: string): Promise<BlogPost[]> {
  try {
    const blogs = await query<any[]>(
      `SELECT b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, c.slug AS category_slug,
              b.meta_title, b.meta_keywords, b.meta_des,
              GROUP_CONCAT(DISTINCT t.name) AS tag_names, GROUP_CONCAT(DISTINCT t.id) AS tag_ids, GROUP_CONCAT(DISTINCT t.slug) AS tag_slug_list
       FROM blogs b
       LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id
       LEFT JOIN blog_tags t ON pt.tag_id = t.id
       LEFT JOIN blog_categories c ON c.name = b.category
       WHERE b.id IN (
         SELECT pt2.blog_id FROM blog_post_tags pt2
         INNER JOIN blog_tags t2 ON t2.id = pt2.tag_id
         WHERE t2.slug = ?
       )
       GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, c.slug, b.meta_title, b.meta_keywords, b.meta_des
       ORDER BY b.id DESC`,
      [tagSlug]
    );
    return blogs.map(row => ({
      ...row,
      tags: row.tag_names ? row.tag_names.split(',') : [],
      tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : [],
      tag_slugs: row.tag_slug_list ? row.tag_slug_list.split(',') : []
    }));
  } catch (error) {
    console.error(`Failed to get blogs for tag "${tagSlug}":`, error);
    return [];
  }
}

/**
 * Public Server Action to get a single blog post by its slug, including tag associations.
 */
export async function getBlogBySlugAction(slug: string): Promise<BlogPost | undefined> {
  try {
    const blogs = await query<any[]>(
      `SELECT b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, c.slug AS category_slug,
              b.meta_title, b.meta_keywords, b.meta_des,
              GROUP_CONCAT(DISTINCT t.name) AS tag_names, GROUP_CONCAT(DISTINCT t.id) AS tag_ids, GROUP_CONCAT(DISTINCT t.slug) AS tag_slug_list
       FROM blogs b
       LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id
       LEFT JOIN blog_tags t ON pt.tag_id = t.id
       LEFT JOIN blog_categories c ON c.name = b.category
       WHERE b.slug = ?
       GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, c.slug, b.meta_title, b.meta_keywords, b.meta_des
       LIMIT 1`,
      [slug]
    );
    if (blogs.length === 0) return undefined;
    const row = blogs[0];
    return {
      ...row,
      tags: row.tag_names ? row.tag_names.split(',') : [],
      tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : [],
      tag_slugs: row.tag_slug_list ? row.tag_slug_list.split(',') : []
    };
  } catch (error) {
    console.error(`Failed to get blog by slug "${slug}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to create a new blog post.
 */
export async function createBlogAction(blogData: Omit<BlogPost, 'id'>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const { slug, title, excerpt, content, author, date, image, category, tagIds, meta_title, meta_keywords, meta_des } = blogData;

  if (!slug || !title || !content) {
    return { success: false, error: 'Slug, title, and content are required fields.' };
  }

  try {
    // Check if slug is unique
    const existing = await query('SELECT id FROM blogs WHERE slug = ? LIMIT 1', [slug]);
    if (existing.length > 0) {
      return { success: false, error: 'A blog post with this slug already exists.' };
    }

    const insertResult = await query(
      `INSERT INTO blogs (slug, title, excerpt, content, author, date, image, category, meta_title, meta_keywords, meta_des) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug, 
        title, 
        excerpt || '', 
        content, 
        author || 'Admin', 
        date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), 
        image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 
        category || 'General',
        meta_title || title,
        meta_keywords || `${category.toLowerCase()}, ayurveda, ${author.toLowerCase()}`,
        meta_des || excerpt || ''
      ]
    );

    const blogId = insertResult.insertId;

    // Sync tag associations in join table
    if (blogId && tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await query('INSERT INTO blog_post_tags (blog_id, tag_id) VALUES (?, ?)', [blogId, tagId]);
      }
    }

    revalidatePath('/blogs');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to create blog:', error);
    return { success: false, error: 'Failed to write blog post to database.' };
  }
}

/**
 * Admin Server Action to update an existing blog post.
 */
export async function updateBlogAction(id: string, blogData: Partial<Omit<BlogPost, 'id'>>) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  // Separate tagIds from the fields to update in the blogs table
  const { tagIds, ...blogFields } = blogData;

  const fields: string[] = [];
  const params: any[] = [];

  Object.entries(blogFields).forEach(([key, val]) => {
    if (val !== undefined) {
      fields.push(`\`${key}\` = ?`);
      params.push(val);
    }
  });

  // Check unique slug if it is being changed
  if (blogFields.slug) {
    const existing = await query('SELECT id FROM blogs WHERE slug = ? AND id != ? LIMIT 1', [blogFields.slug, id]);
    if (existing.length > 0) {
      return { success: false, error: 'Another blog post is already using this slug.' };
    }
  }

  try {
    // 1. Update blogs table fields if any are modified
    if (fields.length > 0) {
      params.push(id);
      await query(`UPDATE blogs SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    // 2. Sync tag associations (delete old, insert new)
    if (tagIds !== undefined) {
      await query('DELETE FROM blog_post_tags WHERE blog_id = ?', [id]);
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          await query('INSERT INTO blog_post_tags (blog_id, tag_id) VALUES (?, ?)', [id, tagId]);
        }
      }
    }

    // Fetch updated slug to revalidate properly
    const updated = await query<{ slug: string }[]>('SELECT slug FROM blogs WHERE id = ? LIMIT 1', [id]);
    const updatedSlug = updated[0]?.slug;

    revalidatePath('/blogs');
    if (updatedSlug) {
      revalidatePath(`/blog/${updatedSlug}`);
    }
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to update blog:', error);
    return { success: false, error: 'Failed to update blog post in database.' };
  }
}

/**
 * Admin Server Action to delete a blog post.
 */
export async function deleteBlogAction(id: string) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get slug first to revalidate cache
    const existing = await query<{ slug: string }[]>('SELECT slug FROM blogs WHERE id = ? LIMIT 1', [id]);
    const slug = existing[0]?.slug;

    await query('DELETE FROM blogs WHERE id = ?', [id]);

    revalidatePath('/blogs');
    if (slug) {
      revalidatePath(`/blog/${slug}`);
    }
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete blog:', error);
    return { success: false, error: 'Failed to delete blog post from database.' };
  }
}

/**
 * Admin Server Action to get a single blog post by its database ID.
 */
export async function getBlogByIdAction(id: string): Promise<BlogPost | undefined> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return undefined;
  }
  try {
    const blogs = await query<any[]>(
      `SELECT b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, 
              GROUP_CONCAT(t.name) AS tag_names, GROUP_CONCAT(t.id) AS tag_ids
       FROM blogs b 
       LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id 
       LEFT JOIN blog_tags t ON pt.tag_id = t.id 
       WHERE b.id = ?
       GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category
       LIMIT 1`,
      [id]
    );
    if (blogs.length === 0) return undefined;
    const row = blogs[0];
    return {
      ...row,
      tags: row.tag_names ? row.tag_names.split(',') : [],
      tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : []
    };
  } catch (error) {
    console.error(`Failed to get blog by ID "${id}":`, error);
    return undefined;
  }
}

/**
 * Admin Server Action to upload a featured blog image and save it in public/upload/blog
 */
export async function uploadBlogImageAction(formData: FormData) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const file = formData.get('image') as File;
  if (!file || file.size === 0) {
    return { success: false, error: 'No file uploaded.' };
  }

  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Path setup
    const uploadDir = path.join(process.cwd(), 'public', 'upload', 'blog');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique name
    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Save
    fs.writeFileSync(filePath, buffer);

    return { success: true, url: `/upload/blog/${filename}` };
  } catch (error) {
    console.error('Image upload action error:', error);
    return { success: false, error: 'Failed to save uploaded image.' };
  }
}
