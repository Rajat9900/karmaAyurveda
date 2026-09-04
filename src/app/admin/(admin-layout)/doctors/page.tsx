import { getDoctorsAction } from '@/app/actions/doctorActions';
import { getClinicsAction } from '@/app/actions/clinicActions';
import DoctorsManagerClient from '@/components/admin/DoctorsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminDoctorsPage() {
  const [doctors, clinics] = await Promise.all([
    getDoctorsAction(),
    getClinicsAction()
  ]);

  return <DoctorsManagerClient initialDoctors={doctors} clinicsList={clinics} />;
}
