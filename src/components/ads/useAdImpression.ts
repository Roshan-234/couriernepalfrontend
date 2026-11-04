"use client";

import { useEffect, useRef } from "react";
import { sendAdEvent } from "@/lib/resources/ads";

/** Half the creative on screen counts as seen. */
const VISIBLE_RATIO = 0.5;

/**
 * Count a creative once, when it is actually on screen.
 *
 * Counting on mount would record an impression for a slot three screens
 * below the fold that nobody ever scrolled to, which is the difference
 * between a reach figure and a render figure — and the reports are read as
 * the former.
 *
 * Two details that are easy to get wrong:
 *
 * - **A creative taller than the viewport can never reach a 0.5 ratio**,
 *   because the ratio is measured against the element, not the screen. The
 *   hero on a 375px phone is exactly that case, so a second test passes it:
 *   half a screenful of the thing being visible is being seen.
 * - **It fires once per mount, not once per intersection.** Scrolling a slot
 *   back into view is the same page view and must not count again. The
 *   observer disconnects itself after the first hit, and the guard survives
 *   React's development double-effect because it lives in a ref.
 */
export function useAdImpression<T extends HTMLElement>(creativeId: number, path: string) {
  const ref = useRef<T | null>(null);
  const counted = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // No observer (very old browser, or a test environment) means no guess:
    // an uncounted impression is better than an invented one.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (counted.current) break;
          if (!entry.isIntersecting) continue;

          const screenful = entry.rootBounds?.height ?? window.innerHeight;
          const seen =
            entry.intersectionRatio >= VISIBLE_RATIO ||
            entry.intersectionRect.height >= screenful * VISIBLE_RATIO;
          if (!seen) continue;

          counted.current = true;
          sendAdEvent("impression", creativeId, path);
          observer.disconnect();
        }
      },
      { threshold: [0, VISIBLE_RATIO] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [creativeId, path]);

  return ref;
}
