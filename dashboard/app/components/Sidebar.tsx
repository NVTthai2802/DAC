"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-8 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <TrendingUp className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">DAC</span>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase px-2 mb-2">Danh mục</p>
        
        <Link 
          href="/oil" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/oil') ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Coins size={20} /> Giá Dầu Thế Giới
        </Link>

        <Link 
          href="/gold" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/gold') ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Coins size={20} /> Giá Vàng Thế Giới
        </Link>

        <Link 
          href="/forex" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/forex') ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Coins size={20} /> Giá Ngoại hối
        </Link>

        <Link 
          href="/intel" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/intel') ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <ShieldAlert size={20} /> OSINT Chiến sự
        </Link>
        
        <Link 
          href="/silver" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/silver') ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Coins size={20} /> Giá Bạc Thế Giới
        </Link>

        <Link 
          href="/stock" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith('/stock') ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <BarChart3 size={20} /> Chứng khoán VN
        </Link>

      </nav>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <ThemeToggle />
      </div>
    </aside>
  );
}