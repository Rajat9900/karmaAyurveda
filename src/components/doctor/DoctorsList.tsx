import React from 'react';
import { Doctor } from '@/app/actions/doctorActions';

interface DoctorsListProps {
  doctors: Doctor[];
}

export default function DoctorsList({ doctors }: DoctorsListProps) {
  return (
    <section className="py-16 md:py-24 bg-[#f4fbf6]">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e3b]">
            Our <span className="text-[#d2621a]">Doctors</span>
          </h2>
          <div className="w-24 h-1 bg-[#1f4229] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-6">
          {doctors.map((doctor, index) => (
            <div 
              key={doctor.id || index} 
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-green-50 hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start"
            >
              {/* Doctor Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#f4fbf6] shadow-sm bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Doctor Details */}
              <div className="flex-grow text-center md:text-left space-y-3">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#1f4229]">
                    {doctor.name}
                  </h3>
                  <p className="text-[#d2621a] font-semibold text-sm mt-1">
                    {doctor.education}
                  </p>
                  {doctor.clinic_name && (
                    <p className="text-xs text-slate-400 font-bold mt-0.5">
                      Clinic: {doctor.clinic_name} ({doctor.clinic_city})
                    </p>
                  )}
                </div>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {doctor.detail}
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex-shrink-0 flex items-center justify-center md:mt-4">
                <button className="bg-[#1f4229] text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-[#152e1c] hover:shadow-lg transition-all duration-300 text-sm whitespace-nowrap">
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional padding at bottom to allow scrolling past last card easily */}
        <div className="pb-8"></div>
      </div>
    </section>
  );
}
