import { getDiseaseTreatmentsAction } from '@/app/actions/diseaseTreatmentActions';
import { getDiseasesAction } from '@/app/actions/diseaseActions';
import TreatmentPagesManagerClient from '@/components/admin/TreatmentPagesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminTreatmentPagesPage() {
  const [treatments, diseases] = await Promise.all([
    getDiseaseTreatmentsAction(),
    getDiseasesAction()
  ]);

  return <TreatmentPagesManagerClient initialTreatments={treatments} diseases={diseases} />;
}
