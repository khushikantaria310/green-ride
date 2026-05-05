import React from 'react';
import { Zap, Globe, Monitor, Battery, Activity } from 'lucide-react';

export default function OperatorPortal() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] bg-[radial-gradient(#D4D4D8_2px,transparent_2px)] [background-size:24px_24px] pb-24 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* DARK NAVBAR */}
      <div className="bg-[#0F172A] w-full px-6 py-4 flex items-center justify-between mb-24 shadow-md">
         <div className="flex items-center justify-between max-w-[1400px] mx-auto w-full">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
               <Zap size={16} className="text-white" />
             </div>
             <span className="text-white font-bold text-xl tracking-tight">GreenRide Portal</span>
           </div>
           
           <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
             <a href="#" className="text-white transition">Fleet Overview</a>
             <a href="#" className="hover:text-white transition">Ecosystem</a>
             <a href="#" className="hover:text-white transition">Organization</a>
             <a href="#" className="hover:text-white transition">Analytics</a>
           </div>

           <div className="flex items-center gap-4">
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition">
               Add Vehicle
             </button>
           </div>
         </div>
      </div>

      {/* PORTFOLIO WALLET SECTION (Adapted for Fleet Telemetry) */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center gap-2 mb-6">
           <span className="text-blue-600 font-bold text-sm border border-blue-200 bg-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
             <Activity size={14}/> Live Telemetry
           </span>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight max-w-2xl leading-tight">
          Fleet Portfolio Dashboard
        </h2>
        
        <p className="text-slate-600 text-xl md:text-2xl mb-12 max-w-xl font-medium leading-relaxed">
          Need an easy way to view and manage your EV fleet in real time? Try GreenRide Telemetry now - a routing and tracker in one.
        </p>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/30">
          <Monitor size={18} /> Launch Web Tracker
        </button>
      </div>
    </div>
  );
}
