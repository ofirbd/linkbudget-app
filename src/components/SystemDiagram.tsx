export function SystemDiagram({ model }: { model?: string }) {
  const showFresnel = model !== 'ITUR1238';

  return (
    <div className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col items-center justify-center mt-4">
      <h3 className="text-sm font-semibold text-slate-300 w-full text-left mb-6 uppercase tracking-wider">System Setup Illustration</h3>
      <div className="w-full max-w-2xl relative">
        <svg viewBox="0 0 600 200" className="w-full h-auto drop-shadow-md">
          {/* Ground */}
          <line x1="10" y1="180" x2="590" y2="180" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          
          {/* Transmitter Tower (Left) */}
          <g transform="translate(50, 180)">
            <line x1="0" y1="0" x2="0" y2="-120" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
            {/* Tower Crossbars */}
            <path d="M -10 -20 L 10 -40 M -10 -40 L 10 -60 M -10 -60 L 10 -80 M -10 -80 L 10 -100 M -10 -100 L 10 -120" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 10 -20 L -10 -40 M 10 -40 L -10 -60 M 10 -60 L -10 -80 M 10 -80 L -10 -100 M 10 -100 L -10 -120" stroke="#94a3b8" strokeWidth="2" />
            {/* Antenna Dish/Element */}
            <path d="M 5 -120 Q 20 -100 5 -80" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
            <circle cx="5" cy="-100" r="3" fill="#f43f5e" />
            <text x="0" y="-140" fill="#f1f5f9" fontSize="14" fontWeight="bold" textAnchor="middle">Tx (Transmitter)</text>
          </g>

          {/* Receiver Tower/Antenna (Right) */}
          <g transform="translate(550, 180)">
            <line x1="0" y1="0" x2="0" y2="-80" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            {/* Tower Crossbars */}
            <path d="M -8 -15 L 8 -30 M -8 -30 L 8 -45 M -8 -45 L 8 -60 M -8 -60 L 8 -75" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 8 -15 L -8 -30 M 8 -30 L -8 -45 M 8 -45 L -8 -60 M 8 -60 L -8 -75" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Receiver Dish/Element */}
            <path d="M -5 -80 Q -20 -65 -5 -50" fill="none" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
            <circle cx="-5" cy="-65" r="3" fill="#10b981" />
            <text x="0" y="-100" fill="#f1f5f9" fontSize="14" fontWeight="bold" textAnchor="middle">Rx (Receiver)</text>
          </g>

          {/* Fresnel Zone (Radio Tube) */}
          {showFresnel && (
            <ellipse cx="300" cy="97.5" rx="245" ry="25" fill="#6366f1" fillOpacity="0.15" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 4" transform="rotate(4.1 300 97.5)" />
          )}
          
          {/* Main Line-of-sight */}
          <line x1="55" y1="80" x2="545" y2="115" stroke="#3b82f6" strokeWidth="2" strokeDasharray="8 6" className="animate-pulse" />

          {/* Radiating Arcs from Tx */}
          <g transform="translate(65, 80) rotate(4.1)">
            <path d="M 15 -10 A 20 20 0 0 1 15 10 M 25 -20 A 35 35 0 0 1 25 20 M 35 -30 A 50 50 0 0 1 35 30" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </g>

          {/* Labels for the paths */}
          <text x="300" y="45" fill="#93c5fd" fontSize="14" fontStyle="italic" textAnchor="middle">RF Line-of-Sight</text>
          {showFresnel && (
            <text x="300" y="65" fill="#818cf8" fontSize="12" fontStyle="italic" textAnchor="middle">1st Fresnel Zone</text>
          )}
          
          {/* Distance indicator */}
          <path d="M 50 195 L 550 195" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M 50 190 L 50 200 M 550 190 L 550 200" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="300" y="190" fill="#cbd5e1" fontSize="12" textAnchor="middle">Distance (d)</text>
        </svg>
      </div>
    </div>
  );
}
