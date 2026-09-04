import { getPanchakarmaTagsAction } from '@/app/actions/panchakarmaActions';
import PanchakarmaTagsManagerClient from '@/components/admin/PanchakarmaTagsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPanchakarmaTagsPage() {
  const tags = await getPanchakarmaTagsAction();

  return <PanchakarmaTagsManagerClient initialTags={tags} />;
}
