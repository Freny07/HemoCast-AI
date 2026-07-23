import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { 
  Thermometer, 
  ShieldAlert, 
  Cpu, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Wind, 
  RefreshCw,
  BellRing,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface ColdChainTelemetryProps {
  triggerNotification: (title: string, message: string) => void;
}

export default function ColdChainTelemetry({ triggerNotification }: ColdChainTelemetryProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activeAlert, setActiveAlert] = useState<any>(null);

  async function loadTelemetry() {
    try {
      const res = await api.getTelemetryData();
      setData(res);
    } catch (err) {
      console.error("Failed to load cold chain telemetry", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTelemetry();
    // Auto-refresh telemetry data every 10 seconds for real-time monitoring feel
    const interval = setInterval(() => {
      loadTelemetry();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateBreach = async () => {
    setSimulating(true);
    try {
      const res = await api.simulateTelemetryBreach("UNIT-PLT-03");
      if (res.success) {
        setActiveAlert(res.alert);
        triggerNotification("CRITICAL THERMAL BREACH", res.alert.recommended_protocol);
        // Force state update to reflect simulated breach
        setData((prev: any) => {
          if (!prev) return prev;
          const updatedUnits = prev.units.map((u: any) => {
            if (u.id === "UNIT-PLT-03") {
              return { ...u, current_temp: 25.4, status: "critical", door_status: "CRITICAL BREACH (25.4°C)" };
            }
            return u;
          });
          return { ...prev, overall_status: "critical", breach_alerts_count: prev.breach_alerts_count + 1, units: updatedUnits };
        });
      }
    } catch {
      triggerNotification("Error", "Could not simulate breach.");
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-crimson-600 border-r-transparent border-slate-300 animate-spin mx-auto"></div>
          <p className="text-slate-600 text-sm font-bold">Connecting to Cold Chain IoT Telemetry Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" /> IoT Cold Chain Monitoring Suite
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Live Cold Storage & Thermal Telemetry</h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time IoT sensor telemetry tracking thermal stability, compressor load, and excursion protocols for blood freezers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadTelemetry}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Refresh Signals
          </button>
          <button
            onClick={handleSimulateBreach}
            disabled={simulating}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-bold shadow-md shadow-crimson-600/20 transition-all animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            {simulating ? "Simulating..." : "Simulate Thermal Breach"}
          </button>
        </div>
      </header>

      {/* Critical Alert Banner if breach active */}
      {activeAlert && (
        <div className="bg-crimson-50 border border-crimson-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-crimson-100 border border-crimson-200 text-crimson-700 shrink-0">
                <BellRing className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-crimson-800 uppercase tracking-wider">CRITICAL THERMAL BREACH DETECTED</span>
                <h3 className="text-base font-bold text-slate-900">{activeAlert.unit_name} Excursion Warning ({activeAlert.current_temp}°C)</h3>
              </div>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase"
            >
              Dismiss Alert
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <p className="font-bold text-slate-900">🚨 Recommended Action Protocol:</p>
            <p className="font-medium text-slate-600">{activeAlert.recommended_protocol}</p>
            <p className="text-[11px] text-emerald-700 font-bold pt-1">
              ✓ Automated Priority Alert Dispatched to On-Call Bio-Medical Officer ({activeAlert.sms_sent_to})
            </p>
          </div>
        </div>
      )}

      {/* Overview Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Overall System Health</span>
            <p className="text-lg font-extrabold text-slate-900 uppercase">{data.overall_status === 'optimal' ? 'Optimal' : 'Excursion Warning'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-50 border border-crimson-100 flex items-center justify-center text-crimson-600">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Monitored Storage Units</span>
            <p className="text-2xl font-extrabold text-slate-900">{data.active_units} Units</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Active Excursions</span>
            <p className="text-2xl font-extrabold text-slate-900">{data.breach_alerts_count} Flagged</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Avg Cold Room Humidity</span>
            <p className="text-2xl font-extrabold text-slate-900">45.4% RH</p>
          </div>
        </div>
      </div>

      {/* Storage Unit Live Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-crimson-600" /> Storage Units Live Sensors
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {data.units.map((unit: any) => {
            const isWarning = unit.status === 'warning' || unit.status === 'critical';
            return (
              <div 
                key={unit.id}
                className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-all ${
                  isWarning ? 'border-crimson-300 ring-2 ring-crimson-100' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{unit.id} • {unit.location}</span>
                    <h3 className="text-base font-bold text-slate-900">{unit.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{unit.type}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xxs font-bold uppercase border ${
                    isWarning ? 'bg-crimson-100 text-crimson-800 border-crimson-200 animate-pulse' :
                    'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {unit.status === 'optimal' ? 'Optimal' : 'Excursion Risk'}
                  </span>
                </div>

                {/* Temperature Gauge & Safe Bounds */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Min Safe</span>
                    <span className="text-xs font-bold text-slate-700">{unit.min_safe_temp}°C</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Temp</span>
                    <span className={`text-lg font-extrabold ${isWarning ? 'text-crimson-600' : 'text-slate-900'}`}>
                      {unit.current_temp}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Max Safe</span>
                    <span className="text-xs font-bold text-slate-700">{unit.max_safe_temp}°C</span>
                  </div>
                </div>

                {/* Telemetry Metrics: Load & Humidity */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Compressor Motor Load</span>
                    <span className="font-bold text-slate-900">{unit.compressor_load}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                    <div 
                      className={`h-full rounded-full ${unit.compressor_load > 90 ? 'bg-crimson-600' : 'bg-emerald-600'}`}
                      style={{ width: `${unit.compressor_load}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
                    <span>Door Status: <strong className="text-slate-800">{unit.door_status}</strong></span>
                    <span>Humidity: <strong className="text-slate-800">{unit.humidity}% RH</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 24-Hour Thermal Stability Graph */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Telemetry Logs</span>
            <h3 className="text-base font-bold text-slate-900">24-Hour Thermal Oscillations & Bounds</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
            <Activity className="w-4 h-4 text-emerald-600" /> Sensor Frequency: 1 Hz
          </span>
        </div>

        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#475569', fontWeight: '600' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#475569', fontWeight: '600' }} domain={[-35, 30]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              
              {/* Thermal Lines */}
              <Line type="monotone" dataKey="prbc_temp" name="PRBC Refrigerator (°C)" stroke="#2563eb" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="ffp_temp" name="FFP Deep Freezer (°C)" stroke="#9333ea" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="platelet_temp" name="Platelet Agitator (°C)" stroke="#e11d48" strokeWidth={2.5} dot={false} />

              {/* Threshold Lines */}
              <ReferenceLine y={24} label={{ value: 'Platelet Max (24°C)', fill: '#e11d48', fontSize: 10, fontWeight: 'bold' }} stroke="#e11d48" strokeDasharray="4 4" />
              <ReferenceLine y={6} label={{ value: 'PRBC Max (6°C)', fill: '#2563eb', fontSize: 10, fontWeight: 'bold' }} stroke="#2563eb" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-8 text-xs text-slate-600 font-bold pt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-blue-600 rounded-full"></span> PRBC Refrigerator (Target: 4°C)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-purple-600 rounded-full"></span> FFP Cryo Freezer (Target: -30°C)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-crimson-600 rounded-full"></span> Platelet Incubator (Target: 22°C)
          </span>
        </div>
      </div>

    </div>
  );
}
