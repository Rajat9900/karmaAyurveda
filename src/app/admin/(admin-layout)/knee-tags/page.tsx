import { getKneeTagsAction } from '@/app/actions/kneeActions';
import KneeTagsManagerClient from '@/components/admin/KneeTagsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminKneeTagsPage() {
  const tags = await getKneeTagsAction();

  return <KneeTagsManagerClient initialTags={tags} />;
}
