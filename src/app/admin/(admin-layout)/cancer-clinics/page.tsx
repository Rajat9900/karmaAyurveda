import { getCancerClinicsAction, getCancerTagsAction } from '@/app/actions/cancerActions';
import { getDiseasesAction } from '@/app/actions/diseaseActions';
import CancerClinicsManagerClient from '@/components/admin/CancerClinicsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminCancerClinicsPage() {
  const [clinics, diseases, tags] = await Promise.all([
    getCancerClinicsAction(),
    getDiseasesAction(),
    getCancerTagsAction()
  ]);

  return (
    <CancerClinicsManagerClient 
      initialClinics={clinics} 
      diseasesList={diseases} 
      tagsList={tags} 
    />
  );
}
