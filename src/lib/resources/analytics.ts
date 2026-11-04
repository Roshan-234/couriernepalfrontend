/**
 * The first-party page-view beacon.
 *
 * This is what replaced Google Analytics. The measurement now happens on
 * our own servers, which is the claim the published `/cookies` page makes,
 * so this file is the only thing on the site that reports a visit — and it
 * reports it to one origin, ours.
 *
 * **Consent is not decided here.** The beacon fires either way, and the
 * server decides what to attach to it: with analytics consent the row
 * carries a pseudonymous visitor key, without it the row carries none and
 * can only ever be counted in a total. Gating the request itself in the
 * browser would look more privacy-conscious and would actually be worse —
 * it would make the visit counts depend on consent rates, so a refused
 * banner would read as a drop in traffic rather than as a visitor who
 * declined to be followed between pages. The distinction that matters is
 * whether visits can be joined into a journey, and that is the server's to
 * enforce, where it can be tested.
 *
 * @see app/analytics/collect.py in the backend for the rules applied to
 *      everything sent from here; all of it is treated as hostile input.
 */

import { API_BASE_URL } from "@/config";

/** Declared server-side in `AnalyticsEvent.NAMES`; anything else is a 400. */
export type AnalyticsEventName =
  | "page_view"
  | "quote_requested"
  | "tracking_lookup"
  | "shipment_booked"
  | "contact_submitted"
  | "newsletter_subscribe"
  | "outbound_click";

export interface AnalyticsPayload {
  path?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  detail?: Record<string, string | number | boolean>;
}

/**
 * Paths never reported.
 *
 * Everything behind a sign-in. A public path says which page is useful; a
 * path like `/dashboard/shipments/4817` says which *record* someone opened,
 * which is a different kind of fact and not one worth collecting to find
 * out that the pricing page is popular. The server already strips query
 * strings, so this is about the path itself.
 */
const PRIVATE_PREFIXES = ["/admin", "/dashboard", "/auth"];

export function isMeasurablePath(path: string): boolean {
  return !PRIVATE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Send one event. Never throws, never blocks, never delays a navigation.
 *
 * `sendBeacon` with a typed `Blob`: the default `text/plain` makes the
 * API's `get_json(silent=True)` return `None` and reject the call, and a
 * plain `fetch` on a page that is about to unload is a race the beacon
 * loses. `keepalive` is the fallback for browsers without `sendBeacon`.
 */
export function sendAnalyticsEvent(
  name: AnalyticsEventName,
  payload: AnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  const url = `${API_BASE_URL}/analytics/collect`;
  const body = JSON.stringify({ name, ...payload });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => undefined);
  } catch {
    /* Measurement is never worth an error in front of a customer. */
  }
}

/**
 * The campaign parameters, read from the current URL.
 *
 * Only the three the server stores. Copying the whole query string would
 * hand the analytics table whatever a campaign link happened to carry,
 * which is how a tracking number or an email address ends up in it.
 */
export function campaignParams(search: string): Pick<
  AnalyticsPayload,
  "utm_source" | "utm_medium" | "utm_campaign"
> {
  const params = new URLSearchParams(search);
  const take = (key: string) => {
    const value = params.get(key);
    return value ? value.slice(0, 80) : undefined;
  };
  return {
    utm_source: take("utm_source"),
    utm_medium: take("utm_medium"),
    utm_campaign: take("utm_campaign"),
  };
}
