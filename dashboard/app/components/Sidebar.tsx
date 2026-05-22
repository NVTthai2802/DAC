"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, TrendingUp, ShieldAlert } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <TrendingUp className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">DAC</span>
      </div>
      
      <nav className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-400 uppercase px-2 mb-2">Danh mục</p>
        
        <Link 
          href="/oil" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/oil') ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Coins size={20} /> Giá Dầu Thế Giới
        </Link>

        <Link 
          href="/gold" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/gold') ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Coins size={20} /> Giá Vàng Thế Giới
        </Link>

        <Link 
          href="/forex" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/forex') ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Coins size={20} /> Giá Ngoại hối
        </Link>

        <Link 
          href="/intel" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/intel') ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <ShieldAlert size={20} /> OSINT Chiến sự
        </Link>
        
        <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all cursor-not-allowed">
          <div className="w-5 h-5 border-2 border-slate-300 rounded-full" /> Giá Bạc (Sắp có)
        </button>

      </nav>
    </aside>
  );
}