import { getDiseasesAction } from '@/app/actions/diseaseActions';
import DiseasesManagerClient from '@/components/admin/DiseasesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminDiseasesPage() {
  // Fetch diseases from the database
  const diseases = await getDiseasesAction();

  return <DiseasesManagerClient initialDiseases={diseases} />;
}
