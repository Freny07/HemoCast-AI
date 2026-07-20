import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line } from 'recharts';
import { 
  Bot, 
  Sparkles, 
  Settings, 
  AlertTriangle, 
  CalendarCheck, 
  TrendingUp, 
  HelpCircle 
} from 'lucide-react';

export default function Forecast() {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [component, setComponent] = useState('Platelets');
  const [granularity, setGranularity] = useState('daily');
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      setLoading(true);
      try {
        const data = await api.getForecast(bloodGroup, component, granularity);
        setForecastData(data);
      } catch (err) {
        console.error("Failed to load forecast", err);
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, [bloodGroup, component, granularity]);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const components = ["Whole Blood", "Packed RBC", "Platelets", "FFP"];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto font-sans">
      <header>
        <h1 className="text-2xl font-bold text-white">AI Forecasting & Long-Horizon Planning</h1>
        <p className="text-slate-450 text-sm mt-1">
          ML-driven demand forecasting using scikit-learn models trained on climate data, disease surveillance, and scheduled surgical calendars.
        </p>
      </header>

      {/* Filter Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-850 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Blood Group Select */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-crimson-500"
            >
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* Component Select */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Component Type</label>
            <select
              value={component}
              onChange={e => setComponent(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-crimson-500"
            >
              {components.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Granularity Toggle */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right md:text-left">Time Granularity</label>
          <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-850 flex gap-1">
            {["daily", "weekly", "monthly"].map(g => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  granularity === g 
                    ? 'bg-crimson-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 rounded-full border-4 border-t-crimson-600 border-slate-800 animate-spin mx-auto"></div>
            <p className="text-slate-500 text-xs font-semibold">Fitting regression lines...</p>
          </div>
        </div>
      ) : forecastData ? (
        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Chart Panel */}
          <div className="md:col-span-8 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-850 relative">
              <div className="flex justify-between items-center pb-4 border-b border-slate-850 mb-6">
                <div>
                  <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Demand Curve</span>
                  <h3 className="text-base font-bold text-white">
                    Predicted Total: <span className="text-crimson-500">{forecastData.total_predicted} Units</span>
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-950/20 text-crimson-400 border border-crimson-900/10 text-xs font-bold">
                  <TrendingUp className="w-4 h-4" />
                  {forecastData.change_vs_average_percent >= 0 ? '+' : ''}{forecastData.change_vs_average_percent}% vs Average
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      tickFormatter={(dateStr) => {
                        const dateObj = new Date(dateStr);
                        if (granularity === 'daily') return dateObj.toLocaleDateString([], { weekday: 'short' });
                        if (granularity === 'weekly') return 'W' + dateObj.getDate();
                        return dateObj.toLocaleDateString([], { month: 'short' });
                      }}
                    />
                    <YAxis stroke="#475569" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any, name: any) => {
                        if (name === 'confidence_upper') return [value, 'Max Bound'];
                        if (name === 'confidence_lower') return [value, 'Min Bound'];
                        return [value, 'Predicted Demand'];
                      }}
                    />
                    
                    {/* Confidence band interval */}
                    <Area 
                      type="monotone" 
                      dataKey="confidence_upper" 
                      stroke="transparent" 
                      fill="#334155" 
                      fillOpacity={0.15} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confidence_lower" 
                      stroke="transparent" 
                      fill="#0b0f19" 
                      fillOpacity={1.0} // Mask bottom out
                    />

                    {/* Prediction Line */}
                    <Area 
                      type="monotone" 
                      dataKey="predicted_demand" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      fill="url(#colorForecast)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Confidence Band Legend */}
              <div className="flex justify-center gap-6 mt-4 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-1 bg-crimson-500 rounded"></span> ML Predicted Target
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-3 bg-slate-800/80 border border-slate-700/60 rounded"></span> 95% Confidence Interval Band
                </span>
              </div>
            </div>
            
            {/* High-Need Month Flag for Monthly View */}
            {granularity === 'monthly' && forecastData.change_vs_average_percent > 10 && (
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-5 flex gap-3.5 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">HIGH-NEED MONTH FLAG DETECTED</h4>
                  <p className="text-xxs text-slate-400 leading-relaxed">
                    Aggregate predictions for this period exceed historical averages by over 10%. Consider initiating early donation drive procurement at Alang Port and local universities — approximately {forecastData.change_vs_average_percent}% ahead of schedule.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Explainable AI Panel */}
          <div className="md:col-span-4 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-crimson-500" /> Explainable AI Panel
            </h2>

            <div className="glass-panel p-6 rounded-3xl border border-slate-850 space-y-6">
              
              {/* Attribution Factors */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contributing Features</span>
                {forecastData.drivers.map((d: any, idx: number) => (
                  <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-white">{d.factor}</span>
                      <span className={d.impact.includes('-') ? 'text-emerald-450' : 'text-crimson-400'}>
                        {d.impact}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{d.description}</p>
                  </div>
                ))}
              </div>

              {/* Recommended Actions */}
              <div className="pt-4 border-t border-slate-850/60 space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recommended Action</span>
                <div className="bg-crimson-950/20 border border-crimson-900/25 p-4 rounded-xl space-y-2">
                  <span className="flex items-center gap-1.5 text-xxs font-bold text-crimson-400">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> PRE-POSITION STRATEGY
                  </span>
                  <p className="text-xs text-white leading-relaxed font-semibold">
                    {forecastData.recommended_action}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="text-slate-400">Error rendering forecasting data.</div>
      )}
    </div>
  );
}
