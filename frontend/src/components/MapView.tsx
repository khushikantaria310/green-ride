"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🔥 IMPORT THE TANSTACK QUERY HOOK
import { useStations } from '../hooks/useNetwork'; 

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (slots: number) => {
  const color = slots > 5 ? '#4d6af2' : slots > 0 ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px ${color}; transition: all 0.5s ease;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface MapViewProps {
  onSelectStation: (station: any) => void;
}

export default function MapView({ onSelectStation }: MapViewProps) {
  const center = { lat: 12.9716, lng: 77.5946 };
  
  // 🔥 FETCH LIVE DATA FROM TANSTACK QUERY CACHE
  const { data: stations, isLoading, isError } = useStations();

  // Handle graceful loading state
  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-[#161921] rounded-[40px]">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#4d6af2] rounded-full animate-spin mb-4" />
        <p className="font-bold tracking-widest uppercase text-xs text-gray-400">Syncing Network Nodes...</p>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-[#161921] rounded-[40px] text-red-500 font-bold">
        Failed to connect to the energy network. Ensure your backend is running.
      </div>
    );
  }

  // Ensure stations fallback to empty array if undefined
  const activeStations = stations || [];

  return (
    <div className="w-full h-[600px] rounded-[40px] overflow-hidden relative z-0">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {activeStations.map((station: any) => (
          <Marker 
            key={station.id} 
            position={[station.coordinates.lat, station.coordinates.lng]}
            icon={createCustomIcon(station.available_slots)}
          >
            <Popup className="status-popup">
              <div className="p-3 font-sans w-48">
                <div className="inline-block px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-[10px] font-bold uppercase tracking-widest mb-2">
                  Live
                </div>
                <h3 className="font-bold text-lg leading-tight">{station.name}</h3>
                <p className="text-gray-500 text-xs mt-1 mb-4">{station.distance_km} km away</p>
                <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-xl">
                  <span className="text-xl">🔋</span>
                  <div className="text-right">
                    <span className="block font-bold text-lg leading-none">{station.available_slots}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Slots left</span>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectStation(station)}
                  disabled={station.available_slots === 0}
                  className="w-full bg-[#4d6af2] text-white py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {station.available_slots === 0 ? 'Depleted' : 'Reserve Node'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
