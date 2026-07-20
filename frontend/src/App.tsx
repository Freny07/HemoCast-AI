import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatbotWidget from './components/ChatbotWidget';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Inventory from './pages/Inventory';
import DonorTargeting from './pages/DonorTargeting';
import HospitalRequest from './pages/HospitalRequest';
import InteractiveMap from './pages/InteractiveMap';
import AboutImpact from './pages/AboutImpact';


import { BellRing, X } from 'lucide-react';

interface Toast {
  title: string;
  message: string;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [toast, setToast] = useState<Toast | null>(null);

  // Load user from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem('hemocast_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('hemocast_user', JSON.stringify(userData));
    setCurrentPage('dashboard');
    triggerNotification("Access Granted", `Logged in successfully as ${userData.name}.`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hemocast_user');
    setCurrentPage('landing');
    triggerNotification("Logged Out", "You have signed out of your portal session.");
  };

  const triggerNotification = (title: string, message: string) => {
    setToast({ title, message });
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Page Routing Logic
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing setCurrentPage={setCurrentPage} user={user} />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard user={user} setCurrentPage={setCurrentPage} triggerNotification={triggerNotification} />;
      case 'forecast':
        return <Forecast />;
      case 'inventory':
        return <Inventory triggerNotification={triggerNotification} />;
      case 'targeting':
        return <DonorTargeting triggerNotification={triggerNotification} />;
      case 'hospital':
        return <HospitalRequest triggerNotification={triggerNotification} user={user} />;
      case 'map':
        return <InteractiveMap />;
      case 'about':
        return <AboutImpact />;
      default:
        return <Landing setCurrentPage={setCurrentPage} user={user} />;
    }
  };

  // Determine if layout should display sidebar
  const hasSidebar = user && !['landing', 'login'].includes(currentPage);

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans">
      {/* Toast Notification slide-in banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 w-80 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl flex gap-3 animate-in slide-in-from-right-6 duration-300">
          <div className="w-8 h-8 rounded-lg bg-crimson-600/10 flex items-center justify-center border border-crimson-600/30 text-crimson-500 shrink-0">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white leading-none">{toast.title}</h4>
            <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-500 hover:text-slate-350 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* App Sidebar navigation */}
      {hasSidebar && (
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}

      {/* Main Content Area Container */}
      <div className={`flex-1 flex flex-col ${hasSidebar ? 'pl-64' : ''}`}>
        {renderPage()}
      </div>

      {/* Persistent Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
