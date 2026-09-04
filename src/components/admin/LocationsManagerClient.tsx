'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Plus,
  Trash2,
  Edit,
  FolderOpen,
  Image as ImageIcon,
  Phone,
  Mail
} from 'lucide-react';
import { deleteLocationAction, ServiceLocation } from '@/app/actions/locationActions';

interface LocationsManagerClientProps {
  initialLocations: ServiceLocation[];
}

export default function LocationsManagerClient({ initialLocations }: LocationsManagerClientProps) {
  const [locations, setLocations] = useState<ServiceLocation[]>(initialLocations);
  const [searchQuery, setSearchQuery] = useState('');

  // Statistics
  const totalLocations = locations.length;

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    const originalLocations = [...locations];
    setLocations(prev => prev.filter(l => l.id !== id));

    const result = await deleteLocationAction(id);
    if (!result.success) {
      alert(result.error || 'Failed to delete location.');
      setLocations(originalLocations);
    }
  };

  // Filter locations
  const filteredLocations = locations.filter(location => {
    return (
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">

      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Other Locations We Serve</span>
      </div>

      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/10">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Other Locations We Serve</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage service areas without a full clinic branch — used for local reach and SEO</p>
          </div>
        </div>

        <Link
          href="/admin/locations-we-serve/add"
          className="bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10 cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4.5 h-4.5" />
          Add New Location
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] col-span-1">
          <span className="text-[32px] font-black text-slate-900 leading-none">{totalLocations}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Total Locations</span>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="flex justify-end items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        {/* Search */}
        <div className="relative w-full sm:w-64 group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-[#059669] transition-colors" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-xs bg-white text-slate-700 placeholder:text-slate-400 font-semibold"
          />
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-600">
            <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                </th>
                <th className="py-4 px-5">Location Name & City</th>
                <th className="py-4 px-5">Contact Details</th>
                <th className="py-4 px-5">Address</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No locations found. Click "Add New Location" to create.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-slate-50/50 transition-colors animate-fade-in">
                    <td className="py-4 px-5">
                      <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {location.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="max-w-md">
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-1">{location.name}</h4>
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-black text-sky-650 bg-sky-50 border border-sky-100 px-1.5 py-0.25 rounded">
                            {location.city}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {location.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {location.email}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-semibold max-w-xs truncate" title={location.address}>
                      {location.address}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/locations-we-serve/edit/${location.id}`}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}
