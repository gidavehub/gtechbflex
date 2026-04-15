'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (params: { title: string; description?: string; type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((params: { title: string; description?: string; type?: ToastType }) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: Toast = { id, title: params.title, description: params.description, type: params.type || 'info' };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const iconMap = {
    success: <CheckCircle size={18} className="text-emerald-500" />,
    error: <XCircle size={18} className="text-red-500" />,
    info: <AlertCircle size={18} className="text-amber-500" />,
  };

  const borderMap = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    info: 'border-l-amber-500',
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto bg-white border border-gray-200 ${borderMap[t.type]} border-l-4 rounded-2xl shadow-xl p-4 flex items-start gap-3`}
            >
              <div className="mt-0.5 shrink-0">{iconMap[t.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{t.title}</p>
                {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
              </div>
              <button onClick={() => removeToast(t.id)} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
