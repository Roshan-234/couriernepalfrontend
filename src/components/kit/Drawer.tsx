'use client';

import { useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useDialogA11y } from './Modal';

export type DrawerSide = 'right' | 'left';
export type DrawerSize = 'sm' | 'md' | 'lg';

const DRAWER_SIZES: Record<DrawerSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-xl',
};

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Labels the dialog. Always provide one. */
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Action row pinned to the bottom of the panel. */
  footer?: React.ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Edge-anchored dialog for filters, detail panes and side forms. Same focus
 * trap, focus restore and Escape handling as `Modal`; full width on phones.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  initialFocusRef,
  className,
}: DrawerProps) {
  const { panelRef, mounted } = useDialogA11y({ open, onClose, closeOnEscape, initialFocusRef });
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const descriptionId = description ? `${reactId}-description` : undefined;

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) onClose();
  }, [closeOnOverlayClick, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        onClick={handleOverlayClick}
        className="absolute inset-0 bg-slate-900/50"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          'absolute inset-y-0 flex w-full flex-col border-slate-200 bg-white shadow-2xl',
          side === 'right' ? 'right-0 sm:border-l' : 'left-0 sm:border-r',
          DRAWER_SIZES[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className="text-base font-bold text-[color:var(--brand-navy)]">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-slate-600">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[color:var(--brand-navy)]"
          >
            <FaTimes aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-slate-700">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default Drawer;
