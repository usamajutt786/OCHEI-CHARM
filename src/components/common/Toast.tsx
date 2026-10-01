import React, { useEffect } from 'react';
import { ToastMessage } from '../../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-[#0d161a]',
    warning: 'border-amber-500/30 bg-[#19150d]',
    error: 'border-rose-500/30 bg-[#1a0e12]',
    info: 'border-sky-500/30 bg-[#0c1424]',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${borders[toast.type]}`}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs font-semibold text-slate-100">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-500 hover:text-slate-200 transition-colors p-1"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
