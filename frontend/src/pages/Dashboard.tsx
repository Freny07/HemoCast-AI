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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-crimson-600 border-r-transparent border-slate-300 animate-spin mx-auto"></div>
          <p className="text-slate-600 text-sm font-bold">Loading clinical dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-slate-900 p-10 font-bold">Error loading dashboard</div>;

  // 1. --- DONOR PORTAL VIEW ---
  if (user.role === 'donor') {
    return (
      <div className="p-8 space-y-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
        <header className="flex justify-between items-center pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {data.name}!</h1>
            <p className="text-slate-600 text-sm mt-1">Your donations keep the forecasting network alive and communities safe.</p>
          </div>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {data.eligibility}
          </span>
        </header>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-crimson-50 border border-crimson-100 flex items-center justify-center text-crimson-600">
              <Heart className="w-6 h-6 fill-crimson-600" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Total Lives Impacted</span>
              <p className="text-2xl font-extrabold text-slate-900">{data.impact_score} Points</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Donation Streak</span>
              <p className="text-2xl font-extrabold text-slate-900">{data.streak_weeks} Weeks</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Last Donation Date</span>
              <p className="text-lg font-bold text-slate-900">{data.last_donation}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Notifications Card */}
          <div className="md:col-span-7 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-crimson-600" /> Urgent Shortages
            </h2>
            {data.notifications.map((n: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-crimson-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded bg-crimson-100 text-crimson-700 text-xxs font-bold border border-crimson-200">Urgent Alert</span>
                  <span className="text-xxs text-slate-400 font-bold">Just Now</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{n.message}</p>
                <button 
                  onClick={() => setCurrentPage('map')}
                  className="px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {n.action}
                </button>
              </div>
            ))}
          </div>

          {/* Badges Gallery */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Unlocked Badges
            </h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {data.badges.map((b: string, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center flex flex-col items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200 shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">{b}</span>
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
      <div className="p-8 space-y-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
        <header className="flex flex-col md:flex-row justify-between md:items-center pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {data.name}!</h1>
            <p className="text-slate-600 text-sm mt-1">HemoCast AI monitors your supply levels and alerts nearby banks to prevent shortages.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage('hospital')}
              className="px-4.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-xl text-sm transition-all shadow-xs"
            >
              Order Blood
            </button>
            <button
              onClick={() => setCurrentPage('hospital')}
              className="px-4.5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold rounded-xl text-sm shadow-md shadow-crimson-600/20 transition-all animate-pulse"
            >
              One-Tap SOS
            </button>
          </div>
        </header>

        {/* Stats block */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Pending Orders</span>
              <p className="text-2xl font-extrabold text-slate-900">{data.pending_requests_count}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Fulfilled Orders</span>
              <p className="text-2xl font-extrabold text-slate-900">{data.fulfilled_requests_count}</p>
            </div>
          </div>
        </div>

        {/* Active tracking panel */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-crimson-600" /> Active Order Tracker
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xxs font-bold uppercase border-b border-slate-200">
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
                  <tr key={r.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50">
                    <td className="p-4 font-mono text-xs font-bold text-slate-500">#{r.id}</td>
                    <td className="p-4 text-crimson-700 font-bold">{r.blood_group}</td>
                    <td className="p-4 text-slate-600 font-medium">{r.component}</td>
                    <td className="p-4 text-center text-slate-900 font-extrabold">{r.units}</td>
                    <td className="p-4">
                      <span className={`text-xxs font-bold px-2 py-0.5 rounded border uppercase ${
                        r.urgency === 'emergency' ? 'bg-crimson-100 text-crimson-800 border-crimson-200' :
                        r.urgency === 'urgent' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {r.urgency}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{r.required_date}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xxs font-bold px-2.5 py-1 rounded-full uppercase ${
                        r.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        r.status === 'approved' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
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
    <div className="p-8 space-y-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{data.bank_name}</h1>
          <p className="text-slate-600 text-sm mt-1">AI-powered inventory management and demand forecasting hub.</p>
        </div>
        <button
          onClick={() => setCurrentPage('forecast')}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-bold shadow-md shadow-crimson-600/20 transition-all hover:scale-[1.02]"
        >
          <TrendingUp className="w-4 h-4" />
          View Long-Horizon Forecasts
        </button>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Units Saved From Expiry</span>
            <p className="text-2xl font-extrabold text-slate-900">{data.units_saved} Units</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-50 border border-crimson-100 flex items-center justify-center text-crimson-600">
            <Heart className="w-6 h-6 fill-crimson-600" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Shortages Prevented</span>
            <p className="text-2xl font-extrabold text-slate-900">{data.shortages_prevented}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Units at Expiry Risk</span>
            <p className="text-2xl font-extrabold text-slate-900">{data.expiry_risk_units} Units</p>
          </div>
        </div>
      </div>

      {/* AI Alert Banner */}
      {data.alert_banner && (
        <div className="bg-crimson-50 border border-crimson-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-crimson-100 border border-crimson-200 text-crimson-700 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-crimson-800">Predictive Intelligence Flag</span>
              <h3 className="text-base font-bold text-slate-900">{data.alert_banner.message}</h3>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 shadow-xs">
            <span className="flex items-center gap-1 font-bold text-slate-900 text-xxs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-crimson-600" /> Explainable AI Attribution
            </span>
            <p className="leading-relaxed font-medium">{data.alert_banner.reasoning}</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNotifyDonors}
              disabled={notifying}
              className="px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
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
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-crimson-600" /> Tomorrow's Demand Forecasts
          </h2>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            {data.demand_indicators.map((ind: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-center font-bold text-crimson-700 bg-crimson-50 px-1 py-0.5 rounded text-xxs border border-crimson-200">
                      {ind.blood_group}
                    </span>
                    <span className="text-slate-900">{ind.component}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Confidence</span>
                    <span className="text-emerald-700 font-bold">{ind.confidence}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 border border-slate-200">
                    <div 
                      className={`h-full rounded-full ${
                        ind.level.includes('High') ? 'bg-crimson-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${(ind.predicted_units / 20) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-900 font-bold w-12 text-right">
                    {ind.predicted_units} Units
                  </span>
                </div>
                
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Forecast Level: {ind.level}</span>
                  <span className="text-slate-700 font-bold">{ind.predicted_units} predicted needed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Expiry & Top Donors recommendations */}
        <div className="md:col-span-6 space-y-6">
          {/* Expiry Suggestion Card */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-crimson-600" /> Expiry Redistribution Suggestions
            </h2>
            {data.transfer_suggestion ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-bold text-xxs text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" /> EXPIRY RISK WARNING
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {data.transfer_suggestion.units} Units {data.transfer_suggestion.blood_group}
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-2 leading-relaxed font-medium">
                  <p><strong className="text-slate-900">Proposed Redistribution:</strong> Move to <span className="text-crimson-700 font-bold underline">{data.transfer_suggestion.target}</span>.</p>
                  <p className="text-slate-600 italic">Reasoning: {data.transfer_suggestion.reason}</p>
                </div>
                <button
                  onClick={() => handleRedistribute(data.transfer_suggestion.id)}
                  disabled={redistributing}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
                >
                  {redistributing ? "Executing redistribution..." : "Approve & Initiate Transfer"}
                </button>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs py-10 shadow-xs">
                All inventory levels are safe. No soon-to-expire surplus detected.
              </div>
            )}
          </div>

          {/* Top Donor targeting card */}
          {data.donor_suggestion && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-crimson-600" /> AI-Recommended Outreach
              </h2>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Recipient Group Match</span>
                  <h4 className="text-sm font-bold text-slate-900">{data.donor_suggestion.name} ({data.donor_suggestion.blood_group})</h4>
                  <p className="text-xxs text-emerald-700 font-bold">Eligible. Streak: {data.donor_suggestion.streak} weeks. Contact: {data.donor_suggestion.contact}</p>
                </div>
                <button
                  onClick={() => setCurrentPage('targeting')}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all shrink-0"
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
