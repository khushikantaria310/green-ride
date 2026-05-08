"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
  Zap, Map as MapIcon, Calendar, Wallet, Clock, User, LogOut, 
  Activity, ShieldCheck, Eye, EyeOff, ShieldAlert, BarChart3, 
  Users, Info, Signal, Search, Globe
} from 'lucide-react';

import BookingOverlay from './components/BookingOverlay';
import PaymentOverlay from './components/PaymentOverlay';
import LandingPage from './components/LandingPage';
import TopUpModal from './components/TopUpModal';
import WithdrawModal from './components/WithdrawModal'; 

import { 
  useNetworkSocket, useMyBookings, useMyTransactions, 
  useMyProfile, useAdminStats 
} from './hooks/useNetwork';

const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

export default function App() {
  useNetworkSocket();
  const { data: bookings } = useMyBookings();
  const { data: transactions } = useMyTransactions();
  const { data: profile } = useMyProfile();
  
  const isAdmin = profile?.role === 'ADMIN';
  const { data: adminStats } = useAdminStats(isAdmin);

  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Map');
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [stations, setStations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [balance, setBalance] = useState(0.00); 
  
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [paymentStation, setPaymentStation] = useState<any>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // 📡 Real-time Clock for Countdowns
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLiveInfrastructure = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stations');
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error("❌ API Offline");
      }
    };
    fetchLiveInfrastructure();
  }, []);

  const filteredStations = useMemo(() => {
    return stations.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stations, searchQuery]);

  useEffect(() => {
    if (profile?.balance !== undefined) setBalance(profile.balance);
  }, [profile]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
    } catch (error: any) {
      alert(`Authentication Failed: ${error.message}`);
    }
  };

  if (showLanding) return <LandingPage onEnterApp={() => setShowLanding(false)} />;

  if (!isLoggedIn) {
    return (
      <main className="relative w-screen h-screen bg-[#0a0b10] flex flex-col items-center justify-center overflow-hidden font-geist">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161921] border border-white/10 rounded-[32px] p-10 max-w-md w-full z-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#A7C7E7] flex items-center justify-center mb-6">
              <Zap size={32} className="text-[#0a0b10]" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Access</h2>
            <p className="text-gray-500 text-sm mt-2 font-mono">ENCRYPTED NODE INITIALIZATION</p>
          </div>
          <form className="space-y-6" onSubmit={handleAuth}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Email Identity</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@greenride.io" className="w-full bg-[#0a0b10] text-white px-4 py-4 rounded-2xl border border-white/5 focus:border-[#A7C7E7] outline-none transition-colors" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Access Key</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#0a0b10] text-white px-4 py-4 rounded-2xl border border-white/5 focus:border-[#A7C7E7] outline-none transition-colors" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-[#A7C7E7] hover:bg-[#8FAECB] text-[#0a0b10] py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors">
              Initialize Session
            </button>
            <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "Request Clearance" : "Login to Matrix"}
            </p>
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
  if (isAdmin) tabs.push({ name: 'Command', icon: ShieldAlert });

  return (
    <main className="min-h-screen bg-[#0a0b10] relative pb-32 font-geist">
      <Toaster position="top-right" theme="dark" richColors />
      
      <nav className="bg-[#0a0b10] border-b border-white/5 w-full px-8 py-5 sticky top-0 z-[1000]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('Map')}>
            <div className="w-10 h-10 rounded-xl bg-[#A7C7E7] flex items-center justify-center">
              <Zap size={20} className="text-[#0a0b10]" fill="currentColor" />
            </div>
            <span className="text-white font-black text-xl uppercase tracking-tighter">GreenRide</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 bg-[#161921] p-1 rounded-2xl border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'bg-[#A7C7E7] text-[#0a0b10]' : 'text-gray-500 hover:text-white'}`}>
                  <Icon size={14} /> {tab.name}
                </button>
              );
            })}
          </div>
          <button onClick={() => { localStorage.removeItem('token'); setIsLoggedIn(false); }} className="px-6 py-2.5 bg-[#161921] text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 hover:bg-[#fda4af] hover:text-[#0a0b10] transition-colors">
            Terminate
          </button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto pt-10 px-6">
        {/* 🗺️ MAP TAB */}
        {activeTab === 'Map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 bg-[#161921] p-8 rounded-[32px] border border-white/5">
              <div className="flex-1">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">National Grid</h2>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-2 px-3 py-1 bg-[#A7C7E7]/10 text-[#A7C7E7] rounded-full border border-[#A7C7E7]/20 text-[10px] font-black uppercase tracking-widest">
                     <Signal size={12} /> Live Link
                   </div>
                   <p className="text-gray-400 text-xs font-mono uppercase tracking-tighter">
                     {filteredStations.length} / {stations.length} NODES DISCOVERED
                   </p>
                </div>
              </div>

              <div className="w-full max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Grid City..." className="w-full bg-[#0a0b10] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-black uppercase tracking-widest focus:border-[#A7C7E7] transition-colors outline-none" />
                </div>
                {/* 🏙️ NEW: Phase 3 Quick City Filters */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {['Bengaluru', 'Hyderabad', 'Chennai', 'Mumbai'].map((city) => (
                    <button key={city} onClick={() => setSearchQuery(city)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${searchQuery === city ? 'bg-[#A7C7E7] text-[#0a0b10] border-[#A7C7E7]' : 'bg-[#0a0b10] text-gray-500 border-white/5 hover:border-white/20'}`}>
                      {city}
                    </button>
                  ))}
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-[#fda4af]/10 text-[#fda4af] border border-[#fda4af]/20">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[40px] border border-white/5 bg-[#161921] h-[700px] overflow-hidden relative">
              <MapView stations={filteredStations} onSelectStation={(station: any) => setSelectedStation(station)} />
            </div>
          </motion.div>
        )}

        {/* 📋 BOOKINGS TAB */}
        {activeTab === 'Bookings' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="bg-[#161921] rounded-[32px] p-8 border border-white/5">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                <Calendar className="text-[#A7C7E7]" size={28} />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Matrix Allocations</h2>
              </div>
              {!bookings || bookings.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-[#0a0b10] text-gray-600 font-mono text-[10px] uppercase tracking-widest">NO ACTIVE RESERVATIONS DETECTED.</div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking: any, index: number) => {
                    const expiresAt = new Date(booking.expiresAt).getTime();
                    const diff = Math.max(0, expiresAt - now.getTime());
                    const m = Math.floor(diff / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    
                    return (
                      <motion.div key={booking.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="p-6 bg-[#0a0b10] rounded-2xl border border-white/5 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-black text-[#A7C7E7] uppercase tracking-widest px-3 py-1 bg-[#A7C7E7]/10 rounded-lg flex items-center gap-2 w-max">
                            <Zap size={10} /> ID: {booking.id.slice(0,8)}
                          </span>
                          <h3 className="text-xl font-black text-white uppercase tracking-tighter mt-3 flex items-center gap-2">
                            <Activity size={16} className="text-[#A7C7E7]"/> {booking.station?.name || 'CONFIRMED'}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center justify-end gap-1"><Clock size={10}/> Remaining</p>
                          <p className={`text-3xl font-black font-mono ${diff < 300000 ? 'text-[#fda4af]' : 'text-white'}`}>
                            {m}:{s.toString().padStart(2, '0')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 💰 WALLET TAB */}
        {activeTab === 'Wallet' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <div className="bg-[#161921] rounded-[40px] p-12 text-white border border-white/5 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Wallet size={14} className="text-[#A7C7E7]" /> Grid Capital Reserve</p>
                <div className="text-7xl font-black mb-12 tracking-tighter">
                  <span className="text-[#A7C7E7]">₹</span> {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowTopUp(true)} className="flex-1 bg-[#A7C7E7] hover:bg-[#8FAECB] text-[#0a0b10] py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors">Inject Capital</button>
                  <button onClick={() => setShowWithdraw(true)} className="flex-1 bg-[#0a0b10] hover:bg-white/5 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 transition-colors">Withdraw</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🕒 HISTORY TAB */}
        {activeTab === 'History' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="bg-[#161921] rounded-[32px] border border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center gap-3">
                <Clock className="text-[#A7C7E7]" size={28} /> 
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Transaction Ledger</h2>
              </div>
              <div className="p-6 space-y-4">
                {transactions?.map((tx: any, index: number) => (
                  <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex justify-between items-center p-6 bg-[#0a0b10] rounded-2xl border border-white/5">
                    <div>
                      <p className="font-black text-white tracking-widest uppercase text-sm flex items-center gap-2">
                        <Activity size={14} className="text-[#A7C7E7]" /> TXN_{tx.id.slice(0, 8)}
                      </p>
                      <p className="text-xs font-mono text-gray-400 mt-2 flex items-center gap-2">
                        <Clock size={12} className="text-gray-500"/>
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-black text-3xl text-white tracking-tighter">₹{tx.amount}</p>
                      <span className="text-[10px] font-black uppercase text-[#A7C7E7] bg-[#A7C7E7]/10 px-3 py-1.5 rounded-lg tracking-widest flex items-center gap-1.5 border border-[#A7C7E7]/20">
                        <ShieldCheck size={12} /> SUCCESS
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 👤 PROFILE TAB */}
        {activeTab === 'Profile' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#161921] rounded-[32px] p-12 border border-white/5 text-center relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#A7C7E7]/10 blur-[100px] rounded-full" />
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-[#A7C7E7] mx-auto flex items-center justify-center font-black text-4xl mb-6 text-[#0a0b10] shadow-[0_0_30px_rgba(167,199,231,0.2)]">
                  {profile?.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{profile?.email}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A7C7E7]/10 rounded-xl border border-[#A7C7E7]/20 mt-4">
                  <ShieldCheck size={16} className="text-[#A7C7E7]" />
                  <span className="text-[10px] font-black text-[#A7C7E7] uppercase tracking-widest">{profile?.role}</span>
                </div>
              </div>
            </div>

            {/* 🌱 Phase 1: Sustainability Impact Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#161921] rounded-[24px] p-8 border border-white/5 text-center">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Total Node Swaps</p>
                <p className="text-4xl font-black text-white tracking-tighter">{bookings?.length || 0}</p>
              </div>
              <div className="bg-[#161921] rounded-[24px] p-8 border border-[#A7C7E7]/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5" />
                <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                   <Zap size={10} fill="currentColor" /> CO2 Offset
                </p>
                <p className="text-4xl font-black text-emerald-400 tracking-tighter relative z-10">
                  {((bookings?.length || 0) * 2.4).toFixed(1)}<span className="text-sm ml-1 text-emerald-400/50">KG</span>
                </p>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em]">Operative contribution to a decarbonized future.</p>
          </motion.div>
        )}

        {/* 🛡️ ADMIN COMMAND CENTER */}
        {activeTab === 'Command' && isAdmin && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl mx-auto">
            <div className="bg-[#161921] rounded-[40px] p-12 border border-[#fda4af]/20">
              <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                    <ShieldAlert size={40} className="text-[#fda4af]" /> Command Matrix
                  </h2>
                  <p className="text-gray-400 font-mono text-xs mt-2">LEVEL 5 AUTHORIZATION GRANTED</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0a0b10] p-8 rounded-3xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Total Nodes</p>
                  <p className="text-5xl font-black text-white tracking-tighter">{adminStats?.totalUsers || 0}</p>
                </div>
                <div className="bg-[#0a0b10] p-8 rounded-3xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Network Load</p>
                  <p className="text-5xl font-black text-[#A7C7E7] tracking-tighter">{adminStats?.totalBookings || 0}</p>
                </div>
                <div className="bg-[#0a0b10] p-8 rounded-3xl border border-white/5">
                  <p className="text-[10px] text-[#fda4af] font-black uppercase tracking-widest mb-4">Gross Revenue</p>
                  <p className="text-5xl font-black text-white tracking-tighter">₹{adminStats?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedStation && (
          <BookingOverlay station={selectedStation} onClose={() => setSelectedStation(null)} onConfirm={() => { setPaymentStation(selectedStation); setSelectedStation(null); }} />
        )}
      </AnimatePresence>

      {paymentStation && <PaymentOverlay station={paymentStation} onClose={() => setPaymentStation(null)} />}
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} onSuccess={(amount) => { setBalance(prev => prev + amount); setShowTopUp(false); }} />}
      {showWithdraw && <WithdrawModal currentBalance={balance} onClose={() => setShowWithdraw(false)} onSuccess={(amount) => { setBalance(prev => prev - amount); setShowWithdraw(false); }} />}
    </main>
  );
}
