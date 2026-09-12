import BulkLocationUploadClient from '@/components/admin/BulkLocationUploadClient';
import { getDiseasesAction } from '@/app/actions/diseaseActions';

export const dynamic = 'force-dynamic';

export default async function AdminBulkLocationUploadPage() {
  const diseases = await getDiseasesAction();

  return <BulkLocationUploadClient diseases={diseases} />;
}
