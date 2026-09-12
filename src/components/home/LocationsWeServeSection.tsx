'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import { ServiceLocation } from '@/app/actions/locationActions';

interface LocationsWeServeSectionProps {
  locations: ServiceLocation[];
}

export default function LocationsWeServeSection({ locations }: LocationsWeServeSectionProps) {
  const [search, setSearch] = useState('');

  const filtered = locations.filter(loc => {
    const q = search.toLowerCase();
    return loc.name.toLowerCase().includes(q) || loc.city.toLowerCase().includes(q);
  });

  if (locations.length === 0) return null;

  return (
    <div className="container mx-auto px-4 mt-20 max-w-7xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Other Locations We Serve
      </h2>
      <p className="text-sm text-gray-500 text-center mb-8">
        Karma Ayurveda's reach extends to these areas and service pages across India.
      </p>

      <div className="relative max-w-md mx-auto mb-8">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] transition-all bg-white text-sm text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filtered.map((location) => (
          <Link
            key={location.id}
            href={`/our-clinics/${location.slug}`}
            className="bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#c3dbc0] transition-all flex items-center gap-3"
          >
            <MapPin className="w-5 h-5 text-[#1f4229] flex-shrink-0" />
            <span className="text-sm font-bold text-gray-800 line-clamp-1">Ayurvedic Hospital in {location.city || location.name}</span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-gray-400 font-bold bg-white rounded-2xl border border-gray-100">
          No locations match "{search}".
        </div>
      )}
    </div>
  );
}
