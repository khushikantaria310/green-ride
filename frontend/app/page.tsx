"use client"; // <-- THIS IS THE MAGIC FIX

import dynamic from 'next/dynamic';

// Safely import the globe so Next.js doesn't crash trying to render 3D on the server
const DynamicGlobe = dynamic(() => import('../components/GlobeView'), {
  ssr: false, 
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
      Loading Earth...
    </div>
  )
});

export default function Home() {
  return (
    <main className="bg-black m-0 p-0 overflow-hidden h-screen w-screen">
      <DynamicGlobe />
    </main>
  );
}
