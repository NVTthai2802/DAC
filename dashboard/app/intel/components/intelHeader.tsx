import { ShieldAlert } from 'lucide-react';

export default function IntelHeader() {
  return (
    <header className="flex justify-between items-center p-8 pb-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
          <ShieldAlert className="text-red-500" size={32} />
          GLOBAL OSINT RADAR
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Hệ thống giám sát dữ liệu Real-time Kafka & Druid
        </p>
      </div>
      
      {/* Nút Live xanh lá giống hệ thống Giá Dầu */}
      <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 shadow-sm">
        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Live</span>
      </div>
    </header>
  );
}