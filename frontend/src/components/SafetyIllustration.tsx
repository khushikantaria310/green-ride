export default function SafetyIllustration() {
  return (
    <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <style>
        {`
          @keyframes radarScan {
            0% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; }
            100% { opacity: 0; transform: scale(1.2); }
          }
          @keyframes sensorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes shieldPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes dash {
            to { stroke-dashoffset: -20; }
          }
          .radarScan { animation: radarScan 3s ease-out infinite; }
          .sensorBlink { animation: sensorBlink 2s ease-in-out infinite; }
          .shieldPulse { animation: shieldPulse 2s ease-in-out infinite; transform-origin: 150px 140px; }
          .dash { animation: dash 2s linear infinite; }
        `}
      </style>

      {/* Background */}
      <circle cx="150" cy="150" r="140" fill="#FEE2E2"/>

      {/* Shield */}
      <g className="shieldPulse">
        <path d="M150 60 L200 80 L200 140 Q200 180 150 220 Q100 180 100 140 L100 80 Z" fill="#EF4444"/>
        <path d="M150 70 L190 87 L190 140 Q190 175 150 210 Q110 175 110 140 L110 87 Z" fill="#DC2626"/>
      </g>

      {/* Checkmark */}
      <path d="M130 145 L145 160 L175 125" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Radar waves */}
      <g opacity="0.5">
        <circle cx="150" cy="150" r="110" stroke="#F87171" strokeWidth="2" strokeDasharray="4 4" fill="none" className="dash"/>
        <circle cx="150" cy="150" r="95" stroke="#F87171" strokeWidth="2" strokeDasharray="4 4" fill="none" className="dash" style={{animationDelay: '0.3s'}}/>
      </g>

      {/* Radar scan effect */}
      <circle cx="150" cy="150" r="110" stroke="#EF4444" strokeWidth="3" fill="none" className="radarScan"/>
      <circle cx="150" cy="150" r="110" stroke="#EF4444" strokeWidth="3" fill="none" className="radarScan" style={{animationDelay: '1s'}}/>

      {/* Sensor indicators */}
      <circle cx="80" cy="100" r="8" fill="#FBBF24" className="sensorBlink"/>
      <circle cx="220" cy="100" r="8" fill="#FBBF24" className="sensorBlink" style={{animationDelay: '0.3s'}}/>
      <circle cx="80" cy="200" r="8" fill="#FBBF24" className="sensorBlink" style={{animationDelay: '0.6s'}}/>
      <circle cx="220" cy="200" r="8" fill="#FBBF24" className="sensorBlink" style={{animationDelay: '0.9s'}}/>

      {/* Connection lines */}
      <path d="M88 100 L142 150" stroke="#FBBF24" strokeWidth="2" opacity="0.5" strokeDasharray="3 3"/>
      <path d="M212 100 L158 150" stroke="#FBBF24" strokeWidth="2" opacity="0.5" strokeDasharray="3 3"/>
      <path d="M88 200 L142 150" stroke="#FBBF24" strokeWidth="2" opacity="0.5" strokeDasharray="3 3"/>
      <path d="M212 200 L158 150" stroke="#FBBF24" strokeWidth="2" opacity="0.5" strokeDasharray="3 3"/>

      {/* Lock icon */}
      <g transform="translate(230, 220)">
        <rect x="-10" y="5" width="20" height="18" rx="2" fill="#1F2937"/>
        <path d="M-6 5 L-6 0 Q-6 -6 0 -6 Q6 -6 6 0 L6 5" stroke="#1F2937" strokeWidth="3" fill="none"/>
        <circle cx="0" cy="14" r="2.5" fill="#FCD34D"/>
      </g>
    </svg>
  );
}

