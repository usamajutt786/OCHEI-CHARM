import React, { useState } from 'react';
import { User } from '../../types';
import { Calendar, Plus, X, Clock, CheckCircle } from 'lucide-react';

interface ExtendSubscriptionModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onExtend: (userId: string, additionalDays: number) => void;
}

export const ExtendSubscriptionModal: React.FC<ExtendSubscriptionModalProps> = ({
  isOpen,
  user,
  onClose,
  onExtend,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>('60');
  const [isCustom, setIsCustom] = useState(false);

  if (!isOpen || !user) return null;

  const currentExpiry = new Date(user.subscriptionExpiry);
  const now = new Date();
  const baseTime = currentExpiry.getTime() > now.getTime() ? currentExpiry.getTime() : now.getTime();

  const daysToAdd = isCustom ? (parseInt(customDays, 10) || 0) : selectedPreset;
  const newExpiry = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000);

  const handleConfirm = () => {
    if (daysToAdd <= 0) return;
    onExtend(user.id, daysToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#111724] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100"
        role="dialog"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/15 text-violet-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Extend Subscription</h3>
              <p className="text-xs text-slate-400">For {user.name} ({user.email})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status display */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 mb-5 text-xs">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span>Current Status:</span>
            <span className={`font-semibold capitalize ${
              user.status === 'active' ? 'text-emerald-400' : user.status === 'expired' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {user.status} ({user.remainingDays} days remaining)
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Current Expiry Date:</span>
            <span className="text-slate-200 font-mono-data">{new Date(user.subscriptionExpiry).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Preset Duration Buttons */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Select Extension Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '+30 Days', days: 30, desc: '1 Month' },
              { label: '+90 Days', days: 90, desc: '1 Quarter' },
              { label: '+365 Days', days: 365, desc: '1 Year' },
            ].map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset.days);
                  setIsCustom(false);
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  !isCustom && selectedPreset === preset.days
                    ? 'border-violet-500 bg-violet-950/40 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <p className="text-xs font-semibold">{preset.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{preset.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
            >
              <span>{isCustom ? 'Use preset options' : 'Enter custom duration (days)'}</span>
            </button>

            {isCustom && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1825"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-violet-500"
                />
                <span className="text-xs text-slate-400">days</span>
              </div>
            )}
          </div>
        </div>

        {/* Projected Expiry Preview */}
        <div className="p-3 bg-violet-950/20 border border-violet-800/30 rounded-xl mb-6 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-violet-300">
            <Clock className="w-4 h-4 text-violet-400 shrink-0" />
            <span>New Expiry Date:</span>
          </div>
          <span className="font-semibold text-white font-mono-data">
            {newExpiry.toLocaleDateString()} (+{daysToAdd}d)
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Apply Extension</span>
          </button>
        </div>
      </div>
    </div>
  );
};
