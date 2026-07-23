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
    <div className="p-8 space-y-8 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Donor Target Recruiter</h1>
        <p className="text-slate-600 text-sm mt-1">
          Shortlists and ranks eligible donors by proximity, donation eligibility, and predicted response likelihood to minimize alert fatigue.
        </p>
      </header>

      {/* Target Config Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Required Blood Group</label>
            <select
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
            >
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Required Component</label>
            <select
              value={component}
              onChange={e => setComponent(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
            >
              {components.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 max-w-md font-medium">
          <Info className="w-4 h-4 text-crimson-600 shrink-0" />
          <span>The donor model ranks O- universal donors and group-specific matches by historical response rates to prevent alert fatigue and over-messaging.</span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Ranked Donors List */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-crimson-600" /> Ranked Shortlist
            </h2>
            <button
              onClick={handleSelectAll}
              disabled={loading || donors.length === 0}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider"
            >
              Select / Deselect All Eligible
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-t-crimson-600 border-slate-200 animate-spin"></div>
            </div>
          ) : donors.length > 0 ? (
            <div className="space-y-3">
              {donors.map(donor => (
                <div
                  key={donor.id}
                  onClick={() => donor.eligible && handleSelectToggle(donor.id)}
                  className={`p-4.5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-200 ${
                    !donor.eligible ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200' :
                    selectedIds.includes(donor.id) ? 'border-crimson-600 bg-crimson-50/60 cursor-pointer shadow-sm' :
                    'bg-white border-slate-200 hover:border-slate-300 cursor-pointer shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Checkbox Icon */}
                    {donor.eligible ? (
                      selectedIds.includes(donor.id) ? (
                        <CheckSquare className="w-5 h-5 text-crimson-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-slate-600 shrink-0" />
                      )
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{donor.name}</span>
                        <span className="w-7 h-5 rounded bg-crimson-50 border border-crimson-200 text-[10px] font-extrabold text-crimson-700 flex items-center justify-center">
                          {donor.blood_group}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {donor.distance_km} km away
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
                      donor.response_likelihood >= 0.8 ? 'text-emerald-700' :
                      donor.response_likelihood >= 0.5 ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                      {Math.round(donor.response_likelihood * 100)}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs shadow-xs">
              No matching donors found.
            </div>
          )}
        </div>

        {/* Messaging Box Panel */}
        <div className="md:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-crimson-600" /> Outreach Campaign
          </h2>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="space-y-2">
              <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Message Content</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-crimson-600 resize-none leading-relaxed font-medium"
              />
              <span className="text-[10px] text-slate-500 block text-right font-bold">
                Sent as SMS (fallback for non-app users)
              </span>
            </div>

            <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Selected Recipients:</span>
                <span className="text-slate-900 font-extrabold">{selectedIds.length} Donors</span>
              </div>
            </div>

            <button
              onClick={handleSendOutreach}
              disabled={sending || selectedIds.length === 0}
              className="w-full py-3 bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-crimson-600/20 transition-all flex items-center justify-center gap-2"
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
