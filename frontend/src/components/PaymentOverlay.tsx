"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentOverlayProps {
  station: any;
  onClose: () => void;
}

export default function PaymentOverlay({ station, onClose }: PaymentOverlayProps) {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600s)
  const [upiId, setUpiId] = useState("");

  // Countdown Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      onClose(); // Auto-cancel if time runs out
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onClose]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // Simulate network delay & success
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  // SVG Ring Math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / 600) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0a0b10]/90 backdrop-blur-xl" onClick={step === 'success' ? onClose : undefined} />

      <AnimatePresence mode="wait">
        {step === 'payment' && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-[#161921] rounded-[40px] border border-white/10 p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Secure Battery</h2>
              
              {/* Animated SVG Countdown Ring */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r={radius - 12} stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="transparent" />
                  <circle 
                    cx="32" cy="32" r={radius - 12} 
                    stroke="#4d6af2" strokeWidth="3" fill="transparent" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="text-white text-xs font-mono font-bold">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
              <p className="text-gray-400 text-sm mb-1">Target Node</p>
              <p className="text-white font-medium">{station.name}</p>
              <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
                <p className="text-gray-400">Total Swap Fee</p>
                <p className="text-xl text-white font-bold">₹149.00</p>
              </div>
            </div>

            {/* UPI Input Form */}
            <form onSubmit={handlePayment}>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-2">UPI ID</label>
              <input 
                type="text" 
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@ybl"
                className="w-full bg-[#0a0b10] border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#4d6af2] focus:ring-1 focus:ring-[#4d6af2] transition-all mb-6"
              />
              <div className="flex gap-4">
                <button type="button" onClick={onClose} className="w-1/3 bg-white/5 text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="w-2/3 bg-[#4d6af2] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(77,106,242,0.3)]">
                  Pay Now
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center relative z-10"
          >
            <div className="w-20 h-20 border-4 border-white/10 border-t-[#4d6af2] rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Signature</h2>
            <p className="text-gray-400">Committing transaction to network...</p>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-gradient-to-b from-[#161921] to-[#0a0b10] rounded-[40px] border border-green-500/30 p-8 shadow-[0_0_50px_rgba(34,197,94,0.15)] text-center overflow-hidden z-10"
          >
            {/* CORRECTED: Battery ID Reveal Card (Spring Physics Fix) */}
            <motion.div 
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)] text-3xl"
            >
              ✓
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Slot Unlocked!</h2>
            <p className="text-gray-400 mb-8">Proceed to the station to swap.</p>

            <div className="bg-[#0a0b10] rounded-2xl p-6 border border-white/5 mb-8 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Authorized Battery ID</p>
              <p className="text-3xl font-mono font-bold text-white tracking-widest text-shadow-glow">
                BATT-49X
              </p>
            </div>

            <button onClick={onClose} className="w-full bg-white/10 text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-white/20 transition-colors">
              Return to Ecosystem
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
