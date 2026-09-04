'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ServiceLocation } from '@/app/actions/locationActions';
import { submitLeadAction } from '@/app/actions/leadActions';
import { ArrowRight, MapPin, Phone, Mail, User, Loader2 } from 'lucide-react';

interface LocationDetailViewProps {
  location: ServiceLocation;
  otherLocations?: ServiceLocation[];
}

// Shared page template for every "Location We Serve" sub-page.
// The layout is identical across locations — only the content authored
// in the admin panel (title, image, rich-text body) differs per page.
export default function LocationDetailView({ location, otherLocations = [] }: LocationDetailViewProps) {
  const hasContent = location.content && location.content !== '<p><br></p>';
  const heading = location.title || location.name;
  const mapQuery = encodeURIComponent(`${location.address}, ${location.city}`);

  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('disease', heading);
      data.append('message', formData.message);

      const result = await submitLeadAction(data);
      if (result.success) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', message: '' });
      } else {
        setError(result.error || 'Failed to submit your enquiry. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
            <Link href="/our-clinics" className="hover:text-[#1f4229] transition-colors">Locations We Serve</Link>
            <span className="text-[#9ab3a2]">/</span>
            <span className="text-[#1f4229]">{location.name}</span>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1f4229] md:text-xs">
                Locations We Serve
              </p>
              <h1 className="max-w-xl text-4xl font-black leading-[1.06] tracking-[-0.04em] text-[#0f2a1d] md:text-5xl">
                {heading}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#335440] md:text-lg">
                {location.address}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={`tel:${location.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-3 rounded-full bg-[#0b6a3d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0b6a3d]/20 transition hover:bg-[#095b34]"
                >
                  <Phone className="w-4 h-4" />
                  <span>{location.phone}</span>
                </a>
                {location.map_url && (
                  <a
                    href={location.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-[#1e5d3f] bg-white/80 px-5 py-3 text-sm font-semibold text-[#123c2b] shadow-sm transition hover:bg-white"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Get Directions</span>
                  </a>
                )}
              </div>
            </div>

            {location.image && (
              <div className="relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={location.image}
                  alt={heading}
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
                dangerouslySetInnerHTML={{ __html: location.content! }}
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="rounded-[30px] border border-[#edf2ed] p-10 text-center text-sm text-gray-500">
              Detailed content for this location is coming soon. In the meantime,{' '}
              <Link href="/our-clinics" className="text-[#1f4229] font-bold underline">
                view all our clinic locations
              </Link>
              <ArrowRight className="inline w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </section>
      )}

      {/* Contact Us + Map */}
      <section className="py-16 bg-gradient-to-b from-[#fcfdfc] to-[#f3f9f4]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
              <Phone className="w-3.5 h-3.5" />
              Get In Touch
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#152e1c] tracking-tight mb-3">
              Contact Us in {location.city}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base font-medium">
              Have a question or want to book a consultation? Reach out and our team will get back to you shortly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Info + Form */}
            <div className="rounded-[30px] border border-[#edf2ed] bg-white p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <a
                  href={`tel:${location.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#edf2ed] p-4 hover:border-[#cfe7d5] hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#1f4229] flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Call Us</span>
                    <span className="text-sm font-bold text-[#152e1c] truncate block">{location.phone}</span>
                  </div>
                </a>
                <a
                  href={`mailto:${location.email}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#edf2ed] p-4 hover:border-[#cfe7d5] hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#1f4229] flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Us</span>
                    <span className="text-sm font-bold text-[#152e1c] truncate block">{location.email}</span>
                  </div>
                </a>
              </div>

              {submitted ? (
                <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
                  <p className="text-sm font-bold text-[#1f4229]">Thank you for reaching out!</p>
                  <p className="text-xs text-[#335440] mt-1">Our care team will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <p className="text-xs font-bold text-red-600">{error}</p>
                  )}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400 group-focus-within:text-[#1f4229] transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] outline-none transition-all bg-white text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone size={16} className="text-gray-400 group-focus-within:text-[#1f4229] transition-colors" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your Phone Number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] outline-none transition-all bg-white text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  <textarea
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your query (optional)"
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] outline-none transition-all resize-none bg-white text-gray-900 placeholder:text-gray-500"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1f4229] to-[#2e5339] hover:from-[#2e5339] hover:to-[#1f4229] text-white font-bold text-sm py-3 px-8 rounded-xl shadow-[0_4px_15px_rgba(31,66,41,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Send Enquiry'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Map Embed */}
            <div className="rounded-[30px] border border-[#edf2ed] bg-white overflow-hidden min-h-[360px]">
              <iframe
                title={`Map showing ${heading}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="w-full h-full min-h-[360px]"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Locations We Serve — links to other location sub-pages */}
      {otherLocations.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
                <MapPin className="w-3.5 h-3.5" />
                Near You
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#152e1c] tracking-tight mb-3">
                Other Locations We Serve
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base font-medium">
                Karma Ayurveda offers treatment and consultations across these areas
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherLocations.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/${loc.slug}`}
                  className="flex flex-col rounded-2xl overflow-hidden border border-[#edf2ed] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#cfe7d5] hover:shadow-[0_16px_36px_rgba(17,45,29,0.12)] p-4"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#1f4229] flex-shrink-0 overflow-hidden">
                      {loc.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-black text-[#152e1c] leading-snug truncate">{loc.name}</h3>
                      <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{loc.city}</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${loc.phone.replace(/[^0-9+]/g, '')}`; }}
                      className="text-[10px] font-bold text-[#ef8716] hover:underline cursor-pointer"
                    >
                      {loc.phone}
                    </button>
                    {loc.map_url && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(loc.map_url, '_blank', 'noopener,noreferrer'); }}
                        className="px-2 py-1 border border-gray-200 text-gray-600 hover:text-gray-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Map
                      </button>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/our-clinics"
                className="inline-flex items-center gap-2 rounded-full bg-[#1f4229] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#1f4229]/15 transition hover:bg-[#152e1c]"
              >
                View All Clinics
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
