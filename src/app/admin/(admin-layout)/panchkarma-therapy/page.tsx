import { getTherapiesAction } from '@/app/actions/therapyActions';
import { getDiseasesAction } from '@/app/actions/diseaseActions';
import TherapiesManagerClient from '@/components/admin/TherapiesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPanchkarmaTherapiesPage() {
  const [therapies, diseases] = await Promise.all([
    getTherapiesAction(),
    getDiseasesAction()
  ]);

  return <TherapiesManagerClient initialTherapies={therapies} diseasesList={diseases} />;
}
