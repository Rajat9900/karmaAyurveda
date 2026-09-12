import { redirect } from 'next/navigation';
import { getLocationByIdAction, getLocationDiseaseLinksAction } from '@/app/actions/locationActions';
import { getDiseasesAction } from '@/app/actions/diseaseActions';
import { getClinicTagsAction } from '@/app/actions/clinicActions';
import LocationFormClient from '@/components/admin/LocationFormClient';

export const dynamic = 'force-dynamic';

interface EditLocationPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditLocationPage({ params }: EditLocationPageProps) {
  const { id } = await params;
  const [location, diseases, locationDiseaseLinks, allTags] = await Promise.all([
    getLocationByIdAction(id),
    getDiseasesAction(),
    getLocationDiseaseLinksAction(),
    getClinicTagsAction()
  ]);

  if (!location) {
    redirect('/admin/locations-we-serve');
  }

  return (
    <LocationFormClient
      editingLocation={location}
      diseases={diseases}
      linkedDiseaseIds={locationDiseaseLinks[Number(location.id)] ?? []}
      allTags={allTags}
    />
  );
}
