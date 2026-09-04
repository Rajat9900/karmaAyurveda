import LocationFormClient from '@/components/admin/LocationFormClient';
import { getDiseasesAction } from '@/app/actions/diseaseActions';

export const dynamic = 'force-dynamic';

export default async function AdminAddLocationPage() {
  const diseases = await getDiseasesAction();

  return <LocationFormClient diseases={diseases} />;
}
