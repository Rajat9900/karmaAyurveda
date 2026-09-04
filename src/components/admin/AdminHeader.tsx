'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/authActions';

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Welcome Back,</span>
        <h1 className="text-sm font-black text-slate-800 mt-0.5">Karma Ayurveda</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all cursor-pointer">
          <User className="w-4 h-4 text-slate-400" />
          Profile
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
