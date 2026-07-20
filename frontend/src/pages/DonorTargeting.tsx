import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Users, 
  Search, 
  MapPin, 
  TrendingUp, 
  Send, 
  CheckSquare, 
  Square,
  Sparkles,
  Info
} from 'lucide-react';

interface DonorTargetingProps {
  triggerNotification: (title: string, message: string) => void;
}

export default function DonorTargeting({ triggerNotification }: DonorTargetingProps) {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [component, setComponent] = useState('Platelets');
  const [donors, setDonors] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [message, setMessage] = useState("URGENT: Bhavnagar Civil Hospital has a critical deficit of Platelets O+ tomorrow. Please visit the nearest center to donate. Your support saves lives.");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadDonors() {
    setLoading(true);
    try {
      const data = await api.getTargetDonors(bloodGroup, component);
      setDonors(data);
      // Pre-select top 3 eligible donors
      const eligibleIds = data.filter((d: any) => d.eligible).slice(0, 3).map((d: any) => d.id);
      setSelectedIds(eligibleIds);
    } catch (err) {
      console.error("Failed to load donors", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDonors();
  }, [bloodGroup, component]);

  // Adjust default message when inputs change
  useEffect(() => {
    setMessage(`URGENT: Bhavnagar Civil Hospital has a critical deficit of ${component} ${bloodGroup} tomorrow. Please visit the nearest center to donate. Your support saves lives.`);
  }, [bloodGroup, component]);

  const handleSelectToggle = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const eligibleDonors = donors.filter(d => d.eligible);
    if (selectedIds.length === eligibleDonors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleDonors.map(d => d.id));
    }
  };

  const handleSendOutreach = async () => {
    if (selectedIds.length === 0) return;
    setSending(true);

    try {
      const res = await api.notifyDonors(selectedIds, message);
      triggerNotification("Outreach Sent!", res.message);
      // Deselect all
      setSelectedIds([]);
    } catch {
      triggerNotification("Error", "Failed to send notifications.");
    } finally {
      setSending(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const components = ["Whole Blood", "Packed RBC", "Platelets", "FFP"];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto font-sans">
      <header>
        <h1 className="text-2xl font-bold text-white">Donor Target Recruiter</h1>
        <p className="text-slate-450 text-sm mt-1">
          Shortlists and ranks eligible donors by proximity, donation eligibility, and predicted response likelihood to minimize alert fatigue.
        </p>
      </header>

      {/* Target Config Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-850 flex flex-wrap gap-6 items-end justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required Blood Group</label>
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
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required Component</label>
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

        <div className="flex items-center gap-2 text-xxs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 max-w-md">
          <Info className="w-4 h-4 text-crimson-500 shrink-0" />
          <span>The donor model ranks O- universal donors and group-specific matches by historical response rates to prevent alert fatigue and over-messaging.</span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Ranked Donors List */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-crimson-500" /> Ranked Shortlist
            </h2>
            <button
              onClick={handleSelectAll}
              disabled={loading || donors.length === 0}
              className="text-xxs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
            >
              Select / Deselect All Eligible
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-t-crimson-600 border-slate-800 animate-spin"></div>
            </div>
          ) : donors.length > 0 ? (
            <div className="space-y-3">
              {donors.map(donor => (
                <div
                  key={donor.id}
                  onClick={() => donor.eligible && handleSelectToggle(donor.id)}
                  className={`glass-panel p-4.5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-200 ${
                    !donor.eligible ? 'opacity-40 cursor-not-allowed border-slate-900' :
                    selectedIds.includes(donor.id) ? 'border-crimson-700 bg-crimson-950/10 cursor-pointer shadow-md shadow-crimson-950/10' :
                    'border-slate-850 hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Checkbox Icon */}
                    {donor.eligible ? (
                      selectedIds.includes(donor.id) ? (
                        <CheckSquare className="w-5 h-5 text-crimson-500 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 hover:text-slate-400 shrink-0" />
                      )
                    ) : (
                      <Square className="w-5 h-5 text-slate-800 shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{donor.name}</span>
                        <span className="w-7 h-5 rounded bg-slate-900 border border-slate-800 text-[10px] font-black text-crimson-400 flex items-center justify-center">
                          {donor.blood_group}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xxs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-650" /> {donor.distance_km} km away
                        </span>
                        <span>
                          Donated: {donor.last_donation_days_ago === 999 ? 'Never' : `${donor.last_donation_days_ago} days ago`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Response Likelihood percentage */}
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Likelihood</span>
                    <span className={`text-sm font-extrabold ${
                      donor.response_likelihood >= 0.8 ? 'text-emerald-450' :
                      donor.response_likelihood >= 0.5 ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      {Math.round(donor.response_likelihood * 100)}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-950/20 p-8 rounded-2xl border border-slate-850 text-center text-slate-500 text-xs">
              No matching donors found.
            </div>
          )}
        </div>

        {/* Messaging Box Panel */}
        <div className="md:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-crimson-500" /> Outreach Campaign
          </h2>

          <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-5">
            <div className="space-y-2">
              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Message Content</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 resize-none leading-relaxed"
              />
              <span className="text-[10px] text-slate-500 block text-right font-medium">
                Sent as SMS (fallback for non-app users)
              </span>
            </div>

            <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Selected Recipients:</span>
                <span className="text-white font-bold">{selectedIds.length} Donors</span>
              </div>
            </div>

            <button
              onClick={handleSendOutreach}
              disabled={sending || selectedIds.length === 0}
              className="w-full py-3 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-500 hover:to-crimson-600 disabled:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? "Sending Messages..." : "Send Outreach Messages"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
