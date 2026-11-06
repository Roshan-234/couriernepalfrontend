"use client";

/**
 * Our own rating: the average, the count and the star distribution.
 *
 * This describes approved reviews written on this site and nothing else.
 * Google's score is a different number over a different body of reviews and
 * is never mixed in here — see `GoogleBlock`.
 *
 * `average` is null until something is approved. That is a new site, not a
 * nought, so it says so in words instead of rendering "0 out of 5".
 */

import type { RatingDistribution, ReviewSummary } from "@/lib/resources/reviews";
import { cn } from "@/lib/utils";
import { Stars, starLabel } from "./shared";

export interface RatingSummaryProps {
  summary: ReviewSummary | undefined;
  loading?: boolean;
  /**
   * When given, each bar becomes a filter control. `null` clears it. The
   * rows stay plain text otherwise, because a bar that looks clickable and
   * is not is worse than one that never offered.
   */
  onSelectRating?: (rating: number | null) => void;
  /** The rating currently filtered on, so the active row can be marked. */
  selectedRating?: number | null;
  className?: string;
}

const STARS = [5, 4, 3, 2, 1];

function share(distribution: RatingDistribution, star: number, count: number): number {
  if (!count) return 0;
  return Math.round(((distribution[String(star)] ?? 0) / count) * 100);
}

export function RatingSummary({
  summary,
  loading = false,
  onSelectRating,
  selectedRating = null,
  className,
}: RatingSummaryProps) {
  if (loading) {
    return (
      <div className={cn("panel", className)} aria-busy="true">
        <p className="text-sm text-slate-600">Loading the rating…</p>
      </div>
    );
  }

  const count = summary?.count ?? 0;
  const average = summary?.average ?? null;
  const distribution = summary?.distribution ?? {};

  if (average === null || count === 0) {
    return (
      <div className={cn("panel", className)}>
        <p className="eyebrow text-[color:var(--brand-teal)]">Reviews on this site</p>
        <p className="mt-2 text-lg font-bold text-[color:var(--brand-navy)]">
          No reviews yet
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Nobody has published a review here yet. If you have shipped with us,
          yours would be the first — every review is read by our team before it
          appears.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("panel", className)}>
      <p className="eyebrow text-[color:var(--brand-teal)]">Reviews on this site</p>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-4xl font-extrabold leading-none text-[color:var(--brand-navy)]">
          {average.toFixed(1)}
        </p>
        <p className="text-sm text-slate-600">out of 5</p>
      </div>
      <div className="mt-2">
        <Stars value={average} size="lg" label={starLabel(average)} />
      </div>
      <p className="mt-2 text-sm text-slate-600">
        From {count} published review{count === 1 ? "" : "s"}
      </p>

      <ul className="mt-5 space-y-1.5">
        {STARS.map((star) => {
          const bucket = distribution[String(star)] ?? 0;
          const percent = share(distribution, star, count);
          const selected = selectedRating === star;

          const row = (
            <>
              <span className="w-12 shrink-0 text-xs text-slate-700">{star} star</span>
              <span
                aria-hidden="true"
                className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
              >
                <span
                  className="block h-full rounded-full bg-[color:var(--brand-yellow)]"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-xs tabular-nums text-slate-700">
                {bucket}
              </span>
            </>
          );

          return (
            <li key={star}>
              {onSelectRating ? (
                <button
                  type="button"
                  // Pressing the active row clears the filter, so the control
                  // is its own undo and there is no dead end on a bucket with
                  // nothing in it.
                  onClick={() => onSelectRating(selected ? null : star)}
                  aria-pressed={selected}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-[0.5rem] px-2 text-left hover:bg-slate-50",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-teal)]",
                    // Marked with a ring as well as a tint: on the narrow
                    // column the tint alone is easy to miss, and a filtered
                    // list that does not say it is filtered reads as a bug.
                    selected && "bg-teal-50 ring-1 ring-[color:var(--brand-teal)]",
                  )}
                >
                  <span className="sr-only">
                    {selected
                      ? `Showing only ${star}-star reviews. Press to show all.`
                      : `Show only ${star}-star reviews (${bucket})`}
                  </span>
                  {row}
                </button>
              ) : (
                <div className="flex min-h-7 items-center gap-3 px-2">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
