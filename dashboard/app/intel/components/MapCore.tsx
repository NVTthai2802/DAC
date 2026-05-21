import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Sửa lỗi mất icon mặc định của Leaflet trong Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function MapCore({ events }: { events: any[] }) {
  // Lấy tọa độ trung tâm mặc định (Ví dụ: Trung Đông)
  const defaultCenter: [number, number] = [31.5, 34.8]; 

  return (
    <div className="w-full h-full rounded-xl overflow-hidden z-0 relative">
      <MapContainer center={defaultCenter} zoom={4} style={{ height: '100%', width: '100%' }}>
        {/* Lớp nền OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Lặp qua danh sách sự kiện và cắm cờ */}
        {events.map((ev, idx) => {
          if (ev.latitude && ev.longitude) {
            return (
              <Marker key={idx} position={[ev.latitude, ev.longitude]} icon={customIcon}>
                <Popup>
                  <a 
                    href={ev.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-900 hover:text-blue-600 hover:underline block cursor-pointer transition-color"
                  >
                    {ev.title}
                  </a>
                  <div className="text-xs text-slate-500 mt-1">{ev.source}</div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}