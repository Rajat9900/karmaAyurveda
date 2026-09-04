'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClinicsAction } from '@/app/actions/clinicActions';
import { Clinic } from '@/lib/clinicData';
import { getDiseasesAction, Disease } from '@/app/actions/diseaseActions';
import { MapPin } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDiseasesOpen, setIsMobileDiseasesOpen] = useState(false);
  const [isMobileClinicsOpen, setIsMobileClinicsOpen] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);

  useEffect(() => {
    getClinicsAction().then(data => {
      setClinics(data);
    });
    getDiseasesAction().then(data => {
      setDiseases(data);
    });
  }, []);

  return (
    <header className="w-full sticky top-0 z-50 font-sans shadow-md">
      {/* Top Bar - Marquee / Contact Info */}
      <div className="bg-[#2e5339] text-white text-xs md:text-sm py-1.5 px-4 flex items-center justify-between border-b border-[#3f6b4d]">
        
        {/* Language Selector Dropdown */}
        <div className="hidden md:flex items-center bg-white text-black px-2 py-0.5 rounded-sm cursor-pointer mr-4">
          <span className="font-medium text-xs">Select Language</span>
          <svg className="w-3 h-3 ml-1 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Marquee Text */}
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <p className="animate-marquee inline-block text-gray-200">
            Shuddhi Panchakarma Ayurveda Hospital is now Karma Ayurveda (Hospital & Institute Of Integrated Medical Sciences). For more details contact at <a href="tel:9971928080" className="font-bold text-[#ff6600]">99719-28080</a>
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-[#1f4229] py-2 px-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 mr-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://www.karmaayurveda.com/assets/image/karma-ayurveda-logo.png" 
              alt="Karma Ayurveda Logo" 
              className="h-10 md:h-12 w-auto brightness-200" 
            />
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white hover:text-green-300 focus:outline-none ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 flex-wrap justify-center flex-1">
            <Link href="/" className="text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors">Home</Link>
            <Link href="/about" className="text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors">About</Link>
            <Link href="/doctor" className="text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors">Doctors</Link>

            {/* Diseases Mega Menu (Desktop) */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors pb-2 pt-2 cursor-pointer">
                Diseases
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {/* Mega Menu Panel */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-[420px] md:w-[560px] xl:w-[680px] bg-white rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden border border-gray-100">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conditions We Treat</span>
                    <Link href="/all-diseases" className="text-[11px] font-bold text-[#1f4229] hover:text-[#ef8716] transition-colors">View All &rarr;</Link>
                  </div>
                  {diseases.length === 0 ? (
                    <span className="text-xs text-gray-400 font-bold">No diseases listed</span>
                  ) : (
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 max-h-96 overflow-y-auto">
                      {diseases.map(disease => (
                        <Link
                          key={disease.id}
                          href={`/${disease.slug}`}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-green-50 hover:text-[#1f4229] transition-colors"
                        >
                          <span className="text-base flex-shrink-0 w-5 text-center">{disease.icon}</span>
                          <span className="truncate">{disease.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link href="/testimonials" className="text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors">Testimonials</Link>

            <Link href="/media-articles" className="text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors">Media</Link>

            <Link href="/research-articles" className="text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors">Research &amp; Articles</Link>

            <Link href="/faqs" className="text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors">FAQs</Link>

            <Link href="/our-courses" className="text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors">Our Courses</Link>

            <Link href="/blogs" className="text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors">Blogs</Link>

            {/* Our Clinics Dropdown (Desktop) */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white hover:text-yellow-400 font-medium text-[13px] xl:text-[15px] transition-colors pb-2 pt-2 cursor-pointer">
                Our Clinics
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute left-0 top-full mt-0 w-72 md:w-80 bg-white rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden border border-gray-100">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Our Clinics</span>
                    <Link href="/our-clinics" className="text-[11px] font-bold text-[#1f4229] hover:text-[#ef8716] transition-colors">View All &rarr;</Link>
                  </div>
                  {clinics.length === 0 ? (
                    <span className="text-xs text-gray-400 font-bold">No clinics listed</span>
                  ) : (
                    <div className="flex flex-col max-h-96 overflow-y-auto">
                      {clinics.map(clinic => (
                        <Link
                          key={clinic.id}
                          href={`/our-clinics#${clinic.slug}`}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-green-50 hover:text-[#1f4229] transition-colors"
                        >
                          <MapPin className="w-4 h-4 flex-shrink-0 text-[#1f4229]" />
                          <span className="truncate">{clinic.city} Center</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Right Button */}
          <div className="hidden lg:flex flex-shrink-0 ml-4">
            <a 
              href="tel:9971928080" 
              className="flex items-center gap-2 bg-[#ffcc33] text-black px-4 py-2 rounded font-bold text-sm hover:bg-[#e6b82e] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              +91-99719-28080
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden bg-[#1f4229] border-t border-[#3f6b4d] p-4 flex flex-col gap-3 shadow-inner">
          <Link href="/" className="text-white font-medium block" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/about" className="text-white font-medium block" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          <Link href="/doctor" className="text-white font-medium block" onClick={() => setIsMobileMenuOpen(false)}>Doctors</Link>

          {/* Diseases Accordion (Mobile) */}
          <div>
            <button 
              className="w-full flex items-center justify-between text-white font-medium focus:outline-none"
              onClick={() => setIsMobileDiseasesOpen(!isMobileDiseasesOpen)}
            >
              Diseases
              <svg className={`w-4 h-4 transition-transform duration-300 ${isMobileDiseasesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isMobileDiseasesOpen && (
              <div className="flex flex-col gap-3 pl-4 mt-3 border-l border-[#3f6b4d]">
                <Link href="/all-diseases" className="text-green-200 text-sm block" onClick={() => setIsMobileMenuOpen(false)}>All Diseases</Link>
                {diseases.map(disease => (
                  <Link
                    key={disease.id}
                    href={`/${disease.slug}`}
                    className="flex items-center gap-2 text-green-200 text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0">{disease.icon}</span>
                    {disease.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <Link href="/testimonials" className="text-white font-medium block" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</Link>

          <Link href="/media-articles" className="text-white font-medium block" onClick={() => setIsMobileMenuOpen(false)}>Media</Link>

          <Link href="/research-articles" className="text-white font-medium block" onClick={() => setIsMobileMenuOpen(false)}>Research &amp; Articles</Link>

          <Link href="/faqs" className="text-white font-medium block" onClick={() => setIsMobileMenuOpen(false)}>FAQs</Link>

          <Link href="/our-courses" className="text-white font-medium block" onClick={() => setIsMobileMenuOpen(false)}>Our Courses</Link>

          <Link href="/blogs" className="text-white font-medium block" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>

          {/* Clinics Accordion (Mobile) */}
          <div>
            <button 
              className="w-full flex items-center justify-between text-white font-medium focus:outline-none"
              onClick={() => setIsMobileClinicsOpen(!isMobileClinicsOpen)}
            >
              Our Clinics
              <svg className={`w-4 h-4 transition-transform duration-300 ${isMobileClinicsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isMobileClinicsOpen && (
              <div className="flex flex-col gap-3 pl-4 mt-3 border-l border-[#3f6b4d]">
                <Link href="/our-clinics" className="text-green-200 text-sm block" onClick={() => setIsMobileMenuOpen(false)}>All Clinics</Link>
                {clinics.map(clinic => (
                  <Link
                    key={clinic.id}
                    href={`/our-clinics#${clinic.slug}`}
                    className="flex items-center gap-2 text-green-200 text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {clinic.city} Center
                  </Link>
                ))}
              </div>
            )}
          </div>

          <a 
            href="tel:9971928080" 
            className="flex items-center justify-center gap-2 bg-[#ffcc33] text-black px-4 py-2 rounded font-bold text-sm hover:bg-[#e6b82e] transition-colors shadow-sm mt-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            +91-99719-28080
          </a>
        </nav>
      )}
    </header>
  );
}
