import dynamic from 'next/dynamic';

// Import động (Dynamic Import) và tắt SSR
const MapCore = dynamic(() => import('./MapCore'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Đang tải Radar Vệ tinh...</div>
});

export default function OsintMap({ events }: { events: any[] }) {
  return <MapCore events={events} />;
}