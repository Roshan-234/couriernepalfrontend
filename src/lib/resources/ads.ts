/**
 * The company's own promotion surfaces: offer slots and site notices.
 *
 * This is first-party only and deliberately thin. `/serve` has already
 * localised, filtered by page and country, sorted by priority and capped the
 * list to what the placement holds, so there is nothing left for the browser
 * to decide — a slot renders the array it is handed, in the order it arrives.
 * Re-sorting or re-filtering here would quietly contradict the server and
 * make a campaign report impossible to reconcile.
 *
 * Follows the house style in this directory: typed wrappers over the shared
 * axios client, with one exception. The impression and click counters do not
 * go through axios, because they must survive the page unloading underneath
 * them — see `sendAdEvent`.
 */

import { API_BASE_URL } from "@/config";
import { get, post } from "./client";

/* ── Creatives ──────────────────────────────────────────────────────────── */

/** The shape the slot was designed around; drives the default layout. */
export type AdFormat = "banner" | "strip" | "card" | "inline";

export interface AdCreative {
  id: number;
  campaign_id: number;
  placement_id: number;
  /** Placement code, e.g. `home_hero`. Null only if the slot was deleted. */
  placement: string | null;
  format: AdFormat;
  /** Already in the requested language. */
  headline: string;
  body: string | null;
  call_to_action: string | null;
  /** Site-relative. Empty means the creative is not a link. */
  target_path: string | null;
  /** Frequently empty — a text-only creative is a normal creative. */
  image_path: string | null;
  /** Always set by the server when `image_path` is. */
  image_alt: string | null;
  priority: number;
  is_active: boolean;
  impressions: number;
  clicks: number;
  click_through_rate: number;
}

export interface AdServeResponse {
  items: AdCreative[];
  total: number;
  path: string;
  language: string;
}

export interface ServeQuery {
  path: string;
  placement?: string;
  language?: string;
}

/**
 * What belongs in a slot on this page, decided server-side.
 *
 * An empty `items` is the ordinary resting state of this system — every
 * campaign ships as a draft — not an error and not a gap to fill.
 */
export const serveAds = ({ path, placement, language = "en" }: ServeQuery) =>
  get<AdServeResponse>("/ads/serve", { path, placement, language });

/* ── Notices ────────────────────────────────────────────────────────────── */

export type NoticeStyle = "bar" | "modal" | "toast";
export type NoticeTone = "info" | "promotion" | "warning" | "disruption";

export interface SiteNotice {
  id: number;
  code: string;
  title: string;
  body: string | null;
  style: NoticeStyle;
  tone: NoticeTone;
  link_path: string | null;
  link_label: string | null;
  /** Days a dismissal should stick for, if the visitor allows persistence. */
  dismiss_days: number | null;
  /** Frequency cap. Honoured only as far as the available storage allows. */
  max_impressions: number | null;
  is_dismissible: boolean;
  priority: number;
}

export interface NoticeFeed {
  items: SiteNotice[];
  total: number;
  path: string;
  language: string;
}

export interface NoticeQuery {
  path: string;
  /** Codes already dismissed, so a dismissed notice never flashes up. */
  exclude?: string[];
  language?: string;
}

export const getNotices = ({ path, exclude = [], language = "en" }: NoticeQuery) =>
  get<NoticeFeed>("/ads/notices", {
    path,
    language,
    exclude: exclude.join(","),
  });

/** Where the browser should remember a dismissal, decided by the server. */
export interface NoticeDismissal {
  code: string;
  /** `local` only when the visitor consented to preferences cookies. */
  store: "local" | "session";
  /** Zero when the dismissal may not be persisted beyond the session. */
  dismiss_days: number;
  stored_server_side: false;
}

/**
 * Count a dismissal and ask where to keep it.
 *
 * The server holds no per-visitor state here; the answer is advice about
 * storage, and honouring it is what keeps the feature working for visitors
 * who refused preferences cookies.
 */
export const dismissNotice = (noticeId: number) =>
  post<NoticeDismissal>(`/ads/notices/${noticeId}/dismiss`, {});

/* ── Counters ───────────────────────────────────────────────────────────── */

export type AdEventKind = "impression" | "click";

/**
 * Fire a counter at the API without ever getting in the visitor's way.
 *
 * Three properties, each one load-bearing:
 *
 * 1. **It does not delay a navigation.** A click beacon sent with axios on a
 *    link that is about to unload the document is a race the beacon loses,
 *    and `await`-ing it first is worse: it puts network latency in front of
 *    every click. `sendBeacon` hands the request to the browser, which
 *    delivers it after the page is gone.
 * 2. **It carries `application/json`.** `sendBeacon` defaults to
 *    `text/plain`, and the API parses with `get_json(silent=True)`, which
 *    answers `None` to that and rejects the call. A typed `Blob` fixes it.
 * 3. **It never throws.** A blocked beacon, an ad blocker's heuristic or an
 *    offline visitor must not surface anything; a counter failing is a
 *    reporting problem, not the visitor's problem.
 */
export function sendAdEvent(kind: AdEventKind, creativeId: number, path: string): void {
  if (typeof window === "undefined") return;
  const url = `${API_BASE_URL}/ads/${kind}`;
  const payload = JSON.stringify({ creative_id: creativeId, path });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
    // `keepalive` is the fetch equivalent: the request outlives the document.
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* A counter is never worth an error in front of a customer. */
  }
}
