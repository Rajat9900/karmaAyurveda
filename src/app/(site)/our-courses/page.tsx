import React from 'react';
import { Metadata } from 'next';
import PageBanner from '@/components/ui/PageBanner';
import { getCoursesAction } from '@/app/actions/courseActions';
import { GraduationCap, ArrowRight } from 'lucide-react';

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
      <section className="py-16 md:py-24 bg-[#f4fbf6]">
        <div className="container mx-auto px-4 max-w-7xl">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <a
                  key={course.id}
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-[#1a2e3b] mb-4 leading-snug line-clamp-3 flex-grow">
                      {course.title}
                    </h3>
                    <span className="inline-flex items-center gap-2 text-[#1f4229] font-bold text-sm group-hover:text-[#d2621a] transition-colors mt-auto w-max">
                      Learn More
                      <ArrowRight size={15} className="transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No courses published yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
