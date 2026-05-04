import { useState } from 'react';

interface Station {
  id: number;
  name: string;
  available_slots: number;
}

interface BookingOverlayProps {
  station: Station;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BookingOverlay({ station, onClose, onConfirm }: BookingOverlayProps) {
  const [isReserving, setIsReserving] = useState(false);

  // Total physical slots at a standard node
  const totalSlots = 15; 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0a0b10]/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* The Status.app style Card */}
      <div className="relative w-full max-w-lg bg-[#161921] rounded-[40px] border border-white/10 p-8 shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">
        
        <header className="flex justify-between items-start mb-8">
          <div>
            <div className="inline-block px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
              Node Active
            </div>
            <h2 className="text-3xl font-bold tracking-tighter text-white">{station.name}</h2>
            <p className="text-gray-400 mt-1 font-medium">Station ID: #{station.id.toString().padStart(4, '0')}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            ✕
          </button>
        </header>

        {/* Battery Slot Grid */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Live Module Availability</h3>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: totalSlots }).map((_, i) => {
              const isAvailable = i < station.available_slots;
              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-2xl flex items-center justify-center text-xl transition-all ${
                    isAvailable 
                      ? 'bg-[#4d6af2]/20 border border-[#4d6af2]/50 shadow-[0_0_15px_rgba(77,106,242,0.15)] text-[#4d6af2]' 
                      : 'bg-white/5 border border-white/5 text-white/20'
                  }`}
                >
                  {isAvailable ? '🔋' : '🔌'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-400 text-sm">Swap Fee</p>
              <p className="text-2xl font-bold text-white">₹149.00</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Estimated Wait</p>
              <p className="text-white font-bold">~2 mins</p>
            </div>
          </div>

          <button 
            // 🔥 FIX: Trigger onConfirm immediately without the fake timeout!
            onClick={() => {
              setIsReserving(true);
              onConfirm(); 
            }}
            disabled={isReserving || station.available_slots === 0}
            className="w-full bg-[#4d6af2] text-white py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReserving ? 'Securing Node...' : 'Authorize Swap'}
          </button>
        </div>
      </div>
    </div>
  );
}
