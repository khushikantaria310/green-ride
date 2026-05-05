export default function EVHeroIllustration() {
  return (
    <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .pulse { animation: pulse 2s ease-in-out infinite; }
          .float { animation: float 3s ease-in-out infinite; }
          .rotate { animation: rotate 20s linear infinite; transform-origin: center; }
          .blink { animation: blink 2s ease-in-out infinite; }
          .slideIn { animation: slideIn 1s ease-out; }
        `}
      </style>

      {/* Background circles */}
      <circle cx="300" cy="200" r="180" fill="#E0F2FE" className="pulse"/>
      <circle cx="300" cy="200" r="140" fill="#BAE6FD" className="pulse" style={{animationDelay: '0.5s'}}/>

      {/* EV Car Body */}
      <g className="float">
        <path d="M150 220 L200 180 L400 180 L450 220 L450 280 L150 280 Z" fill="#3B82F6"/>
        <path d="M200 180 L220 160 L380 160 L400 180 Z" fill="#2563EB"/>

        {/* Car Windows */}
        <path d="M210 180 L225 165 L300 165 L300 180 Z" fill="#93C5FD" opacity="0.7"/>
        <path d="M310 180 L310 165 L375 165 L390 180 Z" fill="#93C5FD" opacity="0.7"/>

        {/* Car Details */}
        <rect x="160" y="230" width="40" height="25" rx="3" fill="#1E40AF"/>
        <rect x="400" y="230" width="40" height="25" rx="3" fill="#DC2626" className="blink"/>

        {/* Wheels */}
        <g className="rotate">
          <circle cx="220" cy="280" r="35" fill="#1F2937"/>
          <circle cx="220" cy="280" r="20" fill="#4B5563"/>
          <circle cx="220" cy="280" r="8" fill="#9CA3AF"/>
          <rect x="218" y="272" width="4" height="16" fill="#9CA3AF"/>
        </g>

        <g className="rotate">
          <circle cx="380" cy="280" r="35" fill="#1F2937"/>
          <circle cx="380" cy="280" r="20" fill="#4B5563"/>
          <circle cx="380" cy="280" r="8" fill="#9CA3AF"/>
          <rect x="378" y="272" width="4" height="16" fill="#9CA3AF"/>
        </g>

        {/* Lightning bolt (electric symbol) */}
        <path d="M310 200 L300 220 L305 220 L295 240 L310 220 L305 220 Z" fill="#FCD34D" className="blink"/>
      </g>

      {/* Charging station */}
      <rect x="480" y="180" width="60" height="100" rx="8" fill="#10B981"/>
      <rect x="495" y="195" width="30" height="40" rx="4" fill="#34D399"/>
      <circle cx="510" cy="250" r="8" fill="#FCD34D"/>
      <path d="M505 245 L510 252 L515 245" stroke="#10B981" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Cable connecting car to charger */}
      <path d="M450 240 Q465 235 480 238" stroke="#6B7280" strokeWidth="4" strokeLinecap="round" fill="none"/>

      {/* Floating UI elements */}
      <g transform="translate(80, 120)">
        <rect width="70" height="50" rx="8" fill="white" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
        <text x="35" y="25" fontSize="24" fill="#10B981" textAnchor="middle" fontWeight="bold">85%</text>
        <text x="35" y="40" fontSize="10" fill="#6B7280" textAnchor="middle">Battery</text>
      </g>

      {/* Smart features indicator */}
      <g transform="translate(470, 100)" className="float" style={{animationDelay: '0.5s'}}>
        <circle cx="20" cy="20" r="20" fill="white" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
        <path d="M20 12 L20 22 M15 17 L20 12 L25 17" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>

      {/* Floating decorative elements */}
      <g className="float" style={{animationDelay: '0.2s'}}>
        <circle cx="50" cy="80" r="4" fill="#FBBF24"/>
        <circle cx="55" cy="75" r="2" fill="#F59E0B"/>
      </g>
      <g className="float" style={{animationDelay: '0.7s'}}>
        <circle cx="550" cy="120" r="5" fill="#10B981"/>
        <circle cx="545" cy="115" r="2.5" fill="#059669"/>
      </g>
      <g className="float" style={{animationDelay: '1s'}}>
        <circle cx="520" cy="300" r="3" fill="#8B5CF6"/>
      </g>
      <g className="float" style={{animationDelay: '0.3s'}}>
        <circle cx="80" cy="320" r="3.5" fill="#EC4899"/>
      </g>

      {/* Energy sparkles */}
      <g className="blink" style={{animationDelay: '0.4s'}}>
        <path d="M420 140 L425 145 L430 140 L425 135 Z" fill="#FCD34D"/>
      </g>
      <g className="blink" style={{animationDelay: '0.8s'}}>
        <path d="M180 150 L185 155 L190 150 L185 145 Z" fill="#60A5FA"/>
      </g>
    </svg>
  );
}

