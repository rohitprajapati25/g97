import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
  createdAt: number;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id' | 'createdAt'> }
  | { type: 'REMOVE_TOAST'; payload: string };

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        toasts: [
          {
            id: `${Date.now()}-${Math.random()}`,
            createdAt: Date.now(),
            ...action.payload,
          },
          ...state.toasts.slice(0, 3), // max 4 toasts
        ],
      };
    case 'REMOVE_TOAST':
      return { toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
};

const ToastContext = createContext<any>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const toast = useCallback((type: ToastType, title: string, message: string, duration = 4000) => {
    dispatch({ type: 'ADD_TOAST', payload: { type, title, message, duration } });
  }, []);

  // Expose globally for axios interceptor
  useEffect(() => {
    (window as any).toast = toast;
  }, [toast]);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts: state.toasts }}>
      {children}
      {/*
        Toast container rendered via portal directly into <body>
        — guarantees it's above ALL modals, overlays, and z-index stacking contexts.

        Mobile  : bottom-center, slides UP from bottom, respects safe-area
        Desktop : top-right, slides in from the right
      */}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="false"
          className="
            fixed pointer-events-none
            bottom-0 left-0 right-0
            flex flex-col-reverse items-center gap-2 px-4
            pb-4
            sm:bottom-auto sm:top-5 sm:right-5 sm:left-auto
            sm:items-end sm:flex-col sm:px-0 sm:pb-0
            sm:w-[380px]
          "
          style={{
            zIndex: 2147483647, /* max possible z-index — always on top */
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          }}
        >
          {state.toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// ─── Individual Toast ────────────────────────────────────────────────────────

const CONFIGS = {
  success: {
    bg: 'bg-white',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    titleColor: 'text-slate-900',
    msgColor: 'text-slate-500',
    bar: 'bg-emerald-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-slate-900',
    msgColor: 'text-slate-500',
    bar: 'bg-red-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    titleColor: 'text-slate-900',
    msgColor: 'text-slate-500',
    bar: 'bg-amber-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-slate-900',
    msgColor: 'text-slate-500',
    bar: 'bg-blue-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = React.useState(100);
  const [visible, setVisible] = React.useState(false);
  const cfg = CONFIGS[toast.type];

  // Slide-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - toast.createdAt;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        setVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [toast, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`
        pointer-events-auto rounded-2xl border shadow-xl overflow-hidden
        w-[calc(100vw-2rem)] max-w-sm
        sm:w-[380px]
        transition-all duration-300 ease-out
        ${cfg.bg} ${cfg.border}
        ${visible
          ? 'opacity-100 translate-y-0 translate-x-0 scale-100'
          : 'opacity-0 translate-y-4 scale-[0.97] sm:translate-y-0 sm:translate-x-4'}
      `}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center`}>
          {cfg.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`font-bold text-sm leading-tight ${cfg.titleColor}`}>{toast.title}</p>
          {toast.message && (
            <p className={`text-xs mt-0.5 leading-relaxed ${cfg.msgColor}`}>{toast.message}</p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div
          className={`h-full ${cfg.bar} transition-all duration-75 ease-linear rounded-full`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context.toast;
};
