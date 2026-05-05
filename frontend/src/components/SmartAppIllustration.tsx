export default function SmartAppIllustration() {
  return (
    <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <style>
        {`
          @keyframes slideUp {
            0% { transform: translateY(10px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes ping {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
          }
          @keyframes wifiPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .slideUp { animation: slideUp 1s ease-out; }
          .ping { animation: ping 2s ease-in-out infinite; }
          .wifiPulse { animation: wifiPulse 2s ease-in-out infinite; }
          .bounce { animation: bounce 2s ease-in-out infinite; }
        `}
      </style>

      {/* Background */}
      <circle cx="150" cy="150" r="140" fill="#DDD6FE"/>

      {/* Phone */}
      <rect x="90" y="50" width="120" height="200" rx="16" fill="#1F2937"/>
      <rect x="100" y="65" width="100" height="170" rx="8" fill="#F3F4F6"/>

      {/* App header */}
      <rect x="100" y="65" width="100" height="35" rx="8" fill="#8B5CF6"/>
      <text x="150" y="87" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">Smart EV</text>

      {/* Car status card */}
      <rect x="110" y="110" width="80" height="60" rx="8" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
      <circle cx="130" cy="135" r="12" fill="#10B981"/>
      <path d="M126 135 L129 138 L135 132" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <text x="150" y="138" fontSize="10" fill="#1F2937" fontWeight="600">Connected</text>
      <text x="150" y="155" fontSize="16" fill="#3B82F6" fontWeight="bold">247 km</text>

      {/* Control buttons */}
      <circle cx="130" cy="195" r="18" fill="#3B82F6"/>
      <path d="M130 188 L130 195 M130 195 L137 195" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      <circle cx="170" cy="195" r="18" fill="#EF4444"/>
      <rect x="164" y="189" width="12" height="12" fill="white" rx="2"/>

      {/* Floating notification */}
      <g transform="translate(200, 80)" className="slideUp">
        <rect width="80" height="40" rx="8" fill="white" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"/>
        <circle cx="15" cy="20" r="8" fill="#22C55E" className="ping"/>
        <text x="30" y="18" fontSize="9" fill="#1F2937" fontWeight="600">Charging</text>
        <text x="30" y="28" fontSize="8" fill="#6B7280">Complete!</text>
      </g>

      {/* Wi-Fi signal */}
      <g transform="translate(210, 140)">
        <path d="M20 30 Q20 20 30 20 Q40 20 40 30" stroke="#8B5CF6" strokeWidth="2" fill="none" className="wifiPulse"/>
        <path d="M23 27 Q23 22 30 22 Q37 22 37 27" stroke="#8B5CF6" strokeWidth="2" fill="none" className="wifiPulse" style={{animationDelay: '0.3s'}}/>
        <circle cx="30" cy="30" r="2" fill="#8B5CF6"/>
      </g>

      {/* Floating decorative icons */}
      <g className="bounce">
        <circle cx="50" cy="100" r="6" fill="#A78BFA"/>
        <path d="M47 100 L50 103 L53 97" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>
      <g className="bounce" style={{animationDelay: '0.5s'}}>
        <circle cx="250" cy="250" r="5" fill="#F472B6"/>
      </g>
    </svg>
  );
}

