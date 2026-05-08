"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  stations: any[];
  onSelectStation: (station: any) => void;
}

export default function MapView({ stations, onSelectStation }: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Clean up Leaflet default icons safely
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  if (!mounted) return null;

  // 🌊 True Flat Pastel Icon Generator (Zero Glow, Zero Animation)
  const createFlatIcon = (availableBatteries: number) => {
    const isCritical = availableBatteries === 0;
    // Ultra-light pastel hex codes
    const pastelColor = isCritical ? '#fda4af' : '#A7C7E7'; 

    return L.divIcon({
      className: 'bg-transparent border-0', 
      html: `
        <div class="relative flex items-center justify-center w-6 h-6">
          <div class="rounded-full" style="width: 14px; height: 14px; background-color: ${pastelColor}; border: 2px solid #0a0b10;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const mapCenter: [number, number] = [12.9716, 77.5946]; 

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={6} 
      style={{ height: '100%', width: '100%', zIndex: 0, backgroundColor: '#0a0b10' }}
      zoomControl={false} 
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {stations.map((station) => {
        // 🔥 Force coordinates to be numbers 
        const lat = Number(station.latitude);
        const lng = Number(station.longitude);
        
        // Safety check
        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker 
            key={station.id} 
            position={[lat, lng]}
            icon={createFlatIcon(station.availableBatteries)}
            eventHandlers={{
              click: () => {
                if (station.availableBatteries > 0) {
                  onSelectStation(station);
                }
              },
            }}
          >
            {/* Sleek Dark Mode Hover Tooltip */}
            <Tooltip 
              direction="top" 
              offset={[0, -15]} 
              opacity={1}
              className="custom-tooltip"
            >
              <div className="bg-[#161921] border border-[#334155] px-4 py-3 rounded-xl min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${station.availableBatteries === 0 ? 'bg-[#fda4af]' : 'bg-[#A7C7E7]'}`}></span>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{station.name}</p>
                </div>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{station.city}</p>
                
                <p className={`text-sm font-black font-mono mt-3 ${station.availableBatteries === 0 ? 'text-[#fda4af]' : 'text-[#A7C7E7]'}`}>
                  {station.availableBatteries} UNITS LIVE
                </p>
                
                <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-2 border-t border-white/5 pt-2">
                  {station.availableBatteries > 0 ? 'Click to Reserve Node' : 'Node Depleted'}
                </p>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
