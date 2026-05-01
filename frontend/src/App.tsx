"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import BookingOverlay from './components/BookingOverlay';
import PaymentOverlay from './components/PaymentOverlay';
import { Input } from "./components/ui/Input";

// Dynamically import components that rely on the browser 'window' (SSR: false)
const GlobeView = dynamic(() => import('./components/GlobeView'), { ssr: false });
const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [paymentStation, setPaymentStation] = useState<any>(null);

  // --- DARK IDENTITY PAGE (Entry) ---
  if (!isLoggedIn) {
    return (
      <main className="relative w-screen h-screen bg-[#0a0b10] overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex items-center justify-center">
          <GlobeView />
        </div>
        
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-sm p-8 text-center bg-[#161921]/80 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-500 rounded-[22px] rotate-6 mx-auto mb-8 shadow-2xl shadow-blue-500/20" />
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-8">Identity.</h1>
            <form className="space-y-4" onSubmit={(e) => { 
              e.preventDefault(); 
              setIsLoggedIn(true); 
            }}>
              <Input label="Identity (Email)" placeholder="dev@greenride.io" type="email" required/>
              <Input label="Secret Key" placeholder="••••••••" type="password" required/>
              <button 
                type="submit"
                className="w-full bg-[#4d6af2] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px] mt-4 hover:brightness-110 transition-all cursor-pointer"
              >
                Unlock Network
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // --- WHITE "BUILT DIFFERENT" DASHBOARD ---
  return (
    <main className="min-h-screen bg-[#f2f2f4] text-black font-sans selection:bg-blue-100 relative pb-32">
      
      {/* 🧭 PRETTY NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#3a3c47] text-white py-3 px-6 shadow-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center text-[13px]">
          
          <div className="flex items-center gap-8">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#ff6b6b] to-[#c06c84] rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-[10px] font-bold">GR</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 font-medium text-[#b3b4bc]">
              <span className="cursor-pointer hover:text-white transition-colors">Apps</span>
              <span className="cursor-pointer hover:text-white transition-colors">Ecosystem</span>
              <span className="cursor-pointer hover:text-white transition-colors text-white">Organization</span>
              <span className="cursor-pointer hover:text-white transition-colors">Help</span>
              <span className="cursor-pointer hover:text-white transition-colors">Collaborate</span>
              <span className="cursor-pointer hover:text-white transition-colors">Developers</span>
              <span className="cursor-pointer hover:text-white transition-colors">SNT</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex bg-[#4d6af2] hover:bg-[#3e56c4] text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors items-center gap-2 shadow-md">
                <span className="text-base">🐧</span> Download for Linux
            </button>
            
            <div className="hidden md:flex gap-3 text-xl opacity-80">
                <button className="hover:opacity-100 transition-opacity">🍎</button>
                <button className="hover:opacity-100 transition-opacity">🪟</button>
            </div>

            <button className="hidden sm:flex bg-transparent hover:bg-white/5 text-[#b3b4bc] border border-white/20 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors items-center gap-2">
               📱 Download for mobile
            </button>

            <div className="flex items-center gap-1 pl-2 text-[#b3b4bc] cursor-pointer hover:text-white">
                🌐 <span className="font-semibold">EN</span> <span className="text-[10px]">▼</span>
            </div>

            <button 
                onClick={() => setIsLoggedIn(false)}
                className="ml-2 bg-[#4c333a] text-[#ff7a92] hover:bg-[#603540] px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
                Exit
            </button>
          </div>
        </div>
      </nav>

      {/* 🌟 The Floating Drifting Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mt-16">
        <motion.div animate={{ y: [0, -30, 0], rotate: [0, 10, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-32 left-[15%] text-7xl drop-shadow-2xl">🔋</motion.div>
        <motion.div animate={{ y: [0, 40, 0], rotate: [0, -15, 5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-64 right-[20%] text-6xl drop-shadow-2xl">🛡️</motion.div>
        <motion.div animate={{ y: [0, -20, 0], x: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-96 left-[25%] text-5xl drop-shadow-2xl opacity-50">⚡</motion.div>
      </div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto pt-48 pb-12 px-8 relative z-10 text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-[140px] font-bold tracking-tighter leading-none mb-24">
          Built different.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { icon: "🔋", title: "Open Source", desc: "Green Ride is a community project. Anyone can build, contribute, and fork." },
            { icon: "🛡️", title: "Secure", desc: "Self-custodial keys safeguard your battery bookings and transactions." },
            { icon: "✨", title: "Ad-free", desc: "No tracking. No ads. Just pure energy infrastructure for the people." }
          ].map((card, i) => (
            <div key={i} className="group p-12 bg-white rounded-[40px] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-4 cursor-pointer border border-gray-100">
              <div className="text-4xl mb-8 group-hover:scale-110 transition-transform">{card.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="max-w-[1400px] mx-auto pt-12 pb-20 px-8 relative z-10">
        <div className="rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-[8px] border-white bg-black">
          <MapView onSelectStation={(station: any) => setSelectedStation(station)} />
        </div>
      </section>

      {/* "Be Unstoppable" Footer */}
      <section className="bg-[#121318] text-white pt-32 pb-48 px-8 mt-12 rounded-[60px] mx-4 mb-8 text-center relative z-10 overflow-hidden shadow-2xl">
        <h2 className="text-[80px] font-bold tracking-tighter mb-6 relative z-10">Keep your energy flowing</h2>
        <p className="text-gray-400 text-2xl max-w-2xl mx-auto relative z-10 font-medium">With our decentralized network, no one can stop you from swapping.</p>
        
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -bottom-10 left-10 text-8xl opacity-80">⚙️</motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-20 right-32 text-6xl opacity-90">✨</motion.div>
      </section>

      {/* --- OVERLAYS --- */}
      {selectedStation && (
        <BookingOverlay 
          station={selectedStation} 
          onClose={() => setSelectedStation(null)}
          onConfirm={() => {
            setPaymentStation(selectedStation);
            setSelectedStation(null);
          }}
        />
      )}

      {paymentStation && (
        <PaymentOverlay 
          station={paymentStation}
          onClose={() => setPaymentStation(null)}
        />
      )}
      
    </main>
  );
}
