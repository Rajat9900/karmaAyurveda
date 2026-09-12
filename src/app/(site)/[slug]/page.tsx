import React from 'react';
import Link from 'next/link';
import DiseaseDetailClient from '@/components/diseases/DiseaseDetailClient';
import TreatmentDetailView from '@/components/diseases/TreatmentDetailView';
import LocationDetailView from '@/components/diseases/LocationDetailView';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getDiseaseBySlugAction } from '@/app/actions/diseaseActions';
import { getPillarsForDiseaseAction } from '@/app/actions/pillarActions';
import { getDiseaseTreatmentBySlugAction, getDiseaseTreatmentsForDiseaseAction } from '@/app/actions/diseaseTreatmentActions';
import { getLocationsForDiseaseAction, getLocationBySlugAction, getLocationsAction } from '@/app/actions/locationActions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO from database
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  // Route params arrive percent-encoded (e.g. Unicode slugs) — decode before using as a lookup key.
  const slug = decodeURIComponent(resolvedParams.slug);
  const disease = await getDiseaseBySlugAction(slug);

  if (disease) {
    return {
      title: disease.meta_title || `${disease.title} - Karma Ayurveda Hospital`,
      description: disease.meta_des || `Read about expert Ayurvedic treatment and root-cause healing therapies for ${disease.title.toLowerCase()} at Karma Ayurveda. Consult specialist doctors today.`,
      keywords: disease.meta_keywords || `${disease.name.toLowerCase()}, treatment, ayurveda`
    };
  }

  const treatment = await getDiseaseTreatmentBySlugAction(slug);
  if (treatment) {
    return {
      title: treatment.meta_title || `${treatment.title} - Karma Ayurveda Hospital`,
      description: treatment.meta_des || `Read about Ayurvedic treatment for ${treatment.title.toLowerCase()} at Karma Ayurveda.`
    };
  }

  const location = await getLocationBySlugAction(slug);
  if (location) {
    return {
      title: `${location.title || location.name} - Karma Ayurveda Hospital`,
      description: `Read about Ayurvedic treatment at Karma Ayurveda in ${location.city}.`
    };
  }

  return { title: 'Condition Detail | Karma Ayurveda Hospital' };
}

export default async function DiseaseDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const disease = await getDiseaseBySlugAction(slug);

  if (!disease) {
    const treatment = await getDiseaseTreatmentBySlugAction(slug);
    if (treatment) {
      return <TreatmentDetailView treatment={treatment} />;
    }
    const location = await getLocationBySlugAction(slug);
    if (location) {
      const allLocations = await getLocationsAction();
      const otherLocations = allLocations.filter(l => l.id !== location.id);
      return <LocationDetailView location={location} otherLocations={otherLocations} />;
    }
    redirect('/all-diseases');
  }

  const pillars = await getPillarsForDiseaseAction(disease.id);
  const treatments = await getDiseaseTreatmentsForDiseaseAction(disease.id);
  const locations = await getLocationsForDiseaseAction(disease.id);

  const heroTitle = disease.name || 'Kidney Disease';
  const heroSubtitle = `${heroTitle} The Ayurvedic Way`;
  const heroDescription = disease.description;
  const heroEmoji = disease.icon || '🌿';
  const heroImage = disease.main_image || '/images/diseases/kidney-disease.jpg';
  const doctorName = 'Dr. Puneet Dhawan';
  const doctorTitle = 'B.A.M.S (Gold Medalist)';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <section className="relative overflow-hidden bg-[#edf6ef] border-b border-[#dfeee2]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(95,163,109,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(95,163,109,0.10),_transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 md:py-10 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="pt-4 md:pt-8">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1f4229] md:text-xs">
                Natural. Safe. Effective.
              </p>

              <h1 className="max-w-xl text-4xl font-black leading-[1.06] tracking-[-0.04em] text-[#0f2a1d] md:text-5xl xl:text-[4rem]">
                {heroSubtitle.split(' The Ayurvedic Way')[0]}
                <span className="mt-1 block">The Ayurvedic Way</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#335440] md:text-lg">
                {heroDescription}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 md:gap-5">
                <div className="flex items-center gap-3 rounded-full bg-[#0b6a3d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0b6a3d]/20 transition hover:bg-[#095b34]">
                  <span>Book Appointment</span>
                  <span className="rounded-full bg-white/15 p-1">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zm1.1 4.3a.9.9 0 112 0v3.8l2.4 2.4a.9.9 0 11-1.3 1.3L10.9 12a.9.9 0 01-.3-.7V5.8z"/>
                    </svg>
                  </span>
                </div>

                <Link
                  href="/doctor"
                  className="flex items-center gap-3 rounded-full border border-[#1e5d3f] bg-white/80 px-5 py-3 text-sm font-semibold text-[#123c2b] shadow-sm transition hover:bg-white"
                >
                  <span>Talk to Expert</span>
                  <span className="rounded-full bg-[#eaf8ee] p-1 text-[#1a5b3b]">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2.5 11.7a.8.8 0 01.8-.8h5.8L8 7.9a.8.8 0 111.4-.9l3.7 4.7a.8.8 0 010 .9L9.4 17.1a.8.8 0 11-1.4-.9l.9-3H3.3a.8.8 0 01-.8-.8z"/>
                    </svg>
                  </span>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 md:gap-8">
                {[
                  { label: '25+', value: 'Years of Experience' },
                  { label: '1,50,000+', value: 'Happy Patients' },
                  { label: '100%', value: 'Ayurvedic & Natural' }
                ].map((stat) => (
                  <div key={stat.label} className="min-w-[140px]">
                    <div className="text-2xl font-black text-[#0f2a1d] md:text-3xl">{stat.label}</div>
                    <div className="mt-1 text-sm text-[#335440]">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center pt-4 lg:pt-0">
              <div className="relative mb-2 flex w-full max-w-[520px] items-end justify-center">
                <div className="absolute left-8 top-10 h-48 w-48 rounded-full bg-[#dbeedc] blur-2xl" />
                <div className="absolute right-2 top-12 h-40 w-40 rounded-full bg-[#dfead7] blur-2xl" />

                <div className="relative z-10 flex w-full items-end justify-center">
                  <div className="relative flex  items-end justify-center">
                    <div className="absolute bottom-0 left-8 right-8 h-24 rounded-[50%] bg-[#c3dbc0]/70 blur-2xl" />

                    <div className="absolute top-[-40px] right-[-40px] z-[9999] flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#b7d5b8] bg-[#e6f3e7] text-5xl shadow-lg shadow-[#dfece1]">
                            {heroEmoji}
                    </div>

                    {/* <div className="absolute right-0 top-8 h-52 w-52 rounded-full bg-gradient-to-br from-[#f6f4ef] to-[#e7efe8] shadow-[0_20px_50px_rgba(27,56,42,0.12)]" /> */}

                    <img
                      src={heroImage}
                      alt={doctorName}
                      className="hero-image-float relative z-10 h-[390px] object-cover rounded-[26px] shadow-[0_25px_60px_rgba(23,48,33,0.18)] border-[6px] border-white transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>
                </div>

                {/* <div className="absolute right-0 top-10 w-[220px] rounded-[22px] border border-[#dfeae0] bg-white/90 p-4 shadow-[0_18px_40px_rgba(26,52,37,0.12)] backdrop-blur-sm md:right-2">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1,2,3].map((i) => (
                        <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#d9efe1] text-[10px] font-bold text-[#1c4b37]">
                          {i === 1 ? 'A' : i === 2 ? 'R' : 'S'}
                        </div>
                      ))}
                    </div>
                    <div className="text-2xl font-black text-[#1d3e2c]">1,50,000+</div>
                  </div>
                  <div className="text-sm text-[#385c45]">Patients Treated Successfully</div>
                  <div className="mt-3 flex gap-1 text-[#f5b942]">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                </div> */}

                {/* <div className="absolute bottom-0 left-0 rounded-[24px] border border-[#dfeae0] bg-white/90 p-4 shadow-[0_20px_45px_rgba(23,51,32,0.12)] backdrop-blur-sm md:left-6">
                  <div className="text-center">
                    <div className="text-[14px] font-bold uppercase tracking-[0.16em] text-[#9aa7a0]">Doctor</div>
                    <h3 className="mt-2 text-xl font-bold text-[#103425]">{doctorName}</h3>
                    <p className="mt-1 text-sm text-[#456557]">{doctorTitle}</p>
                    <p className="mt-2 text-xs text-[#4f665d]">25+ Years of Experience</p>
                    <div className="mt-3 text-right text-2xl text-[#0d2f1e]">✍</div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <DiseaseDetailClient disease={disease} pillars={pillars} treatments={treatments} locations={locations} />
    </div>
  );
}
