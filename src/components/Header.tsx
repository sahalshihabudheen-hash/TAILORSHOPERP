import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  User,
  X,
  Mail,
  Smartphone,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { UserRole, NotificationLog } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  notifications: NotificationLog[];
  onSearch: (term: string) => void;
  currentUserEmail?: string;
  onLogoutCustomer?: () => void;
  onOpenGlobalSearch?: (term: string) => void;
}

export default function Header({
  currentRole,
  setCurrentRole,
  isDarkMode,
  setIsDarkMode,
  notifications,
  currentUserEmail,
  onLogoutCustomer,
  onOpenGlobalSearch
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onOpenGlobalSearch) {
      onOpenGlobalSearch(value);
    }
  };

  const pendingNotifications = notifications.slice(0, 5); // Take recent 5 info logs

  return (
    <header
      className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
      }`}
    >
      {/* Universal Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search customers, unique IDs, order status (e.g. CUST-101, ORD-9841)..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 transition-all ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500 focus:ring-amber-500'
                : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-amber-500 focus:ring-amber-500'
            }`}
          />
        </div>
      </div>

      {/* Control Actions Panel */}
      <div className="flex items-center space-x-4">
        {/* Testing Role Switcher */}
        <div className={`p-1 rounded-xl flex items-center space-x-1.5 border ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-250'
        }`}>
          <div className="flex items-center px-2 py-0.5 space-x-1 text-[10px] uppercase font-bold text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            <span>Simulate Role:</span>
          </div>
          {(['Owner', 'Manager', 'Worker', 'Customer'] as UserRole[]).map((role) => {
            const isSelected = currentRole === role;
            return (
              <button
                key={role}
                onClick={() => {
                  setCurrentRole(role);
                  // If switching from customer we can trigger a simulated logout if active
                  if (role !== 'Customer' && onLogoutCustomer) {
                    onLogoutCustomer();
                  }
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-sm'
                    : isDarkMode
                    ? 'text-stone-400 hover:text-white hover:bg-slate-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {/* Dark Mode Theme Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-xl border hover:opacity-80 transition-all ${
            isDarkMode ? 'border-slate-700 text-amber-400 hover:bg-slate-800' : 'border-stone-250 text-stone-600 hover:bg-stone-100'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Automated System Bulletins Toggler */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className={`p-2 rounded-xl border relative hover:opacity-80 transition-all ${
              isDarkMode ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-stone-250 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Floating dropdown menu for Notifications */}
          {showNotificationMenu && (
            <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border flex flex-col overflow-hidden z-50 ${
              isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-stone-200 text-stone-800'
            }`}>
              <div className="p-4 border-b flex items-center justify-between">
                <h4 className="font-bold text-sm">Automated Alerts Log (Live)</h4>
                <button
                  onClick={() => setShowNotificationMenu(false)}
                  className="p-1 hover:bg-stone-100 rounded"
                >
                  <X className="h-4 w-4 text-stone-400" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400">
                    No active communications triggered yet.
                  </div>
                ) : (
                  notifications.slice(0, 8).map((not) => (
                    <div key={not.id} className="p-3 hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-all">
                      <div className="flex items-start justify-between space-x-2">
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase ${
                          not.type === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {not.type}
                        </span>
                        <span className="text-[9px] text-stone-400">
                          {new Date(not.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-300 mt-1 font-mono leading-tight break-words">
                        {not.message}
                      </p>
                      <div className="flex items-center space-x-1.5 mt-1.5 text-[9px] text-emerald-500">
                        <CheckCircle className="h-3 w-3" />
                        <span className="font-semibold uppercase tracking-wider">Dispatched to {not.recipient}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-stone-50 dark:bg-slate-900 border-t text-center text-[10px] text-stone-500 dark:text-stone-400">
                Triggers emails & WhatsApp messages live as status is updated.
              </div>
            </div>
          )}
        </div>

        {/* Display Active Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l dark:border-slate-800 border-stone-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold">
              {currentRole === 'Customer' ? currentUserEmail?.split('@')[0] || 'Client Guest' : 'Administrator'}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-amber-500 font-bold">
              {currentRole}
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/10">
            {currentRole === 'Customer' ? (
              <User className="h-4 w-4" />
            ) : (
              <span className="font-serif text-sm">S</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
