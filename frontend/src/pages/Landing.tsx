import React from 'react';
import { Droplet, ArrowRight, ShieldCheck, Zap, Repeat, HelpCircle, Bot, MapPin } from 'lucide-react';

interface LandingProps {
  setCurrentPage: (page: string) => void;
  user: any;
}

export default function Landing({ setCurrentPage, user }: LandingProps) {
  const shortages = [
    { blood: "O-", comp: "Packed RBC", location: "District Trauma Center", urgency: "Critical" },
    { blood: "A+", comp: "Platelets", location: "Civil Hospital", urgency: "High Need" },
    { blood: "AB-", comp: "Whole Blood", location: "Red Cross Bhavnagar", urgency: "Warning" },
    { blood: "O+", comp: "Platelets", location: "Monsoon Area Clinic", urgency: "High Need" }
  ];

  const handleNavigation = (isLogin: boolean, role: string) => {
    localStorage.setItem('login_preset_is_login', String(isLogin));
    localStorage.setItem('login_preset_role', role);
    setCurrentPage('login');
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Shortage Ticker */}
      <div className="bg-crimson-950/40 border-b border-crimson-900/30 py-3 overflow-hidden z-10">
        <div className="animate-ticker flex gap-12 text-xs font-semibold text-crimson-400">
          {[...shortages, ...shortages].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson-500 animate-ping"></span>
              <strong className="text-white bg-crimson-600/25 px-1.5 py-0.5 rounded border border-crimson-500/20">{item.blood}</strong> {item.comp} needed at <span className="underline">{item.location}</span> ({item.urgency})
            </span>
          ))}
        </div>
      </div>

      {/* Main Hero */}
      <main className="flex-1 max-w-7xl mx-auto px-6 flex flex-col justify-center py-20 relative">
        {/* Neon blur background effects */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-crimson-900/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-slate-900/40 rounded-full blur-[160px] pointer-events-none"></div>

        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-crimson-500"></span>
              Built for ImpactForge Hackathon
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              AI-Powered Blood <br />
              <span className="bg-gradient-to-r from-crimson-500 to-red-400 bg-clip-text text-transparent">
                Forecasting
              </span> <br />
              to Prevent Shortages.
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              HemoCast AI shifts blood management from reactive to predictive. By analyzing weather patterns, seasonal diseases, surgeries, and historical donations, we forecast demand and redirect surplus units before they expire.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              {user ? (
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-500 hover:to-crimson-600 text-white font-bold rounded-xl shadow-lg shadow-crimson-950/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Enter Control Center
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation(false, 'donor')}
                    className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-500 hover:to-crimson-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
                  >
                    Register as Donor
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleNavigation(true, 'hospital')}
                    className="px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
                  >
                    Hospital Portal
                  </button>
                  <button
                    onClick={() => handleNavigation(true, 'bank')}
                    className="px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
                  >
                    Blood Bank Portal
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            {/* Visual hero card - Glass panel with live stats mock */}
            <div className="w-full max-w-md glass-panel p-6 rounded-3xl relative border border-slate-800 shadow-2xl">
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-crimson-600/10 rounded-full blur-[40px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800/80">
                <span className="text-xs font-semibold text-slate-400">BHAVNAGAR DISTRICT LIVE</span>
                <span className="flex items-center gap-1.5 text-xxs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-900/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ACTIVE FORECASTS
                </span>
              </div>

              {/* Mock Chart representation */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">A+ Platelets (Dengue monsoon surge)</span>
                    <span className="text-crimson-400 font-bold">142% Predicted Demand</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800">
                    <div className="bg-gradient-to-r from-crimson-600 to-crimson-500 h-full rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">O+ Whole Blood (Regular Surgery week)</span>
                    <span className="text-slate-400">105% Predicted Demand</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800">
                    <div className="bg-gradient-to-r from-slate-700 to-slate-500 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800/60 mt-6 space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <Bot className="w-5 h-5 text-crimson-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Explainable AI Reasoning</h4>
                      <p className="text-slate-400 text-xxs leading-relaxed mt-1">
                        Rainfall +300% (Monsoon onset) is driving a surge in vector-borne mosquito activity. Hospital reports 4 dengue patients admitted. Platelet inventory health score: Critical.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How it works Section */}
      <section className="bg-slate-950/50 py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-white">Closing the Shortage Loop</h2>
            <p className="text-slate-400">HemoCast AI runs a continuous predictive loop connecting blood banks, local hospitals, and registered donors.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl border border-slate-900 relative">
              <div className="w-12 h-12 rounded-xl bg-crimson-600/10 flex items-center justify-center border border-crimson-600/30 text-crimson-500 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">1. Predict Shortfalls</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The ML engine trains on historical donation records, weather indices, disease reports, and hospital calendars to forecast specific shortages 1-7 days in advance.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-slate-900 relative">
              <div className="w-12 h-12 rounded-xl bg-crimson-600/10 flex items-center justify-center border border-crimson-600/30 text-crimson-500 mb-6">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">2. Auto-Notify Donors</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Instead of mass spam SMS, the algorithm ranks and contacts eligible, high-response donors based on their location, blood group suitability, and donation timelines.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-slate-900 relative">
              <div className="w-12 h-12 rounded-xl bg-crimson-600/10 flex items-center justify-center border border-crimson-600/30 text-crimson-500 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">3. Smart Redistribution</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Surfaced transfer alerts prompt blood bank directors to shift soon-to-expire units from surplus zones to high-need hospitals, preventing wastage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-slate-950 py-12 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-black text-white">142</div>
              <div className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Units Saved From Expiry</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-black text-white">58</div>
              <div className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Shortages Prevented</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-black text-white">&lt;1.5km</div>
              <div className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Average Donor Distance</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-black text-white">92%</div>
              <div className="text-slate-500 text-xs font-semibold tracking-wider uppercase">AI Forecasting Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950/80 border-t border-slate-900/60 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
          <p>© 2026 HemoCast AI. Built for the ImpactForge Hackathon.</p>
          <div className="flex gap-6">
            <button onClick={() => setCurrentPage('map')} className="hover:text-slate-350 transition-colors">Coverage Map</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
