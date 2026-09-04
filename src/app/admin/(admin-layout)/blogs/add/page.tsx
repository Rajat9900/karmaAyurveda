import { getBlogCategoriesAction } from '@/app/actions/blogCategoryActions';
import { getBlogTagsAction } from '@/app/actions/blogTagActions';
import BlogFormClient from '@/components/admin/BlogFormClient';

export const dynamic = 'force-dynamic';

export default async function AddBlogPage() {
  // Fetch Categories and Tags from database
  const [categories, tags] = await Promise.all([
    getBlogCategoriesAction(),
    getBlogTagsAction()
  ]);

  return <BlogFormClient categories={categories} tagsList={tags} />;
}
