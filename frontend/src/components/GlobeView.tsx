import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

// 1. TypeScript Interface matching your FastAPI JSON response
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
  const globeRef = useRef<any>();

  // 2. Fetch Data from your Python Backend
  useEffect(() => {
    const fetchStations = async () => {
      try {
        // Hitting your local API (using Cubbon Park as the center point)
        const response = await fetch('http://localhost:5000/api/stations/nearby?lat=12.9716&lon=77.5946');
        if (!response.ok) throw new Error('Failed to fetch API');
        
        const data = await response.json();
        setStations(data);
        console.log("Loaded Stations:", data);
      } catch (error) {
        console.error("Error loading Green Ride stations:", error);
      }
    };

    fetchStations();
  }, []);

  // 3. Globe Camera & Auto-Rotation Controls
  useEffect(() => {
    if (globeRef.current) {
      // Make the globe spin slowly
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.8;
      
      // Pan the camera to focus on India/Bengaluru on load
      // Altitude 1.5 gives a nice zoomed-in view of the country
      globeRef.current.pointOfView({ lat: 15, lng: 77, altitude: 1.5 }, 4000);
    }
  }, []);

  // 4. Render the 3D Globe
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', margin: 0, padding: 0 }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        // Feed the backend data directly into the globe markers
        labelsData={stations}
        labelLat={(d: any) => d.coordinates.lat}
        labelLng={(d: any) => d.coordinates.lng}
        labelText={(d: any) => d.name}
        labelSize={1.5}
        labelDotRadius={0.5}
        labelColor={() => 'rgba(46, 204, 113, 1)'} // Green Ride marker color!
        labelResolution={2}
      />
    </div>
  );
}
