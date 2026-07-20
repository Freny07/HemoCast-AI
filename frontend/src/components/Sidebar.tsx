import React from 'react';
import { 
  LayoutDashboard, 
  LineChart, 
  Layers, 
  Users, 
  FileText, 
  Map, 
  Award, 
  LogOut, 
  Droplet,
  Globe,
  Settings,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
  onLogout: () => void;
}

export default function Sidebar({ currentPage, setCurrentPage, user, onLogout }: SidebarProps) {
  const role = user?.role || 'public';

  const menuItems = [
    { id: 'landing', label: 'Landing Page', icon: Globe, roles: ['public', 'bank', 'hospital', 'donor', 'admin'] },
    { id: 'dashboard', label: 'Control Center', icon: LayoutDashboard, roles: ['bank', 'hospital', 'donor', 'admin'] },
    { id: 'forecast', label: 'AI Forecasts', icon: LineChart, roles: ['bank', 'admin'] },
    { id: 'inventory', label: 'Inventory Stock', icon: Layers, roles: ['bank', 'admin'] },
    { id: 'targeting', label: 'Donor Targeting', icon: Users, roles: ['bank', 'admin'] },
    { id: 'hospital', label: 'Hospital Orders', icon: FileText, roles: ['hospital', 'bank', 'admin'] },
    { id: 'map', label: 'Interactive Map', icon: Map, roles: ['public', 'bank', 'hospital', 'donor', 'admin'] },
    { id: 'about', label: 'Evaluation Hub', icon: Award, roles: ['public', 'bank', 'hospital', 'donor', 'admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center shadow-lg shadow-crimson-900/40 animate-pulse-soft">
          <Droplet className="w-6 h-6 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">HemoCast AI</h1>
          <span className="text-xs text-crimson-500 font-semibold tracking-wider uppercase">Forecasting</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-crimson-600 to-crimson-700 text-white shadow-md shadow-crimson-900/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Session Details */}
      <div className="p-4 border-t border-slate-800/60">
        {user ? (
          <div className="space-y-4">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <span className="text-sm font-bold text-crimson-400">{user.name[0]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xxs text-slate-400 font-medium tracking-wide uppercase">{user.role}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-crimson-900 hover:bg-crimson-950/20 text-slate-400 hover:text-crimson-400 text-xs font-semibold transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setCurrentPage('login')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-sm font-semibold shadow-md transition-all duration-200"
          >
            Sign In / Sign Up
          </button>
        )}
      </div>
    </aside>
  );
}
