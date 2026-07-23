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
  ShieldAlert,
  Thermometer
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
    { id: 'telemetry', label: 'Cold Chain IoT', icon: Thermometer, roles: ['bank', 'hospital', 'admin'] },
    { id: 'targeting', label: 'Donor Targeting', icon: Users, roles: ['bank', 'admin'] },
    { id: 'hospital', label: 'Hospital Orders', icon: FileText, roles: ['hospital', 'bank', 'admin'] },
    { id: 'map', label: 'Interactive Map', icon: Map, roles: ['public', 'bank', 'hospital', 'donor', 'admin'] },
    { id: 'about', label: 'Platform Architecture', icon: Layers, roles: ['public', 'bank', 'hospital', 'donor', 'admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-sm">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center shadow-md shadow-crimson-600/20 animate-pulse-soft">
          <Droplet className="w-6 h-6 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">HemoCast AI</h1>
          <span className="text-xs text-crimson-600 font-semibold tracking-wider uppercase">Transfusion Logistics</span>
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
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-crimson-600 text-white shadow-md shadow-crimson-600/25' 
                  : 'text-slate-600 hover:text-crimson-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-crimson-600'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Session Details */}
      <div className="p-4 border-t border-slate-100">
        {user ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-crimson-100 flex items-center justify-center border border-crimson-200">
                <span className="text-sm font-bold text-crimson-700">{user.name[0]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xxs text-slate-500 font-bold tracking-wide uppercase">{user.role}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCurrentPage('login')}
            className="w-full py-3 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-bold shadow-md shadow-crimson-600/20 transition-all"
          >
            Staff & Donor Login
          </button>
        )}
      </div>
    </aside>
  );
}
