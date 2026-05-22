"use client";

import { useEffect, useState } from 'react';
import AssetChart from '../components/AssetChart';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const PAIRS = ['EUR/USD', 'USD/JPY', 'USD/VND'];

export default function ForexPage() {
  const [data, setData] = useState<any[]>([]);
  const [latest, setLatest] = useState<any | null>(null);
  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD');

  const fetchData = async () => {
    try {
      // Gọi API kèm theo đuôi ?asset=...
      const res = await fetch(`/api/forex?asset=${encodeURIComponent(selectedPair)}`);
      if (!res.ok) return;

      const jsonData = await res.json();
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        setData(jsonData);
        setLatest(jsonData[jsonData.length - 1]);
      } else {
        setData([]);
        setLatest(null);
      }
    } catch (error) {
      console.error("Lỗi fetch Forex FE:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  // Hàm quyết định số lượng chữ số thập phân dựa theo loại tiền
  const getDecimals = (pair: string) => pair.includes('VND') ? 0 : pair.includes('JPY') ? 3 : 5;
  const decimals = getDecimals(selectedPair);
  const isPositive = (latest?.change_pct ?? 0) >= 0;

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <header className="flex flex-col gap-4 p-8 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Thị trường Ngoại hối (Forex)</h1>
            <p className="text-slate-500 text-sm mt-1">Hệ thống giám sát dữ liệu tiền tệ Real-time độ trễ thấp</p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-red-700 uppercase tracking-wider">Live Market</span>
          </div>
        </div>

        {/* CÁC TABS CHUYỂN ĐỔI CẶP TIỀN */}
        <div className="flex gap-3 mt-4">
          {PAIRS.map(pair => (
            <button
              key={pair}
              onClick={() => setSelectedPair(pair)}
              className={`px-5 py-2 rounded-lg font-bold transition-all ${
                selectedPair === pair 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {pair}
            </button>
          ))}
        </div>
      </header>

      {/* FOREX STATS (Tùy chỉnh riêng để không bị giới hạn 2 chữ số của file cũ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Tỷ giá hiện tại</p>
          <h2 className="text-4xl font-black text-slate-900">
            {latest?.price ? latest.price.toFixed(decimals) : '---'}
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Biến động (Pips / Abs)</p>
          <div className={`flex items-center gap-2 text-3xl font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight strokeWidth={3} /> : <ArrowDownRight strokeWidth={3} />}
            {latest?.change_abs ? Math.abs(latest.change_abs).toFixed(decimals) : '0'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">% Thay đổi</p>
          <div className={`flex items-center gap-2 text-3xl font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <Activity strokeWidth={3} size={28} />
            {latest?.change_pct ? Math.abs(latest.change_pct).toFixed(3) : '0'}%
          </div>
        </div>
      </div>

      {/* TÁI SỬ DỤNG CHART CHUNG */}
      <div className="flex-1 overflow-hidden pb-4">
        {data.length > 0 ? (
          <AssetChart data={data} latest={latest} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">Đang đồng bộ dữ liệu...</div>
        )}
      </div>
    </main>
  );
}