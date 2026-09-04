import React from 'react';
import { Metadata } from 'next';
import AboutKarmaAyurveda from '@/components/about/AboutKarmaAyurveda';
import AboutDoctorSection from '@/components/home/AboutDoctorSection';
import AwardsSection from '@/components/about/AwardsSection';
import GallerySection from '@/components/about/GallerySection';
import PageBanner from '@/components/ui/PageBanner';

export const metadata: Metadata = {
  title: 'About Us | Karma Ayurveda',
  description: 'Learn about Karma Ayurveda, our history, Dr. Puneet Dhawan, and our holistic approach to kidney care.',
};

export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* 
        Note: The Header and Footer are already included automatically 
        by the root layout.tsx in the app directory.
      */}
      
      {/* Page Header */}
      <PageBanner 
        title="About Us"
        subtitle="A legacy of healing naturally without side effects since 1937"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'About Us' }
        ]}
      />

      <AboutKarmaAyurveda />
      <AboutDoctorSection />
      <AwardsSection />
      <GallerySection />
    </main>
  );
}
