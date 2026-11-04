"use client";

import Link from "next/link";
import { useId } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { useDialogA11y } from "@/components/kit/Modal";
import type { SiteNotice } from "@/lib/resources/ads";
import { cn } from "@/lib/utils";
import { toneStyle } from "./tone";

export interface NoticeModalProps {
  notice: SiteNotice;
  open: boolean;
  /** Close and remember it. Only called for a dismissible notice. */
  onDismiss: () => void;
  /** Close for this page view only. Nothing is remembered. */
  onClose: () => void;
}

/**
 * A notice important enough to interrupt.
 *
 * Accessibility comes from `useDialogA11y`, the same hook the UI kit's
 * `Modal` uses: focus moves into the panel, Tab is trapped inside it,
 * Escape closes, the page behind stops scrolling, and focus returns to
 * whatever had it when the dialog opened.
 *
 * **On `is_dismissible: false`.** A bar or a toast with no close control is
 * merely insistent; a *dialog* with no close control is a keyboard trap, and
 * a visitor who cannot reach the page behind it has been locked out of the
 * site by a marketing flag. So a non-dismissible notice gets no ✕ and
 * nothing is written to storage for it — it returns on the next page view,
 * every time, which is what non-dismissible has to mean here — but Escape,
 * the overlay and one plainly-labelled "Continue" button still let the
 * visitor past it. The flag withholds the memory of the dismissal, not the
 * way out.
 */
export default function NoticeModal({ notice, open, onDismiss, onClose }: NoticeModalProps) {
  const dismissible = notice.is_dismissible;
  const close = dismissible ? onDismiss : onClose;
  const { panelRef, mounted } = useDialogA11y({ open, onClose: close });

  const reactId = useId();
  const titleId = `${reactId}-title`;
  const bodyId = notice.body ? `${reactId}-body` : undefined;

  const tone = toneStyle(notice.tone);
  const Icon = tone.icon;

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-[1px]"
      />
      <div
        ref={panelRef}
        role={notice.tone === "disruption" ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:my-8 sm:max-w-lg sm:rounded-2xl"
      >
        {/* The tone owns the head of the panel, so a shut border and a
            Dashain offer are not the same dialog with different words. */}
        <div className={cn("flex items-start gap-3 border-b px-5 py-4 sm:px-6", tone.surface)}>
          <Icon aria-hidden="true" className={cn("mt-1 shrink-0", tone.iconClass)} />
          <div className="min-w-0 flex-1">
            <p className={cn("eyebrow", tone.labelClass)}>{tone.label}</p>
            <h2 id={titleId} className="mt-1 text-lg font-extrabold leading-snug">
              {notice.title}
            </h2>
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={`Dismiss notice: ${notice.title}`}
              className={cn(
                "-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                tone.closeClass,
              )}
            >
              <FaTimes aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="px-5 py-5 sm:px-6">
          {notice.body && (
            <p id={bodyId} className="text-sm leading-7 text-slate-700">
              {notice.body}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={close} className="action action-outline">
              {dismissible ? "Close" : "Continue to the site"}
            </button>
            {notice.link_path && (
              <Link href={notice.link_path} onClick={close} className="action">
                {notice.link_label || "Read more"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
