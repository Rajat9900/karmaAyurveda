import { getClinicsAction } from '@/app/actions/clinicActions';
import ClinicsManagerClient from '@/components/admin/ClinicsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminClinicsPage() {
  // 1. Fetch clinics from DB
  const clinics = await getClinicsAction();

  return <ClinicsManagerClient initialClinics={clinics} />;
}
