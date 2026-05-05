"use client";

import React, { useState } from 'react';
import { Shield, Globe, Users, Zap, MapPin, Activity } from 'lucide-react';

export default function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  // State for the language dropdown
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  
  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'KN', name: 'Kannada' },
    { code: 'HI', name: 'Hindi' },
    { code: 'ES', name: 'Español' },
    { code: 'FR', name: 'Français' }
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-blue-500 selection:text-white bg-white">
      
      {/* 1. DARK HERO SECTION */}
      <div className="bg-[#0F172A] pt-6 pb-32 flex flex-col relative overflow-hidden">
         {/* Navigation */}
         <nav className="flex items-center justify-between px-6 max-w-[1400px] mx-auto w-full mb-24">
           {/* Logo */}
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center">
               <Zap size={16} className="text-white" fill="currentColor" />
             </div>
             <span className="text-white font-bold text-xl tracking-tight">GreenRide</span>
           </div>
           
           {/* Controls (Language & Login) */}
           <div className="flex items-center gap-4 relative">
             
             {/* Functional Language Dropdown */}
             <div className="relative">
               <button 
                 onClick={() => setIsLangOpen(!isLangOpen)}
                 className="text-white border border-slate-700 rounded-full px-4 py-1.5 text-sm hover:bg-slate-800 transition flex items-center gap-2"
               >
                 <Globe size={14} /> {selectedLang} <span className="text-xs">▼</span>
               </button>
               
               {/* Dropdown Menu */}
               {isLangOpen && (
                 <div className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden w-32 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                   {languages.map((lang) => (
                     <button
                       key={lang.code}
                       onClick={() => {
                         setSelectedLang(lang.code);
                         setIsLangOpen(false);
                       }}
                       className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                         selectedLang === lang.code 
                           ? 'bg-blue-600 text-white font-bold' 
                           : 'text-slate-300 hover:bg-slate-700 hover:text-white font-medium'
                       }`}
                     >
                       {lang.name}
                     </button>
                   ))}
                 </div>
               )}
             </div>

             <button 
               onClick={onEnterApp} 
               className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition shadow-lg shadow-blue-500/20"
             >
               Login / Register
             </button>
           </div>
         </nav>

         {/* Hero Content */}
         <div className="flex flex-col items-center justify-center text-center px-4 z-10">
           <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-tight">
             Your EV, charged<br />anytime, anywhere!
           </h1>
           <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
             Transact, Manage, and Route your EV Fleet on your<br />Terms ...integrated into one<br />powerful super app
           </p>
         </div>
      </div>

      {/* 2. "BUILT DIFFERENT" GRID SECTION */}
      <div className="bg-white py-24 md:py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-16 md:mb-20 tracking-tight">Built different</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            
            {/* Feature 1 */}
            <div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100 shadow-sm">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Open infrastructure</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                GreenRide is a community project. Anyone can build, contribute to and fork its routing algorithms.
              </p>
            </div>

            {/* Feature 2 */}
            <div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100 shadow-sm">
                <Globe size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Decentralised</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Fleets are exclusively powered by their members running the GreenRide desktop node.
              </p>
            </div>

            {/* Feature 3 */}
            <div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 border border-purple-100 shadow-sm">
                <Shield size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Secure</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Self-custodial keys safeguard your fleet telemetry and messages via elliptic curve cryptography.
              </p>
            </div>

            {/* Feature 4 */}
            <div>
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 mb-6 border border-pink-100 shadow-sm">
                <Users size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Community driven</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Riders can influence future developments and city infrastructure governance decisions.
              </p>
            </div>

            {/* Feature 5 */}
            <div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-6 border border-orange-100 shadow-sm">
                <MapPin size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Permissionless</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Nobody can stop you routing your vehicles because nobody controls GreenRide's p2p network.
              </p>
            </div>

            {/* Feature 6 */}
            <div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6 border border-amber-100 shadow-sm">
                <Activity size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Free and ad-free</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                No ads. No paid tier. No imposed limits. It's just free to track your personal EV.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
