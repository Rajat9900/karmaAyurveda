import React from 'react';
import { Metadata } from 'next';
import AboutDoctorSection from '@/components/home/AboutDoctorSection';
import DoctorsList from '@/components/doctor/DoctorsList';
import PageBanner from '@/components/ui/PageBanner';
import { getDoctorsAction } from '@/app/actions/doctorActions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Our Doctors | Karma Ayurveda',
  description: 'Meet our team of experienced Ayurvedic doctors and kidney specialists led by Dr. Puneet Dhawan.',
};

export default async function DoctorPage() {
  const doctors = await getDoctorsAction();

  // Separate the featured owner (e.g. Dr. Puneet Dhawan) from other doctors
  const ownerDoctor = doctors.find(doc => doc.is_owner === 1);
  const otherDoctors = doctors.filter(doc => doc.is_owner !== 1);

  return (
    <main className="flex flex-col min-h-screen">
      
      {/* Page Header / Hero Section */}
      <PageBanner 
        title={<>Kidney Specialist Ayurvedic <span className="text-[#d2621a]">Doctors</span></>}
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Doctors Page' }
        ]}
      />

      {/* Featured Doctor: Dr. Puneet Dhawan */}
      <AboutDoctorSection doctor={ownerDoctor} />

      {/* List of All Other Doctors */}
      <DoctorsList doctors={otherDoctors} />

    </main>
  );
}
