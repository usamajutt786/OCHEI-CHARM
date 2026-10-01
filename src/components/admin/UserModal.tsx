import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { UserPlus, UserCheck, X, AlertCircle } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  user?: User | null;
  onClose: () => void;
  onSubmit: (userData: any) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  mode,
  user,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [role, setRole] = useState<UserRole>('studio_user');
  const [planName, setPlanName] = useState('Pro Iris Photographer');
  const [durationDays, setDurationDays] = useState('90');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setPlanName(user.planName);
      setNotes(user.notes || '');
      setDurationDays(user.remainingDays.toString());
      setTempPassword('');
    } else {
      setName('');
      setEmail('');
      setTempPassword('StudioIris2026!');
      setRole('studio_user');
      setPlanName('Pro Iris Photographer');
      setDurationDays('90');
      setNotes('');
    }
    setErrors({});
  }, [isOpen, mode, user]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email format.';
    }

    if (mode === 'create' && (!tempPassword || tempPassword.length < 6)) {
      newErrors.tempPassword = 'Temporary password must be at least 6 characters.';
    }

    const days = parseInt(durationDays, 10);
    if (isNaN(days) || days < 1) {
      newErrors.durationDays = 'Duration must be at least 1 day.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'create') {
      onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        planName,
        durationDays: parseInt(durationDays, 10),
        notes: notes.trim(),
      });
    } else if (user) {
      const days = parseInt(durationDays, 10);
      const newExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      onSubmit({
        id: user.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        planName,
        subscriptionExpiry: newExpiry,
        notes: notes.trim(),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#111724] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100"
        role="dialog"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/15 text-violet-400">
              {mode === 'create' ? <UserPlus className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold">
                {mode === 'create' ? 'Create Studio Account' : 'Edit Studio Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'create' ? 'Provision access and assign subscription pass' : `Update settings for ${user?.name}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className={`w-full px-3 py-2 bg-slate-900 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${
                  errors.name ? 'border-rose-500' : 'border-slate-700/80'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. maya@studiolens.com"
                className={`w-full px-3 py-2 bg-slate-900 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${
                  errors.email ? 'border-rose-500' : 'border-slate-700/80'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
            </div>
          </div>

          {mode === 'create' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Temporary Password *
              </label>
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Initial studio pass password"
                className={`w-full px-3 py-2 bg-slate-900 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${
                  errors.tempPassword ? 'border-rose-500' : 'border-slate-700/80'
                }`}
              />
              {errors.tempPassword && <p className="text-[11px] text-rose-400 mt-1">{errors.tempPassword}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="studio_user">Studio Photographer</option>
                <option value="admin">Studio Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Plan Tier
              </label>
              <select
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="Pro Iris Photographer">Pro Iris Photographer</option>
                <option value="Standard Studio Seat">Standard Studio Seat</option>
                <option value="Enterprise Studio Master">Enterprise Studio Master</option>
                <option value="Annual Studio Pass">Annual Studio Pass</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Subscription Duration (Days from now) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="1825"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className={`w-32 px-3 py-2 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 ${
                  errors.durationDays ? 'border-rose-500' : 'border-slate-700/80'
                }`}
              />
              <span className="text-xs text-slate-400">
                days (approx. {Math.round((parseInt(durationDays, 10) || 0) / 30)} months)
              </span>
            </div>
            {errors.durationDays && <p className="text-[11px] text-rose-400 mt-1">{errors.durationDays}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Internal Admin Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Contract ID, hardware setup, specialized lighting rig"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors shadow-sm"
            >
              {mode === 'create' ? 'Create Account' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
