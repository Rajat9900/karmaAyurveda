import { getLocationsAction, getLocationDiseaseLinksAction } from '@/app/actions/locationActions';
import { getDiseasesAction } from '@/app/actions/diseaseActions';
import LocationsManagerClient from '@/components/admin/LocationsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminLocationsPage() {
  const [locations, diseases, locationDiseaseLinks] = await Promise.all([
    getLocationsAction(),
    getDiseasesAction(),
    getLocationDiseaseLinksAction()
  ]);

  return (
    <LocationsManagerClient
      initialLocations={locations}
      diseases={diseases}
      locationDiseaseLinks={locationDiseaseLinks}
    />
  );
}
