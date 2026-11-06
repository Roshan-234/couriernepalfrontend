"use client";

/**
 * Google's reviews, kept in their own block.
 *
 * This is somebody else's content and is treated as such:
 *
 * * **Nothing renders while `configured` is false** — no heading, no empty
 *   widget, no "coming soon". That is the state today, and a placeholder for
 *   content we have never had is how a working page starts looking broken.
 * * **Attribution is shown wherever the content is**, using the string the
 *   API returns.
 * * **The text is reproduced as written.** No truncation, no "read more"
 *   that hides half a sentence, no editing.
 * * **The score is Google's own.** `place.rating` is their average over every
 *   review they hold; the handful returned here are a shop window, not the
 *   sample it was computed from. Nothing in this file averages the reviews
 *   on screen, and nothing merges this number with our own rating.
 *
 * The reviewer's profile photo is deliberately not rendered: it is a remote
 * Google asset, and the author is instead credited by name and linked to
 * their own profile where Google gives one.
 */

import { useQuery } from "@tanstack/react-query";
import { FaExternalLinkAlt } from "react-icons/fa";
import { queryKeys } from "@/lib/queryKeys";
import {
  GOOGLE_ATTRIBUTION,
  googleReviews,
  type GoogleReview,
} from "@/lib/resources/reviews";
import { Stars, starLabel } from "./shared";

export interface GoogleBlockProps {
  className?: string;
}

function GoogleCard({ review }: { review: GoogleReview }) {
  return (
    <article className="flex h-full flex-col rounded-[1rem] border border-slate-200 bg-white p-5">
      {review.rating !== null && (
        <Stars value={review.rating} size="sm" label={starLabel(review.rating)} />
      )}
      {review.text && (
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
          {review.text}
        </p>
      )}
      <p className="mt-4 text-xs text-slate-600">
        {review.author_url ? (
          <a
            href={review.author_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-semibold text-slate-800 hover:underline"
          >
            {review.author_name ?? "A Google reviewer"}
          </a>
        ) : (
          <span className="font-semibold text-slate-800">
            {review.author_name ?? "A Google reviewer"}
          </span>
        )}
        {/* Google's own phrasing of the age, reproduced rather than
            recalculated from `posted_at`. */}
        {review.relative_time && <> · {review.relative_time}</>}
      </p>
    </article>
  );
}

export function GoogleBlock({ className }: GoogleBlockProps) {
  const feed = useQuery({
    queryKey: queryKeys.reviews.google,
    queryFn: () => googleReviews.feed(),
    // Cached server-side and refreshed by hand; there is nothing to gain
    // from asking again on every mount.
    staleTime: 10 * 60 * 1000,
  });

  const data = feed.data;
  if (!data?.configured) return null;

  const place = data.place;
  const hasReviews = data.reviews.length > 0;
  if (!place && !hasReviews) return null;

  return (
    <section className={className} aria-labelledby="google-reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[color:var(--brand-teal)]">
            {data.attribution || GOOGLE_ATTRIBUTION}
          </p>
          <h2
            id="google-reviews-heading"
            className="mt-1 text-2xl font-bold text-[color:var(--brand-navy)]"
          >
            What people wrote on Google
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            These are posted on our Google listing, not here, and we cannot
            edit or reply to them from this site. They are kept separate from
            the reviews written on this site and the two ratings are not
            combined.
          </p>
        </div>

        {place && (
          <div className="text-left sm:text-right">
            {place.rating !== null && (
              <>
                <p className="text-2xl font-extrabold leading-none text-[color:var(--brand-navy)]">
                  {place.rating.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-slate-600">out of 5</span>
                </p>
                <div className="mt-1 sm:flex sm:justify-end">
                  <Stars value={place.rating} label={`Google rating: ${starLabel(place.rating)}`} />
                </div>
              </>
            )}
            {place.total_ratings !== null && (
              <p className="mt-1 text-xs text-slate-600">
                Google&rsquo;s own average over {place.total_ratings.toLocaleString()} rating
                {place.total_ratings === 1 ? "" : "s"}
              </p>
            )}
          </div>
        )}
      </div>

      {hasReviews && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.reviews.map((review) => (
            <GoogleCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {place?.url && (
        <p className="mt-5">
          <a
            href={place.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
          >
            See the listing on Google
            <FaExternalLinkAlt aria-hidden="true" className="text-xs" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </p>
      )}
    </section>
  );
}
