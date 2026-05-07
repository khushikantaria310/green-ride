"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 🔥 Updated to match your DB schema (batteries instead of slots)
const createCustomIcon = (batteries: number) => {
  const color = batteries > 5 ? '#4d6af2' : batteries > 0 ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px ${color}; transition: all 0.5s ease;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// 🔥 Added the 'stations' prop so it receives data from App.tsx
interface MapViewProps {
  stations: any[];
  onSelectStation: (station: any) => void;
}

export default function MapView({ stations, onSelectStation }: MapViewProps) {
  // Center of South India
  const center = { lat: 12.9716, lng: 77.5946 };
  
  const activeStations = stations || [];

  return (
    <div className="w-full h-[600px] rounded-[40px] overflow-hidden relative z-0 bg-[#161921]">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={6} // 🔥 Zoomed out to 6 so you can see all of South India!
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {activeStations.map((station: any) => {
          // Safety check: skip rendering if coordinates are missing
          if (!station.latitude || !station.longitude) return null;

          return (
            <Marker 
              key={station.id} 
              // 🔥 Swapped to your Prisma DB fields
              position={[station.latitude, station.longitude]}
              icon={createCustomIcon(station.availableBatteries)}
            >
              <Popup className="status-popup">
                <div className="p-3 font-sans w-48">
                  <div className="inline-block px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-[10px] font-bold uppercase tracking-widest mb-2">
                    {station.status || 'Live'}
                  </div>
                  <h3 className="font-bold text-lg leading-tight truncate" title={station.name}>
                    {station.name}
                  </h3>
                  
                  {/* 🔥 Replaced mock distance with the Real City/State from DB */}
                  <p className="text-gray-500 text-xs mt-1 mb-4 truncate">
                    {station.city}, {station.state}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-xl">
                    <span className="text-xl">🔋</span>
                    <div className="text-right">
                      <span className="block font-bold text-lg leading-none">{station.availableBatteries}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Batteries left</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSelectStation(station)}
                    disabled={station.availableBatteries === 0}
                    className="w-full bg-[#4d6af2] text-white py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {station.availableBatteries === 0 ? 'Depleted' : 'Reserve Node'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
