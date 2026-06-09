import React from 'react';
import {
  Users,
  ShoppingBag,
  Clock,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  Activity,
  Award,
  DollarSign
} from 'lucide-react';
import { Order, Customer, Worker, RecentActivity } from '../types';

interface DashboardViewProps {
  orders: Order[];
  customers: Customer[];
  workers: Worker[];
  activities: RecentActivity[];
  isDarkMode: boolean;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({
  orders,
  customers,
  workers,
  activities,
  isDarkMode,
  onNavigateToTab
}: DashboardViewProps) {
  // Stat calculations
  const totalCustomers = customers.length;
  const totalOrders = orders.length;

  const ordersInProgress = orders.filter(
    (o) =>
      o.status === 'Measurement Taken' ||
      o.status === 'Cutting' ||
      o.status === 'Stitching' ||
      o.status === 'Finishing'
  ).length;

  const readyOrders = orders.filter((o) => o.status === 'Ready for Pickup').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  const totalRevenue = orders.reduce((sum, o) => sum + o.price, 0);
  const pendingPayments = orders.reduce((sum, o) => sum + o.remainingBalance, 0);

  // Clothing type distribution statistics
  const clothingCounts = orders.reduce((acc, o) => {
    acc[o.clothingType] = (acc[o.clothingType] || 0) + o.quantity;
    return acc;
  }, {} as Record<string, number>);

  const clothingTypes = ['Suit', 'Shirt', 'Kurta', 'Pant', 'Custom'];
  const maxGarmentCount = Math.max(...clothingTypes.map((t) => clothingCounts[t] || 0), 1);

  // Static Month-wise Revenue calculations based on orders
  const revenueByMonth = [
    { name: 'Jan', revenue: 1540 },
    { name: 'Feb', revenue: 2100 },
    { name: 'Mar', revenue: 1800 },
    { name: 'Apr', revenue: 2900 },
    { name: 'May', revenue: totalRevenue - 900 > 0 ? totalRevenue - 900 : 1200 }, // simulated growth
    { name: 'Jun', revenue: totalRevenue }, // current month live
  ];
  const maxRevenue = Math.max(...revenueByMonth.map((r) => r.revenue), 100);

  return (
    <div className="space-y-6 fade-in p-1">
      {/* Visual Welcome Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-tr from-slate-900 to-slate-850 border-slate-800 text-white'
          : 'bg-gradient-to-tr from-stone-900 to-amber-950 border-stone-850 text-white shadow-xl'
      }`}>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-400 block">tailorSHOP ERP</span>
          <h2 className="font-serif text-2.5xl font-bold tracking-tight">Owner Dashboard Overview</h2>
          <p className="text-stone-300 text-xs max-w-lg">
            Manage your fine tailoring workshops, track measurements, and generate bespoke delivery packages cleanly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('orders')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-all font-semibold text-xs rounded-xl shadow-md text-white flex items-center space-x-2"
          >
            <span>+ Create bespoke Order</span>
          </button>
          <button
            onClick={() => onNavigateToTab('customers')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-all font-semibold text-xs rounded-xl text-white border border-white/20"
          >
            <span>Customers Sizing</span>
          </button>
        </div>
      </div>

      {/* Main Stats Bento-style layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className={`p-4 rounded-xl border transition-all ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <div className="flex justify-between items-start">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Total Customers</p>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold tracking-tight">{totalCustomers}</h3>
            <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +15% active growth
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`p-4 rounded-xl border transition-all ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <div className="flex justify-between items-start">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Active Assignments</p>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold tracking-tight">{ordersInProgress}</h3>
            <span className="text-[10px] font-semibold text-amber-500 flex items-center gap-1 mt-1">
              In Cutting & Stitching ({readyOrders} Ready)
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`p-4 rounded-xl border transition-all ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <div className="flex justify-between items-start">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Delivered & Closed</p>
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold tracking-tight">{deliveredOrders}</h3>
            <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-1">
              Of {totalOrders} total bookings
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`p-4 rounded-xl border transition-all ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <div className="flex justify-between items-start">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Revenue & Outstanding</p>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold tracking-tight">${totalRevenue}</h3>
            <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3" /> ${pendingPayments} Outstanding Balance
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Garment distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Custom Revenue Bar Chart SVG */}
        <div className={`p-5 rounded-2xl border col-span-2 ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="mb-4">
            <h3 className="font-bold text-sm">Monthly Revenue Overview ($)</h3>
            <p className="text-[11px] text-stone-400">Bespoke earnings tracking over the past half-year</p>
          </div>
          <div className="h-64 flex items-end justify-between px-4 pt-4 border-b border-stone-100 dark:border-slate-800">
            {revenueByMonth.map((m) => {
              const barHeightPct = (m.revenue / maxRevenue) * 100;
              return (
                <div key={m.name} className="flex flex-col items-center flex-1 group">
                  <div className="text-[10px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white rounded px-1.5 py-0.5">
                    ${m.revenue}
                  </div>
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className="w-12 bg-amber-500 hover:bg-amber-600 rounded-t-lg transition-all duration-500 cursor-pointer shadow-md shadow-amber-500/10 hover:shadow-amber-500/30 flex items-end justify-center"
                  >
                    <div className="w-1.5 h-1/2 bg-white/20 rounded-t mb-1" />
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold mt-2 pb-1 block">
                    {m.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clothing Type popular category statistics */}
        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="mb-4">
            <h3 className="font-bold text-sm">Popular bespokes</h3>
            <p className="text-[11px] text-stone-400">Garment quantity booked details</p>
          </div>
          <div className="space-y-4 pt-1">
            {clothingTypes.map((type) => {
              const qty = clothingCounts[type] || 0;
              const barWidth = `${(qty / maxGarmentCount) * 100}%`;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{type}s</span>
                    <span className="text-amber-500">{qty} items booked</span>
                  </div>
                  <div className="h-3 w-full bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: qty > 0 ? barWidth : '4%' }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workers and Activities segment */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Workers Load/Performance Card */}
        <div className={`p-5 rounded-2xl border lg:col-span-3 ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-sm">Tailor Performance Summary</h3>
              <p className="text-[11px] text-stone-400">Stitchers assignment capacity & bonus reports</p>
            </div>
            <button
              onClick={() => onNavigateToTab('workers')}
              className="text-xs text-amber-500 font-bold hover:underline"
            >
              Manage Staff
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-stone-400' : 'border-stone-100 text-stone-500'}`}>
                  <th className="pb-2 font-bold uppercase tracking-wider">Tailor</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">Rating</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-center">Active Work</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-right">Base salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                {workers.map((worker) => {
                  const workerActiveCount = orders.filter(
                    (o) => o.assignedWorkerId === worker.id && o.status !== 'Delivered'
                  ).length;
                  return (
                    <tr key={worker.id} className="hover:bg-stone-50/50 dark:hover:bg-slate-850/50">
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <img
                            src={worker.avatar}
                            alt={worker.name}
                            className="h-7 w-7 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold block">{worker.name}</span>
                            <span className="text-[9px] text-stone-400 font-medium">{worker.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-1 font-extrabold text-amber-500">
                          <Award className="h-3.5 w-3.5" />
                          <span>{worker.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          workerActiveCount > 1
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                        }`}>
                          {workerActiveCount} active tasks
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-stone-500 dark:text-stone-300">
                        ${worker.baseSalary}/mo
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities Feed */}
        <div className={`p-5 rounded-2xl border lg:col-span-2 ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="mb-4">
            <h3 className="font-bold text-sm">Recent Activity Field</h3>
            <p className="text-[11px] text-stone-400">Atelier operations audit logs</p>
          </div>
          <div className="space-y-4 max-h-[220px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-stone-400 text-xs py-4 text-center">No actions logged yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs items-start">
                  <div className="p-1 rounded-lg bg-stone-100 dark:bg-slate-800 text-amber-500">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold leading-tight flex items-center justify-between text-stone-700 dark:text-stone-200">
                      <span>{act.action}</span>
                      <span className="text-[9px] text-stone-400 font-normal">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    <p className="text-stone-400 text-[10px] sm:text-xs mt-0.5 line-clamp-2">{act.details}</p>
                    <span className="text-[8px] tracking-wider uppercase font-extrabold text-amber-500 block mt-1">
                      By {act.userName} ({act.userRole})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
