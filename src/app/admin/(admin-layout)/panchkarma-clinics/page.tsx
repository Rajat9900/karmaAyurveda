import { getPanchakarmaClinicsAction, getPanchakarmaTagsAction } from '@/app/actions/panchakarmaActions';
import { getDiseasesAction } from '@/app/actions/diseaseActions';
import PanchakarmaClinicsManagerClient from '@/components/admin/PanchakarmaClinicsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPanchakarmaClinicsPage() {
  const [clinics, diseases, tags] = await Promise.all([
    getPanchakarmaClinicsAction(),
    getDiseasesAction(),
    getPanchakarmaTagsAction()
  ]);

  return (
    <PanchakarmaClinicsManagerClient 
      initialClinics={clinics} 
      diseasesList={diseases} 
      tagsList={tags} 
    />
  );
}
