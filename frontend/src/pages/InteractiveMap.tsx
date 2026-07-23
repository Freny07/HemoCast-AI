import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, MapPin, Building, Hospital, Calendar, Sparkles, Navigation } from 'lucide-react';

interface MapLocation {
  id: number;
  name: string;
  type: 'bank' | 'hospital' | 'camp';
  latitude: number;
  longitude: number;
  address: string;
  details: string;
  stats?: string;
}

// Leaflet custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #070b13; box-shadow: 0 0 12px ${color};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const bankIcon = createCustomIcon('#ef4444');
const hospitalIcon = createCustomIcon('#818cf8');
const campIcon = createCustomIcon('#f59e0b');

export default function InteractiveMap() {
  const [filter, setFilter] = useState<'all' | 'bank' | 'hospital' | 'camp'>('all');
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);

  // Mapped locations in Bhavnagar district
  const locations: MapLocation[] = [
    { 
      id: 1, 
      name: "Bhavnagar District Blood Bank", 
      type: "bank", 
      latitude: 21.7645, 
      longitude: 72.1519, 
      address: "M.G. Road, Bhavnagar", 
      details: "Central distribution hub. Hosts the HemoCast AI forecasting server.", 
      stats: "78 units available | 16 units at expiry risk"
    },
    { 
      id: 2, 
      name: "Red Cross Bhavnagar Center", 
      type: "bank", 
      latitude: 21.7820, 
      longitude: 72.1350, 
      address: "Chitra GIDC Road, Bhavnagar", 
      details: "Regional secondary storage bank.", 
      stats: "34 units available | Stock status: stable"
    },
    { 
      id: 3, 
      name: "Bhavnagar Civil Hospital", 
      type: "hospital", 
      latitude: 21.7584, 
      longitude: 72.1633, 
      address: "Jail Road, Bhavnagar", 
      details: "Primary trauma and surgery center. Demands 65% of local platelet stocks.", 
      stats: "1 pending urgent request | 5 units O- SOS fulfilled recently"
    },
    { 
      id: 4, 
      name: "District Trauma & Pediatric Hospital", 
      type: "hospital", 
      latitude: 21.7390, 
      longitude: 72.1480, 
      address: "Takhteshwar, Bhavnagar", 
      details: "Specialized pediatric ward. Current target area for A+ Platelet forecasting.", 
      stats: "Active alerts: high dengue platelet demand pings sent"
    },
    { 
      id: 5, 
      name: "Bhavnagar University Camp", 
      type: "camp", 
      latitude: 21.7500, 
      longitude: 72.1400, 
      address: "University Campus Hall, Bhavnagar", 
      details: "Student-led donation drive. Scheduled to start in 10 days.", 
      stats: "Target: 80 units | Pre-registered: 65 donors | Priority: High (O+)"
    },
    { 
      id: 6, 
      name: "GIDC Industrial Area Camp", 
      type: "camp", 
      latitude: 21.7850, 
      longitude: 72.1200, 
      address: "GIDC Welfare Hall, Bhavnagar", 
      details: "Factory outreach camp targeting high whole blood yield.", 
      stats: "Target: 120 units | Scheduled in 24 days | Priority: Medium"
    }
  ];

  const filteredLocations = filter === 'all' 
    ? locations 
    : locations.filter(loc => loc.type === filter);

  const getMarkerIcon = (type: 'bank' | 'hospital' | 'camp') => {
    if (type === 'bank') return bankIcon;
    if (type === 'hospital') return hospitalIcon;
    return campIcon;
  };

  const getIconColor = (type: 'bank' | 'hospital' | 'camp') => {
    if (type === 'bank') return 'text-crimson-500 fill-crimson-500/20';
    if (type === 'hospital') return 'text-indigo-400 fill-indigo-400/20';
    return 'text-amber-500 fill-amber-500/20';
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Regional Coverage & GIS Transfusion Grid</h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time spatial mapping of partner blood centers, trauma hospitals, and active mobile donation drives across Bhavnagar District.
          </p>
        </div>
        
        {/* Toggle Filters */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex gap-1">
          {[
            { id: 'all', label: 'Show All' },
            { id: 'bank', label: 'Blood Banks' },
            { id: 'hospital', label: 'Hospitals' },
            { id: 'camp', label: 'Camps' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filter === item.id 
                  ? 'bg-crimson-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Leaflet Real Interactive OpenStreetMap */}
        <div className="md:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden relative shadow-md h-[450px] z-10">
            {/* Map Watermark Header */}
            <div className="absolute top-4 left-4 text-xs font-bold text-slate-800 bg-white/95 border border-slate-200 px-3 py-1.5 rounded-lg z-[1000] shadow-sm backdrop-blur-md select-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE OPENSTREETMAP GRID (BHAVNAGAR DISTRICT)
            </div>

            {/* Leaflet MapContainer */}
            <MapContainer 
              center={[21.7600, 72.1450]} 
              zoom={13} 
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Connecting line to selected location from central bank */}
              {selectedLoc && (
                <Polyline 
                  positions={[
                    [21.7645, 72.1519],
                    [selectedLoc.latitude, selectedLoc.longitude]
                  ]}
                  pathOptions={{ color: '#dc2626', weight: 2.5, dashArray: '6, 8', opacity: 0.8 }}
                />
              )}

              {/* Render Leaflet Markers */}
              {filteredLocations.map(loc => (
                <Marker 
                  key={loc.id} 
                  position={[loc.latitude, loc.longitude]}
                  icon={getMarkerIcon(loc.type)}
                  eventHandlers={{
                    click: () => setSelectedLoc(loc),
                  }}
                >
                  <Popup className="leaflet-dark-popup">
                    <div className="p-1 font-sans">
                      <strong className="text-sm block font-bold text-slate-900">{loc.name}</strong>
                      <span className="text-xs text-slate-600 block mt-0.5">{loc.address}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-crimson-600 mt-1 block">{loc.type} portal</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar details card */}
        <div className="md:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Map className="w-5 h-5 text-crimson-600" /> Location Registry
          </h2>

          {selectedLoc ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center ${getIconColor(selectedLoc.type)}`}>
                    {selectedLoc.type === 'bank' ? <Building className="w-4 h-4" /> : 
                     selectedLoc.type === 'hospital' ? <Hospital className="w-4 h-4" /> : 
                     <Calendar className="w-4 h-4" />}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{selectedLoc.name}</h3>
                    <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">{selectedLoc.type} portal</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 leading-relaxed pt-2">
                  <p><strong className="text-slate-900">Address:</strong> {selectedLoc.address}</p>
                  <p><strong className="text-slate-900">Coordinates:</strong> {selectedLoc.latitude}° N, {selectedLoc.longitude}° E</p>
                  <p><strong className="text-slate-900">Description:</strong> {selectedLoc.details}</p>
                </div>
              </div>

              {/* Predictive Statistics Panel */}
              <div className="bg-crimson-50/60 p-4 rounded-2xl border border-crimson-100 space-y-2">
                <span className="flex items-center gap-1.5 text-xxs font-bold text-crimson-700 tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Status Indicators
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-bold">
                  {selectedLoc.stats}
                </p>
              </div>

              <button
                onClick={() => setSelectedLoc(null)}
                className="w-full py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
              >
                Clear Selection
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs py-20 flex flex-col items-center justify-center gap-3 shadow-sm">
              <MapPin className="w-8 h-8 text-crimson-500 animate-bounce" />
              <p>Select any marker on the OpenStreetMap canvas to inspect live spatial coordinates and stock details.</p>
            </div>
          )}
        </div>

      </div>

      {/* Network Blood Bank Operational Directory Section */}
      <section className="space-y-6 pt-6 border-t border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-crimson-600" /> Regional Blood Bank Network Directory
          </h2>
          <p className="text-slate-600 text-xs mt-1">
            Official licenses, cold chain storage specifications, and 24/7 emergency dispatch helplines for partner blood centers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">License: NBTC-GJ-2024-8891</span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">Bhavnagar District Blood Bank</h3>
                <p className="text-xs text-slate-500">Central Transfusion & Forecasting Hub</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold">24/7 Active</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
              <p><strong className="text-slate-900">Emergency Hotline:</strong> <a href="tel:+912782429000" className="text-crimson-600 font-bold hover:underline">+91 (278) 242-9000</a> / 1800-425-BLOOD</p>
              <p><strong className="text-slate-900">Address:</strong> M.G. Road, Near Sir T. Hospital, Bhavnagar 364001</p>
              <p><strong className="text-slate-900">Medical Director:</strong> Dr. Rajesh Varma (MD Transfusion Medicine)</p>
              <p><strong className="text-slate-900">Cold Chain Storage:</strong> -30°C Deep Freezers, 4°C Refrigerators, 22°C Agitated Incubators</p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Whole Blood", "PRBC", "Agitated Platelets", "FFP", "Cryoprecipitate"].map((cap, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">License: IRCS-GJ-2023-4102</span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">Red Cross Regional Blood Center</h3>
                <p className="text-xs text-slate-500">Industrial Zone Secondary Storage</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold">Dispatch Active</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
              <p><strong className="text-slate-900">Emergency Hotline:</strong> <a href="tel:+912782514433" className="text-crimson-600 font-bold hover:underline">+91 (278) 251-4433</a></p>
              <p><strong className="text-slate-900">Address:</strong> Chitra GIDC Industrial Zone, Bhavnagar 364004</p>
              <p><strong className="text-slate-900">Medical Director:</strong> Dr. Meera Patel</p>
              <p><strong className="text-slate-900">Cold Chain Storage:</strong> Dual Refrigerated Centrifuges, Component Separators</p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Whole Blood", "PRBC", "Platelet Concentrates", "FFP"].map((cap, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
