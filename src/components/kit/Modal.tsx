'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  );
}

export interface DialogA11yOptions {
  open: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  /** Element to focus when the dialog opens. Defaults to the first tabbable. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export interface DialogA11yResult {
  /** Attach to the dialog panel. */
  panelRef: React.RefObject<HTMLDivElement | null>;
  /** False until after hydration, so portals are not rendered on the server. */
  mounted: boolean;
}

/**
 * Shared overlay behaviour for `Modal`, `Drawer` and `ConfirmDialog`:
 * focus moves in on open and back to the trigger on close, Tab is trapped
 * inside the panel, Escape closes, and the page behind stops scrolling.
 */
export function useDialogA11y({
  open,
  onClose,
  closeOnEscape = true,
  initialFocusRef,
}: DialogA11yOptions): DialogA11yResult {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Move focus in, and put it back where it came from on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = initialFocusRef?.current ?? focusableWithin(panel)[0] ?? panel;
      target.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      previouslyFocused?.focus();
    };
  }, [open, initialFocusRef]);

  // Stop the page behind the overlay from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape to close, Tab cycles inside the panel.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (closeOnEscape) {
          event.preventDefault();
          onClose();
        }
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = focusableWithin(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open, onClose, closeOnEscape]);

  return { panelRef, mounted };
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const MODAL_SIZES: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Labels the dialog. Always provide one. */
  title: React.ReactNode;
  /** Optional supporting line, wired up as `aria-describedby`. */
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Action row pinned to the bottom of the panel. */
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Centred dialog rendered in a portal on `document.body`. Full width on
 * phones, constrained from the `sm` breakpoint up.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocusRef,
  className,
}: ModalProps) {
  const { panelRef, mounted } = useDialogA11y({ open, onClose, closeOnEscape, initialFocusRef });
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const descriptionId = description ? `${reactId}-description` : undefined;

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) onClose();
  }, [closeOnOverlayClick, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        onClick={handleOverlayClick}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          'relative z-10 my-0 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:my-8 sm:rounded-2xl sm:p-6',
          MODAL_SIZES[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className="text-lg font-bold text-[color:var(--brand-navy)]">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-slate-600">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[color:var(--brand-navy)]"
            >
              <FaTimes aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>

        {children && <div className="mt-4 text-sm text-slate-700">{children}</div>}

        {footer && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
