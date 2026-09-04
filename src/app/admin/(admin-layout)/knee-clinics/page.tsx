import { getKneeClinicsAction, getKneeTagsAction } from '@/app/actions/kneeActions';
import { getDiseasesAction } from '@/app/actions/diseaseActions';
import KneeClinicsManagerClient from '@/components/admin/KneeClinicsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminKneeClinicsPage() {
  const [clinics, diseases, tags] = await Promise.all([
    getKneeClinicsAction(),
    getDiseasesAction(),
    getKneeTagsAction()
  ]);

  return (
    <KneeClinicsManagerClient 
      initialClinics={clinics} 
      diseasesList={diseases} 
      tagsList={tags} 
    />
  );
}
