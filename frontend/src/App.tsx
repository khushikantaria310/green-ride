"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import BookingOverlay from './components/BookingOverlay';
import PaymentOverlay from './components/PaymentOverlay';

// 🔥 IMPORT THE GLOBAL SOCKET HOOK
import { useNetworkSocket } from './hooks/useNetwork';

// Dynamically import the Map (SSR disabled to prevent window errors)
const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

// 🎨 Helper Component for the elegant floating background illustrations
const FloatingIllustration = ({ children, top, left, delay, duration, yRange, rotateRange }: any) => (
  <motion.div
    className="absolute drop-shadow-[0_20px_40px_rgba(18,28,45,0.08)]"
    style={{ top, left }}
    animate={{ 
      y: yRange, 
      rotate: rotateRange 
    }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
  >
    {children}
  </motion.div>
);

export default function App() {
  // 🔥 ACTIVATE THE LIVE SOCKET CONNECTION
  useNetworkSocket();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Map');
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [paymentStation, setPaymentStation] = useState<any>(null);

  // --- 1. BRIGHT MOBILE-STYLE LOGIN PAGE (No Globe) ---
  if (!isLoggedIn) {
    return (
      <main className="relative w-screen h-screen bg-white overflow-hidden flex flex-col font-sans" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
        
        {/* The Deep Blue Curved Header */}
        <div className="bg-[#121c2d] w-full rounded-b-[50px] pt-20 pb-12 px-8 shadow-xl z-10 relative flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner mb-4">
              <span className="text-[#121c2d] text-lg font-black">GR</span>
            </div>
          <h1 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Welcome Back!</h1>
          <h2 className="text-3xl font-bold text-white tracking-tight">Sign In</h2>
        </div>

        {/* Floating Login Illustration & Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative bg-white">
          
          {/* Animated Illustration for Login */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8 mt-4"
          >
             {/* Flat Vector Car/Tech SVG */}
             <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
                <rect x="20" y="40" width="140" height="60" rx="16" fill="#f4f6f9" stroke="#121c2d" strokeWidth="4"/>
                <circle cx="50" cy="100" r="16" fill="#121c2d"/>
                <circle cx="130" cy="100" r="16" fill="#121c2d"/>
                <rect x="40" y="20" width="100" height="40" rx="12" fill="#e2e8f0" stroke="#121c2d" strokeWidth="4"/>
                <rect x="130" y="60" width="16" height="8" rx="4" fill="#ff6b6b"/>
                <rect x="34" y="60" width="16" height="8" rx="4" fill="#facc15"/>
             </svg>
          </motion.div>

          {/* The Clean Input Form */}
          <form className="w-full max-w-sm space-y-5" onSubmit={(e) => { 
            e.preventDefault(); 
            setIsLoggedIn(true); 
          }}>
            <div>
              <label className="block text-[11px] font-bold text-[#121c2d] uppercase tracking-wider mb-2 ml-4">Email Address</label>
              <input type="email" placeholder="Enter Email Address" className="w-full bg-[#f4f6f9] text-gray-800 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#121c2d] transition-all border border-transparent focus:border-[#121c2d]" required />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#121c2d] uppercase tracking-wider mb-2 ml-4">Password</label>
              <input type="password" placeholder="Enter Your Password" className="w-full bg-[#f4f6f9] text-gray-800 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#121c2d] transition-all border border-transparent focus:border-[#121c2d]" required />
              <div className="text-right mt-3 mr-4">
                <span className="text-xs font-bold text-gray-400 hover:text-[#121c2d] cursor-pointer transition-colors">Forget Password?</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#121c2d] text-white py-4 rounded-full font-bold text-sm mt-2 hover:bg-[#1a2840] transition-colors shadow-[0_10px_20px_rgba(18,28,45,0.2)] active:scale-[0.98]">
              Sign In
            </button>

            {/* Social Logins */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                <span className="text-lg">G</span> Google
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                <span className="text-lg text-blue-600">f</span> Facebook
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // --- 2. MAIN APP DASHBOARD (Animated Illustration Background) ---
  return (
    <main className="min-h-screen bg-[#f4f5f8] text-black selection:bg-blue-100 relative pb-32" style={{ fontFamily: 'Geist Sans, sans-serif' }}>
      
      {/* 🧭 APP NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#3a3c47] text-white py-3 px-6 shadow-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center text-[13px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#4d6af2] to-[#ff6b6b] rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-[10px] font-bold">GR</span>
            </div>
            <span className="font-bold text-sm tracking-wide hidden sm:block">GREEN RIDE</span>
          </div>

          <div className="flex items-center gap-2 md:gap-8 font-medium text-[#b3b4bc] bg-[#2a2c35] px-6 py-2 rounded-full border border-white/5">
            {['Map', 'Bookings', 'Wallet', 'History', 'Profile'].map((tab) => (
              <span 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer transition-colors px-2 py-1 ${activeTab === tab ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'hover:text-white'}`}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsLoggedIn(false)} className="bg-[#4c333a] text-[#ff7a92] hover:bg-[#603540] px-5 py-2 rounded-xl text-xs font-bold transition-colors">
                Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Show Content based on Active Tab */}
      {activeTab === 'Map' && (
        <div className="animate-in fade-in duration-500">
          
          {/* 🌟 HERO SECTION WITH ANIMATED ILLUSTRATIONS */}
          <section className="relative w-full h-[70vh] bg-white flex items-center justify-center overflow-hidden border-b border-gray-200">
            
            {/* Center Text */}
            <div className="relative z-10 text-center max-w-2xl px-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-[64px] font-bold tracking-tighter text-[#121c2d] mb-6 leading-[1.1]"
              >
                Own your energy
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-gray-500 font-medium tracking-tight"
              >
                No grid can freeze, lock out, or stop you from accessing your battery nodes.
              </motion.p>
            </div>

            {/* Background Animated Illustrations (UnDraw Style) */}
            <div className="absolute inset-0 pointer-events-none z-0">
              
              {/* Illustration 1: Phone Dashboard (Top Left) */}
              <FloatingIllustration top="15%" left="15%" delay={0} duration={18} yRange={[0, -30, 0]} rotateRange={[0, 8, -4, 0]}>
                 <svg width="120" height="180" viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="112" height="172" rx="20" fill="white" stroke="#121c2d" strokeWidth="6"/>
                    <rect x="20" y="24" width="80" height="60" rx="8" fill="#e2e8f0"/>
                    <rect x="20" y="96" width="80" height="12" rx="6" fill="#121c2d"/>
                    <rect x="20" y="120" width="50" height="12" rx="6" fill="#cbd5e1"/>
                    <circle cx="60" cy="155" r="8" fill="#121c2d"/>
                 </svg>
              </FloatingIllustration>

              {/* Illustration 2: ID/Wallet Card (Bottom Right) */}
              <FloatingIllustration top="60%" left="75%" delay={2} duration={22} yRange={[0, 40, 0]} rotateRange={[0, -10, 5, 0]}>
                 <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="152" height="92" rx="16" fill="#121c2d" stroke="white" strokeWidth="4"/>
                    <circle cx="36" cy="36" r="16" fill="#4d6af2"/>
                    <rect x="68" y="24" width="60" height="8" rx="4" fill="white"/>
                    <rect x="68" y="40" width="40" height="8" rx="4" fill="#94a3b8"/>
                    <rect x="20" y="72" width="120" height="8" rx="4" fill="#334155"/>
                 </svg>
              </FloatingIllustration>

              {/* Illustration 3: Location Pin/Node (Top Right) */}
              <FloatingIllustration top="20%" left="70%" delay={1} duration={15} yRange={[0, -25, 0]} rotateRange={[0, 5, -5, 0]}>
                 <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 4C20.1177 4 4 20.1177 4 40C4 70 40 96 40 96C40 96 76 70 76 40C76 20.1177 59.8823 4 40 4Z" fill="white" stroke="#121c2d" strokeWidth="6"/>
                    <circle cx="40" cy="40" r="12" fill="#4d6af2"/>
                 </svg>
              </FloatingIllustration>

              {/* Illustration 4: Web Dashboard (Bottom Left) */}
              <FloatingIllustration top="65%" left="10%" delay={3} duration={20} yRange={[0, 35, 0]} rotateRange={[0, -5, 8, 0]}>
                 <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="192" height="132" rx="12" fill="white" stroke="#121c2d" strokeWidth="6"/>
                    <rect x="4" y="4" width="192" height="28" rx="12" fill="#121c2d"/>
                    <circle cx="20" cy="18" r="4" fill="#ff6b6b"/>
                    <circle cx="36" cy="18" r="4" fill="#facc15"/>
                    <circle cx="52" cy="18" r="4" fill="#4ade80"/>
                    <rect x="20" y="50" width="60" height="70" rx="8" fill="#e2e8f0"/>
                    <rect x="96" y="50" width="84" height="20" rx="6" fill="#cbd5e1"/>
                    <rect x="96" y="82" width="84" height="38" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
                 </svg>
              </FloatingIllustration>
            </div>
          </section>

          {/* Interactive Map Section */}
          <section className="max-w-[1400px] mx-auto pt-16 pb-20 px-4 sm:px-8 relative z-10">
            <div className="flex justify-between items-end mb-8 px-2">
              <div>
                <h2 className="text-4xl font-bold tracking-tighter leading-none mb-2 text-[#121c2d]">Active Network</h2>
                <p className="text-gray-500 font-medium">Live synchronization • Updating every 60s</p>
              </div>
              <div className="hidden md:flex gap-3">
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50">Filter: 5km</button>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50">Rating: 4★+</button>
              </div>
            </div>
            
            <div className="rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(18,28,45,0.1)] border border-gray-200 bg-[#161921]">
              <MapView onSelectStation={(station: any) => setSelectedStation(station)} />
            </div>
          </section>
        </div>
      )}

      {/* Placeholder for other Nav Tabs */}
      {activeTab !== 'Map' && (
        <section className="pt-40 flex items-center justify-center min-h-[80vh]">
          <div className="text-center p-12 bg-white rounded-[40px] shadow-xl border border-gray-100 max-w-md w-full mx-4">
            <div className="text-6xl mb-6">
              {activeTab === 'Bookings' && '📅'}
              {activeTab === 'Wallet' && '💳'}
              {activeTab === 'History' && '🧾'}
              {activeTab === 'Profile' && '👤'}
            </div>
            <h2 className="text-3xl font-bold tracking-tighter mb-4 text-[#121c2d]">{activeTab} Module</h2>
            <p className="text-gray-500 font-medium mb-8">This module will be connected to the Phase 4 live data stream.</p>
            <button onClick={() => setActiveTab('Map')} className="w-full bg-[#121c2d] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#1a2840] transition-all">
              Return to Map
            </button>
          </div>
        </section>
      )}

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
