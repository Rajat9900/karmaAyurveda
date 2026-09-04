import React from 'react';
import { Award, Users, Stethoscope } from 'lucide-react';
import { Doctor } from '@/app/actions/doctorActions';

interface AboutDoctorSectionProps {
  doctor?: Doctor;
}

export default function AboutDoctorSection({ doctor }: AboutDoctorSectionProps) {
  const name = doctor?.name || "Dr. Puneet Dhawan";
  const designation = doctor?.designation || "Pioneering Ayurvedic Kidney Treatment";
  const education = doctor?.education || "BAMS, 5th-generation Ayurvedic physician";
  const detail = doctor?.detail || "A 5th-generation Ayurvedic physician, Dr. Puneet has transformed the lives of over 1.5 lakh kidney patients globally. With a deep rooted belief in ancient Ayurvedic science, he has successfully proven that kidney failure can be reversed naturally, without the need for painful dialysis or transplants.";
  const image = doctor?.image || "https://www.karmaayurveda.com/new/assets/image/dr-puneet.png";

  return (
    <section className="py-12 md:py-16 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-gradient-to-br from-[#f4fbf6] to-[#e1f5e8] rounded-[2.5rem] p-8 md:p-12 relative shadow-sm border border-green-50 mt-16 md:mt-24 mb-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Image Section - Breaking out of the container */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-start -mt-32 lg:-mt-48 z-10">
              <div className="relative w-full max-w-[280px] md:max-w-[340px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={image} 
                  alt={name} 
                  className="w-full h-auto object-contain drop-shadow-2xl relative"
                />
                
                {/* Floating Badge */}
                <div className="absolute bottom-4 -right-2 md:-right-6 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 z-20">
                  <div className="w-10 h-10 bg-[#1f4229] text-white rounded-full flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#1f4229] leading-tight">10+</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Years Exp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-7 space-y-5 relative z-10 pt-4 lg:pt-0">
              <div>
                <span className="inline-block py-1.5 px-4 rounded-full bg-white text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">Meet Our Expert</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e3b] mb-2">
                  {name}
                </h2>
                <h3 className="text-lg md:text-xl font-semibold text-[#1f4229]">
                  {designation}
                </h3>
                <p className="text-xs text-[#d2621a] font-bold mt-1 uppercase tracking-wider">{education}</p>
                {doctor?.clinic_name && (
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Based at: <strong className="text-[#1f4229]">{doctor.clinic_name} ({doctor.clinic_city})</strong>
                  </p>
                )}
              </div>
              
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                {detail}
              </p>
              
              {/* Stats/Highlights */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-green-50">
                  <div className="text-[#1f4229] bg-green-50 p-2 rounded-lg">
                    <Users size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a2e3b] text-base leading-tight">1.5 Lakh+</h4>
                    <p className="text-xs text-gray-500 font-medium">Patients Treated</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-green-50">
                  <div className="text-[#d2621a] bg-orange-50 p-2 rounded-lg">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a2e3b] text-base leading-tight">100%</h4>
                    <p className="text-xs text-gray-500 font-medium">Natural Approach</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button className="bg-[#1f4229] text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-[#152e1c] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-sm flex items-center gap-2">
                  Consult Dr. Puneet
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
