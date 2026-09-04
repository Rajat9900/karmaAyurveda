import ClinicFormClient from '@/components/admin/ClinicFormClient';
import { getClinicTagsAction } from '@/app/actions/clinicActions';

export const dynamic = 'force-dynamic';

export default async function AdminAddClinicPage() {
  const tags = await getClinicTagsAction();

  return <ClinicFormClient allTags={tags} />;
}
