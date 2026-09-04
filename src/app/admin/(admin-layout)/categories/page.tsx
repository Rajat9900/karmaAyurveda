import { getBlogCategoriesAction } from '@/app/actions/blogCategoryActions';
import CategoriesManagerClient from '@/components/admin/CategoriesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  // 1. Fetch Categories from DB
  const categories = await getBlogCategoriesAction();

  return <CategoriesManagerClient initialCategories={categories} />;
}
