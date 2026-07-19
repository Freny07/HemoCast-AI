import React, { useState } from 'react';
import { Map, MapPin, Building, Hospital, Calendar, Sparkles, Navigation, Info } from 'lucide-react';

interface MapLocation {
  id: number;
  name: string;
  type: 'bank' | 'hospital' | 'camp';
  latitude: number;
  longitude: number;
  address: string;
  details: string;
  stats?: string;
  x: number; // mapped SVG coordinate (x: 50 to 450)
  y: number; // mapped SVG coordinate (y: 50 to 350)
}

export default function InteractiveMap() {
  const [filter, setFilter] = useState<'all' | 'bank' | 'hospital' | 'camp'>('all');
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);

  // Mapped locations in Bhavnagar area
  const locations: MapLocation[] = [
    { 
      id: 1, 
      name: "Bhavnagar District Blood Bank", 
      type: "bank", 
      latitude: 21.7645, 
      longitude: 72.1519, 
      address: "M.G. Road, Bhavnagar", 
      details: "Central distribution hub. Hosts the HemoCast AI forecasting server.", 
      stats: "78 units available | 16 units at expiry risk",
      x: 250, 
      y: 180 
    },
    { 
      id: 2, 
      name: "Red Cross Bhavnagar Center", 
      type: "bank", 
      latitude: 21.7820, 
      longitude: 72.1350, 
      address: "Chitra GIDC Road, Bhavnagar", 
      details: "Regional secondary storage bank.", 
      stats: "34 units available | Stock status: stable",
      x: 180, 
      y: 100 
    },
    { 
      id: 3, 
      name: "Bhavnagar Civil Hospital", 
      type: "hospital", 
      latitude: 21.7584, 
      longitude: 72.1633, 
      address: "Jail Road, Bhavnagar", 
      details: "Primary trauma and surgery center. Demands 65% of local platelet stocks.", 
      stats: "1 pending urgent request | 5 units O- SOS fulfilled recently",
      x: 320, 
      y: 220 
    },
    { 
      id: 4, 
      name: "District Trauma & Pediatric Hospital", 
      type: "hospital", 
      latitude: 21.7390, 
      longitude: 72.1480, 
      address: "Takhteshwar, Bhavnagar", 
      details: "Specialized pediatric ward. Current target area for A+ Platelet forecasting.", 
      stats: "Active alerts: high dengue platelet demand pings sent",
      x: 210, 
      y: 280 
    },
    { 
      id: 5, 
      name: "Bhavnagar University Camp", 
      type: "camp", 
      latitude: 21.7500, 
      longitude: 72.1400, 
      address: "University Campus Hall, Bhavnagar", 
      details: "Student-led donation drive. Scheduled to start in 10 days.", 
      stats: "Target: 80 units | Pre-registered: 65 donors | Priority: High (O+)",
      x: 150, 
      y: 200 
    },
    { 
      id: 6, 
      name: "GIDC Industrial Area Camp", 
      type: "camp", 
      latitude: 21.7850, 
      longitude: 72.1200, 
      address: "GIDC Welfare Hall, Bhavnagar", 
      details: "Factory outreach camp targeting high whole blood yield.", 
      stats: "Target: 120 units | Scheduled in 24 days | Priority: Medium",
      x: 100, 
      y: 70 
    }
  ];

  const filteredLocations = filter === 'all' 
    ? locations 
    : locations.filter(loc => loc.type === filter);

  const getIconColor = (type: 'bank' | 'hospital' | 'camp') => {
    if (type === 'bank') return 'text-crimson-500 fill-crimson-500/20';
    if (type === 'hospital') return 'text-indigo-400 fill-indigo-400/20';
    return 'text-amber-500 fill-amber-500/20';
  };

  const getPinStroke = (type: 'bank' | 'hospital' | 'camp') => {
    if (type === 'bank') return '#ef4444';
    if (type === 'hospital') return '#818cf8';
    return '#f59e0b';
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto font-sans">
      <header className="flex justify-between items-center pb-6 border-b border-slate-850">
        <div>
          <h1 className="text-2xl font-bold text-white">Coverage & Active Drive Map</h1>
          <p className="text-slate-450 text-sm mt-1">
            Visual coordinates of partner hospitals, paged blood banks, and active donation drives.
          </p>
        </div>
        
        {/* Toggle Filters */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-850 flex gap-1">
          {[
            { id: 'all', label: 'Show All' },
            { id: 'bank', label: 'Blood Banks' },
            { id: 'hospital', label: 'Hospitals' },
            { id: 'camp', label: 'Camps' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all ${
                filter === item.id 
                  ? 'bg-slate-800 text-white border border-slate-700/60 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* SVG Regional Map Visualization */}
        <div className="md:col-span-8">
          <div className="glass-panel rounded-3xl border border-slate-850 overflow-hidden relative bg-[#090f1a] shadow-inner p-4 flex flex-col justify-between h-[450px]">
            {/* Map Controls Watermark */}
            <div className="absolute top-4 left-4 text-xxs font-bold text-slate-500 bg-slate-950/70 border border-slate-850 px-3 py-1.5 rounded-lg z-10 select-none">
              BHAVNAGAR DISTRICT REGIONAL GRID COORDINATES
            </div>

            {/* Map Grid Canvas SVG */}
            <svg className="w-full h-full min-h-[380px]" viewBox="0 0 500 400">
              {/* Map grid lines */}
              <defs>
                <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.15"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* District boundaries outline representation */}
              <path 
                d="M 50,50 Q 150,30 250,50 T 450,80 Q 480,200 420,300 T 250,380 Q 120,380 70,300 T 50,50 Z" 
                fill="none" 
                stroke="#1e293b" 
                strokeWidth="2" 
                strokeDasharray="4 6"
                opacity="0.6" 
              />

              {/* Geographic connectors */}
              {selectedLoc && (
                <g>
                  <line 
                    x1="250" 
                    y1="180" 
                    x2={selectedLoc.x} 
                    y2={selectedLoc.y} 
                    stroke="#ef4444" 
                    strokeWidth="1.5" 
                    strokeDasharray="2 3"
                    opacity="0.5"
                    className="animate-pulse"
                  />
                  <circle cx="250" cy="180" r="3" fill="#ef4444" opacity="0.7" />
                </g>
              )}

              {/* Location Pins */}
              {filteredLocations.map(loc => {
                const isSelected = selectedLoc?.id === loc.id;
                return (
                  <g 
                    key={loc.id} 
                    className="cursor-pointer group"
                    onClick={() => setSelectedLoc(loc)}
                  >
                    {/* Ring Pulse for Selected location */}
                    {isSelected && (
                      <circle 
                        cx={loc.x} 
                        cy={loc.y} 
                        r="18" 
                        fill="none" 
                        stroke={getPinStroke(loc.type)} 
                        strokeWidth="1" 
                        opacity="0.8" 
                        className="animate-ping"
                      />
                    )}
                    
                    {/* Pin Backdrop Hover Shape */}
                    <circle 
                      cx={loc.x} 
                      cy={loc.y} 
                      r="12" 
                      fill="currentColor" 
                      className={`transition-colors duration-150 ${
                        loc.type === 'bank' ? 'text-crimson-500/10' : 
                        loc.type === 'hospital' ? 'text-indigo-400/10' : 'text-amber-500/10'
                      } group-hover:scale-125`}
                      opacity="0.8" 
                    />

                    {/* Geographical Center Pin Dot */}
                    <circle 
                      cx={loc.x} 
                      cy={loc.y} 
                      r="5.5" 
                      fill={getPinStroke(loc.type)}
                      stroke="#070b13"
                      strokeWidth="1.5"
                      className="group-hover:scale-110 transition-transform"
                    />

                    {/* Mini Label on hover */}
                    <text 
                      x={loc.x} 
                      y={loc.y - 12} 
                      textAnchor="middle" 
                      fill="#fff" 
                      fontSize="9" 
                      fontWeight="bold"
                      className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-950 px-1"
                    >
                      {loc.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Compass rose decoration */}
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-650 font-mono flex items-center gap-1 bg-slate-950/40 p-2 rounded-lg border border-slate-900 select-none">
              <Navigation className="w-3.5 h-3.5 text-slate-500 rotate-45" /> 
              <span>Grid Center: N21°45' E72°09'</span>
            </div>
          </div>
        </div>

        {/* Sidebar details card */}
        <div className="md:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-crimson-500" /> Location Registry
          </h2>

          {selectedLoc ? (
            <div className="glass-panel p-6 rounded-3xl border border-slate-850 space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${getIconColor(selectedLoc.type)}`}>
                    {selectedLoc.type === 'bank' ? <Building className="w-4 h-4" /> : 
                     selectedLoc.type === 'hospital' ? <Hospital className="w-4 h-4" /> : 
                     <Calendar className="w-4 h-4" />}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-white">{selectedLoc.name}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{selectedLoc.type} portal</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-350 leading-relaxed pt-2">
                  <p><strong>Address:</strong> {selectedLoc.address}</p>
                  <p><strong>Description:</strong> {selectedLoc.details}</p>
                </div>
              </div>

              {/* Predictive Statistics Panel */}
              <div className="bg-slate-900/60 p-4.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="flex items-center gap-1.5 text-xxs font-bold text-crimson-400 tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Status Indicators
                </span>
                <p className="text-xs text-white leading-relaxed font-semibold">
                  {selectedLoc.stats}
                </p>
              </div>

              <button
                onClick={() => setSelectedLoc(null)}
                className="w-full py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
              >
                Clear Selection
              </button>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl border border-slate-850 text-center text-slate-500 text-xs py-20 flex flex-col items-center justify-center gap-3">
              <MapPin className="w-8 h-8 text-slate-700 animate-bounce" />
              <p>Select any pin on the geographical canvas to load coordinate intelligence and stock details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
