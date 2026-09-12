'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { checkAuth } from './authActions';
import { BlogPost } from '@/lib/blogData';

// A blog's `category` column can hold several comma-separated category names (e.g. bulk
// imports commonly carry "Treatment For Kidney Disease, Chronic Kidney Disease" as one cell).
// These helpers resolve that into a proper list of {name, slug} entries against blog_categories,
// instead of treating the whole joined string as a single category — which is what the old
// `LEFT JOIN blog_categories c ON c.name = b.category` did, matching nothing for multi-category
// posts (or matching a garbage row whose `name` was itself the literal joined string).
const splitCategoryNames = (categoryField: string): string[] =>
  (categoryField || '').split(',').map(c => c.trim()).filter(Boolean);

async function getCategoryNameToSlugMap(): Promise<Map<string, string>> {
  const rows = await query<{ name: string; slug: string }[]>('SELECT name, slug FROM blog_categories');
  return new Map(rows.map(r => [r.name, r.slug]));
}

function attachCategories<T extends { category: string }>(row: T, categoryMap: Map<string, string>) {
  const categories = splitCategoryNames(row.category)
    .map(name => ({ name, slug: categoryMap.get(name) || '' }))
    .filter(c => c.slug);
  return {
    categories,
    category_slug: categories[0]?.slug
  };
}

/**
 * Public Server Action to get all blog posts, including their tag associations.
 */
export async function getBlogsAction(): Promise<BlogPost[]> {
  try {
    const [blogs, categoryMap] = await Promise.all([
      query<any[]>(
        `SELECT b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category,
                b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status,
                GROUP_CONCAT(DISTINCT t.name) AS tag_names, GROUP_CONCAT(DISTINCT t.id) AS tag_ids, GROUP_CONCAT(DISTINCT t.slug) AS tag_slug_list
         FROM blogs b
         LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id
         LEFT JOIN blog_tags t ON pt.tag_id = t.id
         GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status
         ORDER BY b.id DESC`
      ),
      getCategoryNameToSlugMap()
    ]);
    return blogs.map(row => ({
      ...row,
      tags: row.tag_names ? row.tag_names.split(',') : [],
      tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : [],
      tag_slugs: row.tag_slug_list ? row.tag_slug_list.split(',') : [],
      ...attachCategories(row, categoryMap)
    }));
  } catch (error) {
    console.error('Failed to get blogs from DB:', error);
    return [];
  }
}

/**
 * Public Server Action to get all Active blog posts, for public-facing listings
 * (blogs page, category/tag pages, recent posts sidebar, static param generation).
 * Inactive posts are excluded so they're effectively hidden from the public site.
 */
export async function getPublicBlogsAction(): Promise<BlogPost[]> {
  const blogs = await getBlogsAction();
  return blogs.filter(b => b.status !== 'Inactive');
}

/**
 * Public Server Action to get every blog post belonging to a given category,
 * resolved by the category's slug (blogs.category stores the category name, not an ID).
 */
export async function getBlogsByCategoryAction(categorySlug: string): Promise<BlogPost[]> {
  try {
    const categoryMap = await getCategoryNameToSlugMap();
    const categoryName = [...categoryMap.entries()].find(([, slug]) => slug === categorySlug)?.[0];
    if (!categoryName) return [];

    const blogs = await query<any[]>(
      `SELECT b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category,
              b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status,
              GROUP_CONCAT(DISTINCT t.name) AS tag_names, GROUP_CONCAT(DISTINCT t.id) AS tag_ids, GROUP_CONCAT(DISTINCT t.slug) AS tag_slug_list
       FROM blogs b
       LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id
       LEFT JOIN blog_tags t ON pt.tag_id = t.id
       WHERE b.status != 'Inactive'
       GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status
       ORDER BY b.id DESC`
    );

    // Matched in JS rather than SQL, since `category` can hold several comma-separated
    // names per row and needs the same split/trim treatment as the display side.
    return blogs
      .filter(row => splitCategoryNames(row.category).includes(categoryName))
      .map(row => ({
        ...row,
        tags: row.tag_names ? row.tag_names.split(',') : [],
        tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : [],
        tag_slugs: row.tag_slug_list ? row.tag_slug_list.split(',') : [],
        ...attachCategories(row, categoryMap)
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
    const [blogs, categoryMap] = await Promise.all([
      query<any[]>(
        `SELECT b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category,
                b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status,
                GROUP_CONCAT(DISTINCT t.name) AS tag_names, GROUP_CONCAT(DISTINCT t.id) AS tag_ids, GROUP_CONCAT(DISTINCT t.slug) AS tag_slug_list
         FROM blogs b
         LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id
         LEFT JOIN blog_tags t ON pt.tag_id = t.id
         WHERE b.id IN (
           SELECT pt2.blog_id FROM blog_post_tags pt2
           INNER JOIN blog_tags t2 ON t2.id = pt2.tag_id
           WHERE t2.slug = ?
         ) AND b.status != 'Inactive'
         GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status
         ORDER BY b.id DESC`,
        [tagSlug]
      ),
      getCategoryNameToSlugMap()
    ]);
    return blogs.map(row => ({
      ...row,
      tags: row.tag_names ? row.tag_names.split(',') : [],
      tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : [],
      tag_slugs: row.tag_slug_list ? row.tag_slug_list.split(',') : [],
      ...attachCategories(row, categoryMap)
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
    const [blogs, categoryMap] = await Promise.all([
      query<any[]>(
        `SELECT b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category,
                b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status,
                GROUP_CONCAT(DISTINCT t.name) AS tag_names, GROUP_CONCAT(DISTINCT t.id) AS tag_ids, GROUP_CONCAT(DISTINCT t.slug) AS tag_slug_list
         FROM blogs b
         LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id
         LEFT JOIN blog_tags t ON pt.tag_id = t.id
         WHERE b.slug = ? AND b.status != 'Inactive'
         GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status
         LIMIT 1`,
        [slug]
      ),
      getCategoryNameToSlugMap()
    ]);
    if (blogs.length === 0) return undefined;
    const row = blogs[0];
    return {
      ...row,
      tags: row.tag_names ? row.tag_names.split(',') : [],
      tagIds: row.tag_ids ? row.tag_ids.split(',').map(Number) : [],
      tag_slugs: row.tag_slug_list ? row.tag_slug_list.split(',') : [],
      ...attachCategories(row, categoryMap)
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

  const { slug, title, excerpt, content, author, date, image, category, tagIds, meta_title, meta_keywords, meta_des, head_script, footer_script, status } = blogData;

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
      `INSERT INTO blogs (slug, title, excerpt, content, author, date, image, category, meta_title, meta_keywords, meta_des, head_script, footer_script, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        meta_des || excerpt || '',
        head_script || '',
        footer_script || '',
        status || 'Active'
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
              b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status,
              GROUP_CONCAT(t.name) AS tag_names, GROUP_CONCAT(t.id) AS tag_ids
       FROM blogs b
       LEFT JOIN blog_post_tags pt ON b.id = pt.blog_id
       LEFT JOIN blog_tags t ON pt.tag_id = t.id
       WHERE b.id = ?
       GROUP BY b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.date, b.image, b.category, b.meta_title, b.meta_keywords, b.meta_des, b.head_script, b.footer_script, b.status
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

const slugify = (text: string) =>
  text.toLowerCase().replace(/\//g, '-').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export interface BulkBlogRow {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  date?: string;
  image?: string;
  category?: string;
  tags?: string; // comma-separated tag names
  meta_title?: string;
  meta_keywords?: string;
  meta_des?: string;
  head_script?: string;
  footer_script?: string;
  status?: string;
}

export interface BulkImportResult {
  success: boolean;
  created: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

/**
 * Admin Server Action to bulk-import blog posts from a parsed CSV/Excel file.
 * The client parses the file and maps its columns to these field names before
 * calling this action, so each row here already matches the BulkBlogRow shape.
 * Rows are processed independently — one bad row doesn't abort the whole import.
 *
 * The client sends rows in small batches rather than the whole file at once, since a
 * single large request/response for a big CSV can get truncated in transit. `rowOffset`
 * lets each batch report spreadsheet row numbers that stay accurate across batches.
 */
export async function bulkImportBlogsAction(rows: BulkBlogRow[], rowOffset: number = 0): Promise<BulkImportResult> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return { success: false, created: 0, skipped: 0, errors: [{ row: 0, reason: 'Unauthorized' }] };
  }

  let created = 0;
  let skipped = 0;
  const errors: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = rowOffset + i + 2; // +1 for header row, +1 for 1-indexing — matches the row number the admin sees in their spreadsheet

    try {
      const title = (row.title || '').trim();
      if (!title) {
        skipped++;
        errors.push({ row: rowNum, reason: 'Missing title — row skipped.' });
        continue;
      }

      const slug = (row.slug && row.slug.trim()) || slugify(title);

      const existing = await query('SELECT id FROM blogs WHERE slug = ? LIMIT 1', [slug]);
      if (existing.length > 0) {
        skipped++;
        errors.push({ row: rowNum, reason: `Slug "${slug}" already exists — row skipped.` });
        continue;
      }

      const author = (row.author || 'Admin').trim();
      const category = (row.category || 'General').trim();
      const excerpt = (row.excerpt || '').trim();
      const content = (row.content || '').trim() || `<p>${title}</p>`;
      const date = (row.date && row.date.trim()) || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const image = (row.image && row.image.trim()) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
      const status = row.status && row.status.trim().toLowerCase() === 'inactive' ? 'Inactive' : 'Active';

      // Auto-create each individual category in blog_categories if new, so it's browsable at
      // /category/{slug} — a cell can carry several comma-separated names (e.g. "Treatment For
      // Kidney Disease, Chronic Kidney Disease"), so each is created separately rather than as
      // one combined row, mirroring how comma-separated tags are resolved below.
      const categoryNames = splitCategoryNames(category);
      for (const categoryName of categoryNames) {
        const categoryExisting = await query<{ id: number }[]>('SELECT id FROM blog_categories WHERE name = ? LIMIT 1', [categoryName]);
        if (categoryExisting.length === 0) {
          const categorySlug = slugify(categoryName);
          const categorySlugTaken = await query('SELECT id FROM blog_categories WHERE slug = ? LIMIT 1', [categorySlug]);
          if (categorySlugTaken.length === 0) {
            await query('INSERT INTO blog_categories (name, slug) VALUES (?, ?)', [categoryName, categorySlug]);
          }
        }
      }

      const insertResult = await query<any>(
        `INSERT INTO blogs (slug, title, excerpt, content, author, date, image, category, meta_title, meta_keywords, meta_des, head_script, footer_script, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          slug,
          title,
          excerpt,
          content,
          author,
          date,
          image,
          category,
          (row.meta_title || '').trim() || title,
          (row.meta_keywords || '').trim() || `${category.toLowerCase()}, ayurveda, ${author.toLowerCase()}`,
          (row.meta_des || '').trim() || excerpt,
          (row.head_script || '').trim(),
          (row.footer_script || '').trim(),
          status
        ]
      );

      const blogId = insertResult.insertId;

      // Resolve comma-separated tag names to tag IDs, creating any tags that don't exist yet
      const tagNames = (row.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      for (const tagName of tagNames) {
        let tagRows = await query<{ id: number }[]>('SELECT id FROM blog_tags WHERE name = ? LIMIT 1', [tagName]);
        let tagId: number;
        if (tagRows.length === 0) {
          const tagSlug = slugify(tagName);
          const tagResult = await query<any>('INSERT INTO blog_tags (name, slug) VALUES (?, ?)', [tagName, tagSlug]);
          tagId = tagResult.insertId;
        } else {
          tagId = tagRows[0].id;
        }
        await query('INSERT IGNORE INTO blog_post_tags (blog_id, tag_id) VALUES (?, ?)', [blogId, tagId]);
      }

      // Without this, a slug that was ever requested before this row existed (or was
      // prerendered as part of an earlier build) keeps serving a stale cached 404 forever,
      // since bulk-imported posts otherwise never revalidate their own detail path.
      revalidatePath(`/blog/${slug}`);

      created++;
    } catch (error) {
      console.error(`Bulk import failed on row ${rowNum}:`, error);
      skipped++;
      errors.push({ row: rowNum, reason: 'Unexpected error while saving this row.' });
    }
  }

  revalidatePath('/blogs');
  revalidatePath('/admin/blogs');
  revalidatePath('/admin/dashboard');

  return { success: true, created, skipped, errors };
}
