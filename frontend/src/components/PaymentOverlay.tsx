"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

interface PaymentOverlayProps {
  station: any;
  onClose: () => void;
}

export default function PaymentOverlay({ station, onClose }: PaymentOverlayProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [upiId, setUpiId] = useState("");
  const [bookingId, setBookingId] = useState("BATT-49X");

  useEffect(() => {
    if (timeLeft <= 0) {
      onClose();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onClose]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    try {
      const token = localStorage.getItem('token');

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ stationId: station.id }) 
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Backend Error: ${errorData.error || "Unknown error occurred"}`);
        setStep('payment'); 
        return;
      }

      const data = await response.json();
      
      // 🔥 TRIGGER REFRESH: This makes the "Matrix Allocations" update instantly
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      setBookingId(`BATT-${data.id.substring(0, 6).toUpperCase()}`);
      setStep('success');

    } catch (error: any) {
      console.error("Booking failed:", error);
      alert("System Error: Failed to reach the server.");
      setStep('payment');
    }
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / 600) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0b10]/95 backdrop-blur-md" onClick={step === 'success' ? onClose : undefined} />

      <AnimatePresence mode="wait">
        {step === 'payment' && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-[#161921] rounded-[32px] border border-white/5 p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Secure Battery</h2>
              
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r={radius - 12} stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="transparent" />
                  <circle 
                    cx="32" cy="32" r={radius - 12} 
                    stroke="#A7C7E7" strokeWidth="3" fill="transparent" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="text-white text-xs font-mono font-black">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="bg-[#0a0b10] rounded-2xl p-6 mb-6 border border-white/5">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Target Node</p>
              <p className="text-white font-black uppercase truncate">{station.name}</p>
              <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Swap Fee</p>
                <p className="text-xl text-[#A7C7E7] font-black font-mono">₹149.00</p>
              </div>
            </div>

            <form onSubmit={handlePayment}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-2">UPI Identity</label>
              <input 
                type="text" 
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="operator@ybl"
                className="w-full bg-[#0a0b10] border border-white/5 rounded-2xl px-4 py-4 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:border-[#A7C7E7] transition-colors mb-8"
              />
              <div className="flex gap-4">
                <button type="button" onClick={onClose} className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors border border-white/5">
                  Abort
                </button>
                <button type="submit" className="flex-[2] bg-[#A7C7E7] text-[#0a0b10] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#8FAECB] transition-colors">
                  Authorize Swap
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center relative z-10"
          >
            <div className="w-16 h-16 border-4 border-white/5 border-t-[#A7C7E7] rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Verifying Ledger</h2>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Committing to PostgreSQL...</p>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-[#161921] rounded-[32px] border border-[#A7C7E7]/20 p-8 text-center z-10"
          >
            <div className="w-20 h-20 bg-[#A7C7E7] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-[#0a0b10] font-black">
              ✓
            </div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Node Unlocked</h2>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-8">Access granted. proceed to swap.</p>

            <div className="bg-[#0a0b10] rounded-2xl p-6 border border-white/5 mb-8">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Auth Key</p>
              <p className="text-3xl font-mono font-black text-white tracking-widest">
                {bookingId}
              </p>
            </div>

            <button onClick={onClose} className="w-full bg-white/5 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors border border-white/5">
              Return to Matrix
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
