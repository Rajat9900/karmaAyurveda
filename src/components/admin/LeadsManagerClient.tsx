'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  FolderOpen,
  Phone
} from 'lucide-react';
import { updateLeadStatusAction, deleteLeadAction, Lead } from '@/app/actions/leadActions';

interface LeadsManagerClientProps {
  initialLeads: Lead[];
}

export default function LeadsManagerClient({ initialLeads }: LeadsManagerClientProps) {
  // Leads state & filter
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');

  // Statistics
  const totalLeads = leads.length;
  const pendingLeads = leads.filter(l => l.status === 'Pending').length;

  // Update lead status
  const handleStatusChange = async (id: number, status: 'Pending' | 'Contacted' | 'Closed') => {
    const originalLeads = [...leads];
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status } : lead));

    const result = await updateLeadStatusAction(id, status);
    if (!result.success) {
      alert(result.error || 'Failed to update status.');
      setLeads(originalLeads); // rollback
    }
  };

  // Delete lead
  const handleDeleteLead = async (id: number) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    const originalLeads = [...leads];
    setLeads(prev => prev.filter(l => l.id !== id));

    const result = await deleteLeadAction(id);
    if (!result.success) {
      alert(result.error || 'Failed to delete lead.');
      setLeads(originalLeads);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.phone.includes(leadSearch) ||
      (lead.email || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.disease.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.message.toLowerCase().includes(leadSearch.toLowerCase());
    
    const matchesFilter = leadStatusFilter === 'all' || lead.status.toLowerCase() === leadStatusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <span>Dashboard</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Contact Leads</span>
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/10">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Patient Leads</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage and respond to patient inquiries & callbacks</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-slate-900 leading-none">{totalLeads}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Total Enquiries</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-orange-600 leading-none">{pendingLeads}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Pending Callback</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-emerald-600 leading-none">{totalLeads - pendingLeads}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Responded/Closed</span>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        
        {/* Pills */}
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button 
            onClick={() => setLeadStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              leadStatusFilter === 'all'
                ? 'bg-emerald-50 text-[#059669] border border-emerald-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Leads <span className="text-[10px] ml-0.5 opacity-80">{totalLeads}</span>
          </button>
          <button 
            onClick={() => setLeadStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              leadStatusFilter === 'pending'
                ? 'bg-emerald-50 text-[#059669] border border-emerald-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Pending <span className="text-[10px] ml-0.5 opacity-80">{pendingLeads}</span>
          </button>
          <button 
            onClick={() => setLeadStatusFilter('contacted')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              leadStatusFilter === 'contacted'
                ? 'bg-emerald-50 text-[#059669] border border-emerald-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Contacted <span className="text-[10px] ml-0.5 opacity-80">{leads.filter(l => l.status === 'Contacted').length}</span>
          </button>
          <button 
            onClick={() => setLeadStatusFilter('closed')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              leadStatusFilter === 'closed'
                ? 'bg-emerald-50 text-[#059669] border border-emerald-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Closed <span className="text-[10px] ml-0.5 opacity-80">{leads.filter(l => l.status === 'Closed').length}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-[#059669] transition-colors" />
          <input
            type="text"
            placeholder="Search leads..."
            value={leadSearch}
            onChange={(e) => setLeadSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-xs bg-white text-slate-700 placeholder:text-slate-400 font-semibold"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-600">
            <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                </th>
                <th className="py-4 px-5">Patient Details</th>
                <th className="py-4 px-5">Disease/Area</th>
                <th className="py-4 px-5">Enquiry Message</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Status Action</th>
                <th className="py-4 px-5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No enquiries found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="max-w-xs">
                        <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{lead.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono font-medium block mt-0.5">{lead.phone}</span>
                        {lead.email && (
                          <span className="text-[10px] text-slate-400 font-mono font-medium block">{lead.email}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-wider">
                        {lead.disease}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-500 max-w-xs truncate" title={lead.message}>
                      {lead.message || '—'}
                    </td>
                    <td className="py-4 px-5 text-slate-400 font-medium">{lead.created_at}</td>
                    <td className="py-4 px-5">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-black cursor-pointer transition-colors focus:outline-none ${
                          lead.status === 'Closed'
                            ? 'bg-emerald-50 border-emerald-200 text-[#03543f]'
                            : lead.status === 'Contacted'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
