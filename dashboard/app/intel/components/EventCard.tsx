import { Radio, ExternalLink } from 'lucide-react';

interface EventCardProps {
  event: any;
}

export default function EventCard({ event }: EventCardProps) {
  const rawTime = event.time || event.TIME || event.__time;
  let displayTime = '--:--';
  if (rawTime) {
    const d = new Date(rawTime);
    // Lấy giờ:phút (VD: 15:36)
    const timePart = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    // Lấy ngày/tháng/năm (VD: 15/05/2026)
    const datePart = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    displayTime = `${timePart} • ${datePart}`;
  }

  const keywords = Array.isArray(event.matched_keywords) 
    ? event.matched_keywords 
    : typeof event.matched_keywords === 'string' 
        ? event.matched_keywords.replace(/[\[\]"]/g, '').split(',') 
        : [];

  return (
    <div className="relative bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-colors group">
      {/* Đổi border của chấm đỏ thành slate-50 để chìm vào nền của trang */}
      <div className="absolute -left-[41px] top-5 w-4 h-4 bg-red-500 rounded-full border-4 border-slate-50 ring-2 ring-red-500/30 group-hover:ring-red-500/60 transition-all"></div>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {/* Nhãn thời gian đổi sang màu sáng */}
          <span className="text-red-600 font-mono text-sm font-bold bg-red-50 border border-red-100 px-2 py-1 rounded">
            {displayTime}
          </span>
          <span className="text-slate-500 text-xs font-bold uppercase flex items-center gap-1">
            <Radio size={12} /> {event.source}
          </span>
        </div>
      </div>

      {/* Đổi text title sang slate-900 */}
      <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">{event.title}</h3>
      
      <div className="flex flex-wrap gap-2 mt-4">
        {keywords.map((kw: string, i: number) => kw.trim() && (
          <span key={i} className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200 uppercase tracking-wider">
            {kw.trim()}
          </span>
        ))}
      </div>

      {/* Đổi màu icon link */}
      <a href={event.link} target="_blank" rel="noopener noreferrer" className="absolute top-5 right-5 text-slate-400 hover:text-blue-500 transition-colors">
        <ExternalLink size={18} />
      </a>
    </div>
  );
}