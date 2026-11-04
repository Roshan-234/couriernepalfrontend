"use client";

/**
 * Reports one page view per navigation, to our own API and nowhere else.
 *
 * Mounted once in the root layout. Next's App Router does not reload the
 * document between pages, so without this only the first page of a visit
 * would ever be counted.
 */

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  campaignParams,
  isMeasurablePath,
  sendAnalyticsEvent,
} from "@/lib/resources/analytics";

export default function PageViews() {
  const path = usePathname();
  const search = useSearchParams();

  // The last path actually reported. React runs effects twice in
  // development under StrictMode, and a naive version counts every page
  // twice — which is invisible in production and quietly doubles every
  // figure an administrator looks at while developing.
  const reported = useRef<string | null>(null);

  useEffect(() => {
    if (!path || reported.current === path) return;
    if (!isMeasurablePath(path)) {
      // Remember it anyway, so returning to a public page from a private
      // one still counts as one view rather than being suppressed.
      reported.current = path;
      return;
    }
    reported.current = path;

    sendAnalyticsEvent("page_view", {
      path,
      // The in-app referrer is the previous route, which the server reduces
      // to a host and therefore discards for same-site navigation. Sending
      // document.referrer is only meaningful on the first page of a visit,
      // and that is exactly where it is wanted.
      referrer: document.referrer || undefined,
      ...campaignParams(search?.toString() ?? ""),
    });
  }, [path, search]);

  return null;
}
