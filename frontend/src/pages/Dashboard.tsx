import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { 
  ShieldAlert, 
  TrendingUp, 
  Sparkles, 
  UserCheck, 
  Truck, 
  Activity, 
  Heart, 
  Calendar,
  AlertTriangle,
  Award,
  BellRing
} from 'lucide-react';

interface DashboardProps {
  user: any;
  setCurrentPage: (page: string) => void;
  triggerNotification: (title: string, message: string) => void;
}

export default function Dashboard({ user, setCurrentPage, triggerNotification }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);
  const [redistributing, setRedistributing] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const res = await api.getDashboardSummary(user.role, user.userId);
        setData(res);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#070b13]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-crimson-600 border-r-transparent border-slate-800 animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm font-medium">Querying predictive databases...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-white p-10">Error loading dashboard</div>;

  // 1. --- DONOR PORTAL VIEW ---
  if (user.role === 'donor') {
    return (
      <div className="p-8 space-y-8 max-w-6xl mx-auto">
        <header className="flex justify-between items-center pb-6 border-b border-slate-850">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {data.name}!</h1>
            <p className="text-slate-400 text-sm">Your donations make a real-world predictive difference.</p>
          </div>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {data.eligibility}
          </span>
        </header>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-crimson-600/10 border border-crimson-600/30 flex items-center justify-center text-crimson-500">
              <Heart className="w-6 h-6 fill-crimson-600" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Total Lives Impacted</span>
              <p className="text-2xl font-extrabold text-white">{data.impact_score} Points</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Active Streaks</span>
              <p className="text-2xl font-extrabold text-white">{data.streak_weeks} Weeks</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Last Donation Date</span>
              <p className="text-lg font-bold text-white">{data.last_donation}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Notifications Card */}
          <div className="md:col-span-7 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-crimson-500" /> Urgently Pinned Shortages
            </h2>
            {data.notifications.map((n: any, idx: number) => (
              <div key={idx} className="bg-slate-900/60 p-6 rounded-2xl border border-crimson-900/20 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded bg-crimson-600/20 text-crimson-400 text-xxs font-bold border border-crimson-500/20">Urgents</span>
                  <span className="text-xxs text-slate-500">Just Now</span>
                </div>
                <h3 className="text-base font-bold text-white">{n.title}</h3>
                <p className="text-slate-450 text-sm leading-relaxed">{n.message}</p>
                <button 
                  onClick={() => setCurrentPage('map')}
                  className="px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-crimson-950/50"
                >
                  {n.action}
                </button>
              </div>
            ))}
          </div>

          {/* Badges Gallery */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Unlocked Badges
            </h2>
            <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {data.badges.map((b: string, idx: number) => (
                  <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center flex flex-col items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. --- HOSPITAL PORTAL VIEW ---
  if (user.role === 'hospital') {
    return (
      <div className="p-8 space-y-8 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between md:items-center pb-6 border-b border-slate-850 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {data.name}!</h1>
            <p className="text-slate-400 text-sm">HemoCast AI monitors requests to prevent stock bottlenecks.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage('hospital')}
              className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-250 font-bold rounded-xl text-sm transition-all"
            >
              Order Blood
            </button>
            <button
              onClick={() => setCurrentPage('hospital')}
              className="px-4.5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-crimson-950/30 transition-all animate-pulse"
            >
              One-Tap SOS
            </button>
          </div>
        </header>

        {/* Stats block */}
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Pending Orders</span>
              <p className="text-2xl font-extrabold text-white">{data.pending_requests_count}</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Fulfilled Orders</span>
              <p className="text-2xl font-extrabold text-white">{data.fulfilled_requests_count}</p>
            </div>
          </div>
        </div>

        {/* Active tracking panel */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-crimson-500" /> Active Order Tracker
          </h2>
          <div className="glass-panel rounded-2xl border border-slate-850 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xxs font-bold uppercase border-b border-slate-850">
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Group</th>
                  <th className="p-4">Component</th>
                  <th className="p-4 text-center">Units</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Required Date</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_requests.map((r: any) => (
                  <tr key={r.id} className="border-b border-slate-850 text-slate-350 hover:bg-slate-900/15">
                    <td className="p-4 font-mono text-xs">#{r.id}</td>
                    <td className="p-4 text-white font-bold">{r.blood_group}</td>
                    <td className="p-4 text-slate-450">{r.component}</td>
                    <td className="p-4 text-center text-white font-semibold">{r.units}</td>
                    <td className="p-4">
                      <span className={`text-xxs font-bold px-2 py-0.5 rounded border uppercase ${
                        r.urgency === 'emergency' ? 'bg-crimson-950/20 text-crimson-400 border-crimson-900/20' :
                        r.urgency === 'urgent' ? 'bg-amber-950/20 text-amber-400 border-amber-900/20' :
                        'bg-slate-900 text-slate-400 border-slate-850'
                      }`}>
                        {r.urgency}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{r.required_date}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xxs font-bold px-2.5 py-1 rounded-full uppercase ${
                        r.status === 'fulfilled' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20' :
                        r.status === 'approved' ? 'bg-indigo-950/20 text-indigo-400 border border-indigo-900/20' :
                        'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. --- BLOOD BANK & ADMIN VIEW ---
  const handleNotifyDonors = async () => {
    setNotifying(true);
    try {
      const donors = await api.getTargetDonors(data.alert_banner.target_blood_group, data.alert_banner.target_component);
      const donorIds = donors.filter((d: any) => d.eligible).slice(0, 3).map((d: any) => d.id);
      
      const res = await api.notifyDonors(
        donorIds, 
        `URGENT ALERT: HemoCast AI has predicted a critical shortfall for Platelets A+ tomorrow. Please visit the nearest center to donate.`
      );
      triggerNotification("Outreach Sent!", res.message);
    } catch {
      triggerNotification("Error", "Could not send pings.");
    } finally {
      setNotifying(false);
    }
  };

  const handleRedistribute = async (itemId: number) => {
    setRedistributing(true);
    try {
      const res = await api.executeRedistribution(itemId);
      triggerNotification("Redistribution Initiated", res.message);
      // Remove transfer suggestion locally to simulate change
      setData((prev: any) => ({
        ...prev,
        transfer_suggestion: null,
        units_saved: prev.units_saved + prev.transfer_suggestion.units
      }));
    } catch {
      triggerNotification("Error", "Transfer execution failed.");
    } finally {
      setRedistributing(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center pb-6 border-b border-slate-850">
        <div>
          <h1 className="text-2xl font-bold text-white">{data.bank_name}</h1>
          <p className="text-slate-400 text-sm">Predictive Inventory Management Control Center.</p>
        </div>
        <button
          onClick={() => setCurrentPage('forecast')}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-bold shadow-md shadow-crimson-950/40 transition-all hover:scale-[1.02]"
        >
          <TrendingUp className="w-4 h-4" />
          View Long-Horizon Forecasts
        </button>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Units Saved From Expiry</span>
            <p className="text-2xl font-extrabold text-white">{data.units_saved} Units</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-600/10 border border-crimson-600/30 flex items-center justify-center text-crimson-500">
            <Heart className="w-6 h-6 fill-crimson-600" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Shortages Prevented</span>
            <p className="text-2xl font-extrabold text-white">{data.shortages_prevented} Times</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Units at Expiry Risk</span>
            <p className="text-2xl font-extrabold text-white">{data.expiry_risk_units} Units</p>
          </div>
        </div>
      </div>

      {/* AI Alert Banner */}
      {data.alert_banner && (
        <div className="bg-gradient-to-r from-crimson-950/50 to-slate-900 border border-crimson-900/35 rounded-2xl p-6 space-y-4">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-crimson-500/10 border border-crimson-500/30 text-crimson-500 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-crimson-400">Predictive Intelligence Flag</span>
              <h3 className="text-base font-bold text-white">{data.alert_banner.message}</h3>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-850 text-xs text-slate-350 space-y-2">
            <span className="flex items-center gap-1 font-bold text-white text-xxs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-crimson-500" /> Explainable AI Attribution
            </span>
            <p className="leading-relaxed">{data.alert_banner.reasoning}</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNotifyDonors}
              disabled={notifying}
              className="px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-crimson-950/40"
            >
              {notifying ? "Sending notifications..." : data.alert_banner.action_text}
            </button>
          </div>
        </div>
      )}

      {/* Two Column Bottom Grid */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Left Column: Tomorrow's Demand Forecast (Progress Bars) */}
        <div className="md:col-span-6 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-crimson-500" /> Tomorrow's Demand Forecasts
          </h2>
          
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-5">
            {data.demand_indicators.map((ind: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-center font-bold text-crimson-500 bg-crimson-500/10 px-1 py-0.5 rounded text-xxs border border-crimson-500/15">
                      {ind.blood_group}
                    </span>
                    <span className="text-white">{ind.component}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Confidence:</span>
                    <span className="text-emerald-400 font-bold">{ind.confidence}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-slate-950 rounded-full h-2.5 border border-slate-850">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${
                        ind.level.includes('High') ? 'from-crimson-600 to-crimson-500' : 'from-slate-700 to-slate-500'
                      }`}
                      style={{ width: `${(ind.predicted_units / 20) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white font-bold w-12 text-right">
                    {ind.predicted_units} Units
                  </span>
                </div>
                
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Forecast Level: {ind.level}</span>
                  <span className="text-slate-400 font-medium">{ind.predicted_units} predicted needed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Expiry & Top Donors recommendations */}
        <div className="md:col-span-6 space-y-6">
          {/* Expiry Suggestion Card */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-crimson-500" /> Expiry Redistribution建议
            </h2>
            {data.transfer_suggestion ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-bold text-xxs text-amber-500 bg-amber-950/20 px-2.5 py-1 rounded-full border border-amber-900/10">
                    <AlertTriangle className="w-3.5 h-3.5" /> EXPIRY RISK WARNING
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    {data.transfer_suggestion.units} Units {data.transfer_suggestion.blood_group}
                  </span>
                </div>
                <div className="text-xs text-slate-350 space-y-2 leading-relaxed">
                  <p><strong>Proposed Redistribution:</strong> Move to <span className="text-white underline">{data.transfer_suggestion.target}</span>.</p>
                  <p className="text-slate-450 italic">Reasoning: {data.transfer_suggestion.reason}</p>
                </div>
                <button
                  onClick={() => handleRedistribute(data.transfer_suggestion.id)}
                  disabled={redistributing}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all shadow-inner"
                >
                  {redistributing ? "Executing redistribution..." : "Approve & Initiate Transfer"}
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/30 p-8 rounded-2xl border border-slate-850 text-center text-slate-500 text-xs py-10">
                All inventory levels are safe. No soon-to-expire surplus detected.
              </div>
            )}
          </div>

          {/* Top Donor targeting card */}
          {data.donor_suggestion && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-crimson-500" /> AI-Recommended Outreach
              </h2>
              <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Recipient Group Match</span>
                  <h4 className="text-sm font-bold text-white">{data.donor_suggestion.name} ({data.donor_suggestion.blood_group})</h4>
                  <p className="text-xxs text-emerald-450 font-medium">Eligible. Streak: {data.donor_suggestion.streak} weeks. Contact: {data.donor_suggestion.contact}</p>
                </div>
                <button
                  onClick={() => setCurrentPage('targeting')}
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-all shrink-0 shadow-sm"
                >
                  Contact
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
