import { redirect } from 'next/navigation';
import { getClinicByIdAction, getClinicTagsAction, getClinicGalleryAction, getClinicDoctorsAction } from '@/app/actions/clinicActions';
import ClinicFormClient from '@/components/admin/ClinicFormClient';

export const dynamic = 'force-dynamic';

interface EditClinicPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditClinicPage({ params }: EditClinicPageProps) {
  // 1. Fetch clinic by ID, all tags, the clinic's doctors, and the clinic's gallery
  const { id } = await params;
  const [clinic, tags, doctors, gallery] = await Promise.all([
    getClinicByIdAction(id),
    getClinicTagsAction(),
    getClinicDoctorsAction(id),
    getClinicGalleryAction(id)
  ]);

  if (!clinic) {
    redirect('/admin/clinics');
  }

  return <ClinicFormClient editingClinic={clinic} allTags={tags} initialDoctors={doctors} initialGallery={gallery} />;
}
