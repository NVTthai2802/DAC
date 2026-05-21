import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AssetStats({ latest }: { latest: any }) {
  if (!latest) return null;

  const isPositive = (latest.change_pct ?? 0) >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Giá hiện tại (USD)</p>
        <h2 className="text-4xl font-black text-slate-900">${latest.price?.toFixed(2)}</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Biến động (%)</p>
        <div className={`flex items-center gap-2 text-3xl font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight strokeWidth={3} /> : <ArrowDownRight strokeWidth={3} />}
          {Math.abs(latest.change_pct ?? 0)}%
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Thay đổi (Abs)</p>
        <h2 className={`text-3xl font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : '-'}{Math.abs(latest.change_abs ?? 0)}
        </h2>
      </div>
    </div>
  );
}