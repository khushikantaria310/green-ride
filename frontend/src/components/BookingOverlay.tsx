import { motion } from 'framer-motion';
import { Zap, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function BookingOverlay({ station, onClose, onConfirm }: any) {
  if (!station) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                Node Available
              </span>
              <h2 className="text-3xl font-bold text-slate-900">{station.name}</h2>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-2">
                <MapPin size={16} /> {station.address || "Sector 4, Neo-Bengaluru"}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium flex items-center gap-2"><Zap size={18}/> Available Power Units</span>
              <span className="font-bold text-slate-900 text-lg">{station.available_batteries || 4}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-slate-500 font-medium flex items-center gap-2"><Clock size={18}/> Hold Duration</span>
              <span className="font-bold text-slate-900 text-lg">15 Minutes</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={20} /> Confirm Allocation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
