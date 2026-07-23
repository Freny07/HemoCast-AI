import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  FileText, 
  Plus, 
  ShieldAlert, 
  Send, 
  Activity, 
  CheckCircle, 
  Users, 
  Building,
  BellRing,
  X
} from 'lucide-react';

interface HospitalRequestProps {
  triggerNotification: (title: string, message: string) => void;
  user: any;
}

export default function HospitalRequest({ triggerNotification, user }: HospitalRequestProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Standard Form State
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [component, setComponent] = useState('Whole Blood');
  const [units, setUnits] = useState(5);
  const [urgency, setUrgency] = useState('normal');
  const [requiredDate, setRequiredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // SOS Simulation State
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosBloodGroup, setSosBloodGroup] = useState('O-');
  const [sosComponent, setSosComponent] = useState('Packed RBC');
  const [sosUnits, setSosUnits] = useState(4);
  const [sosNotes, setSosNotes] = useState('');
  const [sosResult, setSosResult] = useState<any>(null);
  const [sosSimulating, setSosSimulating] = useState(false);

  async function loadRequests() {
    try {
      const data = await api.getHospitalRequests(user?.userId || 2);
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredDate) return;
    setSubmitting(true);

    try {
      const newReq = await api.submitBloodRequest({
        blood_group: bloodGroup,
        component: component,
        units: parseInt(units.toString()),
        urgency: urgency,
        required_date: requiredDate,
        notes: notes
      });
      triggerNotification("Request Filed", `Successfully filed request for ${units} units of ${bloodGroup} ${component}.`);
      setRequests(prev => [newReq, ...prev]);
      
      // Reset form
      setRequiredDate('');
      setNotes('');
      setUrgency('normal');
    } catch {
      triggerNotification("Error", "Failed to file request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSosSimulating(true);
    setSosResult(null);

    try {
      const res = await api.triggerEmergencySos({
        blood_group: sosBloodGroup,
        component: sosComponent,
        units: parseInt(sosUnits.toString()),
        notes: sosNotes || "TRAUMA EMERGENCY SOS TRIGGERED"
      });
      setSosResult(res);
      triggerNotification("SOS Broadcasted!", res.message);
      // Reload request list to show the new SOS request
      loadRequests();
    } catch {
      triggerNotification("Error", "SOS broadcast failed.");
    } finally {
      setSosSimulating(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const components = ["Whole Blood", "Packed RBC", "Platelets", "FFP"];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Request Portal</h1>
          <p className="text-slate-600 text-sm mt-1">
            File standard replenishment orders or trigger an emergency SOS broadcast to alert regional blood bank networks.
          </p>
        </div>
        <button
          onClick={() => setShowSosModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-crimson-600 hover:bg-crimson-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-crimson-600/20 hover:scale-105 active:scale-95 transition-all animate-pulse"
        >
          <ShieldAlert className="w-4.5 h-4.5" />
          ONE-TAP EMERGENCY SOS
        </button>
      </header>

      {/* Main Grid: Form on Left, Active Tracking on Right */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Form Panel */}
        <div className="md:col-span-5 space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-crimson-600" /> New Blood Request
          </h2>

          <form onSubmit={handleSubmitRequest} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
                >
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Component Type</label>
                <select
                  value={component}
                  onChange={e => setComponent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
                >
                  {components.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Units Required</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={units}
                  onChange={e => setUnits(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Required Date</label>
              <input
                type="date"
                required
                value={requiredDate}
                onChange={e => setRequiredDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Clinical Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Diagnostic reason, recipient details..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-crimson-600 resize-none leading-relaxed font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-2 bg-crimson-600 hover:bg-crimson-700 text-white font-bold rounded-xl text-xs shadow-md shadow-crimson-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Filing Request..." : "File Request"}
            </button>
          </form>
        </div>

        {/* Requests List */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-crimson-600" /> Filed Requests History
          </h2>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-t-crimson-600 border-slate-200 animate-spin"></div>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-3.5">
              {requests.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-5 rounded bg-crimson-50 border border-crimson-200 text-[10px] font-extrabold text-crimson-700 flex items-center justify-center">
                        {r.blood_group}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{r.component} — {r.units} Units</h4>
                    </div>
                    {r.notes && <p className="text-xxs text-slate-600 italic">Notes: {r.notes}</p>}
                    <div className="text-[10px] text-slate-500 font-bold">
                      Required by: {r.required_date} | Request ID: #{r.id}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase block text-center ${
                      r.urgency === 'emergency' ? 'bg-crimson-100 text-crimson-800 border-crimson-200' :
                      r.urgency === 'urgent' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {r.urgency}
                    </span>
                    <span className={`text-xxs font-bold px-2.5 py-1 rounded-full uppercase block text-center ${
                      r.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      r.status === 'approved' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs py-12 shadow-xs">
              No requested blood units logged yet.
            </div>
          )}
        </div>

      </div>

      {/* EMERGENCY SOS MODAL SIMULATION */}
      {showSosModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-crimson-50 border-b border-crimson-100 flex justify-between items-center">
              <div className="flex items-center gap-3 text-slate-900">
                <ShieldAlert className="w-6 h-6 text-crimson-600 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">ONE-TAP SOS BROADCAST CENTER</h3>
                  <span className="text-xxs text-crimson-800 font-bold uppercase tracking-wider">Broadcasting emergency beacon to all regional networks</span>
                </div>
              </div>
              <button 
                onClick={() => { setShowSosModal(false); setSosResult(null); }}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {!sosResult ? (
                <form onSubmit={handleTriggerSOS} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Triggering the SOS beacon immediately bypasses standard order delays. It searches neighboring banks for matching stock and contacts all eligible universal/matching donors within 15 km via priority SMS and WhatsApp.
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Blood Group</label>
                      <select
                        value={sosBloodGroup}
                        onChange={e => setSosBloodGroup(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
                      >
                        {bloodGroups.map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Component</label>
                      <select
                        value={sosComponent}
                        onChange={e => setSosComponent(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
                      >
                        {components.map(comp => (
                          <option key={comp} value={comp}>{comp}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Units Needed</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={sosUnits}
                        onChange={e => setSosUnits(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Emergency Reason (trauma, postpartum hemorrhage...)</label>
                    <input
                      type="text"
                      required
                      value={sosNotes}
                      onChange={e => setSosNotes(e.target.value)}
                      placeholder="e.g., Acute postpartum hemorrhage. Active ICU patient."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sosSimulating}
                    className="w-full py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-extrabold rounded-xl text-sm shadow-md shadow-crimson-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-5 h-5" />
                    {sosSimulating ? "CONNECTING TO EMERGENCY NETWORKS..." : "BROADCAST EMERGENCY SOS"}
                  </button>
                </form>
              ) : (
                /* Simulation Results display */
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">SOS Broadcast Initiated Successfully</h4>
                      <p className="text-xxs text-slate-600 font-medium mt-0.5">{sosResult.message}</p>
                    </div>
                  </div>

                  {/* Contacted Banks */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-crimson-600" /> Paged Regional Blood Banks
                    </h5>
                    <div className="grid md:grid-cols-2 gap-3.5">
                      {sosResult.banks_notified.map((bank: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{bank.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{bank.distance_km} km away | Contact: {bank.contact}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                            {bank.units_available} Units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contacted Donors */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-crimson-600" /> Contacted Local Matching Donors (Priority SMS)
                    </h5>
                    <div className="space-y-2">
                      {sosResult.donors_contacted.map((donor: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{donor.name}</span>
                            <span className="w-6 h-4 bg-crimson-50 text-xxs font-extrabold text-crimson-700 flex items-center justify-center rounded border border-crimson-200">
                              {donor.blood_group}
                            </span>
                          </div>
                          <div className="text-right text-[10px] text-slate-500 font-medium">
                            {donor.distance_km} km away | SMS Paged: {donor.contact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => { setShowSosModal(false); setSosResult(null); }}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-200"
                    >
                      Close SOS Monitor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
