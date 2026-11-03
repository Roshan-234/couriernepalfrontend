'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toast, type ToastVariant } from './Toast';

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. `null` keeps it until dismissed. */
  duration?: number | null;
  action?: React.ReactNode;
}

export interface ToastRecord extends ToastOptions {
  id: string;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  success: (title: React.ReactNode, options?: Omit<ToastOptions, 'title' | 'variant'>) => string;
  error: (title: React.ReactNode, options?: Omit<ToastOptions, 'title' | 'variant'>) => string;
  info: (title: React.ReactNode, options?: Omit<ToastOptions, 'title' | 'variant'>) => string;
  warning: (title: React.ReactNode, options?: Omit<ToastOptions, 'title' | 'variant'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Errors stay put long enough to be read and acted on. */
const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  info: 5000,
  success: 4000,
  warning: 7000,
  error: 9000,
};

let toastCounter = 0;

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Oldest toasts are dropped once this many are on screen. */
  max?: number;
}

/**
 * Holds the toast queue and renders it in a portal. Mount once, high in the
 * tree; read it with `useToast()`.
 */
export function ToastProvider({ children, max = 4 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => setMounted(true), []);

  const clearTimer = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((current) => current.filter((item) => item.id !== id));
    },
    [clearTimer],
  );

  const dismissAll = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      toastCounter += 1;
      const id = `toast-${toastCounter}`;
      const variant = options.variant ?? 'info';
      const record: ToastRecord = { ...options, variant, id };

      setToasts((current) => {
        const next = [...current, record];
        const overflow = next.length - max;
        if (overflow <= 0) return next;
        next.slice(0, overflow).forEach((item) => clearTimer(item.id));
        return next.slice(overflow);
      });

      const duration = options.duration === undefined ? DEFAULT_DURATIONS[variant] : options.duration;
      if (duration !== null) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }

      return id;
    },
    [clearTimer, dismiss, max],
  );

  // Drop any pending timers when the provider goes away.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      dismiss,
      dismissAll,
      success: (title, options) => toast({ ...options, title, variant: 'success' }),
      error: (title, options) => toast({ ...options, title, variant: 'error' }),
      info: (title, options) => toast({ ...options, title, variant: 'info' }),
      warning: (title, options) => toast({ ...options, title, variant: 'warning' }),
    }),
    [dismiss, dismissAll, toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:bottom-auto sm:left-auto sm:right-0 sm:top-0 sm:max-w-sm sm:items-end">
            {toasts.map((item) => (
              <Toast
                key={item.id}
                variant={item.variant}
                title={item.title}
                description={item.description}
                action={item.action}
                onDismiss={() => dismiss(item.id)}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

/** Access the toast queue. Throws when no `ToastProvider` is above it. */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a <ToastProvider>.');
  }
  return context;
}

export default ToastProvider;
