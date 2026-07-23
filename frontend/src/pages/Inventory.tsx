import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Layers, 
  Plus, 
  Truck, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  HelpCircle,
  Clock
} from 'lucide-react';

interface InventoryProps {
  triggerNotification: (title: string, message: string) => void;
}

export default function Inventory({ triggerNotification }: InventoryProps) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [component, setComponent] = useState('Whole Blood');
  const [units, setUnits] = useState(5);
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadInventory() {
    try {
      const data = await api.getInventory();
      setInventory(data);
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const handleRedistribute = async (itemId: number, units: number, bg: string, comp: string, target: string) => {
    try {
      const res = await api.executeRedistribution(itemId);
      triggerNotification("Redistribution Successful", res.message);
      // Remove from list or mark as redirected
      setInventory(prev => prev.filter(item => item.id !== itemId));
    } catch {
      triggerNotification("Error", "Could not complete the redistribution transfer.");
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiryDate) return;
    setSubmitting(true);

    try {
      const newItem = await api.createInventoryItem({
        blood_group: bloodGroup,
        component: component,
        units: parseInt(units.toString()),
        expiry_date: expiryDate
      });
      triggerNotification("Stock Added", `Successfully registered ${units} units of ${bloodGroup} ${component}.`);
      setInventory(prev => [newItem, ...prev]);
      setShowAddForm(false);
      // Reset form
      setExpiryDate('');
    } catch (err) {
      triggerNotification("Error", "Failed to add inventory stock.");
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysToExpiry = (expiryDateStr: string) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryColor = (days: number) => {
    if (days <= 2) return 'bg-crimson-100 text-crimson-800 border border-crimson-200';
    if (days <= 5) return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  };

  const getExpiryText = (days: number) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires Today';
    if (days === 1) return 'Expires Tomorrow';
    return `Expires in ${days} days`;
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const components = ["Whole Blood", "Packed RBC", "Platelets", "FFP"];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Stock & Expiry Registry</h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time tracking of all blood units by type and expiry, with AI-powered redistribution routing.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-bold shadow-md shadow-crimson-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Newly Collected Stock
        </button>
      </header>

      {/* Add Stock Form Card */}
      {showAddForm && (
        <form onSubmit={handleAddStock} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md grid md:grid-cols-4 gap-6 items-end animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1.5">
            <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600"
            >
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Component</label>
            <select
              value={component}
              onChange={e => setComponent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600"
            >
              {components.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Units (Volume)</label>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={units}
              onChange={e => setUnits(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider">Expiry Date</label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600"
            />
          </div>
          <div className="md:col-span-4 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4.5 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold rounded-xl text-xs shadow-md shadow-crimson-600/20 transition-all"
            >
              {submitting ? "Registering..." : "Submit Registry"}
            </button>
          </div>
        </form>
      )}

      {/* Stock Grid Table */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 rounded-full border-4 border-t-crimson-600 border-slate-200 animate-spin mx-auto"></div>
            <p className="text-slate-600 text-xs font-bold">Reading inventory counts...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xxs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4.5">Blood Group</th>
                <th className="p-4.5">Component Type</th>
                <th className="p-4.5 text-center">Available Units</th>
                <th className="p-4.5">Expiry Countdown</th>
                <th className="p-4.5">Redistribution Suggestion</th>
                <th className="p-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item: any) => {
                const days = getDaysToExpiry(item.expiry_date);
                const isTransferrable = !!item.redistribution_target;
                
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 text-slate-800 font-medium">
                    <td className="p-4.5 font-bold text-slate-900 text-base">
                      <span className="w-8 h-8 rounded-lg bg-crimson-50 border border-crimson-100 flex items-center justify-center text-crimson-700 font-bold">
                        {item.blood_group}
                      </span>
                    </td>
                    <td className="p-4.5 text-slate-700">{item.component}</td>
                    <td className="p-4.5 text-center text-slate-900 font-bold">{item.units} Units</td>
                    <td className="p-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-bold ${getExpiryColor(days)}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {getExpiryText(days)}
                      </span>
                    </td>
                    <td className="p-4.5">
                      {isTransferrable ? (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xxs leading-relaxed">
                          <span className="flex items-center gap-1 text-amber-700 font-bold uppercase tracking-wide mb-1">
                            <Sparkles className="w-3 h-3 animate-pulse" /> AI recommendation
                          </span>
                          <p className="text-slate-700">Transfer to <strong className="text-slate-900">{item.redistribution_target}</strong></p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.redistribution_reason}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Stable (Keep locally)</span>
                      )}
                    </td>
                    <td className="p-4.5 text-right">
                      {isTransferrable ? (
                        <button
                          onClick={() => handleRedistribute(item.id, item.units, item.blood_group, item.component, item.redistribution_target)}
                          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-all"
                        >
                          <Truck className="w-3.5 h-3.5 text-crimson-600" />
                          Transfer Units
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center justify-end gap-1 px-3">
                          <Check className="w-3.5 h-3.5" /> No Action Needed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
