"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
// 🔥 We imported ShieldAlert and BarChart3 for the Admin Tab
import { Zap, Map as MapIcon, Calendar, Wallet, Clock, User, LogOut, Activity, ShieldCheck, Eye, EyeOff, ShieldAlert, BarChart3, Users } from 'lucide-react';

import BookingOverlay from './components/BookingOverlay';
import PaymentOverlay from './components/PaymentOverlay';
import LandingPage from './components/LandingPage';
import TopUpModal from './components/TopUpModal';
import WithdrawModal from './components/WithdrawModal'; 

// 🔥 GLOBAL DATA HOOKS
import { useNetworkSocket, useMyBookings, useMyTransactions, useMyProfile, useAdminStats } from './hooks/useNetwork';

const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

export default function App() {
  useNetworkSocket();
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings();
  const { data: transactions, isLoading: txLoading } = useMyTransactions();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  
  // 🔥 Only fetch Admin stats if this user has the ADMIN role
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
  const [balance, setBalance] = useState(0.00); 
  
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [paymentStation, setPaymentStation] = useState<any>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

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
      <main className="relative w-screen h-screen bg-[#0F172A] flex flex-col items-center justify-center font-sans overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full filter blur-[128px] opacity-20 transition-all duration-1000 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full filter blur-[128px] opacity-20 transition-all duration-1000 animate-pulse"></div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full z-10 border border-white/50">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center shadow-lg mb-6">
              <Zap size={32} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Login</h2>
            <p className="text-slate-500 font-medium mt-2">Operator & Admin Access</p>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Identity</label>
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@greenride.com" 
                className="w-full bg-white/50 text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Access Key</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white/50 text-slate-900 px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500" required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
              <ShieldCheck size={20} /> {authMode === 'login' ? 'Initialize Session' : 'Register Clearance'}
            </button>
            <p className="text-center text-sm text-slate-500 mt-4 cursor-pointer hover:text-blue-600 font-medium" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "New operator? Request clearance." : "Already have clearance? Initialize."}
            </p>
          </form>
        </motion.div>
      </main>
    );
  }

  // 🔥 We conditionally add the 'Command' tab if they are an Admin
  const tabs = [
    { name: 'Map', icon: MapIcon },
    { name: 'Bookings', icon: Calendar },
    { name: 'Wallet', icon: Wallet },
    { name: 'History', icon: Clock },
    { name: 'Profile', icon: User },
  ];
  
  if (isAdmin) {
    tabs.push({ name: 'Command', icon: ShieldAlert }); // The secret 6th tab!
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-500 selection:text-white relative pb-32 overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800A_1px,transparent_1px),linear-gradient(to_bottom,#8080800A_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400 rounded-full blur-[150px] opacity-30 animate-pulse"></div>
      </div>

      <nav className="bg-[#0F172A] w-full px-6 py-4 sticky top-0 z-50 shadow-md transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('Map')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Zap size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">GreenRide Portal</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#1E293B] p-1 rounded-full border border-slate-700 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              // Add a special red styling for the Admin tab
              const activeClass = tab.name === 'Command' 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 scale-105' 
                : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105';
                
              return (
                <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive ? activeClass : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Icon size={16} /> {tab.name}
                </button>
              );
            })}
          </div>

          <button onClick={() => { localStorage.removeItem('token'); setIsLoggedIn(false); }} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-full text-sm font-semibold border border-slate-700 transition-all duration-300">
            <LogOut size={16} /> <span className="hidden sm:inline">Terminate</span>
          </button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto pt-10 px-4 relative z-10">

        {/* MAP TAB */}
        {activeTab === 'Map' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Grid Telemetry</h2>
              <p className="text-slate-600 font-medium mt-1 flex items-center gap-2">
                <Activity size={16} className="text-emerald-500 animate-pulse" /> System Online • {stations.length} Active Nodes
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl shadow-lg border border-white bg-white/80 backdrop-blur-xl h-[650px] relative">
              <MapView stations={stations} onSelectStation={(station: any) => setSelectedStation(station)} />
            </div>
          </motion.div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'Bookings' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b pb-6">Active Reservations</h2>
              {!bookings || bookings.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-500">No active matrix allocations.</div>
              ) : (
                <div className="grid gap-5">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="p-6 bg-white rounded-2xl border border-slate-100 flex justify-between items-center transition-all duration-300 hover:shadow-xl">
                      <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">Node ID: {booking.stationId.slice(0,8)}</span>
                        <h3 className="text-2xl font-bold text-slate-900 capitalize mt-2">{booking.status}</h3>
                      </div>
                      <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Expires At</p>
                        <p className="text-xl font-black text-red-600">{new Date(booking.expiresAt).toLocaleTimeString()}</p>
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
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[2rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-300 font-medium mb-4"><Wallet size={20} className="text-emerald-400" /> Ecosystem Balance</div>
                <div className="text-6xl md:text-7xl font-bold mb-12 drop-shadow-lg">
                  <span className="text-emerald-400">₹</span> {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowTopUp(true)} className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30">Inject Capital</button>
                  <button onClick={() => setShowWithdraw(true)} className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-xl font-bold backdrop-blur-md">Withdraw Funds</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'History' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/80 flex items-center gap-3">
                <Clock className="text-blue-600" size={24} /> <h2 className="text-2xl font-bold text-slate-900">Financial Ledger</h2>
              </div>
              {!transactions || transactions.length === 0 ? (
                 <div className="p-24 text-center bg-slate-50/50">
                   <h3 className="text-xl font-bold text-slate-900 mb-2">No transaction records</h3>
                 </div>
              ) : (
                <div className="p-6 space-y-4 bg-slate-50/50">
                  {transactions?.map((tx: any) => (
                    <div key={tx.id} className="flex justify-between items-center p-6 bg-white rounded-2xl border border-slate-100 transition-all duration-300 hover:shadow-xl">
                      <div>
                        <div className="font-bold text-lg text-slate-900 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> TXN_{tx.id.slice(0, 8)}</div>
                        <p className="text-sm font-medium text-slate-500 mt-1 ml-4">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-3xl text-slate-900">₹{tx.amount}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md">{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'Profile' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-6 flex items-center gap-3">
                <User size={24} className="text-blue-600" /> Operator Clearance
              </h2>
              <div className="flex items-center gap-6 mb-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-white flex items-center justify-center font-bold text-4xl shadow-lg ring-4 ring-white">
                  {profile?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                    System Active
                  </div>
                  <div className="text-xl font-black text-slate-900">{profile?.email || "operator@greenride.io"}</div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Security Classification</p>
                <div className="text-xl font-black text-blue-600 flex items-center gap-2">
                  <ShieldCheck size={20} /> {profile?.role || "OPERATOR"}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🔥 NEW: THE SECRET ADMIN COMMAND CENTER */}
        {activeTab === 'Command' && isAdmin && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto">
            <div className="bg-[#0F172A] rounded-3xl p-10 border border-slate-800 shadow-2xl shadow-rose-900/20 relative overflow-hidden">
              {/* Threat-level red glow */}
              <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-rose-600 rounded-full blur-[120px] opacity-10"></div>
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-8 mb-10 relative z-10">
                <div>
                  <h2 className="text-4xl font-black text-white flex items-center gap-4 tracking-tight">
                    <ShieldAlert size={40} className="text-rose-500" /> Command Matrix
                  </h2>
                  <p className="text-slate-400 font-medium mt-2">Level 5 Security Clearance Verified.</p>
                </div>
                <div className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-lg font-bold text-sm border border-rose-500/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> LIVE MONITORING
                </div>
              </div>

              {/* Data Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-800 backdrop-blur-md">
                  <div className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-4"><Users size={16} /> Total Operators</div>
                  <div className="text-5xl font-black text-white">{adminStats?.totalUsers || 0}</div>
                </div>
                
                <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-800 backdrop-blur-md">
                  <div className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-4"><Calendar size={16} /> Grid Allocations</div>
                  <div className="text-5xl font-black text-blue-400">{adminStats?.totalBookings || 0}</div>
                </div>

                <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-800 backdrop-blur-md ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <div className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-emerald-500" /> Global Revenue</div>
                  <div className="text-5xl font-black text-emerald-400 drop-shadow-md">₹{adminStats?.totalRevenue?.toLocaleString() || 0}</div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </div>

      {selectedStation && <BookingOverlay station={selectedStation} onClose={() => setSelectedStation(null)} onConfirm={() => { setPaymentStation(selectedStation); setSelectedStation(null); }} />}
      {paymentStation && <PaymentOverlay station={paymentStation} onClose={() => setPaymentStation(null)} />}
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} onSuccess={(amount) => { setBalance(prev => prev + amount); setShowTopUp(false); }} />}
      {showWithdraw && <WithdrawModal currentBalance={balance} onClose={() => setShowWithdraw(false)} onSuccess={(amount) => { setBalance(prev => prev - amount); setShowWithdraw(false); }} />}
    </main>
  );
}
