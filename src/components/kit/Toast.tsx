'use client';

import type { IconType } from 'react-icons';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaTimesCircle,
} from 'react-icons/fa';
import { cn } from '@/lib/utils';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

interface VariantStyle {
  container: string;
  icon: string;
  Icon: IconType;
}

const VARIANTS: Record<ToastVariant, VariantStyle> = {
  info: {
    container: 'border-slate-300 bg-white',
    icon: 'text-teal-700',
    Icon: FaInfoCircle,
  },
  success: {
    container: 'border-green-300 bg-green-50',
    icon: 'text-green-700',
    Icon: FaCheckCircle,
  },
  warning: {
    container: 'border-amber-300 bg-amber-50',
    icon: 'text-amber-700',
    Icon: FaExclamationTriangle,
  },
  error: {
    container: 'border-red-300 bg-red-50',
    icon: 'text-red-700',
    Icon: FaTimesCircle,
  },
};

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: ToastVariant;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Extra control, e.g. an Undo button. */
  action?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

/**
 * A single notification. Errors get `role="alert"` so they interrupt; the
 * rest get `role="status"` and are announced politely.
 */
export function Toast({
  variant = 'info',
  title,
  description,
  action,
  onDismiss,
  dismissLabel = 'Dismiss notification',
  className,
  ...rest
}: ToastProps) {
  const style = VARIANTS[variant];
  const Icon = style.Icon;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg',
        style.container,
        className,
      )}
      {...rest}
    >
      <Icon aria-hidden={true} className={cn('mt-0.5 h-5 w-5 shrink-0', style.icon)} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-[color:var(--brand-navy)]">{title}</p>
        {description && <div className="text-sm text-slate-700">{description}</div>}
        {action && <div className="pt-1">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="-m-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-900/5 hover:text-[color:var(--brand-navy)]"
        >
          <FaTimes aria-hidden={true} className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default Toast;
