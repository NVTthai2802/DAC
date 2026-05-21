"use client";

import { useEffect, useState } from 'react';
import ForexHeader from './components/ForexHeader';
import AssetStats from '../components/AssetStats'; // Gọi Component dùng chung của bạn
import AssetChart from '../components/AssetChart'; // Gọi Component biểu đồ dùng chung
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function ForexDashboard() {
  const [rates, setRates] = useState<any>({});
  const [quota, setQuota] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchForexData = async () => {
      try {
        const res = await fetch('/api/forex');
        if (!res.ok) return;
        
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // 1. LẤY TỶ GIÁ MỚI NHẤT CHO 3 THẺ KPI
          const rateMap: any = {};
          // Lọc ra các dữ liệu của ngày mới nhất để tính KPI
          const latestData = data.filter(d => d.time === data[0].time);
          latestData.forEach(item => {
            rateMap[item.currency] = item.rate;
          });
          
          setRates(rateMap);
          if (data[0]?.quota_remaining) setQuota(data[0].quota_remaining);

          // 2. BIẾN ĐỔI DỮ LIỆU CHO BIỂU ĐỒ (Lọc riêng VND để vẽ biểu đồ USD/VND)
          // Đảo ngược mảng để vẽ từ quá khứ đến hiện tại (trái sang phải)
          const vndHistory = data
            .filter(item => item.currency === 'VND')
            .reverse() 
            .map(item => {
              const d = new Date(item.time);
              return {
                time: `${d.getDate()}/${d.getMonth() + 1}`, // Format ngày: "19/5"
                value: item.rate // Tỷ giá USD/VND
              };
            });
            
          setChartData(vndHistory);
        }
      } catch (error) {
        console.error("Lỗi fetch:", error);
      }
    };

    fetchForexData();
    // 10 giây cập nhật 1 lần (Lấy từ Druid nội bộ, KHÔNG tốn request API ngoài)
    const interval = setInterval(fetchForexData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Tính toán tỷ giá chéo (USD, EUR, JPY)
  const usd_vnd = rates['VND'] || 0;
  const eur_vnd = rates['EUR'] ? usd_vnd / rates['EUR'] : 0;
  const jpy_vnd = rates['JPY'] ? usd_vnd / rates['JPY'] : 0;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <ForexHeader quotaRemaining={quota} />

      <div className="flex-1 overflow-y-auto p-8 pt-0">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* KHỐI 3 THẺ TỶ GIÁ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tái sử dụng AssetStats nếu bạn đã viết nó, hoặc viết thẻ Div cơ bản */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-slate-500 text-sm font-bold tracking-wider mb-2">TỶ GIÁ USD/VND</h3>
              <p className="text-3xl font-extrabold text-slate-900">
                {usd_vnd.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} <span className="text-lg text-slate-500">₫</span>
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-slate-500 text-sm font-bold tracking-wider mb-2">TỶ GIÁ EUR/VND</h3>
              <p className="text-3xl font-extrabold text-slate-900">
                {eur_vnd.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} <span className="text-lg text-slate-500">₫</span>
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-slate-500 text-sm font-bold tracking-wider mb-2">TỶ GIÁ JPY/VND</h3>
              <p className="text-3xl font-extrabold text-slate-900">
                {jpy_vnd.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} <span className="text-lg text-slate-500">₫</span>
              </p>
            </div>
          </div>

          {/* KHỐI BIỂU ĐỒ KỸ THUẬT */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-96">
             <h3 className="text-slate-800 text-lg font-bold mb-4">Biểu đồ biến động USD/VND (30 ngày)</h3>
             {chartData.length > 0 ? (
               // Gọi Component biểu đồ dùng chung, truyền data vào
               <AssetChart data={chartData} dataKey="value" strokeColor="#3b82f6" />
             ) : (
               <div className="w-full h-full flex items-center justify-center">
                 <p className="text-slate-400 animate-pulse">Đang tải dữ liệu biểu đồ...</p>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}