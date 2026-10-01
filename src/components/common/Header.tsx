import React, { useState } from 'react';
import { User } from '../../types';
import { 
  Sparkles, 
  Layers, 
  Download, 
  Printer, 
  Upload, 
  Shield, 
  LogOut, 
  UserCheck, 
  ChevronDown, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  currentView: 'workspace' | 'admin';
  onNavigate: (view: 'workspace' | 'admin') => void;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  availableUsers: User[];
  onUploadClick?: () => void;
  onEnhanceClick?: () => void;
  onEffectsClick?: () => void;
  onExportClick?: () => void;
  onPrintClick?: () => void;
  hasActiveImage?: boolean;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onLogout,
  onSwitchUser,
  availableUsers,
  onUploadClick,
  onEnhanceClick,
  onEffectsClick,
  onExportClick,
  onPrintClick,
  hasActiveImage = false,
  onResetDemoData,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-[#0a0e17] border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-6">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onNavigate('workspace'); }}
          className="text-lg font-bold tracking-tight text-white font-display hover:text-slate-200 transition-colors whitespace-nowrap"
        >
          Iris Studio
        </a>

        {/* Clean textual status & context */}
        {currentUser && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span>{currentUser.name}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className={currentUser.remainingDays <= 14 ? 'text-amber-400 font-medium' : 'text-slate-400'}>
              {currentUser.remainingDays} days remaining
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-500">{currentUser.planName}</span>
          </div>
        )}
      </div>

      {/* Zone 2: Navigation Links / Segmented View Controls */}
      <nav className="flex items-center gap-1 md:gap-2">
        <button
          onClick={() => onNavigate('workspace')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            currentView === 'workspace'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>

        <button
          onClick={() => onNavigate('admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            currentView === 'admin'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions & User Session Control */}
      <div className="flex items-center gap-2">
        {currentView === 'workspace' && (
          <div className="hidden sm:flex items-center gap-1.5 border-r border-slate-800/80 pr-2 mr-1">
            <button
              onClick={onUploadClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
              title="Upload iris photograph (JPEG/PNG)"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload</span>
            </button>

            <button
              onClick={onEnhanceClick}
              disabled={!hasActiveImage}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                hasActiveImage
                  ? 'text-violet-200 bg-violet-950/60 hover:bg-violet-900/80 border border-violet-700/50 shadow-sm'
                  : 'text-slate-500 bg-slate-900/50 border border-slate-800/40 cursor-not-allowed'
              }`}
              title="Simulate AI glare reduction and iris sharpening"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Enhance AI</span>
            </button>

            <button
              onClick={onEffectsClick}
              disabled={!hasActiveImage}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                hasActiveImage
                  ? 'text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700'
                  : 'text-slate-500 bg-slate-900/50 border border-slate-800/40 cursor-not-allowed'
              }`}
              title="Open fine art composition presets"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Effects</span>
            </button>

            <button
              onClick={onExportClick}
              disabled={!hasActiveImage}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                hasActiveImage
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Export artwork to PNG or JPEG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={onPrintClick}
              disabled={!hasActiveImage}
              className="p-1.5 text-slate-400 hover:text-slate-200 disabled:text-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
              title="Print fine art layout"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Session Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <span className="hidden md:inline max-w-[110px] truncate">{currentUser?.name || 'Account'}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {userDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setUserDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-1.5 w-64 bg-[#111724] border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-slate-200 text-xs animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-semibold text-slate-100">{currentUser?.name}</p>
                  <p className="text-slate-400 truncate">{currentUser?.email}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{currentUser?.role === 'admin' ? 'Administrator' : 'Studio Member'}</span>
                    <span>·</span>
                    <span className={currentUser?.status === 'active' ? 'text-emerald-400' : currentUser?.status === 'expired' ? 'text-amber-400' : 'text-rose-400'}>
                      {currentUser?.status} ({currentUser?.remainingDays}d)
                    </span>
                  </div>
                </div>

                {/* Quick Demo Switcher Section */}
                <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Switch Demo Account
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-800/80 flex items-center justify-between transition-colors ${
                        currentUser?.id === user.id ? 'bg-violet-950/40 text-violet-300' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.role} · {user.status}</p>
                      </div>
                      {currentUser?.id === user.id && (
                        <UserCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onResetDemoData();
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
