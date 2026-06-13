"use client";

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
      title={dark ? 'Chuyển sang Sáng' : 'Chuyển sang Tối'}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
      <span className="text-sm font-semibold">{dark ? 'Sáng' : 'Tối'}</span>
    </button>
  );
}
