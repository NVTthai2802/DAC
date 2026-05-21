"use client";

import { useEffect, useState } from 'react';
import AssetStats from '../components/AssetStats';
import AssetChart from '../components/AssetChart';

type AssetData = {
  time: string;
  price: number;
  asset?: string;
  change_pct?: number;
  change_abs?: number;
};

export default function OilPage() {
  const [data, setData] = useState<AssetData[]>([]);
  const [latest, setLatest] = useState<AssetData | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/oil');
      if (!res.ok) return;

      const jsonData = await res.json();
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        setData(jsonData);
        setLatest(jsonData[jsonData.length - 1]);
      }
    } catch (error) {
      console.error("Lỗi fetch data FE:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <header className="flex justify-between items-center p-8 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{latest?.asset || 'WTI Crude Oil'}</h1>
          <p className="text-slate-500 text-sm mt-1">Hệ thống giám sát dữ liệu Real-time Kafka & Druid</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 shadow-sm">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Live</span>
        </div>
      </header>

      {/* Gọi các Component đa năng */}
      <AssetStats latest={latest} />
      <AssetChart data={data} latest={latest} />
    </main>
  );
}