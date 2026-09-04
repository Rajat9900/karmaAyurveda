import { getLocationsAction } from '@/app/actions/locationActions';
import LocationsManagerClient from '@/components/admin/LocationsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminLocationsPage() {
  const locations = await getLocationsAction();

  return <LocationsManagerClient initialLocations={locations} />;
}
