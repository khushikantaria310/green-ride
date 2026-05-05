export default function ChargingIllustration() {
  return (
    <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <style>
        {`
          @keyframes chargePulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          @keyframes energyFlow {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(20px); opacity: 0; }
          }
          @keyframes wave {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-5px); }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .chargePulse { animation: chargePulse 1.5s ease-in-out infinite; }
          .energyFlow { animation: energyFlow 2s ease-in-out infinite; }
          .wave { animation: wave 2s ease-in-out infinite; }
          .rotate { animation: rotate 3s linear infinite; transform-origin: center; }
        `}
      </style>

      {/* Background */}
      <circle cx="150" cy="150" r="140" fill="#DCFCE7" className="chargePulse"/>

      {/* Charging station */}
      <rect x="100" y="80" width="100" height="160" rx="12" fill="#10B981"/>
      <rect x="115" y="100" width="70" height="80" rx="8" fill="#34D399"/>

      {/* Screen display */}
      <rect x="125" y="110" width="50" height="60" rx="4" fill="#065F46"/>
      <text x="150" y="140" fontSize="20" fill="#D1FAE5" textAnchor="middle" fontWeight="bold">⚡</text>
      <text x="150" y="160" fontSize="12" fill="#D1FAE5" textAnchor="middle">Fast</text>

      {/* Charging cable */}
      <path d="M150 240 L150 260 Q150 270 160 270 L180 270" stroke="#1F2937" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <circle cx="185" cy="270" r="8" fill="#374151"/>

      {/* Energy waves */}
      <g opacity="0.6" className="wave">
        <path d="M70 140 Q80 140 80 150 Q80 160 70 160" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M60 150 Q70 150 70 160 Q70 170 60 170" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </g>
      <g opacity="0.6" className="wave" style={{animationDelay: '0.5s'}}>
        <path d="M230 140 Q220 140 220 150 Q220 160 230 160" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M240 150 Q230 150 230 160 Q230 170 240 170" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </g>

      {/* Energy particles flowing */}
      <circle cx="150" cy="220" r="3" fill="#10B981" className="energyFlow"/>
      <circle cx="155" cy="215" r="2" fill="#34D399" className="energyFlow" style={{animationDelay: '0.3s'}}/>
      <circle cx="145" cy="225" r="2.5" fill="#10B981" className="energyFlow" style={{animationDelay: '0.6s'}}/>

      {/* Power button */}
      <circle cx="150" cy="200" r="15" fill="#047857"/>
      <circle cx="150" cy="200" r="8" fill="#10B981" className="chargePulse"/>

      {/* Rotating charge indicator */}
      <g className="rotate">
        <circle cx="150" cy="150" r="100" stroke="#10B981" strokeWidth="2" strokeDasharray="5 15" fill="none" opacity="0.3"/>
      </g>
    </svg>
  );
}

