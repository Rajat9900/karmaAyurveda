'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  Clock, 
  LayoutDashboard,
  ArrowRight,
  Phone,
  FolderOpen
} from 'lucide-react';
import { Lead } from '@/app/actions/leadActions';
import { BlogPost } from '@/lib/blogData';

interface DashboardSummaryClientProps {
  initialLeads: Lead[];
  initialBlogs: BlogPost[];
}

export default function DashboardSummaryClient({ initialLeads, initialBlogs }: DashboardSummaryClientProps) {
  const totalLeads = initialLeads.length;
  const pendingLeads = initialLeads.filter(l => l.status === 'Pending').length;
  const totalBlogs = initialBlogs.length;

  // Get recent 5 items for preview
  const recentLeads = [...initialLeads]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const recentBlogs = [...initialBlogs]
    .slice(0, 5);

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <span>Dashboard</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Overview</span>
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Quick glance at your hospital leads and blog content</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <div>
            <span className="text-[32px] font-black text-slate-900 leading-none">{totalBlogs}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Total Blog Posts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <div>
            <span className="text-[32px] font-black text-slate-900 leading-none">{totalLeads}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Total Enquiries</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <div>
            <span className="text-[32px] font-black text-orange-600 leading-none">{pendingLeads}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Pending Callback</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Split Recent Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Leads Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500" />
                Recent Leads
              </h3>
              <Link 
                href="/admin/leads" 
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                Manage Leads
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentLeads.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <FolderOpen className="w-6 h-6 mx-auto text-slate-200 mb-1" />
                  No leads received yet.
                </div>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/40">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-none">{lead.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">{lead.phone} • {lead.disease}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      lead.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : lead.status === 'Contacted'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Blogs Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Recent Blog Posts
              </h3>
              <Link 
                href="/admin/blogs" 
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                Manage Blogs
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentBlogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <FolderOpen className="w-6 h-6 mx-auto text-slate-200 mb-1" />
                  No blog posts found.
                </div>
              ) : (
                recentBlogs.map((blog) => (
                  <div key={blog.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/40">
                    <div className="max-w-[70%]">
                      <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-1">{blog.title}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">By {blog.author}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-black">
                      {blog.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </main>
  );
}
