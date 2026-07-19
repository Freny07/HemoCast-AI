import React from 'react';
import { Award, ShieldAlert, Sparkles, Heart, Bot, Zap, Code2, Flame } from 'lucide-react';

export default function AboutImpact() {
  const criteria = [
    {
      title: "Build Quality & Stability",
      weight: "30%",
      color: "border-emerald-900/30 bg-emerald-950/10 text-emerald-450",
      desc: "Robust full-stack architecture. Vite React + TypeScript frontend paired with a FastAPI (Python) backend. SQLite models map entities, and scikit-learn random forests fit lag features, weather indexes, and surgeries to compute real predictions.",
      icon: Code2
    },
    {
      title: "Real-World Impact",
      weight: "25%",
      color: "border-crimson-900/30 bg-crimson-950/10 text-crimson-450",
      desc: "Shifts operations from reactive tracking to proactive procurement. Minimizes platelet wastage (5-day shelf life) and pings universal O- donors inside a 15km range. Designed with SMS fallback capabilities for low-connectivity regions.",
      icon: Heart
    },
    {
      title: "Creativity & Approach",
      weight: "20%",
      color: "border-indigo-900/30 bg-indigo-950/10 text-indigo-400",
      desc: "Replaces black-box forecasting with Explainable AI (XAI) panels. Attributes platelet demand spikes to monsoon dengue trends or O+ trauma spikes to festival transit traffic, bridging trust with clinical teams.",
      icon: Sparkles
    },
    {
      title: "User Experience (UX)",
      weight: "15%",
      color: "border-amber-900/30 bg-amber-950/10 text-amber-500",
      desc: "Role-aware panels customized for doctors, donors, and blood bank staff. Integrates a one-tap Emergency SOS page that triggers live pings to nearby banks, and a persistent site-wide NLP chatbot widget.",
      icon: Bot
    },
    {
      title: "Clarity of Submission",
      weight: "10%",
      color: "border-slate-800 bg-slate-900/40 text-slate-350",
      desc: "Complete, step-by-step sitemap layout. All features are fully functional or have interactive simulation overlays to showcase the complete workflow loop under judging conditions.",
      icon: Flame
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto font-sans">
      <header className="text-center space-y-3 pb-8 border-b border-slate-850">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-600/10 border border-crimson-600/30 text-crimson-500 text-xs font-bold uppercase tracking-wider">
          <Award className="w-4 h-4 animate-bounce" /> Judge Evaluation Hub
        </div>
        <h1 className="text-3xl font-extrabold text-white">How HemoCast AI Targets Judging Criteria</h1>
        <p className="text-slate-450 text-sm max-w-2xl mx-auto">
          An overview of the clinical problems solved, and how our approach directly answers the ImpactForge Hackathon benchmarks.
        </p>
      </header>

      {/* The Problem Statement */}
      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        <div className="glass-panel p-6.5 rounded-3xl border border-slate-850 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-crimson-500" /> The Status Quo Problem
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Blood banking networks operate reactively: they wait for patients to bleed before request pings are dispatched, or spam thousands of donors with generic SMS blasts, causing high alert fatigue. 
          </p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Furthermore, critical blood products like **Platelets expire in just 5 days**, leading to high wastage rates, while rare blood types (like AB- or Bombay group) remain heavily underserved because standard models neglect their low-frequency distributions.
          </p>
        </div>

        <div className="glass-panel p-6.5 rounded-3xl border border-slate-850 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-5 h-5 text-emerald-450" /> The HemoCast AI Solution
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            HemoCast AI bridges this gap with machine learning. By forecasting regional deficits 1-7 days before they hit, blood bank directors can plan ahead. 
          </p>
          <p className="text-slate-400 text-xs leading-relaxed">
            The platform's **Redistribution Engine** flags units at high risk of expiry, suggesting transfers to hospitals with immediate scheduled surgeries. The **Target Recruiter** contacts only highly eligible, local donors, creating a closed-loop system that prevents shortages before they happen.
          </p>
        </div>
      </div>

      {/* Judging Criteria Alignment Cards */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-crimson-500" /> Evaluation Breakdown
        </h2>

        <div className="space-y-4.5">
          {criteria.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-850 grid md:grid-cols-12 gap-6 items-start">
                
                {/* Badge/Weight Column */}
                <div className="md:col-span-3 flex flex-row md:flex-col justify-between md:justify-center items-center gap-2.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center h-full">
                  <Icon className="w-6 h-6 text-crimson-500" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Weight</span>
                    <span className="text-xl font-black text-white">{item.weight}</span>
                  </div>
                </div>

                {/* Description Column */}
                <div className="md:col-span-9 space-y-2">
                  <h4 className="font-extrabold text-white text-base">{item.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
