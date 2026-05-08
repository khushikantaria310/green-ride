"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Zap, CheckCircle2, Loader2 } from 'lucide-react';

interface TopUpModalProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export default function TopUpModal({ onClose, onSuccess }: TopUpModalProps) {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');

  const presetAmounts = [500, 1000, 2500, 5000];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const handleProceed = async () => {
    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) return;
    
    setStep('processing');

    try {
      if (!(window as any).Razorpay) {
         alert("Razorpay SDK is still loading...");
         setStep('select');
         return;
      }

      const token = localStorage.getItem('token');

      const orderResponse = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: finalAmount }),
      });
      
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: "rzp_test_SmmWza8ZZrRajA", // Ensure this matches your backend Key ID
        amount: orderData.amount,
        currency: orderData.currency,
        name: "GreenRide Ecosystem",
        description: "Wallet Capital Injection",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: finalAmount,
              }),
            });

            if (verifyResponse.ok) {
              setStep('success');
              setTimeout(() => onSuccess(finalAmount), 2000);
            } else {
              alert("Payment verification failed.");
              setStep('select');
            }
          } catch (err) {
            alert("Verification Error.");
            setStep('select');
          }
        },
        prefill: { name: "Operator", email: "admin@greenride.com" },
        theme: { color: "#2563EB" },
        modal: { ondismiss: () => setStep('select') }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      alert(err.message);
      setStep('select');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-geist">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-200"
      >
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Zap size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inject Capital</h2>
                </div>
                <button onClick={onClose} className="text-slate-500 p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Amount Selection Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {presetAmounts.map((preset) => (
                  <button 
                    key={preset} 
                    onClick={() => { setAmount(preset); setCustomAmount(''); }} 
                    className={`py-4 rounded-2xl font-bold border-2 transition-all duration-200 ${
                      amount === preset && !customAmount 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    ₹{preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative mb-8">
                <input 
                  type="number" 
                  value={customAmount} 
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }} 
                  placeholder="Or enter custom amount" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <button 
                onClick={handleProceed} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
              >
                <CreditCard size={20} /> 
                <span className="text-lg">Pay via Razorpay</span>
              </button>
            </motion.div>
          )}

          {step === 'processing' && (
            <div className="p-12 flex flex-col items-center justify-center min-h-[420px]">
              <Loader2 size={48} className="text-blue-600 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-slate-900">Securely Connecting...</h2>
              <p className="text-slate-500 mt-2">Initializing gateway protocols</p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-12 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} className="text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Capital Injected!</h2>
              <p className="text-slate-500 mt-2 text-center">Your secure balance has been updated across the grid.</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
