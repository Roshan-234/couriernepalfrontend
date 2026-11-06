"use client";

/**
 * A few customer reviews on the homepage.
 *
 * **The empty section is the normal section.** Nothing is published until a
 * person approves it, so an established company can perfectly well have an
 * empty public list for weeks. This renders `null` — no wrapper, no heading,
 * no skeleton, no "be the first" box — while loading, on error and whenever
 * there is nothing approved, the same rule `AdSlot` follows, so the page
 * above and below closes up rather than leaving a hole.
 *
 * Google's reviews are not here. They are a separate body of content with a
 * separate rating and their own block on `/reviews`, and three cards on a
 * homepage is not the place to carry the attribution they require.
 */

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FaArrowRight } from "react-icons/fa";
import { queryKeys } from "@/lib/queryKeys";
import { reviews } from "@/lib/resources/reviews";
import { ReviewCard } from "./ReviewCard";
import { Stars, starLabel } from "./shared";

/** How many to show. Three fits the grid the rest of the homepage uses. */
const SHOWN = 3;

/**
 * The page the picks are drawn from.
 *
 * Deliberately the most recent page rather than every review ever written:
 * this is "some of what people have said lately", which the heading can
 * honestly claim, not an all-time best-of assembled by scanning the archive.
 */
const DRAWN_FROM = 12;

const FILTERS = { page: 1, per_page: DRAWN_FROM };

export function HomeReviews() {
  const list = useQuery({
    queryKey: queryKeys.reviews.list(FILTERS),
    queryFn: () => reviews.list(FILTERS),
    staleTime: 5 * 60 * 1000,
  });

  const summary = list.data?.summary;
  const picks = [...(list.data?.items ?? [])]
    // Best first; among equals, the ones we answered, because a reply is the
    // part a reader learns most from. Newest breaks the remaining ties.
    .sort(
      (a, b) =>
        b.rating - a.rating ||
        Number(Boolean(b.reply_body)) - Number(Boolean(a.reply_body)) ||
        (b.created_at ?? "").localeCompare(a.created_at ?? ""),
    )
    .slice(0, SHOWN);

  if (picks.length === 0) return null;

  return (
    <section className="surface-tint border-y border-slate-200">
      <div className="section container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="kicker mb-4">What customers say</p>
            <h2 className="display-sm max-w-xl">In their words.</h2>
            {summary && summary.average !== null && (
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                <Stars value={summary.average} label={starLabel(summary.average)} />
                <span>
                  <strong className="text-[color:var(--brand-navy)]">
                    {summary.average.toFixed(1)} out of 5
                  </strong>{" "}
                  from {summary.count} published review{summary.count === 1 ? "" : "s"} on this
                  site
                </span>
              </p>
            )}
          </div>
          <Link href="/reviews" className="font-semibold text-teal-700 hover:underline">
            Read all reviews →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {picks.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        <Link href="/reviews" className="action action-outline mt-8 w-full sm:w-auto">
          Write a review <FaArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
