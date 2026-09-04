import React from 'react';
import Link from 'next/link';
import { DiseaseTreatmentWithDisease } from '@/app/actions/diseaseTreatmentActions';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TreatmentDetailViewProps {
  treatment: DiseaseTreatmentWithDisease;
}

// Shared page template for every disease "Treatments We Offer" sub-page.
// The layout is identical across treatments — only the content authored
// in the admin panel (title, image, rich-text body) differs per page.
export default function TreatmentDetailView({ treatment }: TreatmentDetailViewProps) {
  const hasContent = treatment.content && treatment.content !== '<p><br></p>';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#edf6ef] border-b border-[#dfeee2]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(95,163,109,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(95,163,109,0.10),_transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-14 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-[#335440]">
            <Link href="/" className="hover:text-[#1f4229] transition-colors">Home</Link>
            <span className="text-[#9ab3a2]">/</span>
            <Link href={`/${treatment.disease_slug}`} className="hover:text-[#1f4229] transition-colors">{treatment.disease_name}</Link>
            <span className="text-[#9ab3a2]">/</span>
            <span className="text-[#1f4229]">{treatment.title}</span>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1f4229] md:text-xs">
                Ayurvedic Treatment
              </p>
              <h1 className="max-w-xl text-4xl font-black leading-[1.06] tracking-[-0.04em] text-[#0f2a1d] md:text-5xl">
                {treatment.title}
              </h1>

              {treatment.short_description && (
                <p className="mt-6 max-w-xl text-base leading-8 text-[#335440] md:text-lg">
                  {treatment.short_description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="tel:9971928080"
                  className="flex items-center gap-3 rounded-full bg-[#0b6a3d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0b6a3d]/20 transition hover:bg-[#095b34]"
                >
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href={`/${treatment.disease_slug}`}
                  className="flex items-center gap-2 rounded-full border border-[#1e5d3f] bg-white/80 px-5 py-3 text-sm font-semibold text-[#123c2b] shadow-sm transition hover:bg-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to {treatment.disease_name}</span>
                </Link>
              </div>
            </div>

            {treatment.image && (
              <div className="relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={treatment.image}
                  alt={treatment.title}
                  className="h-[280px] md:h-[340px] w-full max-w-[480px] object-cover rounded-[26px] shadow-[0_25px_60px_rgba(23,48,33,0.18)] border-[6px] border-white"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      {hasContent ? (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="rounded-[30px] border border-[#edf2ed] p-6 md:p-10">
              <article
                className="text-gray-700 text-base leading-relaxed
                           [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-[#112d1d] [&>h1]:mt-8 [&>h1]:mb-4
                           [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-[#112d1d] [&>h2]:mt-8 [&>h2]:mb-4
                           [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[#1a2e3b] [&>h3]:mt-6 [&>h3]:mb-3
                           [&>p]:mb-5
                           [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5 [&>ul>li]:mb-2
                           [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-5 [&>ol>li]:mb-2
                           [&>blockquote]:border-l-4 [&>blockquote]:border-[#1f4229] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#4d5f57] [&>blockquote]:mb-5
                           [&>strong]:text-[#1a2e3b] [&>strong]:font-bold
                           [&>em]:italic
                           [&_a]:text-[#1f4229] [&_a]:font-bold [&_a]:underline
                           [&_img]:rounded-2xl [&_img]:my-6"
                dangerouslySetInnerHTML={{ __html: treatment.content }}
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="rounded-[30px] border border-[#edf2ed] p-10 text-center text-sm text-gray-500">
              Detailed content for this treatment is coming soon. In the meantime,{' '}
              <Link href={`/${treatment.disease_slug}`} className="text-[#1f4229] font-bold underline">
                view the full {treatment.disease_name} page
              </Link>.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
