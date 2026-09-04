import React from 'react';
import { Metadata } from 'next';
import VideoTestimonials from '@/components/testimonials/VideoTestimonials';
import TextTestimonials from '@/components/testimonials/TextTestimonials';
import PageBanner from '@/components/ui/PageBanner';

export const metadata: Metadata = {
  title: 'Patient Testimonials | Karma Ayurveda',
  description: 'Read and watch success stories from patients who reversed their kidney failure and chronic diseases naturally with Karma Ayurveda.',
};

export default function TestimonialsPage() {
  return (
    <main className="flex flex-col min-h-screen">
      
      {/* Page Header / Hero Section */}
      <PageBanner 
        title={<>Patient <span className="text-[#d2621a]">Testimonials</span></>}
        subtitle="Real stories of healing, recovery, and restored hope through natural Ayurvedic treatments."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Testimonials' }
        ]}
      />

      {/* Video Testimonials Section */}
      <VideoTestimonials />

      {/* Text Testimonials Section */}
      <TextTestimonials />

    </main>
  );
}
