import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  UserCheck,
  Plus,
  TrendingUp,
  Award,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  Layers,
  Calculator,
  User,
  Activity,
  MapPin,
  Trash2
} from 'lucide-react';
import { Worker, Order } from '../types';

interface WorkerManagementProps {
  workers: Worker[];
  orders: Order[];
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  onDeleteWorker?: (id: string) => void;
  isDarkMode: boolean;
  triggerToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function WorkerManagementView({
  workers,
  orders,
  onAddWorker,
  onDeleteWorker,
  isDarkMode,
  triggerToast
}: WorkerManagementProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    role: 'Senior Stitcher' as Worker['role'],
    baseSalary: 2200,
    perOrderBonus: 20,
    avatar: ''
  });

  // Country code state linked automatically to location changes
  const [countryCode, setCountryCode] = useState('+1');
  const [localPhone, setLocalPhone] = useState('');

  const detectAndSetCountryCode = (locationText: string) => {
    const loc = locationText.toLowerCase();
    let detectedSign = '';
    
    if (loc.includes('london') || loc.includes('uk') || loc.includes('united kingdom') || loc.includes('britain') || loc.includes('scotland') || loc.includes('wales') || loc.includes('leicester')) {
      detectedSign = '+44';
    } else if (loc.includes('paris') || loc.includes('france')) {
      detectedSign = '+33';
    } else if (loc.includes('milan') || loc.includes('italy') || loc.includes('rome')) {
      detectedSign = '+39';
    } else if (loc.includes('tokyo') || loc.includes('japan') || loc.includes('kyoto') || loc.includes('osaka')) {
      detectedSign = '+81';
    } else if (loc.includes('mumbai') || loc.includes('india') || loc.includes('delhi') || loc.includes('bangalore')) {
      detectedSign = '+91';
    } else if (loc.includes('dubai') || loc.includes('uae') || loc.includes('abu dhabi') || loc.includes('emirates')) {
      detectedSign = '+971';
    } else if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('frankfurt')) {
      detectedSign = '+49';
    } else if (loc.includes('spain') || loc.includes('madrid') || loc.includes('barcelona')) {
      detectedSign = '+34';
    } else if (loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver')) {
      detectedSign = '+1';
    } else if (loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne')) {
      detectedSign = '+61';
    } else if (loc.includes('new york') || loc.includes('usa') || loc.includes('california') || loc.includes('chicago') || loc.includes('america') || loc.includes('boston') || loc.includes('houston')) {
      detectedSign = '+1';
    }

    if (detectedSign) {
      setCountryCode(detectedSign);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      if (triggerToast) {
        triggerToast('Please provide a tailor name.', 'error');
      } else {
        alert('Please provide a tailor name.');
      }
      return;
    }

    if (!formData.email.trim()) {
      if (triggerToast) {
        triggerToast('Please provide an email address.', 'error');
      } else {
        alert('Please provide an email address.');
      }
      return;
    }

    if (!formData.location.trim()) {
      if (triggerToast) {
        triggerToast('Please provide a location.', 'error');
      } else {
        alert('Please provide a location.');
      }
      return;
    }

    if (!localPhone.trim()) {
      if (triggerToast) {
        triggerToast('Please provide a phone number.', 'error');
      } else {
        alert('Please provide a phone number.');
      }
      return;
    }

    const emailStr = formData.email.trim();
    const phoneStr = `${countryCode} ${localPhone.trim()}`;

    onAddWorker({
      name: formData.name.trim(),
      phone: phoneStr,
      email: emailStr,
      role: formData.role,
      rating: 4.8,
      baseSalary: formData.baseSalary || 2200,
      perOrderBonus: formData.perOrderBonus || 20,
      avatar: formData.avatar || `https://images.unsplash.com/photo-${1519085360753 - Math.floor(Math.random() * 50000)}?auto=format&fit=crop&q=80&w=120`,
      location: formData.location.trim()
    });
    setIsAddOpen(false);
    if (triggerToast) {
       triggerToast('Activated tailor profile and assigned scheduling capacity!', 'success');
    } else {
       alert('Activated tailor profile and assigned scheduling capacity!');
    }
  };

  return (
    <div className="space-y-6 fade-in p-1">
      {/* Intro Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-250 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">Atelier Tailor Registry</h2>
          <p className="text-stone-400 text-xs">Verify tailor profiles, check productivity charts, commissions, and assign custom bonus structures</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              phone: '',
              email: '',
              location: '',
              role: 'Senior Stitcher',
              baseSalary: 2200,
              perOrderBonus: 20,
              avatar: `https://images.unsplash.com/photo-${1500648767791 - Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=120`
            });
            setCountryCode('+1');
            setLocalPhone('');
            setIsAddOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-all font-semibold text-xs rounded-xl text-white shadow-md flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Include new tailor</span>
        </button>
      </div>

      {/* List of tailor registry bars */}
      <div className="flex flex-col gap-3">
        {workers.map((worker) => {
          return (
            <div
              key={worker.id}
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between transition-all relative gap-4 ${
                isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              {/* Profile Details (Left side) */}
              <div className="flex items-center space-x-4">
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-stone-100 dark:border-slate-800 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100">{worker.name}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-stone-300 font-bold uppercase tracking-wider">
                      {worker.role}
                    </span>
                    {/* Rating badge inline */}
                    <span className="text-[10px] text-stone-400 font-bold flex items-center space-x-0.5">
                      <Award className="h-3 w-3 text-amber-500 mr-0.5" />
                      <span>Productivity score: {worker.rating}/5.0</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Data (Middle side) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-stone-500 dark:text-stone-400 md:ml-auto md:mr-12">
                <div className="flex items-center space-x-2">
                  <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>{worker.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{worker.email}</span>
                </div>
                {worker.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{worker.location}</span>
                  </div>
                )}
              </div>

              {/* Delete button (Right side) placed safely */}
              {onDeleteWorker && (
                <button
                  type="button"
                  onClick={() => {
                    setWorkerToDelete(worker);
                  }}
                  title="Remove tailor profile"
                  className="absolute right-4 top-4 md:static md:top-auto md:right-auto p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>



      {/* Include new tailor Modal */}
      {isAddOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className={`p-6 rounded-2xl max-w-md w-full border shadow-2xl relative ${
            isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white shadow-black/80' : 'bg-white border-stone-150 text-stone-900 shadow-stone-300'
          }`}>
            <h3 className="font-serif text-lg font-bold mb-4">Include Bespoke Tailor Card</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Tailor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Rashid Khan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. name@tailorshop.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. London Workshop, Bay 2"
                  value={formData.location}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, location: val });
                    detectAndSetCountryCode(val);
                  }}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Phone Number *</label>
                <div className="flex space-x-1.5">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold w-[72px] shrink-0 text-center bg-stone-50 dark:bg-slate-850 text-stone-800 dark:text-stone-100"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="e.g. (555) 018-9999"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-500 font-semibold hover:bg-stone-50 dark:hover:bg-slate-800 dark:border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold"
                >
                  Register Tailor
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Delete Confirmation Modal */}
      {workerToDelete && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] fade-in text-left">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl relative ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="text-base font-bold mb-2">Delete Tailor Profile?</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-stone-900 dark:text-white">"{workerToDelete.name}"</span> from the ERP registry? This action is irreversible.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setWorkerToDelete(null)}
                className="px-4 py-2 border rounded-xl text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-slate-850 dark:border-slate-750 text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteWorker) {
                    onDeleteWorker(workerToDelete.id);
                  }
                  setWorkerToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold text-xs transition shadow-sm"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
