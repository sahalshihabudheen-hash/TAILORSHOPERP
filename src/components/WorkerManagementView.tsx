import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';
import { Worker, Order } from '../types';

interface WorkerManagementProps {
  workers: Worker[];
  orders: Order[];
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  isDarkMode: boolean;
}

export default function WorkerManagementView({
  workers,
  orders,
  onAddWorker,
  isDarkMode
}: WorkerManagementProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Senior Stitcher' as Worker['role'],
    baseSalary: 2000,
    perOrderBonus: 15,
    avatar: ''
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields.');
      return;
    }
    onAddWorker({
      name: formData.name,
      phone: formData.phone || '+1 (555) 000-0000',
      email: formData.email,
      role: formData.role,
      rating: 4.5,
      baseSalary: formData.baseSalary,
      perOrderBonus: formData.perOrderBonus,
      avatar: formData.avatar || `https://images.unsplash.com/photo-${1519085360753 - Math.floor(Math.random() * 50000)}?auto=format&fit=crop&q=80&w=120`
    });
    setIsAddOpen(false);
    alert('Activated staff card card and assigned scheduling capacity!');
  };

  return (
    <div className="space-y-6 fade-in p-1">
      {/* Intro Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-250 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">Atelier Staff Registry</h2>
          <p className="text-stone-400 text-xs">Verify staff profiles, check productivity charts, salaries, and assign commissioning bonus structures</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              phone: '',
              email: '',
              role: 'Senior Stitcher',
              baseSalary: 2200,
              perOrderBonus: 20,
              avatar: `https://images.unsplash.com/photo-${1500648767791 - Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=120`
            });
            setIsAddOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-all font-semibold text-xs rounded-xl text-white shadow-md flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Induct new staff</span>
        </button>
      </div>

      {/* Grid of worker cards with calculated salary aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workers.map((worker) => {
          // Calculate tasks
          const assignedOrders = orders.filter((o) => o.assignedWorkerId === worker.id);
          const activeTasks = assignedOrders.filter((o) => o.status !== 'Delivered').length;
          const completedTasks = assignedOrders.filter((o) => o.status === 'Delivered').length;

          // Salary breakdown: Base salary + (completed * order bonus)
          const bonusIncome = completedTasks * worker.perOrderBonus;
          const calculatedPayout = worker.baseSalary + bonusIncome;

          return (
            <div
              key={worker.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all relative ${
                isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              {/* Profile card core */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-stone-100 dark:border-slate-800"
                  />
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">{worker.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 mt-0.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-stone-300 font-bold uppercase tracking-wider block">
                      {worker.role}
                    </span>
                  </div>
                </div>

                {/* Rating badge */}
                <div className="flex items-center space-x-1 font-bold text-xs">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Productivity score: {worker.rating}/5.0</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center space-x-2 text-stone-500">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{worker.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-stone-500">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{worker.email}</span>
                  </div>
                </div>

                {/* Task productivity board */}
                <div className={`p-4 rounded-xl border ${
                  isDarkMode ? 'bg-slate-950/40' : 'bg-stone-50/50'
                } space-y-3`}>
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest flex items-center space-x-1">
                    <Activity className="h-3.5 w-3.5 text-amber-500" />
                    <span>Active Work cycle loads</span>
                  </p>
                  <div className="grid grid-cols-2 text-center text-xs">
                    <div className="border-r border-stone-105">
                      <p className="font-extrabold text-lg text-amber-500">{activeTasks}</p>
                      <p className="text-[10px] text-stone-400">Assigned loads</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-lg text-emerald-500">{completedTasks}</p>
                      <p className="text-[10px] text-stone-400">Paid compliance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary computations summary */}
              <div className="mt-5 pt-4 border-t border-stone-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[10px] uppercase text-stone-400 tracking-wider flex items-center space-x-1">
                    <Calculator className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Estimated Monthly slip</span>
                  </span>
                  <span className="font-serif italic font-bold text-amber-500">Calculated Pay</span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-500 dark:text-stone-400 font-mono">
                  <div className="flex justify-between">
                    <span>Base monthly:</span>
                    <span>${worker.baseSalary}</span>
                  </div>
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>Commissions:</span>
                    <span>+{completedTasks} * ${worker.perOrderBonus}</span>
                  </div>
                  <div className="flex justify-between text-stone-850 dark:text-stone-100 font-extrabold text-sm border-t dark:border-slate-700 pt-1.5 font-mono">
                    <span>Total Net Income:</span>
                    <span>${calculatedPayout}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Report segment overview */}
      <div className={`p-6 rounded-2xl border ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <h3 className="font-serif text-lg font-bold mb-2">Monthly Team report Overview</h3>
        <p className="text-stone-400 text-xs mb-4">Sum total payroll commitments and task efficiency audits for physical workshops</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-stone-50 dark:bg-slate-900 rounded-xl">
            <h4 className="text-2xl font-extrabold text-amber-500">${workers.reduce((sum, w) => sum + w.baseSalary, 0)}</h4>
            <p className="text-[10px] uppercase font-bold text-stone-450 mt-1">Accumulated Base payroll</p>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-slate-900 rounded-xl">
            <h4 className="text-2xl font-extrabold text-emerald-500">
              ${
                workers.reduce((sum, worker) => {
                  const completedTasks = orders.filter((o) => o.assignedWorkerId === worker.id && o.status === 'Delivered').length;
                  return sum + completedTasks * worker.perOrderBonus;
                }, 0)
              }
            </h4>
            <p className="text-[10px] uppercase font-bold text-stone-450 mt-1">Disbursed commission bonuses</p>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-slate-900 rounded-xl">
            <h4 className="text-2xl font-extrabold text-indigo-500">
              {
                orders.filter((o) => o.status === 'Delivered').length
              } / {orders.length}
            </h4>
            <p className="text-[10px] uppercase font-bold text-stone-450 mt-1">Completed delivery compliance</p>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-slate-900 rounded-xl">
            <h4 className="text-2xl font-extrabold text-emerald-500">100%</h4>
            <p className="text-[10px] uppercase font-bold text-stone-450 mt-1">Tailors capacity efficiency rate</p>
          </div>
        </div>
      </div>

      {/* Induct new staff Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl max-w-md w-full border ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="font-serif text-lg font-bold mb-4">Induct Bespoke Staff Card</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Tailor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Rashid Khan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@tailorshop.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Workshop Role Badge</label>
                <select
                  value={formData.role}
                  onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border rounded-xl dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="Master Cutter">Master Cutter</option>
                  <option value="Senior Stitcher">Senior Stitcher</option>
                  <option value="Finisher & Ironer">Finisher & Ironer</option>
                  <option value="Apprentice">Apprentice</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Base Monthly Salary ($)</label>
                  <input
                    type="number"
                    min="500"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) || 1200 })}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800 text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Bonus per finished task ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perOrderBonus}
                    onChange={(e) => setFormData({ ...formData, perOrderBonus: parseInt(e.target.value) || 10 })}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800 text-center font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold"
                >
                  Induct Staff Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
