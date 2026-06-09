import React from 'react';
import {
  Scissors,
  Users,
  Ruler,
  ShoppingBag,
  CreditCard,
  UserCheck,
  BarChart3,
  Bell,
  Smartphone,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  isDarkMode: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, currentRole, isDarkMode }: SidebarProps) {
  // Define all menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['Owner', 'Manager'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['Owner', 'Manager'] },
    { id: 'measurements', label: 'Measurements', icon: Ruler, roles: ['Owner', 'Manager', 'Worker'] },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, roles: ['Owner', 'Manager', 'Worker'] },
    { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['Owner', 'Manager'] },
    { id: 'workers', label: 'Worker Desk', icon: UserCheck, roles: ['Owner', 'Manager'] },
    { id: 'portal', label: 'Customer Portal', icon: Smartphone, roles: ['Owner', 'Manager', 'Worker', 'Customer'] },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, roles: ['Owner', 'Manager'] },
    { id: 'notifications', label: 'Notification Logs', icon: Bell, roles: ['Owner', 'Manager'] },
  ];

  // Filter items based on simulated role access control
  const filteredItems = menuItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside
      className={`w-64 flex-shrink-0 flex flex-col border-r transition-colors duration-300 ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-stone-50 border-stone-200 text-stone-900'
      }`}
    >
      {/* Brand Logo Header */}
      <div className={`p-6 border-b flex items-center justify-between ${
        isDarkMode ? 'border-slate-800' : 'border-stone-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Scissors className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-wider block">Sartorial</span>
            <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-amber-500 block">Luxury Tailors</span>
          </div>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className={`mx-4 mt-4 p-3 rounded-lg flex items-center space-x-2 border ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-amber-50/50 border-amber-100'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          currentRole === 'Owner' ? 'bg-green-500' :
          currentRole === 'Manager' ? 'bg-indigo-500' :
          currentRole === 'Worker' ? 'bg-blue-500' : 'bg-purple-500'
        }`} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Security Access</p>
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`}>
            {currentRole} Mode
          </p>
        </div>
        <Sparkles className="h-4 w-4 text-emerald-500" />
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md'
                  : isDarkMode
                  ? 'text-stone-400 hover:bg-slate-800/80 hover:text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Icon className={`h-4 w-4 mr-3 transition-transform duration-300 ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </button>
          );
        })}
      </nav>

      {/* Brand Signature */}
      <div className={`p-4 border-t text-center text-[11px] ${
        isDarkMode ? 'border-slate-800 text-stone-500' : 'border-stone-200 text-stone-400'
      }`}>
        <p className="font-serif italic font-medium">Sartorial CRM v1.4</p>
        <p className="font-mono mt-0.5 text-[9px] uppercase tracking-widest text-[var(--color-gold-500)]">EST. 2026</p>
      </div>
    </aside>
  );
}
