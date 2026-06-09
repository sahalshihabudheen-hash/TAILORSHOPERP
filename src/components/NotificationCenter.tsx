import React from 'react';
import { Bell, CheckCircle, Smartphone, Mail, SmartphoneCharging, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { NotificationLog } from '../types';

interface NotificationCenterProps {
  notifications: NotificationLog[];
  isDarkMode: boolean;
}

export default function NotificationCenter({ notifications, isDarkMode }: NotificationCenterProps) {
  return (
    <div className="space-y-6 fade-in p-1 text-xs text-left">
      {/* Intro Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-250 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">Atelier Dispatch Logs</h2>
          <p className="text-stone-400 text-xs text-stone-400">Chronological list of all live WhatsApp notifications and automated emails triggered by tailor shop activities</p>
        </div>
      </div>

      {/* Roster list */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <h3 className="font-serif text-sm font-bold flex items-center space-x-1.5 pb-2 border-b border-stone-100 dark:border-slate-800">
          <Bell className="h-4 w-4 text-amber-500" />
          <span>Atelier Automatic Dispatch Logs ({notifications.length})</span>
        </h3>

        {notifications.length === 0 ? (
          <p className="text-stone-400 py-10 text-center">No automated messages have been triggered yet.</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-slate-800 space-y-3">
            {notifications.map((not) => {
              const date = new Date(not.timestamp);
              return (
                <div key={not.id} className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        not.type === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {not.type} message
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">ID: {not.id}</span>
                      <span className="text-[10px] text-stone-400">
                        • {date.toLocaleDateString()} at{' '}
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="font-mono text-[10.5px] bg-stone-50 dark:bg-slate-950/40 p-2.5 rounded-lg border leading-relaxed text-stone-600 dark:text-stone-300 select-all">
                      {not.message}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-emerald-500 font-bold self-end sm:self-auto bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span>Dispatched To {not.recipient}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Triggers Explainer Banner */}
      <div className={`p-4 rounded-xl border border-dashed flex items-center gap-3 ${
        isDarkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-amber-50/40 border-amber-200'
      }`}>
        <SmartphoneCharging className="h-5 w-5 text-amber-550 flex-shrink-0 animate-pulse" />
        <div>
          <h4 className="font-bold text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400">💡 Automated dispatch Triggers explanation:</h4>
          <p className="text-[10px] text-stone-500 leading-normal">
            Whenever a partner creates a new Sizing Order, transitions status values (e.g. from cutting to ready-for-pickup), or triggers final handovers, the system calculates client contact records and maps customizable SMS variables automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
