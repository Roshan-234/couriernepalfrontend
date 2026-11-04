"use client";

import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import type { SiteNotice } from "@/lib/resources/ads";
import { cn } from "@/lib/utils";
import { toneStyle } from "./tone";

export interface NoticeToastProps {
  notice: SiteNotice;
  /** Omitted when the notice is not dismissible — then there is no control. */
  onDismiss?: () => void;
}

/**
 * A corner card for something worth saying but not worth a bar across the
 * page — a changed cut-off on one corridor, a counter opening late.
 *
 * It does not time out. These are editorial notices written by somebody in
 * the office, not confirmations of an action the visitor just took, and a
 * notice that vanishes after four seconds is one a slow reader never read.
 * It leaves when it is dismissed, or when the visitor leaves the page.
 */
export default function NoticeToast({ notice, onDismiss }: NoticeToastProps) {
  const tone = toneStyle(notice.tone);
  const Icon = tone.icon;

  return (
    <div
      role={tone.role}
      aria-live={tone.live}
      className={cn(
        "pointer-events-auto w-full overflow-hidden rounded-xl border shadow-xl sm:w-96",
        tone.surface,
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon aria-hidden="true" className={cn("mt-0.5 shrink-0", tone.iconClass)} />
        <div className="min-w-0 flex-1">
          <p className={cn("eyebrow", tone.labelClass)}>{tone.label}</p>
          <p className="mt-1 text-sm font-bold leading-snug">{notice.title}</p>
          {notice.body && (
            <p className={cn("mt-1.5 text-sm leading-6", tone.bodyClass)}>{notice.body}</p>
          )}
          {notice.link_path && (
            <Link
              href={notice.link_path}
              className={cn(
                "mt-2 inline-block text-sm font-bold underline underline-offset-4",
                tone.linkClass,
              )}
            >
              {notice.link_label || "Read more"}
            </Link>
          )}
        </div>
        {notice.is_dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={`Dismiss notice: ${notice.title}`}
            className={cn(
              "-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              tone.closeClass,
            )}
          >
            <FaTimes aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
