/**
 * Pieces shared by every review surface.
 *
 * Deliberately free of anything that decides *what* is shown: the rule that
 * our reviews and Google's are never blended lives in the components that
 * compose them, not here. A star is a star in both blocks, which is the only
 * thing the two have in common.
 */

import { FaStar } from "react-icons/fa";
import { cn } from "@/lib/utils";

export type StarSize = "sm" | "md" | "lg";

const STAR_SIZES: Record<StarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
};

export interface StarsProps {
  /** 0–5. Rounded to the nearest whole star for display. */
  value: number;
  size?: StarSize;
  /**
   * Spoken label. Pass one that reads as a sentence; the icons themselves
   * are hidden from assistive technology because five repeated "star"
   * announcements say nothing a reader can use.
   */
  label: string;
  className?: string;
}

/** Five stars, filled to `value`. */
export function Stars({ value, size = "md", label, className }: StarsProps) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className={cn("inline-flex items-center gap-0.5", STAR_SIZES[size], className)}>
      <span className="sr-only">{label}</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          aria-hidden="true"
          className={star <= filled ? "text-[color:var(--brand-yellow)]" : "text-slate-300"}
        />
      ))}
    </span>
  );
}

/** "4 out of 5 stars", for a star row's spoken label. */
export function starLabel(rating: number | null): string {
  if (rating === null) return "Not yet rated";
  return `${rating} out of 5 stars`;
}

/**
 * A review's date, as a month and year.
 *
 * Reviews are read as a body of opinion rather than a timeline, and a
 * to-the-minute timestamp on a two-year-old review only makes the page look
 * machine-generated. Returns null for a missing or unparseable date so the
 * caller renders nothing rather than "Invalid Date".
 */
export function reviewDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Full date and time, for the admin screens where precision matters. */
export function reviewMoment(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * The reviewer's country as a readable name.
 *
 * The backend stores an ISO alpha-2 code inferred from the request, so it is
 * frequently null and occasionally wrong. Shown as a quiet aside next to the
 * name, never as a claim about where the shipment went.
 */
export function countryName(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null;
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return names.of(code.toUpperCase()) ?? null;
  } catch {
    return code.toUpperCase();
  }
}
