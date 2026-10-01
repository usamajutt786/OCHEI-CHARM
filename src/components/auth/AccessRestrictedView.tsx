import React from 'react';
import { User } from '../../types';
import { ShieldAlert, Clock, LogOut, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

interface AccessRestrictedViewProps {
  user: User;
  onLogout: () => void;
  onSwitchToAdmin: () => void;
  onRequestReactivation?: () => void;
}

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({
  user,
  onLogout,
  onSwitchToAdmin,
  onRequestReactivation,
}) => {
  const isExpired = user.status === 'expired';
  const isBlocked = user.status === 'blocked';

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0e1422] border border-slate-800 rounded-2xl p-7 shadow-2xl relative z-10 text-center">
        {/* Status Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-xl">
          {isExpired ? (
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold font-display text-white mb-2">
          {isExpired ? 'Subscription Expired' : 'Account Suspended'}
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          {isExpired ? (
            <>
              Your studio pass for <span className="text-slate-200 font-medium">{user.name}</span> expired on{' '}
              <span className="text-slate-200 font-mono-data">{new Date(user.subscriptionExpiry).toLocaleDateString()}</span>.
              Access to photo editing, AI simulation, and high-resolution exports is temporarily paused until your studio administrator extends your subscription.
            </>
          ) : (
            <>
              Your studio account <span className="text-slate-200 font-medium">{user.email}</span> has been blocked by the studio administrator.
              {user.notes && <span className="block mt-2 italic text-slate-400">"{user.notes}"</span>}
            </>
          )}
        </p>

        {/* User Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-left mb-6 text-xs">
          <div className="flex justify-between items-center text-slate-400 mb-1.5">
            <span>Account Details</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
              isExpired ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
            }`}>
              {user.status}
            </span>
          </div>
          <p className="text-slate-200 font-medium">{user.name}</p>
          <p className="text-slate-400 text-[11px]">{user.email} · {user.planName}</p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Switch to Admin Demo (Extend / Unblock)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onRequestReactivation && (
            <button
              type="button"
              onClick={onRequestReactivation}
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Request Administrator Renewal</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 px-4 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account / Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
