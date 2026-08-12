'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icons } from './Icons';
import { useTheme } from '@/contexts/ThemeContext';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return (
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              isLight ? 'bg-slate-900 text-white' : 'bg-white text-black'
            }`}
          >
            <Icons.Check />
          </div>
        );
      case 'error':
        return (
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/10 text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white/80'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-white/[0.08] text-white/80 border border-white/10'
            }`}
          >
            <Icons.Info />
          </div>
        );
    }
  };

  /** Brand-aligned surfaces + left accent so success/error/warning read clearly */
  const getToastStyles = (type: ToastType) => {
    if (isLight) {
      switch (type) {
        case 'success':
          return 'border-emerald-200/80 bg-white shadow-vercel border-l-[3px] border-l-emerald-500';
        case 'error':
          return 'border-rose-200/90 bg-rose-50/80 border-l-[3px] border-l-rose-500';
        case 'warning':
          return 'border-amber-200/90 bg-amber-50/70 border-l-[3px] border-l-amber-500';
        case 'info':
        default:
          return 'border-slate-200 bg-white border-l-[3px] border-l-slate-400';
      }
    }
    switch (type) {
      case 'success':
        return 'border-white/12 bg-[#121214] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.75)] border-l-[3px] border-l-emerald-400';
      case 'error':
        return 'border-white/12 bg-[#141416] border-l-[3px] border-l-rose-400';
      case 'warning':
        return 'border-white/12 bg-[#121214] border-l-[3px] border-l-amber-400';
      case 'info':
      default:
        return 'border-white/10 bg-[#0c0c0e] border-l-[3px] border-l-white/35';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-3 sm:max-w-md sm:w-[min(100vw-2rem,24rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border animate-slide-up ${getToastStyles(toast.type)}`}
          >
            <div className="shrink-0 mt-0.5">{getToastIcon(toast.type)}</div>
            <p
              className={`flex-1 text-[13px] sm:text-sm font-medium leading-relaxed ${
                isLight ? 'text-slate-800' : 'text-white/90'
              }`}
            >
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className={`shrink-0 p-1 rounded-lg transition-colors ${
                isLight ? 'hover:bg-slate-100' : 'hover:bg-white/[0.06]'
              }`}
              aria-label="Dismiss notification"
            >
              <svg
                className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-white/40'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
