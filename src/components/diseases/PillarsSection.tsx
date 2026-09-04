'use client';
import React, { useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import {
  Leaf, Sparkles, Activity, Sun, Play, ArrowRight,
  Heart, Droplet, Flame, Moon, Zap, Shield, Wind
} from 'lucide-react';
import type { Pillar as PillarRecord } from '@/app/actions/pillarActions';

interface TherapyDetail {
  id: string;
  name: string;
  what: string;
  how: string;
  why: string;
  benefits: string;
  image: string;
  videoId?: string;
}

interface Category {
  title: string;
  subtitle: string;
  therapies: TherapyDetail[];
}

interface Pillar {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  image: string;
  description: string;
  categories: Category[];
}

// Icon names stored in the DB map to the components used for the tab badges
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Leaf, Activity, Sun, Heart, Droplet, Flame, Moon, Zap, Shield, Wind
};

interface PillarsSectionProps {
  pillars: PillarRecord[];
}

export default function PillarsSection({ pillars }: PillarsSectionProps) {
  const pillarDetails: Pillar[] = pillars.map((p) => {
    let categories: Category[] = [];
    try {
      categories = JSON.parse(p.categories);
    } catch {
      categories = [];
    }
    return {
      id: p.pillar_key,
      number: p.number,
      name: p.name,
      subtitle: p.subtitle,
      badge: p.badge,
      icon: ICON_MAP[p.icon] || Sparkles,
      image: p.image,
      description: p.description,
      categories
    };
  });

  const [activeTab, setActiveTab] = useState(pillarDetails[0]?.id || '');
  const currentPillar = pillarDetails.find(p => p.id === activeTab) || pillarDetails[0];

  if (!currentPillar) {
    return null;
  }

  const pillarNames = pillarDetails.map(p => `${p.name} (${p.badge})`);
  const pillarNamesText = pillarNames.length > 1
    ? `${pillarNames.slice(0, -1).join(', ')}, and ${pillarNames[pillarNames.length - 1]}`
    : pillarNames[0];

  return (
    <section className="py-20 bg-gradient-to-b from-[#f7faf8] via-white to-green-50/40 relative overflow-hidden">

      {/* Background Decorative Blur */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-green-200/25 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">

        <SectionHeading
          title="How We Reverse Diseases"
          subtitle={`In Ayurveda, research is built around ${pillarDetails.length} fundamental pillars - ${pillarNamesText}.`}
        />

        {/* Pillars Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-14">
          {pillarDetails.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = activeTab === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveTab(pillar.id)}
                className={`flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 text-center relative overflow-hidden ${
                  isActive
                    ? 'bg-[#1f4229] text-white border-[#1f4229] shadow-xl scale-[1.02]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50/50 shadow-sm'
                }`}
              >
                <span className={`text-xs font-extrabold px-3 py-0.5 rounded-full mb-3 ${
                  isActive ? 'bg-[#ef8716] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  Pillar {pillar.number}
                </span>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isActive ? 'bg-white/10 text-yellow-400' : 'bg-green-50 text-[#1f4229]'
                }`}>
                  <Icon size={24} />
                </div>

                <h3 className="font-extrabold text-lg md:text-xl leading-tight">
                  {pillar.name}
                </h3>
                <p className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-green-100' : 'text-gray-500'
                }`}>
                  ({pillar.badge})
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Details */}
        <div className="space-y-16">
          {currentPillar.categories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-10">

              {/* Category Header */}
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-xs font-extrabold text-[#ef8716] uppercase tracking-widest bg-orange-50 px-4 py-1 rounded-full border border-orange-100">
                  {currentPillar.name} Protocol
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#1f4229] mt-3">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                  {category.subtitle}
                </p>
              </div>

              {/* Therapy Cards (Matching the user screenshot format) */}
              <div className="space-y-12">
                {category.therapies.map((therapy, therapyIdx) => {
                  const position = therapyIdx + 1;
                  const isReversed = category.title === 'Naturopathy Therapies'
                    ? ![2, 4].includes(position)
                    : therapyIdx % 2 === 1;
                  return (
                  <div
                    key={therapy.id}
                    className="bg-[#f3f9f4] p-6 md:p-8 rounded-3xl border border-[#d8eae0] shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 relative"
                  >

                    {/* Header Divider with Therapy Name */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                      <div className="h-[2px] bg-[#1f4229]/20 flex-1 max-w-[200px]" />
                      <h4 className="text-2xl md:text-3xl font-extrabold text-[#1f4229] tracking-tight text-center">
                        {therapy.name}
                      </h4>
                      <div className="h-[2px] bg-[#1f4229]/20 flex-1 max-w-[200px]" />
                    </div>

                    {/* 2-Column Content Grid: Bullet Info Cards Left, Video/Image Right */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                      {/* Left Side: 4 Info Boxes + Button */}
                      <div className={`lg:col-span-7 flex flex-col justify-between space-y-3 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>

                        {/* What Is This Therapy */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:border-green-200 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-[#1f4229] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-xs font-bold">➔</span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-gray-900 text-sm md:text-base mb-0.5">
                              What Is This Therapy
                            </h5>
                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                              {therapy.what}
                            </p>
                          </div>
                        </div>

                        {/* How It Works */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:border-green-200 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-[#1f4229] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-xs font-bold">➔</span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-gray-900 text-sm md:text-base mb-0.5">
                              How It Works
                            </h5>
                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                              {therapy.how}
                            </p>
                          </div>
                        </div>

                        {/* Why This Therapy */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:border-green-200 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-[#1f4229] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-xs font-bold">➔</span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-gray-900 text-sm md:text-base mb-0.5">
                              Why This Therapy
                            </h5>
                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                              {therapy.why}
                            </p>
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3.5 hover:border-green-200 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-[#1f4229] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-xs font-bold">➔</span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-gray-900 text-sm md:text-base mb-0.5">
                              Benefits
                            </h5>
                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                              {therapy.benefits}
                            </p>
                          </div>
                        </div>

                        {/* Read More Button */}
                        <div className="pt-2">
                          <a
                            href="/all-diseases"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1f4229] hover:bg-[#152e1c] text-white text-sm font-bold rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                          >
                            Read More <ArrowRight size={16} />
                          </a>
                        </div>

                      </div>

                      {/* Right Side: Image with Watch Video Button Overlay (Matches screenshot) */}
                      <div className={`lg:col-span-5 flex flex-col ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                        <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white flex flex-col h-full bg-white group/vid relative">

                          {/* Image Container */}
                          <div className="relative flex-1 min-h-[300px] lg:min-h-full overflow-hidden bg-gray-100">
                            {therapy.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={therapy.image}
                                alt={therapy.name}
                                className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                                <Leaf className="w-12 h-12 text-[#1f4229]/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/10 group-hover/vid:bg-black/20 transition-colors" />
                          </div>

                          {/* Watch Video Red Button Overlay at Bottom */}
                          <a
                            href="https://www.youtube.com/karmaayurveda"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#fc4444] hover:bg-[#e03333] text-white py-3.5 px-4 font-extrabold text-center text-sm md:text-base flex items-center justify-center gap-2 transition-colors shadow-inner w-full"
                          >
                            <div className="w-7 h-7 rounded-full bg-white text-[#fc4444] flex items-center justify-center shadow-sm">
                              <Play size={14} fill="currentColor" className="ml-0.5" />
                            </div>
                            Watch Video
                          </a>

                        </div>
                      </div>

                    </div>

                  </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
