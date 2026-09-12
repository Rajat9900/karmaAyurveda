import React from 'react';
import { MapPin } from 'lucide-react';
import PageBanner from '@/components/ui/PageBanner';
import { getClinicsAction } from '@/app/actions/clinicActions';
import { getUnlinkedLocationsAction } from '@/app/actions/locationActions';
import LocationsWeServeSection from '@/components/home/LocationsWeServeSection';

export const dynamic = 'force-dynamic';

export default async function OurClinicsPage() {
  const [clinics, locations] = await Promise.all([
    getClinicsAction(),
    getUnlinkedLocationsAction()
  ]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageBanner
        title="Our Clinics"
        subtitle="Visit Karma Ayurveda centers across India for expert consultations and treatments."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Our Clinics' }
        ]}
      />

      <div className="container mx-auto px-4 mt-12 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {clinics.map((clinic) => (
            /* Anchor ID target for direct dropdown selection links */
            <a
              key={clinic.id}
              id={clinic.slug}
              href={clinic.map_url || `tel:${clinic.phone.replace(/[^0-9+]/g, '')}`}
              target={clinic.map_url ? '_blank' : undefined}
              rel={clinic.map_url ? 'noopener noreferrer' : undefined}
              className="bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#c3dbc0] transition-all flex items-center gap-3 scroll-mt-24"
            >
              <MapPin className="w-5 h-5 text-[#1f4229] flex-shrink-0" />
              <span className="text-sm font-bold text-gray-800">Ayurvedic Hospital in {clinic.city}</span>
            </a>
          ))}

          {clinics.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-400 font-bold bg-white rounded-2xl border border-gray-100">
              No clinic locations found.
            </div>
          )}
        </div>
      </div>

      <LocationsWeServeSection locations={locations} />
    </div>
  );
}
