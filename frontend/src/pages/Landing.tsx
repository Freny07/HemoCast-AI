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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Shortage Ticker */}
      <div className="bg-crimson-50 border-b border-crimson-100 py-3 overflow-hidden z-10 shadow-xs">
        <div className="animate-ticker flex gap-12 text-xs font-bold text-crimson-700">
          {[...shortages, ...shortages].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-crimson-600 animate-ping"></span>
              <strong className="text-crimson-900 bg-crimson-100 px-2 py-0.5 rounded border border-crimson-200">{item.blood}</strong> {item.comp} needed at <span className="underline font-extrabold">{item.location}</span> ({item.urgency})
            </span>
          ))}
        </div>
      </div>

      {/* Main Hero */}
      <main className="flex-1 max-w-7xl mx-auto px-6 flex flex-col justify-center py-16 relative">
        {/* Soft background glow */}
        <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-crimson-200/40 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-slate-200/50 rounded-full blur-[160px] pointer-events-none"></div>

        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-slate-700 text-xs font-bold">
              <span className="flex h-2 w-2 rounded-full bg-crimson-600"></span>
              Live Predictive Intelligence Network
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
              AI-Powered Blood <br />
              <span className="text-crimson-600">
                Forecasting
              </span> <br />
              to Prevent Shortages.
            </h1>

            <p className="text-slate-600 text-lg leading-relaxed max-w-xl font-medium">
              HemoCast AI shifts blood management from reactive to predictive — analyzing weather patterns, seasonal disease trends, surgical schedules, and historical donations to forecast demand and redirect surplus units before they expire.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              {user ? (
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="flex items-center gap-2 px-6 py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold rounded-xl shadow-md shadow-crimson-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Enter Control Center
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation(false, 'donor')}
                    className="flex items-center gap-2 px-5 py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold rounded-xl shadow-md shadow-crimson-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
                  >
                    Register as Donor
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleNavigation(true, 'hospital')}
                    className="px-5 py-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
                  >
                    Hospital Portal
                  </button>
                  <button
                    onClick={() => handleNavigation(true, 'bank')}
                    className="px-5 py-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
                  >
                    Blood Bank Portal
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            {/* Visual hero card - White panel with live stats */}
            <div className="w-full max-w-md bg-white p-6 rounded-3xl relative border border-slate-200 shadow-xl">
              
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500">BHAVNAGAR DISTRICT LIVE</span>
                <span className="flex items-center gap-1.5 text-xxs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVE FORECASTS
                </span>
              </div>

              {/* Chart representation */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900">A+ Platelets (Dengue monsoon surge)</span>
                    <span className="text-crimson-600 font-bold">142% Predicted Demand</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-200">
                    <div className="bg-crimson-600 h-full rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900">O+ Whole Blood (Routine Surgery Week)</span>
                    <span className="text-slate-500 font-semibold">105% Predicted Demand</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-200">
                    <div className="bg-slate-400 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mt-6 space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <Bot className="w-5 h-5 text-crimson-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Explainable AI Reasoning</h4>
                      <p className="text-slate-600 text-xs leading-relaxed mt-1">
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
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Closing the Shortage Loop</h2>
            <p className="text-slate-600 font-medium">HemoCast AI runs a continuous predictive cycle — connecting blood banks, hospitals, and registered donors to prevent shortages before they happen.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-crimson-100 flex items-center justify-center border border-crimson-200 text-crimson-600 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">1. Predict Shortfalls</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our ML engine trains on historical donation records, weather indices, disease reports, and hospital surgical calendars to forecast specific blood shortages 1–7 days in advance.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-crimson-100 flex items-center justify-center border border-crimson-200 text-crimson-600 mb-6">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">2. Auto-Notify Donors</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Instead of generic mass SMS blasts, the algorithm ranks and contacts eligible, high-response donors based on their proximity, blood group suitability, and donation history — eliminating alert fatigue.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-crimson-100 flex items-center justify-center border border-crimson-200 text-crimson-600 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">3. Smart Redistribution</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                AI-generated transfer alerts prompt blood bank directors to move soon-to-expire units from surplus zones to high-need hospitals, preventing wastage of critical blood products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-extrabold text-white">142</div>
              <div className="text-slate-400 text-xs font-bold tracking-wider uppercase">Units Saved From Expiry</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-extrabold text-white">58</div>
              <div className="text-slate-400 text-xs font-bold tracking-wider uppercase">Shortages Prevented</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-extrabold text-white">&lt;1.5km</div>
              <div className="text-slate-400 text-xs font-bold tracking-wider uppercase">Average Donor Distance</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-extrabold text-white">92%</div>
              <div className="text-slate-400 text-xs font-bold tracking-wider uppercase">AI Forecasting Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-medium">
          <p>© 2026 HemoCast AI. All rights reserved. Real-time predictive blood supply management.</p>
          <div className="flex gap-6">
            <button onClick={() => setCurrentPage('map')} className="hover:text-slate-900 transition-colors font-bold">Coverage Map</button>
            <button onClick={() => setCurrentPage('about')} className="hover:text-slate-900 transition-colors font-bold">Platform Architecture</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
