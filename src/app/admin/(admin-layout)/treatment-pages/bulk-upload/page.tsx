import { getDiseasesAction } from '@/app/actions/diseaseActions';
import BulkTreatmentUploadClient from '@/components/admin/BulkTreatmentUploadClient';

export const dynamic = 'force-dynamic';

export default async function AdminBulkTreatmentUploadPage() {
  const diseases = await getDiseasesAction();
  return <BulkTreatmentUploadClient diseases={diseases} />;
}
