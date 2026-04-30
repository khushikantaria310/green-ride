"use client";

import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

interface Station {
  id: number;
  name: string;
  distance_km: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function GlobeView() {
  const [stations, setStations] = useState<Station[]>([]);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stations/nearby?lat=12.9716&lon=77.5946');
        if (!response.ok) throw new Error('Failed to fetch API');
        
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error("Error loading Green Ride stations:", error);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.8;
      globeRef.current.pointOfView({ lat: 15, lng: 77, altitude: 1.5 }, 4000);
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-black m-0 p-0 overflow-hidden flex items-center justify-center">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        labelsData={stations}
        labelLat={(d: any) => d.coordinates.lat}
        labelLng={(d: any) => d.coordinates.lng}
        labelText={(d: any) => d.name}
        labelSize={1.5}
        labelDotRadius={0.5}
        labelColor={() => 'rgba(46, 204, 113, 1)'}
        labelResolution={2}
      />
    </div>
  );
}
