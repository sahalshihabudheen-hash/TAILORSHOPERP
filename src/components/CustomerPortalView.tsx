import React, { useState } from 'react';
import {
  Smartphone,
  Lock,
  Mail,
  User,
  ShoppingBag,
  Clock,
  Ruler,
  FileText,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  Eye,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Customer, Order, MeasurementRecord, OrderStatus } from '../types';
import { sha256 } from '../utils/storage';

interface CustomerPortalProps {
  customers: Customer[];
  orders: Order[];
  measurements: MeasurementRecord[];
  onUpdateCustomerPassword: (id: string, newPass: string) => void;
  isDarkMode: boolean;
  onNavigateToTab: (tab: string) => void;
}

const ALL_STATUS_STAGES: OrderStatus[] = [
  'Order Received',
  'Measurement Taken',
  'Cutting',
  'Stitching',
  'Finishing',
  'Ready for Pickup',
  'Delivered'
];

export default function CustomerPortalView({
  customers,
  orders,
  measurements,
  onUpdateCustomerPassword,
  isDarkMode,
  onNavigateToTab
}: CustomerPortalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [activePortalCustomer, setActivePortalCustomer] = useState<Customer | null>(null);

  // Forced password update screen variables
  const [isForcedResetCodeOpen, setIsForcedResetCodeOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePortalLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      alert('Password credentials required.');
      return;
    }

    // Try finding customer matching email
    const match = customers.find((c) => c.email.toLowerCase().trim() === emailInput.toLowerCase().trim());
    if (!match) {
      alert('Wrong email credentials. Please check with your workshop tailor to ensure your customer email is registered.');
      return;
    }

    // Use default first login pass as customer Unique ID if not changed
    const isMatched = 
      (match.password && match.password === passwordInput) || 
      (match.password && match.password === sha256(passwordInput)) ||
      (!match.password && match.id === passwordInput);

    if (!isMatched) {
      alert(`Wrong password. Try entering ${match.password ? 'your password' : match.id} to access.`);
      return;
    }

    // Check if this is their first login (passwordChanged === false)
    if (!match.passwordChanged) {
      setActivePortalCustomer(match);
      setIsForcedResetCodeOpen(true);
    } else {
      setActivePortalCustomer(match);
    }
  };

  const handlePasswordResetComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 5) {
      alert('Password must consist of at least 5 letters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (activePortalCustomer) {
      onUpdateCustomerPassword(activePortalCustomer.id, newPassword);
      setActivePortalCustomer({
        ...activePortalCustomer,
        passwordChanged: true,
        password: newPassword
      });
      setIsForcedResetCodeOpen(false);
      alert('Password updated successfully! Welcome to your digital TAILORSHOP ERP account.');
    }
  };

  const handlePortalLogout = () => {
    setActivePortalCustomer(null);
    setEmailInput('');
    setPasswordInput('');
    setIsForcedResetCodeOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  // If customer is log-in, render dashboard. Otherwise, load login credentials box.
  if (activePortalCustomer && !isForcedResetCodeOpen) {
    const custOrders = orders.filter((o) => o.customerId === activePortalCustomer.id);
    const custSizes = measurements.filter((m) => m.customerId === activePortalCustomer.id);

    return (
      <div className="space-y-6 fade-in p-1 text-xs text-left">
        {/* Customer banner */}
        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          isDarkMode
            ? 'bg-gradient-to-tr from-slate-900 to-slate-850 border-slate-800 text-white'
            : 'bg-stone-900 text-white border-stone-850'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-500 block">Personal Portal</span>
            <h2 className="font-serif text-xl font-bold">Welcome back, {activePortalCustomer.name}</h2>
            <p className="text-stone-300 text-[11px]">Track progress metrics, sizing cards, and secure delivery invoices.</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[9px] uppercase font-bold text-stone-400">Exclusive Client Token</p>
              <p className="text-xs font-mono font-bold text-amber-500">{activePortalCustomer.id}</p>
            </div>
            <button
              onClick={handlePortalLogout}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold flex items-center space-x-1 border border-white/25"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>

        {/* Core content modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active order status tracking visual timeline */}
          <div className={`p-5 rounded-2xl border lg:col-span-2 space-y-4 ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200'
          }`}>
            <h3 className="font-serif text-sm font-bold pb-2 border-b flex items-center space-x-1.5">
              <ShoppingBag className="h-4 w-4 text-amber-500" />
              <span>Ongoing commissions ({custOrders.length})</span>
            </h3>

            {custOrders.length === 0 ? (
              <p className="text-stone-400 text-center py-10">You have no booking records listed yet.</p>
            ) : (
              custOrders.map((ord) => {
                const currentStageIndex = ALL_STATUS_STAGES.indexOf(ord.status);
                const currentStagePct = ((currentStageIndex + 1) / ALL_STATUS_STAGES.length) * 100;

                return (
                  <div key={ord.id} className="p-4 border rounded-xl space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-sm">{ord.clothingType} Booking</p>
                        <p className="text-[10px] text-stone-400">Reference: {ord.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-stone-400">Delivery Target</p>
                        <p className="font-bold text-amber-500">{ord.deliveryDate}</p>
                      </div>
                    </div>

                    {/* Progress tracking dots */}
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-[9px] uppercase tracking-wider text-stone-400">
                        <span>Current Phase:</span>
                        <span className="text-emerald-500">{ord.status}</span>
                      </div>
                      {/* Interactive responsive status bar */}
                      <div className="h-2 w-full bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${currentStagePct}%` }}
                          className="h-full bg-amber-500 transition-all duration-500"
                        />
                      </div>
                      <div className="grid grid-cols-7 text-[8px] uppercase font-bold tracking-tight text-stone-400 text-center">
                        <span>Rec'd</span>
                        <span>Sized</span>
                        <span>Cut</span>
                        <span>Stitch</span>
                        <span>Iron</span>
                        <span>Ready</span>
                        <span>Sent</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-stone-500 text-[11px]">
                      <span>Paid Advance: <strong>${ord.advancePayment}</strong></span>
                      <span>Outstanding: <strong className="text-red-500">${ord.remainingBalance}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sizing values overview */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <h3 className="font-serif text-sm font-bold pb-2 border-b flex items-center space-x-1.5">
              <Ruler className="h-4 w-4 text-emerald-500" />
              <span>Bespoke sizes on file</span>
            </h3>

            {custSizes.length === 0 ? (
              <p className="text-stone-400 text-center py-10">No sizing outlines registered in TAILORSHOP ERP.</p>
            ) : (
              custSizes.map((sz) => (
                <div key={sz.id} className="p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl space-y-2 border">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-amber-500 uppercase">{sz.clothingType} specifications</span>
                    <span className="font-mono text-stone-400">{sz.id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                    {Object.entries(sz.fields).map(([k, v]) => (
                      <div key={k} className="p-1 px-1.5 bg-white dark:bg-slate-800 rounded text-center border">
                        <span className="text-[8px] text-stone-400 block uppercase font-sans font-bold">{k}</span>
                        <span className="font-extrabold">{String(v).endsWith('in') || String(v).endsWith('cm') ? String(v) : `${v}"`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mandatory Reset default password modal
  if (activePortalCustomer && isForcedResetCodeOpen) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-2xl border text-xs text-left fade-in mt-10 space-y-4 bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="text-center space-y-1">
          <KeyRound className="h-10 w-10 text-amber-500 mx-auto animate-bounce" />
          <h3 className="font-serif text-lg font-bold">Required Action: Reset Default Password</h3>
          <p className="text-stone-400">This is your first login. To secure your sizing ledger, configure a new master password.</p>
        </div>

        <form onSubmit={handlePasswordResetComplete} className="space-y-4">
          <div>
            <label className="block text-stone-400 font-semibold mb-1">New Secure Password (at least 5 letters)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Verify Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border dark:bg-slate-800"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold"
            >
              Verify & Log in to Hub
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Default Login Credentials box
  return (
    <div className="max-w-md mx-auto fade-in py-10 px-6">
      <div className={`p-6 rounded-2xl border max-w-sm mx-auto text-xs text-left ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="text-center space-y-1 mb-6">
          <div className="p-3 rounded-full bg-amber-50 text-amber-500 dark:bg-slate-800 w-12 h-12 flex items-center justify-center mx-auto">
            <Smartphone className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-bold">TAILORSHOP ERP Customer Portal</h3>
          <p className="text-stone-400 leading-tight">Enter credentials to track active commissions, deliveries, sizing ledgers, and download billing invoices.</p>
        </div>



        <form onSubmit={handlePortalLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-stone-400 font-semibold mb-1">Email username *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-xl dark:bg-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-200 font-semibold mb-1">
              <span className="text-stone-400 font-semibold text-xs">Password key *</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="password"
                required
                placeholder="••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-xl dark:bg-slate-800 focus:outline-none"
              />
            </div>
            <p className="text-[9.5px] text-stone-400 mt-1">If this is your first entry, enter your Unique Customer ID.</p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold tracking-wider transition-all"
          >
            Authenticate Portal
          </button>
        </form>
      </div>
    </div>
  );
}
