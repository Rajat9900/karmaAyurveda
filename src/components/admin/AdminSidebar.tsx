'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText,
  LayoutDashboard,
  ChevronDown,
  MapPin,
  Tag,
  Eye,
  Boxes,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  Activity,
  Users,
  Award,
  HelpCircle,
  Newspaper,
  BookOpen,
  GraduationCap,
  Settings
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Submenu states
  const [diseasesOpen, setDiseasesOpen] = useState(false);
  const [clinicMgmtOpen, setClinicMgmtOpen] = useState(false);
  const [blogsOpen, setBlogsOpen] = useState(true); // default true for better initial view
  const [webStoriesOpen, setWebStoriesOpen] = useState(false);

  // Helper to check if a route is active
  const isActive = (path: string) => pathname === path;

  // Auto-expand active submenus on page load or navigation
  useEffect(() => {
    if (pathname.includes('/admin/diseases') || pathname.includes('/admin/pillars') || pathname.includes('/admin/treatment-pages')) {
      setDiseasesOpen(true);
    }
    if (pathname.includes('/admin/clinics') || pathname.includes('/admin/locations-we-serve') || pathname.includes('/admin/clinic-tags')) {
      setClinicMgmtOpen(true);
    }
    if (
      pathname.includes('/admin/categories') ||
      pathname.includes('/admin/tags') ||
      pathname.includes('/admin/blogs')
    ) {
      setBlogsOpen(true);
    }
    if (pathname.includes('/admin/admin_form') || pathname.includes('/admin/admin_view_stories')) {
      setWebStoriesOpen(true);
    }
  }, [pathname]);

  // Helpers to check if parent is active
  const isDiseasesActive = pathname.includes('/admin/diseases') || pathname.includes('/admin/pillars') || pathname.includes('/admin/treatment-pages');
  const isClinicMgmtActive = pathname.includes('/admin/clinics') || pathname.includes('/admin/locations-we-serve') || pathname.includes('/admin/clinic-tags');
  const isBlogsActive = pathname.includes('/admin/categories') || pathname.includes('/admin/tags') || pathname.includes('/admin/blogs');
  const isWebStoriesActive = pathname.includes('/admin/admin_form') || pathname.includes('/admin/admin_view_stories');

  return (
    <aside className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} bg-[#0b1329] text-gray-400 flex flex-col flex-shrink-0 h-full border-r border-[#1e293b]/30`}>
      
      {/* Brand / Logo */}
      <div className={`p-5 border-b border-[#1e293b]/50 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-all duration-300`}>
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-md flex-shrink-0">
          KA
        </div>
        {!isCollapsed && (
          <div className="transition-opacity duration-300 opacity-100 whitespace-nowrap">
            <h2 className="font-bold text-white text-sm tracking-wide leading-none">Karma Ayurveda</h2>
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-1 block">Admin Panel</span>
          </div>
        )}
      </div>

      {/* Menu Items (Scrollable) */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800">
        
        {/* 1. Dashboard */}
        <Link 
          href="/admin/dashboard"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/dashboard')
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'hover:bg-[#15203b] hover:text-white border border-transparent'
          }`}
          title={isCollapsed ? "Dashboard" : undefined}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        {/* 2. Disease Management */}
        <div className="space-y-1">
          <button
            onClick={() => setDiseasesOpen(!diseasesOpen)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold hover:bg-[#15203b] hover:text-white transition-all duration-200 border border-transparent text-left ${
              isDiseasesActive && !diseasesOpen ? 'text-white' : ''
            }`}
            title={isCollapsed ? "Disease Management" : undefined}
          >
            <span className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <Activity className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Disease Management</span>}
            </span>
            {!isCollapsed && (
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${diseasesOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {!isCollapsed && diseasesOpen && (
            <div className="pl-6 space-y-1 transition-all duration-200">
              <Link
                href="/admin/diseases"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/diseases')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Manage Diseases
              </Link>
              <Link
                href="/admin/pillars"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/pillars')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Manage Pillars
              </Link>
              <Link
                href="/admin/treatment-pages"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/treatment-pages')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Manage Treatment Pages
              </Link>
            </div>
          )}
        </div>

        {/* 3. Clinic & Hospital Management */}
        <div className="space-y-1">
          <button
            onClick={() => setClinicMgmtOpen(!clinicMgmtOpen)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold hover:bg-[#15203b] hover:text-white transition-all duration-200 border border-transparent text-left ${
              isClinicMgmtActive && !clinicMgmtOpen ? 'text-white' : ''
            }`}
            title={isCollapsed ? "Clinic & Hospital Management" : undefined}
          >
            <span className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Clinic & Hospital Mana..</span>}
            </span>
            {!isCollapsed && (
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${clinicMgmtOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {!isCollapsed && clinicMgmtOpen && (
            <div className="pl-6 space-y-1 transition-all duration-200">
              <Link
                href="/admin/clinics"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/clinics')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Our Clinics
              </Link>
              <Link
                href="/admin/locations-we-serve"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/locations-we-serve')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Other Locations We Serve
              </Link>
              <Link
                href="/admin/clinic-tags"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/clinic-tags')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Manage Tags
              </Link>
            </div>
          )}
        </div>

        {/* 3.5 Doctors Management */}
        <Link 
          href="/admin/doctors"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/doctors')
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'hover:bg-[#15203b] hover:text-white border border-transparent'
          }`}
          title={isCollapsed ? "Doctors Management" : undefined}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Doctor Management</span>}
        </Link>

        {/* 8. Blogs Management */}
        <div className="space-y-1">
          <button 
            onClick={() => setBlogsOpen(!blogsOpen)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold hover:bg-[#15203b] hover:text-white transition-all duration-200 border border-transparent text-left ${
              isBlogsActive && !blogsOpen ? 'text-white' : ''
            }`}
            title={isCollapsed ? "Blogs Management" : undefined}
          >
            <span className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <Boxes className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Blogs Management</span>}
            </span>
            {!isCollapsed && (
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${blogsOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {!isCollapsed && blogsOpen && (
            <div className="pl-6 space-y-1 transition-all duration-200">
              <Link 
                href="/admin/categories"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/categories')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Manage Category
              </Link>
              <Link 
                href="/admin/tags"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/tags')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Manage Blogs Tags
              </Link>
              <Link
                href="/admin/blogs"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/blogs')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Manage Blogs
              </Link>
            </div>
          )}
        </div>

        {/* 10. Web Stories Manage */}
        <div className="space-y-1">
          <button 
            onClick={() => setWebStoriesOpen(!webStoriesOpen)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold hover:bg-[#15203b] hover:text-white transition-all duration-200 border border-transparent text-left ${
              isWebStoriesActive && !webStoriesOpen ? 'text-white' : ''
            }`}
            title={isCollapsed ? "Web Stories Manage.." : undefined}
          >
            <span className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Web Stories Manage..</span>}
            </span>
            {!isCollapsed && (
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${webStoriesOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {!isCollapsed && webStoriesOpen && (
            <div className="pl-6 space-y-1 transition-all duration-200">
              <Link 
                href="/admin/admin_form"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/admin_form')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                Add Storie
              </Link>
              <Link 
                href="/admin/admin_view_stories"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive('/admin/admin_view_stories')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:text-white hover:bg-[#15203b]'
                }`}
              >
                View Storie
              </Link>
            </div>
          )}
        </div>

        {/* Awards Management */}
        <Link 
          href="/admin/awards"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/awards')
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'hover:bg-[#15203b] hover:text-white border border-transparent'
          }`}
          title={isCollapsed ? "Awards Management" : undefined}
        >
          <Award className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Awards Management</span>}
        </Link>

        {/* Site FAQs Management */}
        <Link 
          href="/admin/site-faqs"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/site-faqs')
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'hover:bg-[#15203b] hover:text-white border border-transparent'
          }`}
          title={isCollapsed ? "Site FAQs Manage" : undefined}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Site FAQs Manage</span>}
        </Link>

        {/* Media Articles Management */}
        <Link 
          href="/admin/media-articles"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/media-articles')
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'hover:bg-[#15203b] hover:text-white border border-transparent'
          }`}
          title={isCollapsed ? "Media Articles" : undefined}
        >
          <Newspaper className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Media Articles</span>}
        </Link>

        {/* Research & Articles Management */}
        <Link
          href="/admin/research-articles"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/research-articles')
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'hover:bg-[#15203b] hover:text-white border border-transparent'
          }`}
          title={isCollapsed ? "Research & Articles" : undefined}
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Research & Articles</span>}
        </Link>

        {/* Our Courses Management */}
        <Link
          href="/admin/courses"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/courses')
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'hover:bg-[#15203b] hover:text-white border border-transparent'
          }`}
          title={isCollapsed ? "Our Courses" : undefined}
        >
          <GraduationCap className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Our Courses</span>}
        </Link>

        {/* Custom Pages Management */}
        <Link 
          href="/admin/pages"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/pages')
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'hover:bg-[#15203b] hover:text-white border border-transparent'
          }`}
          title={isCollapsed ? "Custom Pages" : undefined}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Manage Pages</span>}
        </Link>

        {/* Site Profile Configuration */}
        <Link 
          href="/admin/site-profile"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isActive('/admin/site-profile')
              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
              : 'hover:bg-[#15203b] hover:text-white border border-transparent'
          }`}
          title={isCollapsed ? "Site Profile" : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Site Profile</span>}
        </Link>

        {/* 11. Minify / Collapse Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:bg-[#15203b] transition-all border border-transparent mt-4`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <span className="flex items-center gap-3">
            {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </span>
        </button>

      </nav>

      {/* Sidebar Footer */}
      <div className={`p-4 border-t border-[#1e293b]/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={`flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-[#14223d] hover:bg-[#1b2c4e] text-white transition-all ${isCollapsed ? 'p-2.5' : 'w-full px-4 py-2.5'}`}
          title="View Website"
        >
          <Eye className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>View Website</span>}
        </a>
      </div>

    </aside>
  );
}

