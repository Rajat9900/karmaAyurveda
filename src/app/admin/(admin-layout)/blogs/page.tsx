import { getBlogsAction } from '@/app/actions/blogActions';
import BlogsManagerClient from '@/components/admin/BlogsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminBlogsPage() {
  // 1. Fetch Initial Database Data
  const blogs = await getBlogsAction();

  return <BlogsManagerClient initialBlogs={blogs} />;
}
