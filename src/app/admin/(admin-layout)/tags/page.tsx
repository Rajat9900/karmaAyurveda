import { getBlogTagsAction } from '@/app/actions/blogTagActions';
import TagsManagerClient from '@/components/admin/TagsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminTagsPage() {
  // 1. Fetch tags from database
  const tags = await getBlogTagsAction();

  return <TagsManagerClient initialTags={tags} />;
}