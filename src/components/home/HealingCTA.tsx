import React from "react";
import SectionHeading from "../ui/SectionHeading";
import { Quote } from "lucide-react";

export default function HealingCTA() {
  return (
    <section className="pt-10 md:pt-12 pb-0 bg-[#1f4229] relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#d2621a]/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10 flex-1 flex flex-col justify-center">
        
        <SectionHeading 
          title={<span className="text-white">Karma Ayurveda - The Four Healing Pillars</span>}
          className="mb-8"
        />

        <div className="flex flex-col lg:flex-row items-center justify-between w-full relative">
          
          {/* Right/Center: Glassmorphism Quote Card */}
          <div className="lg:w-3/5 lg:ml-auto relative z-20 pb-8 lg:pb-12">
            
            {/* Giant decorative quote mark in background */}
            <div className="absolute -top-8 -left-8 text-[120px] leading-none font-serif text-white/5 z-0 pointer-events-none">
              "
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
              <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#d2621a]/20 text-[#d2621a]">
                <Quote size={20} fill="currentColor" />
              </div>
              
              <h3 className="text-2xl md:text-3xl lg:text-3xl font-extrabold text-white mb-4 leading-tight drop-shadow-sm">
                सर्वेषाम् रोगाणाम् निदानं कुपित: मल:।
              </h3>
              
              <div className="w-16 h-1 bg-gradient-to-r from-[#d2621a] to-yellow-500 mb-4 rounded-full"></div>
              
              <p className="text-base md:text-lg font-medium text-green-50 leading-relaxed max-w-2xl">
                अर्थात्: सभी रोगों का इलाज है अपने अन्दर पड़े जमा पुराने गंदे, कुपित मल <br className="hidden md:block" />
                <span className="font-bold text-[#d2621a] bg-white/90 px-2.5 py-0.5 rounded-md inline-block mt-1.5 shadow-sm text-sm md:text-base">
                  यानी Toxins, Waste
                </span> को निकाल दो तो मानव ठीक हो जाता है।
              </p>
            </div>
          </div>

          {/* Left: Doctor Image */}
          <div className="relative lg:absolute bottom-0 left-0 lg:left-10 w-full lg:w-[380px] flex justify-center lg:justify-start items-end z-30 pt-6 lg:pt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.karmaayurveda.com/new/assets/image/dr-puneet.png"
              alt="Dr Puneet Dhawan"
              className="w-auto h-[320px] lg:h-[400px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)]"
            />
            {/* Name Badge */}
            <div className="absolute bottom-4 left-1/2 lg:left-[55%] -translate-x-1/2 bg-white text-[#1f4229] px-6 py-2 rounded-lg font-extrabold text-xs md:text-sm shadow-xl border-b-2 border-[#d2621a] whitespace-nowrap">
              Dr. Puneet Dhawan
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}