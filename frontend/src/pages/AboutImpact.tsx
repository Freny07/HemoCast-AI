import React from 'react';
import { ShieldAlert, Sparkles, Heart, Bot, Zap, Code2, Layers, Cpu } from 'lucide-react';

export default function AboutImpact() {
  const pillars = [
    {
      title: "Predictive ML Infrastructure",
      badge: "Core Engine",
      color: "border-emerald-900/30 bg-emerald-950/10 text-emerald-450",
      desc: "Robust full-stack architecture built with React, TypeScript, and FastAPI. Scikit-Learn Random Forest models evaluate historical lag features, weather indices, disease surveillance data, and surgical calendars to generate 1-7 day demand forecasts.",
      icon: Code2
    },
    {
      title: "Clinical & Emergency Dispatch",
      badge: "Emergency SOS",
      color: "border-crimson-900/30 bg-crimson-950/10 text-crimson-450",
      desc: "Shifts operations from reactive tracking to proactive dispatch. Minimizes platelet wastage (5-day shelf life) and dispatches automated alerts to eligible universal (O-) donors within a 15km radius with SMS and WhatsApp fallbacks.",
      icon: Heart
    },
    {
      title: "Explainable AI (XAI) Transparency",
      badge: "Model Interpretability",
      color: "border-indigo-900/30 bg-indigo-950/10 text-indigo-400",
      desc: "Replaces black-box forecasting with Explainable AI panels. Directly attributes demand spikes to monsoon dengue vectors, seasonal fever trends, or scheduled elective surgeries, establishing trust with clinical personnel.",
      icon: Sparkles
    },
    {
      title: "Role-Aware Enterprise UX",
      badge: "Multi-Role Access",
      color: "border-amber-900/30 bg-amber-950/10 text-amber-500",
      desc: "Role-customized dashboards tailored for clinicians, blood bank directors, and donors. Features an integrated NLP chatbot widget for querying stock levels, expiry dates, and demand projections in plain language.",
      icon: Bot
    },
    {
      title: "Automated Supply Chain Redistribution",
      badge: "Waste Reduction",
      color: "border-slate-800 bg-slate-900/40 text-slate-350",
      desc: "Closed-loop inventory optimization system that identifies near-expiry blood products and automatically routes transfer recommendations to high-demand regional hospitals.",
      icon: Layers
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto font-sans">
      <header className="text-center space-y-3 pb-8 border-b border-slate-850">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-600/10 border border-crimson-600/30 text-crimson-500 text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-4 h-4" /> System Architecture & Whitepaper
        </div>
        <h1 className="text-3xl font-extrabold text-white">Platform Technical Architecture & Impact</h1>
        <p className="text-slate-450 text-sm max-w-2xl mx-auto">
          An architectural overview of how HemoCast AI prevents blood supply deficits through machine learning, explainable AI, and dynamic redistribution.
        </p>
      </header>

      {/* The Problem Statement */}
      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        <div className="glass-panel p-6.5 rounded-3xl border border-slate-850 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-crimson-500" /> The Status Quo Problem
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Traditional blood banking operates reactively — waiting for emergency shortages before requests are dispatched, or blasting thousands of donors with un-targeted alerts, causing severe response fatigue.
          </p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Furthermore, critical blood components such as <strong>Platelets expire in just 5 days</strong>, leading to high spoilage rates, while rare blood groups remain heavily underserved without predictive planning.
          </p>
        </div>

        <div className="glass-panel p-6.5 rounded-3xl border border-slate-850 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-5 h-5 text-emerald-450" /> The HemoCast AI Solution
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            HemoCast AI bridges this gap with predictive machine learning. By forecasting regional deficits 1 to 7 days in advance, health networks can adjust procurement proactively.
          </p>
          <p className="text-slate-400 text-xs leading-relaxed">
            The platform's <strong>Redistribution Engine</strong> flags units at high risk of expiry, directing transfers to hospitals with imminent surgical needs, while the <strong>Donor Recruiter</strong> contacts nearby eligible donors based on response likelihood.
          </p>
        </div>
      </div>

      {/* Architecture Pillars */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-crimson-500" /> Core System Pillars
        </h2>

        <div className="space-y-4.5">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-850 grid md:grid-cols-12 gap-6 items-start">
                
                {/* Pillar Icon & Badge */}
                <div className="md:col-span-3 flex flex-row md:flex-col justify-between md:justify-center items-center gap-2.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center h-full">
                  <Icon className="w-6 h-6 text-crimson-500" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pillar 0{idx + 1}</span>
                    <span className="text-xs font-bold text-white">{item.badge}</span>
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
