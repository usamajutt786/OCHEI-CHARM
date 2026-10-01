import React, { useState } from 'react';
import { User } from '../../types';
import { Shield, Sparkles, UserCheck, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  availableUsers: User[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, availableUsers }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDemoClick = (roleOrStatus: 'admin' | 'active_user' | 'expired' | 'blocked') => {
    let targetUser: User | undefined;

    if (roleOrStatus === 'admin') {
      targetUser = availableUsers.find(u => u.role === 'admin');
    } else if (roleOrStatus === 'active_user') {
      targetUser = availableUsers.find(u => u.role === 'studio_user' && u.status === 'active');
    } else if (roleOrStatus === 'expired') {
      targetUser = availableUsers.find(u => u.status === 'expired');
    } else if (roleOrStatus === 'blocked') {
      targetUser = availableUsers.find(u => u.status === 'blocked');
    }

    if (targetUser) {
      onLoginSuccess(targetUser);
    }
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your studio email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your studio password.');
      return;
    }

    // Client-side authentication check against seeded users
    const matchedUser = availableUsers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matchedUser) {
      setErrorMessage('No studio account found with this email. Try one of the 1-click demo logins below.');
      return;
    }

    onLoginSuccess(matchedUser);
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 mb-4 shadow-xl shadow-violet-900/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-white">
            Iris Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Fine Art Iris Photography & Subscription Platform
          </p>
        </div>

        {/* 1-Click Fast Demo Access Section */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 shadow-2xl mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">Quick Demo Access</span>
            <span className="text-[11px] text-violet-400 font-mono-data">No Password Required</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-violet-500/50 rounded-xl transition-all group text-left"
            >
              <Shield className="w-4 h-4 text-violet-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-semibold text-white">Try Admin Demo</p>
                <p className="text-[10px] text-slate-400">Manage users & plans</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('active_user')}
              className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl transition-all group text-left"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-semibold text-white">Studio User Demo</p>
                <p className="text-[10px] text-slate-400">Photo editor & effects</p>
              </div>
            </button>
          </div>

          {/* Additional testing states */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Test access-restricted states:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('expired')}
                className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
              >
                Expired User
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleDemoClick('blocked')}
                className="text-rose-400 hover:text-rose-300 underline underline-offset-2 transition-colors"
              >
                Blocked User
              </button>
            </div>
          </div>
        </div>

        {/* Standard Form Login */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">
            Sign In with Studio Account
          </h2>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleStandardSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. elena@iris-studio.art"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-violet-900/30 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            Demo credentials: any seeded email (e.g. <span className="text-slate-400">admin@iris-studio.art</span> or <span className="text-slate-400">elena@iris-studio.art</span>) with any password.
          </div>
        </div>
      </div>
    </div>
  );
};
