import React from 'react';
import PageBanner from '@/components/ui/PageBanner';
import { getClinicsAction } from '@/app/actions/clinicActions';

export const dynamic = 'force-dynamic';

export default async function OurClinicsPage() {
  const clinics = await getClinicsAction();

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
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Karma Ayurveda Centers Location
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            /* Anchor ID target for direct dropdown selection links */
            <div 
              key={clinic.id}
              id={clinic.slug}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between scroll-mt-24"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-[#1f4229] font-bold overflow-hidden">
                    {clinic.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={clinic.image} alt={clinic.city} className="w-full h-full object-cover" />
                    ) : (
                      '📍'
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 leading-snug">{clinic.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{clinic.city}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed font-semibold">
                  {clinic.address}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-semibold text-slate-700">Email:</span> {clinic.email}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-semibold text-slate-700">Timings:</span> 10:00 AM - 6:00 PM (Mon - Sat)
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                <a 
                  href={`tel:${clinic.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-xs font-bold text-[#ef8716] hover:underline"
                >
                  📞 {clinic.phone}
                </a>
                
                <div className="flex gap-2">
                  {clinic.map_url && (
                    <a 
                      href={clinic.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 border border-gray-200 text-gray-600 hover:text-gray-800 text-xs font-bold rounded-lg transition-colors"
                    >
                      Map
                    </a>
                  )}
                  <a 
                    href="tel:9971928080"
                    className="px-3 py-1.5 bg-[#1f4229] text-white text-xs font-bold rounded-lg hover:bg-[#152e1c] transition-colors"
                  >
                    Book Visit
                  </a>
                </div>
              </div>
            </div>
          ))}
          
          {clinics.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-400 font-bold bg-white rounded-2xl border border-gray-100">
              No clinic locations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
