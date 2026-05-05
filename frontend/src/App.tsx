"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Zap, Map as MapIcon, Calendar, Wallet, Clock, User, LogOut, Activity, ShieldCheck } from 'lucide-react';

import BookingOverlay from './components/BookingOverlay';
import PaymentOverlay from './components/PaymentOverlay';
import LandingPage from './components/LandingPage';
import TopUpModal from './components/TopUpModal';
import WithdrawModal from './components/WithdrawModal'; // 🔥 WITHDRAW MODAL IMPORTED HERE

// 🔥 IMPORT THE GLOBAL DATA HOOKS
import { useNetworkSocket, useMyBookings, useMyTransactions, useMyProfile } from './hooks/useNetwork';

// Dynamically import the Map (SSR disabled to prevent window errors)
const MapView = dynamic(() => import('./components/MapView'), { ssr: false });

export default function App() {
  // 🔥 ACTIVATE THE LIVE SOCKET CONNECTION
  useNetworkSocket();
  
  // 🔥 FETCH LIVE DATA FOR ALL MODULES
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useMyBookings();
  const { data: transactions, isLoading: txLoading } = useMyTransactions();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Map');
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [paymentStation, setPaymentStation] = useState<any>(null);
  
  // 🔥 STATE FOR WALLET TOP UP, WITHDRAW & BALANCE
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [balance, setBalance] = useState(2450.00);

  // --- 0. PUBLIC LANDING PAGE ---
  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  // --- 1. SLEEK LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <main className="relative w-screen h-screen bg-[#0F172A] overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-blue-500 selection:text-white">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full z-10 relative border border-white/50"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center shadow-lg mb-6">
              <Zap size={32} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Login</h2>
            <p className="text-slate-500 font-medium mt-2">Access the GreenRide Operator Portal</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { 
            e.preventDefault(); 
            setIsLoggedIn(true); 
          }}>
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

  // --- 2. PREMIUM MAIN APP DASHBOARD ---
  const tabs = [
    { name: 'Map', icon: MapIcon },
    { name: 'Bookings', icon: Calendar },
    { name: 'Wallet', icon: Wallet },
    { name: 'History', icon: Clock },
    { name: 'Profile', icon: User },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-500 selection:text-white relative pb-32 overflow-hidden">
      
      {/* ✨ PREMIUM BACKGROUND ILLUSTRATIONS & GLOWS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800A_1px,transparent_1px),linear-gradient(to_bottom,#8080800A_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>

      {/* 🧭 PREMIUM DARK NAVBAR */}
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
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {tab.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-full border border-slate-700">
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
               <span className="text-sm text-slate-300 font-medium">System Online</span>
            </div>
            <button 
              onClick={() => setIsLoggedIn(false)} 
              className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 px-4 py-2.5 rounded-full text-sm font-semibold transition-all border border-slate-700 hover:border-red-500/50"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Terminate</span>
            </button>
          </div>
        </div>

        <div className="flex md:hidden items-center justify-between mt-4 overflow-x-auto pb-2 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-800'
                }`}
              >
                <Icon size={16} /> {tab.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-[1400px] mx-auto pt-10 px-4 sm:px-6 relative z-10">

        {/* --- MAP TAB --- */}
        {activeTab === 'Map' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Grid Telemetry</h2>
                <p className="text-slate-600 font-medium mt-1 flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" /> Live synchronization • Polling interval: 60s
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white bg-white/80 backdrop-blur-xl h-[650px] relative">
              <MapView onSelectStation={(station: any) => setSelectedStation(station)} />
            </div>
          </motion.div>
        )}

        {/* --- BOOKINGS TAB --- */}
        {activeTab === 'Bookings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 md:p-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 pb-6 border-b border-slate-200">Active Reservations</h2>
              
              {bookingsLoading ? (
                <div className="text-center py-20 text-blue-600 font-medium animate-pulse flex flex-col items-center gap-4">
                  <Activity size={32} /> Fetching Node Allocations...
                </div>
              ) : !bookings || bookings.length === 0 ? (
                <div className="text-center py-24 bg-white/50 rounded-2xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No active allocations</h3>
                  <p className="text-slate-500 font-medium">Your matrix is currently empty.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="p-6 bg-white/60 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white hover:shadow-md transition-all group">
                      <div className="mb-4 sm:mb-0">
                        <span className="inline-block px-3 py-1 bg-blue-100/80 text-blue-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                          Node: {booking.station_id}
                        </span>
                        <h3 className="text-2xl font-bold text-slate-900 capitalize">{booking.status}</h3>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-500 font-medium mb-1">Time to Live</p>
                        <p className="text-lg font-bold text-red-600 bg-red-50/80 px-4 py-1.5 rounded-lg border border-red-100 group-hover:bg-red-100 transition-colors">
                          {new Date(booking.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- WALLET TAB --- */}
        {activeTab === 'Wallet' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-[#0F172A]/90 to-[#1E293B]/90 backdrop-blur-xl rounded-[2rem] p-10 md:p-14 text-white shadow-[0_20px_50px_rgb(0,0,0,0.15)] border border-slate-700 relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-[80px] opacity-40"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-300 font-medium mb-4">
                  <Wallet size={20} /> Ecosystem Balance
                </div>
                
                <div className="text-6xl md:text-7xl font-bold mb-12 text-white tracking-tight drop-shadow-lg">
                  <span className="text-emerald-400">₹</span> {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setShowTopUp(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    Inject Capital
                  </button>
                  <button 
                    onClick={() => setShowWithdraw(true)}
                    className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 backdrop-blur-md"
                  >
                    Withdraw Funds
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'History' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
              <div className="bg-slate-50/50 backdrop-blur-md border-b border-slate-200/50 p-8 flex items-center gap-3">
                  <Clock className="text-slate-600" size={24} />
                  <h2 className="text-2xl font-bold text-slate-900">Financial Ledger</h2>
              </div>
              
              {txLoading ? (
                 <div className="p-20 text-center text-blue-600 font-medium animate-pulse">Compiling Records...</div>
              ) : !transactions || transactions.length === 0 ? (
                  <div className="p-24 text-center text-slate-500 font-medium">No transaction records found.</div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100/50">
                  {transactions.map((tx: any) => (
                     <div key={tx.id} className="flex flex-col sm:flex-row justify-between p-6 md:p-8 hover:bg-white/60 transition-colors items-start sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-lg text-slate-900">TXN_{tx.id}</p>
                          <p className="text-sm font-medium text-slate-500 mt-1">Ref: {tx.upi_ref || 'N/A'}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-2xl text-slate-900">₹{tx.amount}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 capitalize shadow-sm ${
                            tx.status === 'success' ? 'bg-emerald-100/80 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                              {tx.status}
                          </span>
                        </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- PROFILE TAB --- */}
        {activeTab === 'Profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 md:p-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-6 border-b border-slate-200/50 flex items-center gap-3">
                <User size={24} className="text-blue-600" /> Operator Clearance
              </h2>
              
              {profileLoading ? (
                <div className="py-12 text-center text-blue-600 font-medium animate-pulse">Decrypting Identity...</div>
              ) : (
                <div className="space-y-10">
                  <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-4xl shadow-lg ring-4 ring-white">
                          {profile?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                          <div className="text-sm font-medium text-slate-500 mb-1">System Status</div>
                          <div className="inline-flex items-center gap-2 bg-emerald-50/80 backdrop-blur-sm text-emerald-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active
                          </div>
                      </div>
                  </div>

                  <div className="space-y-6 bg-white/50 p-6 rounded-2xl border border-white shadow-sm">
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2">Assigned Email</label>
                      <div className="text-lg font-bold text-slate-900">{profile?.email}</div>
                    </div>
                    <div className="pt-4 border-t border-slate-200/50">
                      <label className="block text-sm font-bold text-slate-500 mb-2">Security Classification</label>
                      <div className="inline-block bg-blue-100/80 text-blue-700 px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm">
                          {profile?.role || 'Guest Mode'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>

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

      {showTopUp && (
        <TopUpModal 
          onClose={() => setShowTopUp(false)}
          onSuccess={(amount) => {
            setBalance(prev => prev + amount);
            setShowTopUp(false);
          }}
        />
      )}

      {/* 🔥 THE NEW WITHDRAW MODAL ATTACHED HERE */}
      {showWithdraw && (
        <WithdrawModal 
          currentBalance={balance}
          onClose={() => setShowWithdraw(false)}
          onSuccess={(amount) => {
            setBalance(prev => prev - amount); // Subtracts money!
            setShowWithdraw(false);
          }}
        />
      )}
    </main>
  );
}
