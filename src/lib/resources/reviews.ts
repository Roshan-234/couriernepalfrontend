/**
 * Customer reviews, from two sources that are never blended.
 *
 * **Our own reviews** are written in our form, moderated by a person, and
 * replied to by the company. We own the aggregate: `average`, `count` and
 * `distribution` describe approved, non-demo reviews and nothing else.
 *
 * **Google's reviews** are somebody else's content, cached by the backend
 * from the Places API. They carry a required attribution string, they must
 * not be edited or shortened, and `place.rating` is Google's own average
 * over every review they hold — not an average of the handful returned.
 * The two scores are therefore kept apart everywhere, in the API, in these
 * types and on screen.
 *
 * Every envelope below was dumped from the running backend before this file
 * was written. Two of them do not match what a reader would guess:
 *
 * * `GET /reviews/google` while unconfigured answers
 *   `{configured: false, reviews: [], place: null}` — with no `stale` and
 *   no `attribution` key at all, so both are optional here.
 * * `GET /reviews/` answers `pages: 0` on an empty collection, which no
 *   pager can use. `onePage` floors it at 1.
 *
 * House style for this directory: thin typed wrappers over the shared axios
 * client, so credentials and CSRF come along for the admin calls.
 */

import axios from "axios";
import { del, get, post, type Query } from "./client";
import type { Paginated } from "@/types/logistics";

/* ── Our own reviews ────────────────────────────────────────────────────── */

export type ReviewStatus = "pending" | "approved" | "rejected";

/** The star counts, keyed `"1"`–`"5"` as the API sends them. */
export type RatingDistribution = Record<string, number>;

export interface ReviewSummary {
  /**
   * Null when nothing is approved — which is the state of a new site, not a
   * zero. Anything rendering this must say "no reviews yet" rather than
   * "0 out of 5".
   */
  average: number | null;
  count: number;
  distribution: RatingDistribution;
}

/** A review as the public API serves it. Approved and non-demo, always. */
export interface Review {
  id: number;
  rating: number;
  title: string | null;
  body: string;
  language: string;
  /** Shown publicly. The form asks for a first name and an initial. */
  author_name: string;
  /** ISO-3166 alpha-2, inferred by the backend. Often null. */
  author_country: string | null;
  /** True only when the review is tied to a real shipment. */
  is_verified_customer: boolean;
  /** The company's public answer, where one has been written. */
  reply_body: string | null;
  reply_at: string | null;
  created_at: string | null;
}

/** The extra fields only an administrator is served. */
export interface AdminReview extends Review {
  status: ReviewStatus;
  /** Seeded example content. Never public, and never approvable. */
  is_demo: boolean;
  author_email: string | null;
  user_id: number | null;
  shipment_id: number | null;
  moderated_by: number | null;
  moderated_at: string | null;
  /** Internal only. Why it was rejected; never shown to the public. */
  moderation_note: string | null;
  ip_hash: string | null;
}

/** A page of reviews, with the aggregate the API returns alongside it. */
export interface ReviewPage extends Paginated<Review> {
  summary: ReviewSummary;
}

export interface AdminReviewPage extends Paginated<AdminReview> {
  /** Across every status, not just this page. Drives the queue badge. */
  pending: number;
  summary: ReviewSummary;
}

export interface ReviewFilters extends Query {
  /** 1–5. Anything else is rejected by the API. */
  rating?: number | string;
  /** `true` narrows to reviews tied to a real shipment. */
  verified?: boolean | string;
  page?: number;
  per_page?: number;
}

/** What the form sends. Everything but the rating, body and name is optional. */
export interface ReviewSubmission {
  rating: number;
  body: string;
  author_name: string;
  title?: string;
  author_email?: string;
  language?: "en" | "ne";
  /**
   * Optional. A valid one earns the "verified customer" badge; an invalid
   * one is accepted in silence and simply does not verify, so the form must
   * never promise the badge or report the number as wrong.
   */
  tracking_no?: string;
}

/**
 * The acknowledgement. The same 202 body comes back whatever happened — the
 * review is never echoed, and nothing here says whether it was stored.
 */
export interface ReviewReceipt {
  status: string;
  message: string;
}

/**
 * Floor `pages` at 1.
 *
 * An empty collection answers `pages: 0`, and a pager told it is on page 1
 * of 0 renders nonsense. The count of pages a reader can be on is never
 * less than one.
 */
function onePage<T extends { pages: number }>(payload: T): T {
  return payload.pages >= 1 ? payload : { ...payload, pages: 1 };
}

export const reviews = {
  /** Approved, non-demo reviews, newest first, with the aggregate. */
  list: (query: ReviewFilters = {}) =>
    get<ReviewPage>("/reviews/", query).then(onePage),

  /** The aggregate on its own, for a surface that shows no list. */
  summary: () => get<ReviewSummary>("/reviews/summary"),

  /**
   * Send a review for moderation.
   *
   * Rate limited to five an hour. Resolves on the 202 acknowledgement and
   * nothing else: there is no row to render and nothing to add to a list.
   */
  submit: (body: ReviewSubmission) => post<ReviewReceipt>("/reviews/", body),
};

/* ── Google ─────────────────────────────────────────────────────────────── */

export interface GooglePlace {
  name: string | null;
  /** Google's own average over every review they hold. */
  rating: number | null;
  total_ratings: number | null;
  /** The Google listing. Linked wherever this content appears. */
  url: string | null;
  fetched_at: string | null;
}

export interface GoogleReview {
  id: number;
  author_name: string | null;
  author_url: string | null;
  profile_photo_url: string | null;
  rating: number | null;
  /** Reproduced verbatim. Never edited, never truncated. */
  text: string | null;
  /** Google's own phrasing, e.g. "a month ago". */
  relative_time: string | null;
  posted_at: string | null;
  source: "google";
}

export interface GoogleFeed {
  /**
   * False until the owner supplies a Places key and a place id, which is the
   * ordinary state today. Nothing at all should render while it is false —
   * not an empty widget, not a "coming soon".
   */
  configured: boolean;
  place: GooglePlace | null;
  reviews: GoogleReview[];
  /** Absent from the unconfigured response. */
  stale?: boolean;
  /** The attribution to display. Absent from the unconfigured response. */
  attribution?: string;
}

/** The fallback wording if the API ever omits `attribution`. */
export const GOOGLE_ATTRIBUTION = "Reviews from Google";

export const googleReviews = {
  /** Served from the backend's cache. Never calls Google on a page view. */
  feed: () => get<GoogleFeed>("/reviews/google"),
};

/* ── Administration ─────────────────────────────────────────────────────── */

export interface AdminReviewFilters extends Query {
  status?: ReviewStatus | "";
  /** `false` hides the seeded demo rows. */
  include_demo?: boolean | string;
  page?: number;
  per_page?: number;
}

/** What a refresh attempt reports. `ok: false` is an answer, not a failure. */
export interface GoogleRefreshResult {
  ok: boolean;
  /** `google_reviews_not_configured`, a Places status, or `request_failed`. */
  reason?: string;
  detail?: string;
  reviews?: number;
  rating?: number | null;
  total_ratings?: number | null;
}

/** Wording for the reasons the connector returns, for the admin screen. */
export const GOOGLE_REFRESH_REASONS: Record<string, string> = {
  google_reviews_not_configured:
    "No Google Places API key or place id is configured, so there is nothing to fetch.",
  request_failed: "Google could not be reached.",
  REQUEST_DENIED: "Google refused the request — the API key is wrong or not authorised.",
  OVER_QUERY_LIMIT: "The Places API quota for this key is spent.",
  INVALID_REQUEST: "Google rejected the request as malformed — check the place id.",
  NOT_FOUND: "Google does not recognise the configured place id.",
  ZERO_RESULTS: "Google holds no reviews for this place.",
};

export const reviewsAdmin = {
  /** Every review, including pending, rejected and demo rows. */
  list: (query: AdminReviewFilters = {}) =>
    get<AdminReviewPage>("/reviews/admin", query).then(onePage),

  /** Publish. Answers 409 for a demo review, which can never be published. */
  approve: (id: number) => post<AdminReview>(`/reviews/admin/${id}/approve`),

  /** Reject, with a note for the office that is never shown publicly. */
  reject: (id: number, note: string) =>
    post<AdminReview>(`/reviews/admin/${id}/reject`, { note }),

  /** Answer publicly. An empty body clears an existing reply. */
  reply: (id: number, reply_body: string) =>
    post<AdminReview>(`/reviews/admin/${id}/reply`, { reply_body }),

  /** Super administrators only. Rejecting keeps the record; this does not. */
  remove: (id: number) => del<{ deleted: number }>(`/reviews/admin/${id}`),

  /**
   * Fetch the Google reviews again.
   *
   * Billed per call, so this belongs behind a deliberate button and never on
   * a page view. A refusal arrives as a 409 carrying `{ok: false, reason}` —
   * an outcome the screen has to explain, not an exception — so it is read
   * off the response and returned rather than thrown.
   */
  refreshGoogle: async (): Promise<GoogleRefreshResult> => {
    try {
      return await post<GoogleRefreshResult>("/reviews/admin/google/refresh");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return (error.response.data ?? { ok: false }) as GoogleRefreshResult;
      }
      throw error;
    }
  },
};
