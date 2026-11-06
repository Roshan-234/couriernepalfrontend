/**
 * One review we hold ourselves, with the company's answer under it.
 *
 * The reply is given real weight rather than being tucked away in small
 * grey text. On a complaint it is the more useful half of the card: a
 * reader deciding whether to trust a shipper learns more from how a problem
 * was answered than from the complaint itself.
 */

import { Badge } from "@/components/kit";
import type { Review } from "@/lib/resources/reviews";
import { cn } from "@/lib/utils";
import { Stars, countryName, reviewDate, starLabel } from "./shared";

export interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const written = reviewDate(review.created_at);
  const replied = reviewDate(review.reply_at);
  const country = countryName(review.author_country);

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[1rem] border border-slate-200 bg-white p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Stars value={review.rating} label={starLabel(review.rating)} />
        {review.is_verified_customer && (
          <Badge tone="teal" variant="soft" size="sm">
            Verified customer
          </Badge>
        )}
      </div>

      {review.title && (
        <h3 className="mt-3 text-base font-bold text-[color:var(--brand-navy)]">
          {review.title}
        </h3>
      )}

      {/* `whitespace-pre-line` keeps the paragraph breaks somebody typed.
          The text itself is rendered as written and never shortened. */}
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
        {review.body}
      </p>

      <p className="mt-4 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">{review.author_name}</span>
        {country && <> · {country}</>}
        {written && <> · {written}</>}
      </p>

      {review.reply_body && (
        <div className="mt-5 rounded-[0.75rem] border-l-4 border-[color:var(--brand-teal)] bg-teal-50/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-900">
            Moonlight Freight replied
            {replied && <span className="font-normal normal-case tracking-normal"> · {replied}</span>}
          </p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-7 text-teal-950">
            {review.reply_body}
          </p>
        </div>
      )}
    </article>
  );
}
