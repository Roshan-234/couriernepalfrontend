"use client";

import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import type { SiteNotice } from "@/lib/resources/ads";
import { cn } from "@/lib/utils";
import { toneStyle } from "./tone";

export interface NoticeBarProps {
  notice: SiteNotice;
  /** Omitted when the notice is not dismissible — then there is no control. */
  onDismiss?: () => void;
  className?: string;
}

/**
 * A full-width announcement bar, meant to sit above the header.
 *
 * A notice with `is_dismissible: false` gets no close control at all. That
 * is safe here in a way it would not be in a dialog: a bar takes a strip off
 * the top of the page and nothing else, so refusing to let it be closed
 * never traps anybody.
 */
export default function NoticeBar({ notice, onDismiss, className }: NoticeBarProps) {
  const tone = toneStyle(notice.tone);
  const Icon = tone.icon;

  return (
    <div
      role={tone.role}
      aria-live={tone.live}
      className={cn("border-b", tone.surface, className)}
    >
      <div className="container flex items-start gap-3 py-2.5 sm:items-center sm:py-3">
        <Icon aria-hidden="true" className={cn("mt-0.5 shrink-0 sm:mt-0", tone.iconClass)} />

        <div className="min-w-0 flex-1 text-sm leading-6">
          <span className={cn("eyebrow mr-2 hidden sm:inline", tone.labelClass)}>
            {tone.label}
          </span>
          <span className="font-bold">{notice.title}</span>
          {notice.body && <span className={cn("ml-2", tone.bodyClass)}>{notice.body}</span>}
          {notice.link_path && (
            <Link
              href={notice.link_path}
              className={cn("ml-2 font-bold underline underline-offset-4", tone.linkClass)}
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
              "-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
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
