import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Droplet, Shield, Lock, User, Hospital, Building, Award, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  setCurrentPage: (page: string) => void;
}

export default function Login({ onLoginSuccess, setCurrentPage }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('bank'); // Default role for signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const isLoginPreset = localStorage.getItem('login_preset_is_login');
    const rolePreset = localStorage.getItem('login_preset_role');
    if (isLoginPreset !== null) {
      setIsLogin(isLoginPreset === 'true');
      localStorage.removeItem('login_preset_is_login');
    }
    if (rolePreset !== null) {
      setRole(rolePreset);
      if (rolePreset === 'bank') {
        setUsername('bank');
        setPassword('password123');
      } else if (rolePreset === 'hospital') {
        setUsername('hospital');
        setPassword('password123');
      } else if (rolePreset === 'donor') {
        setUsername('donor');
        setPassword('password123');
      }
      localStorage.removeItem('login_preset_role');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const data = await api.login(username, password);
        onLoginSuccess(data);
        setCurrentPage('dashboard');
      } else {
        const data = await api.signup({ username, password, email, role, name });
        // After signup, automatically login
        const loginData = await api.login(username, password);
        onLoginSuccess(loginData);
        setCurrentPage('dashboard');
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleName: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.login(roleName, "password123");
      onLoginSuccess(data);
      setCurrentPage('dashboard');
    } catch (err: any) {
      setError("Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-6 font-sans relative">
      {/* Top Left Navigation Back to Home Button */}
      <button
        onClick={() => setCurrentPage('landing')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold shadow-xl transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4 text-crimson-500" />
        Back to Homepage
      </button>

      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-crimson-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-900/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl z-10">
        
        {/* Left column: Overview */}
        <div className="p-10 bg-slate-900/60 flex flex-col justify-between border-r border-slate-800/80">
          <button
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-3 text-left group transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-crimson-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-crimson-400 transition-colors">HemoCast AI</h2>
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <ArrowLeft className="w-3 h-3 text-crimson-500" /> Return to Home
              </span>
            </div>
          </button>

          <div className="space-y-6 py-10">
            <h3 className="text-2xl font-bold leading-tight text-white">
              Predictive Blood Supply Intelligence Network.
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Secure role-based authentication portal providing real-time inventory tracking, AI demand forecasting, and emergency dispatch workflows.
            </p>
            <div className="space-y-3.5">
              <div className="flex gap-3 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-crimson-500 mt-1.5"></span>
                <span><strong>Blood Bank Staff:</strong> Inventory management, ML forecasting, and donation camp scheduling.</span>
              </div>
              <div className="flex gap-3 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-crimson-500 mt-1.5"></span>
                <span><strong>Hospital Operations:</strong> Standard blood product ordering and emergency SOS dispatch.</span>
              </div>
              <div className="flex gap-3 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-crimson-500 mt-1.5"></span>
                <span><strong>Donors:</strong> Eligibility status, impact metrics, and regional shortage notifications.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xxs text-slate-500">
            <Shield className="w-4 h-4 text-crimson-500" />
            <span>Secure Enterprise Single Sign-On Platform</span>
          </div>
        </div>

        {/* Right column: Login/Signup Card */}
        <div className="p-10 flex flex-col justify-center bg-slate-950/45">
          {/* Toggle Tabs */}
          <div className="flex border-b border-slate-800 mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
                isLogin ? 'border-crimson-500 text-white' : 'border-transparent text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
                !isLogin ? 'border-crimson-500 text-white' : 'border-transparent text-slate-400'
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-crimson-950/40 border border-crimson-900/40 text-xs text-crimson-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-crimson-500"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-crimson-500"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Portal Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-crimson-500"
                  >
                    <option value="bank">Blood Bank Staff</option>
                    <option value="hospital">Hospital Staff</option>
                    <option value="donor">Volunteer Donor</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-crimson-500"
              />
            </div>

            <div>
              <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-crimson-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-500 hover:to-crimson-600 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {loading ? "Authenticating..." : (isLogin ? "Sign In" : "Register Account")}
            </button>
          </form>

          {/* Quick Access Roles */}
          {isLogin && (
            <div className="mt-8 pt-6 border-t border-slate-900">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
                Quick Access Portal Switcher
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickLogin('bank')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-200 text-xxs font-semibold rounded-lg transition-all"
                >
                  <Building className="w-3.5 h-3.5 text-crimson-500" />
                  Blood Bank
                </button>
                <button
                  onClick={() => handleQuickLogin('hospital')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-200 text-xxs font-semibold rounded-lg transition-all"
                >
                  <Hospital className="w-3.5 h-3.5 text-crimson-500" />
                  Hospital
                </button>
                <button
                  onClick={() => handleQuickLogin('donor')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-200 text-xxs font-semibold rounded-lg transition-all"
                >
                  <User className="w-3.5 h-3.5 text-crimson-500" />
                  Donor
                </button>
                <button
                  onClick={() => handleQuickLogin('admin')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-200 text-xxs font-semibold rounded-lg transition-all"
                >
                  <Shield className="w-3.5 h-3.5 text-crimson-500" />
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
