"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Zap, Map as MapIcon, Calendar, Wallet, Clock, User, LogOut, Activity, ShieldCheck } from 'lucide-react';

import BookingOverlay from './components/BookingOverlay';
import PaymentOverlay from './components/PaymentOverlay';
import LandingPage from './components/LandingPage';
import TopUpModal from './components/TopUpModal';
import WithdrawModal from './components/WithdrawModal'; 

// 🔥 GLOBAL DATA HOOKS
import { useNetworkSocket, useMyBookings, useMyTransactions, useMyProfile } from './hooks/useNetwork';

// Dynamically import the Map
const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

export default function App() {
  // --- 1. LIVE DATA CONNECTIONS ---
  useNetworkSocket();
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings();
  const { data: transactions, isLoading: txLoading } = useMyTransactions();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  // --- 2. STATE MANAGEMENT ---
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Map');
  
  // REAL DATA STATES
  const [stations, setStations] = useState<any[]>([]);
  const [balance, setBalance] = useState(0.00); 
  
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [paymentStation, setPaymentStation] = useState<any>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // --- 3. THE HANDSHAKE (FETCHING REAL DB DATA) ---
  useEffect(() => {
    const fetchLiveInfrastructure = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stations');
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error("❌ API Offline: Map is running in isolated mode.", error);
      }
    };

    fetchLiveInfrastructure();
  }, []);

  // Sync local balance state with the database profile
  useEffect(() => {
    if (profile?.balance !== undefined) {
      setBalance(profile.balance);
    }
  }, [profile]);

  // --- 4. NAVIGATION RENDER ---
  if (showLanding) return <LandingPage onEnterApp={() => setShowLanding(false)} />;

  if (!isLoggedIn) {
    return (
      <main className="relative w-screen h-screen bg-[#0F172A] flex flex-col items-center justify-center font-sans overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full filter blur-[128px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full filter blur-[128px] opacity-20"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full z-10 border border-white/50"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center shadow-lg mb-6">
              <Zap size={32} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Login</h2>
            <p className="text-slate-500 font-medium mt-2">GreenRide Operator Access</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Operator Email</label>
              <input 
                type="email" 
                placeholder="admin@greenride.com" 
                className="w-full bg-white/50 text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Access Key</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-white/50 text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium" 
                required 
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-blue-500/30 mt-4 flex items-center justify-center gap-2">
              <ShieldCheck size={20} /> Initialize Session
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  const tabs = [
    { name: 'Map', icon: MapIcon },
    { name: 'Bookings', icon: Calendar },
    { name: 'Wallet', icon: Wallet },
    { name: 'History', icon: Clock },
    { name: 'Profile', icon: User },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-500 selection:text-white relative pb-32 overflow-hidden">
      
      {/* GLOW BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800A_1px,transparent_1px),linear-gradient(to_bottom,#8080800A_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400 rounded-full blur-[150px] opacity-30"></div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-[#0F172A] w-full px-6 py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('Map')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center shadow-inner">
              <Zap size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">GreenRide Portal</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#1E293B] p-1 rounded-full border border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                  <Icon size={16} /> {tab.name}
                </button>
              );
            })}
          </div>

          <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2.5 rounded-full text-sm font-semibold border border-slate-700">
            <LogOut size={16} /> <span className="hidden sm:inline">Terminate</span>
          </button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto pt-10 px-4 relative z-10">

        {/* MAP TAB */}
        {activeTab === 'Map' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Grid Telemetry</h2>
              <p className="text-slate-600 font-medium mt-1 flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" /> System Online • {stations.length} Active Nodes
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl shadow-xl border border-white bg-white/80 backdrop-blur-xl h-[650px] relative">
              <MapView stations={stations} onSelectStation={(station: any) => setSelectedStation(station)} />
            </div>
          </motion.div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'Bookings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b pb-6">Active Reservations</h2>
              {bookingsLoading ? (
                <div className="text-center py-20 text-blue-600 animate-pulse">Fetching Node Allocations...</div>
              ) : !bookings || bookings.length === 0 ? (
                <div className="text-center py-24 border border-dashed rounded-2xl">No active matrix allocations.</div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="p-6 bg-white/60 rounded-2xl border border-slate-100 flex justify-between items-center group">
                      <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Node ID: {booking.stationId}</span>
                        <h3 className="text-2xl font-bold text-slate-900 capitalize">{booking.status}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 font-medium">Expires At</p>
                        <p className="text-lg font-bold text-red-600">{new Date(booking.expiresAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'Wallet' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[2rem] p-10 md:p-14 text-white shadow-2xl border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-300 font-medium mb-4"><Wallet size={20} /> Ecosystem Balance</div>
                <div className="text-6xl md:text-7xl font-bold mb-12 tracking-tight">
                  <span className="text-emerald-400">₹</span> {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowTopUp(true)} className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30">Inject Capital</button>
                  <button onClick={() => setShowWithdraw(true)} className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-xl font-bold backdrop-blur-md">Withdraw Funds</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'History' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white overflow-hidden">
              <div className="p-8 border-b bg-slate-50/50 flex items-center gap-3">
                <Clock className="text-slate-600" size={24} /> <h2 className="text-2xl font-bold text-slate-900">Financial Ledger</h2>
              </div>
              {txLoading ? (
                 <div className="p-20 text-center text-blue-600 animate-pulse">Compiling Records...</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions?.map((tx: any) => (
                    <div key={tx.id} className="flex justify-between p-8 hover:bg-white/60 transition-colors">
                      <div><p className="font-bold text-lg">TXN_{tx.id.slice(0, 8)}</p><p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p></div>
                      <div className="text-right"><p className="font-bold text-2xl">₹{tx.amount}</p><span className="text-emerald-600 text-xs font-bold uppercase">{tx.status}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'Profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white shadow-sm">
              <h2 className="text-2xl font-bold mb-8 border-b pb-6 flex items-center gap-3"><User size={24} className="text-blue-600" /> Operator Clearance</h2>
              <div className="flex items-center gap-6 mb-10">
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-4xl shadow-lg ring-4 ring-white">
                  {profile?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div><div className="text-sm font-bold text-emerald-500 uppercase">System Active</div><div className="text-lg font-bold text-slate-900">{profile?.email || "operator@greenride.io"}</div></div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Security Classification</p>
                <div className="text-lg font-bold text-blue-600">{profile?.role || "OPERATOR"}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* OVERLAYS */}
      {selectedStation && (
        <BookingOverlay station={selectedStation} onClose={() => setSelectedStation(null)}
          onConfirm={() => { setPaymentStation(selectedStation); setSelectedStation(null); }} />
      )}

      {paymentStation && (
        <PaymentOverlay station={paymentStation} onClose={() => setPaymentStation(null)} />
      )}

      {showTopUp && (
        <TopUpModal onClose={() => setShowTopUp(false)}
          onSuccess={(amount) => { setBalance(prev => prev + amount); setShowTopUp(false); }} />
      )}

      {showWithdraw && (
        <WithdrawModal currentBalance={balance} onClose={() => setShowWithdraw(false)}
          onSuccess={(amount) => { setBalance(prev => prev - amount); setShowWithdraw(false); }} />
      )}
    </main>
  );
}
