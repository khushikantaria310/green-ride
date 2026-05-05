export default function EcoFriendlyIllustration() {
  return (
    <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes leafSway {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.8); }
          }
          @keyframes arrowDown {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(5px); }
          }
          .spin { animation: spin 30s linear infinite; transform-origin: 150px 140px; }
          .leafSway { animation: leafSway 3s ease-in-out infinite; }
          .sparkle { animation: sparkle 2s ease-in-out infinite; }
          .arrowDown { animation: arrowDown 1.5s ease-in-out infinite; }
        `}
      </style>

      {/* Background */}
      <circle cx="150" cy="150" r="140" fill="#D1FAE5"/>

      {/* Earth/Globe */}
      <g className="spin">
        <circle cx="150" cy="140" r="70" fill="#3B82F6"/>
        <circle cx="150" cy="140" r="70" fill="#10B981" opacity="0.3"/>

        {/* Continents (simplified) */}
        <path d="M130 110 Q140 105 150 110 L155 120 Q150 125 145 120 Z" fill="#059669"/>
        <path d="M165 130 Q175 125 180 135 L175 145 Q170 150 165 145 Z" fill="#059669"/>
        <ellipse cx="140" cy="155" rx="20" ry="15" fill="#059669"/>
      </g>

      {/* Leaf wrapping around */}
      <g transform="translate(90, 80)" className="leafSway" style={{transformOrigin: '20px 40px'}}>
        <path d="M0 40 Q20 20 40 40 Q20 60 0 40" fill="#22C55E"/>
        <path d="M0 40 L40 40" stroke="#16A34A" strokeWidth="2"/>
      </g>

      <g transform="translate(170, 150)" className="leafSway" style={{transformOrigin: '15px 0px', animationDelay: '0.5s'}}>
        <path d="M0 0 Q15 -15 30 0 Q15 15 0 0" fill="#22C55E"/>
        <path d="M0 0 L30 0" stroke="#16A34A" strokeWidth="2"/>
      </g>

      {/* Electric car silhouette at bottom */}
      <g transform="translate(100, 220)">
        <rect x="10" y="0" width="80" height="25" rx="4" fill="#1F2937"/>
        <path d="M20 0 L30 -12 L70 -12 L80 0 Z" fill="#374151"/>
        <circle cx="30" cy="25" r="8" fill="#4B5563"/>
        <circle cx="70" cy="25" r="8" fill="#4B5563"/>
        <path d="M45 5 L40 15 L43 15 L38 25 L47 15 L44 15 Z" fill="#FCD34D"/>
      </g>

      {/* CO2 reduction indicator */}
      <g transform="translate(190, 60)">
        <circle cx="20" cy="20" r="20" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
        <text x="20" y="18" fontSize="14" fill="#DC2626" textAnchor="middle" fontWeight="bold">CO₂</text>
        <path d="M12 26 L28 26" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
        <g className="arrowDown">
          <path d="M15 23 L20 28 L25 23" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </g>
      </g>

      {/* Sparkles */}
      <g fill="#FBBF24" className="sparkle">
        <circle cx="220" cy="120" r="3"/>
        <circle cx="80" cy="180" r="2.5"/>
        <circle cx="210" cy="200" r="2"/>
      </g>
      <g fill="#F59E0B" className="sparkle" style={{animationDelay: '0.5s'}}>
        <circle cx="60" cy="120" r="2"/>
        <circle cx="240" cy="180" r="2.5"/>
      </g>
    </svg>
  );
}

