import WebStoriesManagerClient from '@/components/admin/WebStoriesManagerClient';
import { getWebStoriesAction } from '@/app/actions/webStoryActions';

export const dynamic = 'force-dynamic';

export default async function AdminViewWebStoriesPage() {
  const stories = await getWebStoriesAction();

  return <WebStoriesManagerClient initialStories={stories} />;
}
