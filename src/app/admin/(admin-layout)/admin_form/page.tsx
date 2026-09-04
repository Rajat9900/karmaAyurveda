import WebStoryFormClient from '@/components/admin/WebStoryFormClient';
import { getWebStoryByIdAction } from '@/app/actions/webStoryActions';

export const dynamic = 'force-dynamic';

interface AdminFormPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AdminAddWebStoryPage({ searchParams }: AdminFormPageProps) {
  const { id } = await searchParams;
  const editingStory = id ? await getWebStoryByIdAction(id) : undefined;

  return <WebStoryFormClient editingStory={editingStory} />;
}
