"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Zap, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface TopUpModalProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export default function TopUpModal({ onClose, onSuccess }: TopUpModalProps) {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');

  const presetAmounts = [500, 1000, 2500, 5000];

  // 1. Load Razorpay SDK into the browser
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleProceed = async () => {
    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) return;
    
    setStep('processing');

    try {
      // Safety check: Ensure Razorpay script finished loading
      if (!(window as any).Razorpay) {
         alert("Razorpay SDK is still loading. Please try again in a second.");
         setStep('select');
         return;
      }

      // 2. 100% CLIENT-SIDE RAZORPAY CONFIGURATION (NO BACKEND NEEDED FOR TEST MODE)
      const options = {
        // 🔥 Hardcoded your exact Test Key so it never fails!
        key: "rzp_test_SlksEsGhKJGYyw", 
        amount: finalAmount * 100, // Razorpay expects paise
        currency: "INR",
        name: "GreenRide Ecosystem",
        description: "Wallet Capital Injection",
        
        // This runs when the dummy payment is successful
        handler: function (response: any) {
          console.log("Success! Payment ID: ", response.razorpay_payment_id);
          setStep('success');
          // Update the balance in App.tsx
          setTimeout(() => onSuccess(finalAmount), 2000);
        },
        prefill: {
          name: "Operator Node 1",
          email: "admin@greenride.com",
          contact: "9999999999"
        },
        theme: { color: "#2563EB" },
        modal: { 
          ondismiss: () => setStep('select') 
        }
      };

      // 3. Open the popup!
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert("Payment Failed: " + response.error.description);
        setStep('select');
      });
      rzp.open();

    } catch (err) {
      console.error("Payment flow interrupted:", err);
      alert("Could not initialize payment gateway. Check your console for details.");
      setStep('select');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans selection:bg-blue-500 selection:text-white">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step === 'select' ? onClose : undefined}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-100"
      >
        <AnimatePresence mode="wait">
          
          {/* STEP 1: SELECT AMOUNT */}
          {step === 'select' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Zap size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inject Capital</h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Select Amount</label>
                <div className="grid grid-cols-2 gap-3">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => { setAmount(preset); setCustomAmount(''); }}
                      className={`py-3 rounded-xl font-bold transition-all border-2 ${
                        amount === preset && !customAmount
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ₹{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Or Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(0);
                    }}
                    placeholder="Enter amount"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-lg font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button 
                onClick={handleProceed}
                disabled={(!amount && !customAmount) || parseInt(customAmount) <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <CreditCard size={20} /> Pay via UPI / GPay
              </button>
              
              <p className="text-center text-xs font-medium text-slate-400 mt-4 flex items-center justify-center gap-1">
                <ShieldCheck size={14} /> Secured by Razorpay Node
              </p>
            </motion.div>
          )}

          {/* STEP 2: PROCESSING */}
          {step === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <Loader2 size={48} className="text-blue-600 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connecting...</h2>
              <p className="text-slate-500 font-medium">Opening secure payment gateway.</p>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 mx-auto"
              >
                <CheckCircle2 size={40} className="text-emerald-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Capital Injected!</h2>
              <p className="text-slate-500 font-medium">Your ecosystem balance has been updated.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
