import { redirect } from 'next/navigation';
import { getBlogByIdAction } from '@/app/actions/blogActions';
import { getBlogCategoriesAction } from '@/app/actions/blogCategoryActions';
import { getBlogTagsAction } from '@/app/actions/blogTagActions';
import BlogFormClient from '@/components/admin/BlogFormClient';

export const dynamic = 'force-dynamic';

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  // 1. Fetch blog post by ID
  const { id } = await params;
  const blog = await getBlogByIdAction(id);

  if (!blog) {
    redirect('/admin/blogs');
  }

  // 2. Fetch categories and tags from database
  const [categories, tags] = await Promise.all([
    getBlogCategoriesAction(),
    getBlogTagsAction()
  ]);

  return <BlogFormClient editingBlog={blog} categories={categories} tagsList={tags} />;
}
