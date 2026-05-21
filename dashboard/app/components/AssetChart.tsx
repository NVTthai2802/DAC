"use client";

import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine 
} from 'recharts';
import { Clock } from 'lucide-react';

const CHART_MARGIN = { top: 10, right: 70, left: -20, bottom: 0 };
const YAXIS_WIDTH = 60;

const CustomPriceLabel = ({ viewBox, value }: any) => {
  if (!viewBox || value == null) return null;
  const { x, y, width } = viewBox;
  const boxWidth = 62;
  const boxHeight = 22;
  const boxX = x + width;
  const boxY = y - boxHeight / 2;

  return (
    <g>
      <rect x={boxX} y={boxY} width={boxWidth} height={boxHeight} fill="#3b82f6" rx={3} />
      <text x={boxX + boxWidth / 2} y={y + 5} fill="#ffffff" fontSize={11} fontWeight="bold" textAnchor="middle">
        {Number(value).toFixed(2)}
      </text>
    </g>
  );
};

export default function AssetChart({ data, latest }: { data: any[], latest: any }) {
  return (
    <div className="flex-1 bg-white m-8 mt-2 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-600 flex items-center gap-2 uppercase tracking-widest">
          <Clock size={16} className="text-blue-500" /> Biểu đồ kỹ thuật
        </h3>
      </div>

      <div className="flex-1 flex flex-col p-4">
        {/* BIỂU ĐỒ GIÁ */}
        <div className="h-[75%] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} syncId="assetChart" margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" hide={true} height={0} />
              <YAxis orientation="right" domain={['auto', 'auto']} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={YAXIS_WIDTH} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{ color: '#475569', fontWeight: 'bold' }} />
              
              {latest?.price != null && (
                <ReferenceLine y={latest.price} stroke="#3b82f6" strokeDasharray="5 3" strokeWidth={1.5} label={<CustomPriceLabel value={latest.price} />} />
              )}
              <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ĐƯỜNG NGĂN CÁCH */}
        <div className="h-[1px] bg-slate-200 my-1" style={{ marginLeft: '20px', marginRight: '130px' }}></div>

        {/* BIỂU ĐỒ BIẾN ĐỘNG */}
        <div className="h-[25%] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} syncId="assetChart" margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} minTickGap={50} tickLine={false} axisLine={false} />
              <YAxis orientation="right" tick={false} axisLine={false} width={YAXIS_WIDTH} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              <Bar dataKey={(d) => Math.abs(d.change_abs || 0)} barSize={4} isAnimationActive={false}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={(entry.change_pct ?? 0) >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}