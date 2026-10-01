import React from 'react';
import { User } from '../../types';
import { 
  X, 
  Calendar, 
  Clock, 
  Shield, 
  MapPin, 
  Laptop, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles,
  UserCheck
} from 'lucide-react';

interface UserDetailDrawerProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onExtendClick: (user: User) => void;
  onToggleBlock: (user: User) => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  isOpen,
  user,
  onClose,
  onExtendClick,
  onToggleBlock,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#101623] border-l border-slate-800 shadow-2xl p-6 flex flex-col text-slate-100 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight">{user.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  user.status === 'active' 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                    : user.status === 'expired' 
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  {user.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Subscription Summary */}
          <div className="my-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">Subscription Status</span>
              <span className="text-xs font-mono-data text-violet-400 font-semibold">{user.planName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50">
                <span className="text-[11px] text-slate-400 block mb-0.5">Remaining Days</span>
                <span className="text-lg font-bold font-mono-data text-white">{user.remainingDays}</span>
                <span className="text-[10px] text-slate-500 ml-1">days</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50">
                <span className="text-[11px] text-slate-400 block mb-0.5">Expiration Date</span>
                <span className="text-xs font-medium font-mono-data text-slate-200">
                  {new Date(user.subscriptionExpiry).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => onExtendClick(user)}
                className="flex-1 py-1.5 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Extend Days</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleBlock(user)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  user.status === 'blocked'
                    ? 'border-emerald-700/60 text-emerald-300 hover:bg-emerald-950/40'
                    : 'border-rose-800/60 text-rose-300 hover:bg-rose-950/40'
                }`}
              >
                {user.status === 'blocked' ? 'Unblock User' : 'Block Access'}
              </button>
            </div>
          </div>

          {/* Account Metadata */}
          <div className="space-y-3 mb-6 text-xs">
            <h4 className="font-semibold text-slate-300">Account Details</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <div>
                <span className="text-slate-500 block text-[11px]">Role</span>
                <span className="text-slate-200 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Member Since</span>
                <span className="text-slate-200">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Last Active</span>
                <span className="text-slate-200">{user.lastLogin}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Studio ID</span>
                <span className="text-slate-200 font-mono-data">{user.id}</span>
              </div>
            </div>

            {user.notes && (
              <div className="pt-2">
                <span className="text-slate-500 block text-[11px]">Studio Notes</span>
                <p className="text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 mt-1 leading-relaxed">
                  {user.notes}
                </p>
              </div>
            )}
          </div>

          {/* Chronological Login & Security History */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300">Login & Session History</h4>
              <span className="text-[11px] text-slate-500">{user.loginHistory.length} Recorded Sessions</span>
            </div>

            {user.loginHistory.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-500 text-xs">
                No recent logins recorded for this user account.
              </div>
            ) : (
              <div className="space-y-2.5">
                {user.loginHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs transition-colors hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {item.status === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : item.status === 'expired_warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span className="font-semibold text-slate-200">
                          {item.status === 'success' ? 'Authenticated' : item.status === 'expired_warning' ? 'Expired Warning' : 'Blocked Attempt'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono-data">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{item.location} ({item.ip})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{item.device}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
