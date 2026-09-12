import LocationFormClient from '@/components/admin/LocationFormClient';
import { getDiseasesAction } from '@/app/actions/diseaseActions';
import { getClinicTagsAction } from '@/app/actions/clinicActions';

export const dynamic = 'force-dynamic';

export default async function AdminAddLocationPage() {
  const [diseases, allTags] = await Promise.all([
    getDiseasesAction(),
    getClinicTagsAction()
  ]);

  return <LocationFormClient diseases={diseases} allTags={allTags} />;
}
