"use client";

import { useEffect, useState, useRef } from 'react';
import { BarChart3, Clock, RefreshCw, Search } from 'lucide-react';

type StockData = {
  ticker: string;
  price: number;
  volume: number;
  ref_price: number;
  ceil_price: number;
  floor_price: number;
  total_vol: number;
  high: number;
  low: number;
  
  bid_1_price: number; bid_1_vol: number;
  bid_2_price: number; bid_2_vol: number;
  bid_3_price: number; bid_3_vol: number;
  
  ask_1_price: number; ask_1_vol: number;
  ask_2_price: number; ask_2_vol: number;
  ask_3_price: number; ask_3_vol: number;
  
  last_updated: string;
};

// Utilities
function formatVol(vol: number): string {
  if (!vol) return '';
  return (vol / 10).toLocaleString('en-US'); // Thường KL trên bảng điện chia 10
}

function formatPrice(price: number): string {
  if (!price) return '';
  return (price / 1000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getColorClass(price: number, ref: number, ceil: number, floor: number): string {
  if (!price || price === 0) return 'text-yellow-400';
  if (price >= ceil && ceil > 0) return 'text-fuchsia-500';
  if (price <= floor && floor > 0) return 'text-cyan-400';
  if (price > ref) return 'text-green-500';
  if (price < ref) return 'text-red-500';
  return 'text-yellow-400';
}

function getBgColorClass(price: number, ref: number, ceil: number, floor: number): string {
  const color = getColorClass(price, ref, ceil, floor);
  if (color === 'text-fuchsia-500') return 'bg-fuchsia-500/20';
  if (color === 'text-cyan-400') return 'bg-cyan-400/20';
  if (color === 'text-green-500') return 'bg-green-500/20';
  if (color === 'text-red-500') return 'bg-red-500/20';
  return 'bg-yellow-400/20';
}

export default function StockDashboard() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [flashMap, setFlashMap] = useState<Record<string, string>>({});
  const prevDataRef = useRef<Record<string, StockData>>({});

  const fetchData = async () => {
    try {
      const res = await fetch('/api/stock');
      if (!res.ok) return;

      const jsonData: StockData[] = await res.json();
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        
        const newFlash: Record<string, string> = {};
        const prevData = prevDataRef.current;
        
        jsonData.forEach((item) => {
          const prev = prevData[item.ticker];
          if (prev && prev.price !== item.price) {
            newFlash[item.ticker] = getBgColorClass(item.price, item.ref_price, item.ceil_price, item.floor_price);
          }
        });
        
        setFlashMap(newFlash);
        setTimeout(() => setFlashMap({}), 800); // Clear flash sau 800ms

        const dataMap: Record<string, StockData> = {};
        jsonData.forEach((item) => { dataMap[item.ticker] = item; });
        prevDataRef.current = dataMap;

        setStocks(jsonData);
      }
    } catch (error) {
      console.error("Lỗi fetch Stock FE:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-black text-xs font-sans text-gray-300">
      <header className="flex justify-between items-center px-4 py-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-yellow-400" size={24} />
          <h1 className="text-lg font-bold text-white tracking-widest">BẢNG GIÁ CHỨNG KHOÁN</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1.5 text-neutral-500" size={14} />
            <input
              type="text"
              placeholder="Tìm mã CK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-white text-xs rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 placeholder-neutral-600 w-40 transition-all"
            />
          </div>
          <div className="flex gap-4 font-semibold text-sm">
            <span className="text-fuchsia-500">Trần</span>
            <span className="text-green-500">Tăng</span>
            <span className="text-yellow-400">TC</span>
            <span className="text-red-500">Giảm</span>
            <span className="text-cyan-400">Sàn</span>
          </div>
          <button onClick={fetchData} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400">
            <RefreshCw size={16} />
          </button>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-900/40 rounded border border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-green-400 uppercase">Live</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[1200px] border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-neutral-900 border-b border-neutral-800 z-10 shadow-lg">
            <tr>
              <th rowSpan={2} className="px-2 py-2 text-center border-r border-neutral-800 w-16">Mã CK</th>
              <th rowSpan={2} className="px-2 py-2 text-right border-r border-neutral-800 text-yellow-400 w-12">TC</th>
              <th rowSpan={2} className="px-2 py-2 text-right border-r border-neutral-800 text-fuchsia-500 w-12">Trần</th>
              <th rowSpan={2} className="px-2 py-2 text-right border-r border-neutral-800 text-cyan-400 w-12">Sàn</th>
              
              <th colSpan={6} className="px-2 py-1 border-b border-r border-neutral-800 text-center">Bên Mua</th>
              <th colSpan={3} className="px-2 py-1 border-b border-r border-neutral-800 text-center">Khớp Lệnh</th>
              <th colSpan={6} className="px-2 py-1 border-b border-r border-neutral-800 text-center">Bên Bán</th>
              
              <th rowSpan={2} className="px-2 py-2 text-right border-r border-neutral-800 w-16">Tổng KL</th>
              <th rowSpan={2} className="px-2 py-2 text-right border-r border-neutral-800 w-12">Cao</th>
              <th rowSpan={2} className="px-2 py-2 text-right w-12">Thấp</th>
            </tr>
            <tr className="bg-neutral-950">
              {/* Mua */}
              <th className="px-2 py-1 text-right text-neutral-400 w-12">Giá 3</th>
              <th className="px-2 py-1 text-right text-neutral-400 w-14">KL 3</th>
              <th className="px-2 py-1 text-right text-neutral-400 w-12">Giá 2</th>
              <th className="px-2 py-1 text-right text-neutral-400 w-14">KL 2</th>
              <th className="px-2 py-1 text-right text-neutral-400 w-12">Giá 1</th>
              <th className="px-2 py-1 text-right border-r border-neutral-800 text-neutral-400 w-14">KL 1</th>
              
              {/* Khớp lệnh */}
              <th className="px-2 py-1 text-right text-neutral-400 font-bold w-14">Giá</th>
              <th className="px-2 py-1 text-right text-neutral-400 w-16">KL</th>
              <th className="px-2 py-1 text-right border-r border-neutral-800 text-neutral-400 w-12">+/-</th>
              
              {/* Bán */}
              <th className="px-2 py-1 text-right text-neutral-400 w-12">Giá 1</th>
              <th className="px-2 py-1 text-right text-neutral-400 w-14">KL 1</th>
              <th className="px-2 py-1 text-right text-neutral-400 w-12">Giá 2</th>
              <th className="px-2 py-1 text-right text-neutral-400 w-14">KL 2</th>
              <th className="px-2 py-1 text-right text-neutral-400 w-12">Giá 3</th>
              <th className="px-2 py-1 text-right border-r border-neutral-800 text-neutral-400 w-14">KL 3</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-neutral-800/50">
            {stocks
              .filter(stock => stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((stock) => {
              const {
                ticker, ref_price, ceil_price, floor_price, price, volume, total_vol, high, low,
                bid_1_price, bid_1_vol, bid_2_price, bid_2_vol, bid_3_price, bid_3_vol,
                ask_1_price, ask_1_vol, ask_2_price, ask_2_vol, ask_3_price, ask_3_vol
              } = stock;
              
              const flashClass = flashMap[ticker] || 'hover:bg-neutral-900';
              const mainColor = getColorClass(price, ref_price, ceil_price, floor_price);
              
              const diff = price - ref_price;
              const diffStr = diff > 0 ? `+${formatPrice(diff)}` : diff < 0 ? formatPrice(diff) : '0.00';

              return (
                <tr key={ticker} className={`transition-colors duration-300 font-medium ${flashClass}`}>
                  {/* Mã CK */}
                  <td className={`px-2 py-1.5 text-center font-bold border-r border-neutral-800 ${mainColor}`}>{ticker}</td>
                  
                  {/* TC, Trần, Sàn */}
                  <td className="px-2 py-1.5 text-right text-yellow-400 border-r border-neutral-800">{formatPrice(ref_price)}</td>
                  <td className="px-2 py-1.5 text-right text-fuchsia-500 border-r border-neutral-800">{formatPrice(ceil_price)}</td>
                  <td className="px-2 py-1.5 text-right text-cyan-400 border-r border-neutral-800">{formatPrice(floor_price)}</td>

                  {/* Bên mua */}
                  <td className={`px-2 py-1.5 text-right ${getColorClass(bid_3_price, ref_price, ceil_price, floor_price)}`}>{formatPrice(bid_3_price)}</td>
                  <td className="px-2 py-1.5 text-right">{formatVol(bid_3_vol)}</td>
                  <td className={`px-2 py-1.5 text-right ${getColorClass(bid_2_price, ref_price, ceil_price, floor_price)}`}>{formatPrice(bid_2_price)}</td>
                  <td className="px-2 py-1.5 text-right">{formatVol(bid_2_vol)}</td>
                  <td className={`px-2 py-1.5 text-right ${getColorClass(bid_1_price, ref_price, ceil_price, floor_price)}`}>{formatPrice(bid_1_price)}</td>
                  <td className="px-2 py-1.5 text-right border-r border-neutral-800">{formatVol(bid_1_vol)}</td>

                  {/* Khớp lệnh */}
                  <td className={`px-2 py-1.5 text-right font-bold ${mainColor}`}>{formatPrice(price)}</td>
                  <td className="px-2 py-1.5 text-right text-white">{formatVol(volume)}</td>
                  <td className={`px-2 py-1.5 text-right border-r border-neutral-800 ${mainColor}`}>{diffStr}</td>

                  {/* Bên bán */}
                  <td className={`px-2 py-1.5 text-right ${getColorClass(ask_1_price, ref_price, ceil_price, floor_price)}`}>{formatPrice(ask_1_price)}</td>
                  <td className="px-2 py-1.5 text-right">{formatVol(ask_1_vol)}</td>
                  <td className={`px-2 py-1.5 text-right ${getColorClass(ask_2_price, ref_price, ceil_price, floor_price)}`}>{formatPrice(ask_2_price)}</td>
                  <td className="px-2 py-1.5 text-right">{formatVol(ask_2_vol)}</td>
                  <td className={`px-2 py-1.5 text-right ${getColorClass(ask_3_price, ref_price, ceil_price, floor_price)}`}>{formatPrice(ask_3_price)}</td>
                  <td className="px-2 py-1.5 text-right border-r border-neutral-800">{formatVol(ask_3_vol)}</td>

                  {/* High, Low, Total Vol */}
                  <td className="px-2 py-1.5 text-right text-white border-r border-neutral-800">{formatVol(total_vol)}</td>
                  <td className={`px-2 py-1.5 text-right border-r border-neutral-800 ${getColorClass(high, ref_price, ceil_price, floor_price)}`}>{formatPrice(high)}</td>
                  <td className={`px-2 py-1.5 text-right ${getColorClass(low, ref_price, ceil_price, floor_price)}`}>{formatPrice(low)}</td>
                </tr>
              );
            })}
            {stocks.length === 0 && (
              <tr>
                <td colSpan={22} className="py-20 text-center text-neutral-500">
                  <div className="flex justify-center items-center gap-3">
                    <RefreshCw className="animate-spin" size={20} />
                    <span>Đang chờ dữ liệu chứng khoán...</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
