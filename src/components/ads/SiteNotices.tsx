"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { dismissNotice, getNotices, type SiteNotice } from "@/lib/resources/ads";
import { pageLanguage } from "./language";
import {
  countImpression,
  pruneExpired,
  rememberDismissal,
  suppressedCodes,
} from "./noticeStorage";
import NoticeBar from "./NoticeBar";
import NoticeModal from "./NoticeModal";
import NoticeToast from "./NoticeToast";

/**
 * Every live site notice for the current page, in the shape its `style`
 * asks for.
 *
 * Mount this once, high in the tree — bars render where this component sits,
 * so it belongs above the header; the dialog and the toast stack portal to
 * `document.body` and do not care.
 *
 * **Nothing is fetched until the browser has read its own dismissals.** The
 * suppressed codes go out as `?exclude=`, so a notice the visitor closed
 * last week is never in the response to begin with and cannot flash up
 * before the client has a chance to filter it. That ordering is the whole
 * reason the first render shows nothing rather than an optimistic list.
 */
export default function SiteNotices() {
  const path = usePathname() ?? "/";
  const language = pageLanguage();

  /** Null until the browser's own storage has been consulted. */
  const [excluded, setExcluded] = useState<string[] | null>(null);
  /** Closed during this page view — immediate feedback, and the only memory
      a non-dismissible notice ever gets. */
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [mounted, setMounted] = useState(false);

  /** Codes already counted, and the page they were counted for. Keyed by
      path rather than cleared on navigation, so React's development
      double-effect cannot count the same showing twice. */
  const counted = useRef<{ path: string; codes: Set<string> }>({ path: "", codes: new Set() });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    pruneExpired();
    setExcluded(suppressedCodes());
    // A new page is a new page view: a notice closed with "Continue" comes
    // back, a notice genuinely dismissed stays away because storage says so.
    setHidden(new Set());
  }, [path]);

  const { data } = useQuery({
    queryKey: queryKeys.ads.notices(path, language, excluded ?? []),
    queryFn: () => getNotices({ path, language, exclude: excluded ?? [] }),
    enabled: excluded !== null,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const visible = useMemo(
    () => (data?.items ?? []).filter((notice) => !hidden.has(notice.code)),
    [data, hidden],
  );

  // Count a showing once per notice per page view. The cap this feeds is
  // session-scoped; see `noticeStorage` for why it cannot honestly be more.
  const shownCodes = visible.map((notice) => notice.code).join("|");
  useEffect(() => {
    if (counted.current.path !== path) counted.current = { path, codes: new Set() };
    for (const notice of visible) {
      if (counted.current.codes.has(notice.code)) continue;
      counted.current.codes.add(notice.code);
      countImpression(notice.code, notice.max_impressions ?? null);
    }
    // `visible` is rebuilt every render; the joined codes are what changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownCodes, path]);

  const hide = useCallback((code: string) => {
    setHidden((previous) => new Set(previous).add(code));
  }, []);

  /**
   * Close it and remember it where the server says to.
   *
   * It disappears first and the request goes afterwards: the visitor asked
   * for it to go, and making that wait on a round trip would be the wrong
   * way round. If the request fails the dismissal is held for the session
   * anyway, so a close button still closes things offline.
   */
  const dismiss = useCallback(
    (notice: SiteNotice) => {
      hide(notice.code);
      dismissNotice(notice.id)
        .then((answer) => rememberDismissal(notice.code, answer.store, answer.dismiss_days))
        .catch(() => rememberDismissal(notice.code, "session", 0));
    },
    [hide],
  );

  const bars = visible.filter((notice) => notice.style === "bar");
  // One dialog at a time. Two stacked modal notices is not a design, and the
  // feed is already in priority order, so the first is the one that matters.
  const modal = visible.find((notice) => notice.style === "modal");
  const toasts = visible.filter((notice) => notice.style === "toast");

  return (
    <>
      {bars.map((notice) => (
        <NoticeBar
          key={notice.code}
          notice={notice}
          onDismiss={notice.is_dismissible ? () => dismiss(notice) : undefined}
        />
      ))}

      {modal && (
        <NoticeModal
          key={modal.code}
          notice={modal}
          open
          onDismiss={() => dismiss(modal)}
          onClose={() => hide(modal.code)}
        />
      )}

      {mounted &&
        toasts.length > 0 &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
            {toasts.map((notice) => (
              <NoticeToast
                key={notice.code}
                notice={notice}
                onDismiss={notice.is_dismissible ? () => dismiss(notice) : undefined}
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
