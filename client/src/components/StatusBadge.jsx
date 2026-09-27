import React from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const config = {
    scheduled: { label: 'Scheduled', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock },
    confirmed: { label: 'Confirmed', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    completed: { label: 'Completed', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30', icon: Calendar },
    cancelled: { label: 'Cancelled', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: XCircle },
    no_show: { label: 'No Show', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: AlertCircle }
  };

  const current = config[status] || { label: status, bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: Clock };
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {current.label}
    </span>
  );
};
