import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Compass,
  DollarSign,
  Briefcase,
  TrendingDown,
  PieChart,
  Users
} from 'lucide-react';
import { Order, Customer, Worker } from '../types';

interface AnalyticsViewProps {
  orders: Order[];
  customers: Customer[];
  workers: Worker[];
  isDarkMode: boolean;
}

export default function AnalyticsView({
  orders,
  customers,
  workers,
  isDarkMode
}: AnalyticsViewProps) {
  // 1. Calculate top customers based on total expenditures
  const clientSpendMap = orders.reduce((acc, o) => {
    acc[o.customerId] = (acc[o.customerId] || 0) + o.price;
    return acc;
  }, {} as Record<string, number>);

  const topClients = Object.entries(clientSpendMap)
    .map(([id, spend]) => {
      const cust = customers.find((c) => c.id === id);
      return {
        id,
        name: cust?.name || 'Walk-in Client',
        avatar: cust?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        email: cust?.email || '',
        spend
      };
    })
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 4);

  // 2. Clothing categories quantity
  const clothingCounts = orders.reduce((acc, o) => {
    acc[o.clothingType] = (acc[o.clothingType] || 0) + o.quantity;
    return acc;
  }, {} as Record<string, number>);

  const totalClothingQty = Object.values(clothingCounts).reduce((sum, v) => sum + v, 0) || 1;

  // 3. Pending Deliveries
  const pendingDeliveries = orders.filter((o) => o.status !== 'Delivered');

  return (
    <div className="space-y-6 fade-in p-1 text-xs text-left">
      {/* Intro stripe */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-250 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">Atelier Reports & Analytics</h2>
          <p className="text-stone-400 text-xs">A comprehensive operational perspective on tailoring pipelines, premium clients, and staffing productivity indexes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top customers roster */}
        <div className={`p-6 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <h3 className="font-serif text-sm font-bold mb-4 flex items-center space-x-1.5 pb-2 border-b border-stone-100 dark:border-slate-800">
            <Users className="h-4 w-4 text-amber-500" />
            <span>Top bespoke patrons</span>
          </h3>

          <div className="space-y-4">
            {topClients.length === 0 ? (
              <p className="text-stone-400 text-center py-6">No spend histories recorded yet.</p>
            ) : (
              topClients.map((client, idx) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="font-serif italic font-bold text-lg text-amber-500 w-5">
                      #{idx + 1}
                    </div>
                    <img
                      src={client.avatar}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-stone-100 dark:ring-slate-800"
                    />
                    <div>
                      <h4 className="font-bold">{client.name}</h4>
                      <p className="text-[10px] text-stone-400">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-stone-850 dark:text-stone-200">${client.spend}</p>
                    <p className="text-[9px] text-stone-400">Total commissioned bookings</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Ordered garments distributions */}
        <div className={`p-6 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <h3 className="font-serif text-sm font-bold mb-4 flex items-center space-x-1.5 pb-2 border-b border-stone-150 dark:border-slate-850">
            <PieChart className="h-4 w-4 text-emerald-500" />
            <span>Garments popular shares (%)</span>
          </h3>

          <div className="space-y-4">
            {Object.entries(clothingCounts).map(([type, qty]) => {
              const sharePct = Math.round((qty / totalClothingQty) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span>{type} Commissions ({qty} items)</span>
                    <span className="text-amber-500">{sharePct}% of total shop volume</span>
                  </div>
                  <div className="h-3 w-full bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${sharePct}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staff and Outstanding bookings reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workers efficiency rating indexes */}
        <div className={`p-6 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <h3 className="font-serif text-sm font-bold mb-4 flex items-center space-x-1.5 pb-2 border-b border-stone-150 dark:border-slate-850">
            <Award className="h-4 w-4 text-emerald-500" />
            <span>Tailor staff rankings</span>
          </h3>

          <div className="space-y-4">
            {workers.map((w) => {
              const done = orders.filter((o) => o.assignedWorkerId === w.id && o.status === 'Delivered').length;
              return (
                <div key={w.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img src={w.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold">{w.name}</h4>
                      <p className="text-[10px] text-stone-400">{w.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-500">{w.rating} / 5.0 Rating</p>
                    <p className="text-[10px] text-stone-400">Completed: {done} commissions</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deliveries checklist panel */}
        <div className={`p-6 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <h3 className="font-serif text-sm font-bold mb-4 flex items-center space-x-1.5 pb-2 border-b border-stone-150 dark:border-slate-850">
            <Clock className="h-4 w-4 text-red-500" />
            <span>Pending Deliveries checklist ({pendingDeliveries.length})</span>
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {pendingDeliveries.length === 0 ? (
              <p className="text-stone-400 text-center py-6">All bookings completed and delivered! Outstanding work.</p>
            ) : (
              pendingDeliveries.map((ord) => {
                const customer = customers.find((c) => c.id === ord.customerId);
                return (
                  <div key={ord.id} className="p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl flex justify-between items-center border">
                    <div>
                      <p className="font-bold">{ord.clothingType} - {ord.id}</p>
                      <p className="text-[10px] text-stone-400">Client: {customer?.name || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-500">{ord.status}</p>
                      <p className="text-[10px] text-stone-400">Due: {ord.deliveryDate}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
