/**
 * The read side of the analytics table, for the admin screens.
 *
 * Kept out of `analytics.ts` on purpose. That module is the public beacon:
 * it is imported by every page on the website, it depends on nothing but
 * `@/config`, and it is loaded in a bare VM by `tests/analytics-beacon.test.cjs`
 * to pin the two rules that matter there. Hanging the authenticated
 * reporting wrappers — and the axios client behind them — off the same file
 * would put all of that on the public bundle's import graph for no gain.
 *
 * None of these return `visitor_key`, `session_key` or `ip_hash`. That is
 * the point of the endpoints rather than an omission: the keys are what
 * makes counting possible in SQL, and a listing that puts them on screen is
 * what turns a pseudonymous table into a re-identifiable one. Nothing here
 * should go looking for them.
 */

import { get, getPage, type Query } from "./client";
import type { Paginated } from "@/types/logistics";

/** One row of a top-N breakdown: a path, a referrer host, a country. */
export interface AnalyticsTopRow {
  value: string;
  events: number;
}

/** One day of the overview series. Quiet days are present and zeroed. */
export interface AnalyticsSeriesPoint {
  day: string;
  events: number;
  page_views: number;
  /** Consented visitors only — see `AnalyticsOverview.unique_visitors`. */
  visitors: number;
}

/**
 * `GET /analytics/overview`.
 *
 * **`unique_visitors` is a floor, not a count**, and the API says so in
 * three fields rather than one so that a screen cannot render it as a
 * confident figure by accident. Only visitors who agreed to analytics carry
 * a key; everyone who declined is inside `total_events` and
 * `events_without_visitor_key` and can never appear here, nor be told apart
 * from one another. `unique_visitors_source` is `"events"` normally and
 * `"daily_rollup"` once the raw events for the range have been purged, where
 * the figure is further approximated. Show the caveat next to the number.
 */
export interface AnalyticsOverview {
  from: string;
  to: string;
  days: number;
  total_events: number;
  page_views: number;
  unique_visitors: number;
  unique_visitors_is_floor: boolean;
  unique_visitors_source: "events" | "daily_rollup" | string;
  /** Prose from the server explaining the bound. Render it, do not paraphrase. */
  unique_visitors_basis: string;
  events_without_visitor_key: number;
  events_by_name: Record<string, number>;
  conversions: Record<string, number>;
  series: AnalyticsSeriesPoint[];
  top_paths: AnalyticsTopRow[];
  top_referrer_hosts: AnalyticsTopRow[];
  top_countries: AnalyticsTopRow[];
  devices: Record<string, number>;
}

/** A row from `/analytics/events`. Identifier-free by design. */
export interface AnalyticsEventRow {
  id: number;
  name: string;
  path: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  country: string | null;
  device: string | null;
  detail: Record<string, string | number | boolean> | null;
  occurred_at: string | null;
}

export interface AnalyticsEventFilters extends Query {
  name?: string;
  path?: string;
  country?: string;
  utm_campaign?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

/** A rollup row. Outlives the events it came from; holds no visitor key. */
export interface AnalyticsDailyRow {
  day: string;
  name: string;
  path: string | null;
  events: number;
  visitors: number;
}

export interface AnalyticsDailyPage extends Paginated<AnalyticsDailyRow> {
  from: string;
  to: string;
  sum_events: number;
  /**
   * Summed across (name, path) slices, so one visitor is counted once per
   * slice they touched. Not a distinct count, and not pretending to be.
   */
  sum_visitor_slices: number;
}

export interface AnalyticsRealtime {
  since: string;
  minutes: number;
  total_events: number;
  events_by_name: Record<string, number>;
  active_paths: AnalyticsTopRow[];
  items: AnalyticsEventRow[];
  total: number;
}

export interface AnalyticsRange extends Query {
  from?: string;
  to?: string;
}

export const analyticsReports = {
  /** At most 366 days. `from`/`to` are ISO dates. */
  overview: (range: AnalyticsRange = {}) => get<AnalyticsOverview>("/analytics/overview", range),
  events: (query: AnalyticsEventFilters = {}): Promise<Paginated<AnalyticsEventRow>> =>
    getPage<AnalyticsEventRow>("/analytics/events", query),
  daily: (query: AnalyticsEventFilters = {}) => get<AnalyticsDailyPage>("/analytics/daily", query),
  /** The last 30 minutes, for the "is the site alive" panel. */
  realtime: () => get<AnalyticsRealtime>("/analytics/realtime"),
};
