import React from 'react';
import { CheckCircle2, Play } from 'lucide-react';

export default function IntroSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Content Area (Larger) */}
        <div className="lg:w-7/12">
          <div className="inline-block bg-[#f0fcf4] text-[#1f4229] px-4 py-2 rounded-full font-bold text-sm tracking-wide mb-6 border border-green-100 shadow-sm">
            WELCOME TO KARMA AYURVEDA
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1a2e3b] mb-8 leading-tight">
            India’s No. 1 <span className="text-[#1f4229]">Integrated</span> Health Care Hospital
          </h1>
          
          <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed font-medium">
            At Karma Ayurveda, we go beyond treating symptoms. Our experts take the time to evaluate the root cause of your disease, providing natural and holistic healing using ancient wisdom and modern care.
          </p>

          {/* Added bullet points to enrich content and fill space */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {[
              '100% Pure Ayurvedic Herbs',
              'Advanced Panchakarma Therapies',
              '84+ years of legacy',
              'Zero Harmful Side Effects'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="text-[#d2621a] flex-shrink-0" size={24} />
                <span className="text-gray-700 font-semibold">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="/about" className="inline-flex items-center gap-2 bg-[#1f4229] text-white px-8 py-4 rounded-full font-bold hover:bg-[#152e1c] transition-all duration-300 shadow-xl hover:-translate-y-1">
              Read More About Us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <div className="flex items-center gap-4 text-gray-500 font-medium">
              <div className="flex -space-x-4">
                <img className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" src="https://i.pravatar.cc/100?img=1" alt="Patient" />
                <img className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" src="https://i.pravatar.cc/100?img=2" alt="Patient" />
                <img className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" src="https://i.pravatar.cc/100?img=3" alt="Patient" />
              </div>
              <p>Trusted by <span className="font-bold text-[#1a2e3b]">1.5L+</span> Patients</p>
            </div>
          </div>
        </div>

        {/* Right Video Area (Smaller and Unique) */}
        <div className="lg:w-5/12 flex justify-center lg:justify-end relative">
          
          {/* Decorative abstract offset background */}
          <div className="absolute top-4 -right-4 w-[90%] h-[95%] bg-gradient-to-br from-[#1f4229] to-[#2a5c38] rounded-[2rem] rounded-tl-[100px] rounded-br-[100px] -z-10"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-100 rounded-full blur-2xl -z-20"></div>

          <div className="relative group cursor-pointer w-[90%] z-10">
            {/* The actual image container with a unique leaf-like organic shape */}
            <div className="overflow-hidden shadow-2xl rounded-[2rem] rounded-tl-[100px] rounded-br-[100px] border-4 border-white bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://hiims.in/images-new/js_integrated.webp" 
                alt="Integrated Healthcare" 
                className="w-full h-[400px] object-cover transform group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-[#1f4229]/20 flex items-center justify-center group-hover:bg-[#1f4229]/40 transition-colors duration-500">
                
                {/* Custom Play Button */}
                <div className="relative flex items-center justify-center w-20 h-20">
                  <div className="absolute inset-0 bg-white opacity-30 rounded-full animate-ping"></div>
                  <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Play className="text-[#d2621a] ml-1" fill="currentColor" size={28} />
                  </div>
                </div>

              </div>
            </div>
            
            {/* Floating badge over video */}
            <div className="absolute top-8 -left-8 bg-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-100">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
              </span>
              <span className="font-bold text-[#1a2e3b]">Watch Hospital Tour</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
