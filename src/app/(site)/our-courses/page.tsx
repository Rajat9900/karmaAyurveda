import React from 'react';
import { Metadata } from 'next';
import PageBanner from '@/components/ui/PageBanner';
import { getCoursesAction } from '@/app/actions/courseActions';
import CoursesGridClient from '@/components/site/CoursesGridClient';

export const metadata: Metadata = {
  title: 'Our Courses | Karma Ayurveda',
  description: 'Explore Ayurvedic courses and training programs offered by Karma Ayurveda.',
};

export const dynamic = 'force-dynamic';

export default async function OurCoursesPage() {
  const courses = await getCoursesAction();

  return (
    <main className="flex flex-col min-h-screen">

      {/* Page Header */}
      <PageBanner
        title={<>Our <span className="text-[#d2621a]">Courses</span></>}
        subtitle="Ayurvedic courses and training programs from Karma Ayurveda's expert practitioners."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Our Courses' }
        ]}
      />

      {/* Courses Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
            <span className="text-[#1f4229]">Our Ayurveda</span>{' '}
            <span className="text-[#eab308]">Courses</span>
          </h2>

          <CoursesGridClient courses={courses} />
        </div>
      </section>

    </main>
  );
}
