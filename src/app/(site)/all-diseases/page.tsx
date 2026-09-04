import React from 'react';
import PageBanner from '@/components/ui/PageBanner';
import SectionHeading from '@/components/ui/SectionHeading';
import Link from 'next/link';
import DiseaseSidebar from '@/components/diseases/DiseaseSidebar';
import { getDiseasesAction } from '@/app/actions/diseaseActions';

export const dynamic = 'force-dynamic';

export default async function DiseasesPage() {
  const diseases = await getDiseasesAction();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageBanner
        title="Diseases We Treat"
        subtitle="Holistic Ayurvedic treatments for chronic and lifestyle diseases with a focus on root-cause healing."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Diseases' },
        ]}
      />

      <div className="container mx-auto px-4 mt-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="w-full lg:w-2/3">
            <SectionHeading
              title="Areas of Expertise"
              subtitle="Discover our comprehensive range of Ayurvedic treatments for various health conditions."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {diseases.map((disease) => (
                <div
                  key={disease.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {disease.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {disease.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {disease.description}
                  </p>
                  <Link 
                    href={`/${disease.slug}`}
                    className="mt-auto text-green-700 font-medium hover:text-green-800 flex items-center gap-1"
                  >
                    Learn More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-1/3">
            <DiseaseSidebar />
          </div>

        </div>
      </div>
    </div>
  );
}
