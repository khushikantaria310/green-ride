"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, CheckCircle2, Loader2, AlertCircle, Send } from 'lucide-react';

interface WithdrawModalProps {
  currentBalance: number;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export default function WithdrawModal({ currentBalance, onClose, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [destination, setDestination] = useState<string>('bank_ending_4242');
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');

  // Using parseFloat for accurate currency handling
  const numAmount = parseFloat(amount) || 0;
  const isOverdrawn = numAmount > currentBalance;
  const isValid = numAmount > 0 && !isOverdrawn;

  const handleProceed = () => {
    if (!isValid) return;
    setStep('processing');
    
    // Simulate API call to backend for payout processing
    setTimeout(() => {
      setStep('success');
      // Close and deduct balance after a short delay
      setTimeout(() => {
        onSuccess(numAmount);
      }, 2000);
    }, 2500);
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
          
          {/* STEP 1: SELECT AMOUNT & DESTINATION */}
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
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                    <Building2 size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Withdraw Funds</h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              {/* Available Balance Indicator */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between mb-6">
                 <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Available</span>
                 <span className="text-lg font-bold text-emerald-600">₹{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Withdrawal Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full bg-slate-50 border-2 rounded-xl py-3 pl-10 pr-4 text-lg font-bold text-slate-900 focus:outline-none focus:bg-white transition-colors ${
                      isOverdrawn ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-100 focus:border-slate-400'
                    }`}
                  />
                </div>
                {isOverdrawn && (
                   <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                     <AlertCircle size={14} /> Amount exceeds available balance
                   </p>
                )}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Destination</label>
                <select 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="bank_ending_4242">HDFC Bank (•••• 4242)</option>
                  <option value="upi_admin">UPI: operator@axisbank</option>
                  <option value="bank_ending_9911">SBI Account (•••• 9911)</option>
                </select>
              </div>

              <button 
                onClick={handleProceed}
                disabled={!isValid}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Send size={18} /> Process Payout
              </button>
            </motion.div>
          )}

          {/* STEP 2: PROCESSING */}
          {step === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-12 flex flex-col items-center justify-center text-center min-h-[450px]"
            >
              <Loader2 size={48} className="text-slate-800 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Initiating Transfer</h2>
              <p className="text-slate-500 font-medium">Communicating with banking partner...</p>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center justify-center text-center min-h-[450px]"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 border border-slate-200"
              >
                <CheckCircle2 size={40} className="text-slate-800" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Withdrawal Initiated</h2>
              <p className="text-slate-500 font-medium">Funds will reflect in your destination account shortly.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
