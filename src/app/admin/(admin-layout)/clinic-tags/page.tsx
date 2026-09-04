import { getClinicTagsAction } from '@/app/actions/clinicActions';
import ClinicTagsManagerClient from '@/components/admin/ClinicTagsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminClinicTagsPage() {
  const tags = await getClinicTagsAction();

  return <ClinicTagsManagerClient initialTags={tags} />;
}
