"use client";

/**
 * The full list of reviews written on this site, with its filters.
 *
 * Only our own reviews are in here. Google's live in `GoogleBlock`, under
 * their own heading and their own rating, and the two are never interleaved
 * or averaged together — see `src/lib/resources/reviews.ts`.
 *
 * The summary is read from the list response rather than fetched separately,
 * because the API returns the same unfiltered aggregate on every page. That
 * matters: filtering to one star must not make the headline rating change to
 * match.
 */

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Checkbox, EmptyState, Pagination } from "@/components/kit";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { reviews } from "@/lib/resources/reviews";
import { RatingSummary } from "./RatingSummary";
import { ReviewCard } from "./ReviewCard";

const PER_PAGE = 10;

export function ReviewsBrowser() {
  const [rating, setRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: PER_PAGE,
      ...(rating ? { rating } : {}),
      ...(verifiedOnly ? { verified: true } : {}),
    }),
    [page, rating, verifiedOnly],
  );

  const list = useQuery({
    queryKey: queryKeys.reviews.list(filters),
    queryFn: () => reviews.list(filters),
    // Changing a filter or a page is a new cache key, and without this the
    // rating panel and the whole list blank out to "loading" between every
    // keystroke of a filter. Keeping the previous page on screen means only
    // the content changes, which is also what stops the page jumping.
    placeholderData: keepPreviousData,
  });

  const items = list.data?.items ?? [];
  const summary = list.data?.summary;
  const filtered = rating !== null || verifiedOnly;
  // The aggregate counts everything approved, so it is the honest answer to
  // "is there anything here at all" even while a filter is narrowing the list.
  const nothingPublished = (summary?.count ?? 0) === 0;

  function changeRating(next: number | null) {
    setRating(next);
    setPage(1);
  }

  function changeVerified(next: boolean) {
    setVerifiedOnly(next);
    setPage(1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[19rem_1fr] lg:items-start">
      <div className="space-y-4 lg:sticky lg:top-6">
        <RatingSummary
          summary={summary}
          loading={list.isLoading}
          onSelectRating={nothingPublished ? undefined : changeRating}
          selectedRating={rating}
        />

        {!nothingPublished && (
          <div className="panel">
            <p className="text-sm font-semibold text-[color:var(--brand-navy)]">
              Show only
            </p>
            <Checkbox
              wrapperClassName="mt-2"
              label="Verified customers"
              hint="Reviews we matched to a shipment in our own records."
              checked={verifiedOnly}
              onChange={(event) => changeVerified(event.target.checked)}
            />

            {filtered && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => {
                  changeRating(null);
                  changeVerified(false);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      <div>
        {/* The list's own status, announced for anyone not watching it. */}
        <p className="sr-only" aria-live="polite">
          {list.isLoading
            ? "Loading reviews"
            : `${list.data?.total ?? 0} matching review${(list.data?.total ?? 0) === 1 ? "" : "s"}`}
        </p>

        {list.isError ? (
          <EmptyState
            title="Could not load the reviews"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : list.isLoading ? (
          <p className="text-sm text-slate-600">Loading reviews…</p>
        ) : items.length === 0 ? (
          filtered ? (
            <EmptyState
              title="No reviews match that"
              description="Nothing published fits the filters you chose."
              action={
                <Button
                  onClick={() => {
                    changeRating(null);
                    changeVerified(false);
                  }}
                >
                  Show all reviews
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No reviews have been published yet"
              description="Every review is read by our team before it appears here, and none have been published so far. If you have shipped with us, the form below is open — yours would be the first."
            />
          )
        ) : (
          <>
            <div className="grid gap-4">
              {items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {(list.data?.pages ?? 1) > 1 && (
              <div className="mt-6">
                <Pagination
                  page={list.data?.page ?? 1}
                  pageCount={list.data?.pages ?? 1}
                  totalItems={list.data?.total}
                  pageSize={list.data?.per_page}
                  onPageChange={setPage}
                  label="Review pages"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
