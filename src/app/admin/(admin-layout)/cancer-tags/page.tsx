import { getCancerTagsAction } from '@/app/actions/cancerActions';
import CancerTagsManagerClient from '@/components/admin/CancerTagsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminCancerTagsPage() {
  const tags = await getCancerTagsAction();

  return <CancerTagsManagerClient initialTags={tags} />;
}
