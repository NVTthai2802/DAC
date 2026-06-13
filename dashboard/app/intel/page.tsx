"use client";

import { useEffect, useState } from 'react';
import IntelHeader from './components/intelHeader';
import EventCard from './components/EventCard';
import OsintMap from './components/OsintMap'; // Import Component Bản đồ động

export default function IntelDashboard() {
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/osint');
      if (!res.ok) {
        console.error("API lỗi status:", res.status);
        return;
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]); 
      }
    } catch (error) {
      console.error("Lỗi fetch:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Lọc ra những sự kiện CÓ TỌA ĐỘ để truyền riêng cho bản đồ (tránh lỗi)
  const mapEvents = events.filter(ev => ev.latitude != null && ev.longitude != null);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Header */}
      <IntelHeader />

      {/* Nội dung chính: Chia Layout Grid */}
      <div className="flex-1 overflow-y-auto p-8 pt-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI (Chiếm 2/3): HIỂN THỊ BẢN ĐỒ */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Bản đồ Vệ tinh Thời gian thực</h2>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                Đã quét {mapEvents.length} tọa độ
              </span>
            </div>
            
            {/* Gọi Component bản đồ đã bọc next/dynamic */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-[600px]">
                <OsintMap events={mapEvents} />
            </div>
          </div>

          {/* CỘT PHẢI (Chiếm 1/3): DÒNG THỜI GIAN TIN TỨC */}
          <div className="lg:col-span-1 space-y-4">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Dòng thời gian Sự kiện</h2>
             
             {/* Box có scroll dọc riêng biệt cho danh sách tin */}
             <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 pl-8 flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-2 pb-10 custom-scrollbar">
              {events.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Đang rà quét tần số vệ tinh...</p>
              ) : (
                events.map((ev, idx) => <EventCard key={idx} event={ev} />)
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}