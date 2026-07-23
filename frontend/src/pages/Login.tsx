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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative">
      {/* Top Left Navigation Back to Home Button */}
      <button
        onClick={() => setCurrentPage('landing')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-md transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4 text-crimson-600" />
        Back to Homepage
      </button>

      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-crimson-200/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-200/50 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl z-10">
        
        {/* Left column: Overview */}
        <div className="p-10 bg-slate-100/70 flex flex-col justify-between border-r border-slate-200">
          <button
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-3 text-left group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center shadow-md shadow-crimson-600/20 group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-crimson-600 transition-colors">HemoCast AI</h2>
              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                <ArrowLeft className="w-3 h-3 text-crimson-600" /> Return to Home
              </span>
            </div>
          </button>

          <div className="space-y-6 py-10">
            <h3 className="text-2xl font-bold leading-tight text-slate-900">
              Predictive Blood Supply Intelligence Network.
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Secure role-based authentication portal providing real-time inventory tracking, AI demand forecasting, and emergency dispatch workflows.
            </p>
            <div className="space-y-3.5">
              <div className="flex gap-3 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-crimson-600 mt-1.5"></span>
                <span><strong className="text-slate-900">Blood Bank Staff:</strong> Inventory management, ML forecasting, and donation camp scheduling.</span>
              </div>
              <div className="flex gap-3 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-crimson-600 mt-1.5"></span>
                <span><strong className="text-slate-900">Hospital Operations:</strong> Standard blood product ordering and emergency SOS dispatch.</span>
              </div>
              <div className="flex gap-3 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-crimson-600 mt-1.5"></span>
                <span><strong className="text-slate-900">Donors:</strong> Eligibility status, impact metrics, and regional shortage notifications.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xxs text-slate-500 font-bold">
            <Shield className="w-4 h-4 text-crimson-600" />
            <span>Secure Enterprise Single Sign-On Platform</span>
          </div>
        </div>

        {/* Right column: Login/Signup Card */}
        <div className="p-10 flex flex-col justify-center bg-white">
          {/* Toggle Tabs */}
          <div className="flex border-b border-slate-200 mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                isLogin ? 'border-crimson-600 text-crimson-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                !isLogin ? 'border-crimson-600 text-crimson-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-crimson-50 border border-crimson-200 text-xs text-crimson-700 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Portal Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600"
                  >
                    <option value="bank">Blood Bank Staff</option>
                    <option value="hospital">Hospital Staff</option>
                    <option value="donor">Volunteer Donor</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600"
              />
            </div>

            <div>
              <label className="block text-xxs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-crimson-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-crimson-600 hover:bg-crimson-700 text-white font-bold rounded-xl shadow-md shadow-crimson-600/20 transition-all"
            >
              {loading ? "Authenticating..." : (isLogin ? "Sign In" : "Register Account")}
            </button>
          </form>

          {/* Quick Access Roles */}
          {isLogin && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
                Quick Access Portal Switcher
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickLogin('bank')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xxs font-bold rounded-lg transition-all"
                >
                  <Building className="w-3.5 h-3.5 text-crimson-600" />
                  Blood Bank
                </button>
                <button
                  onClick={() => handleQuickLogin('hospital')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xxs font-bold rounded-lg transition-all"
                >
                  <Hospital className="w-3.5 h-3.5 text-crimson-600" />
                  Hospital
                </button>
                <button
                  onClick={() => handleQuickLogin('donor')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xxs font-bold rounded-lg transition-all"
                >
                  <User className="w-3.5 h-3.5 text-crimson-600" />
                  Donor
                </button>
                <button
                  onClick={() => handleQuickLogin('admin')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xxs font-bold rounded-lg transition-all"
                >
                  <Shield className="w-3.5 h-3.5 text-crimson-600" />
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
