"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";

import { useConsent } from "@/contexts/ConsentContext";

/**
 * The cookie banner.
 *
 * Accepting and refusing are the same control in two colours of nothing:
 * same element, same class, same size, same weight, side by side. That is
 * not a style preference. Consent is only freely given if refusing is no
 * harder than agreeing (recital 42), and a banner whose "Reject" is a grey
 * text link under a filled "Accept" has already failed that test before
 * anyone reads the words. The backend pins the same property on the API
 * side — both answers cost one request of identical shape.
 *
 * Everything else follows from it: no optional box starts ticked, the close
 * control and Escape both record a refusal rather than postponing the
 * question, and the third button only opens the detail — it never quietly
 * accepts on the way.
 */

const DISMISS_HINT = "Closing this records a refusal of everything optional.";

export default function ConsentBanner() {
  const { needsDecision, state, policy, saving, save, openPreferences } = useConsent();
  const panel = useRef<HTMLDivElement | null>(null);

  // Nothing is drawn until the policy is in hand. The categories, their
  // wording and the version being agreed to all come from the server, so a
  // banner rendered before it arrives would be offering terms of its own.
  const visible = needsDecision && Boolean(policy);

  // Refuse everything optional. The same call the "Reject all" button makes,
  // because dismissing a consent request is a refusal, not a "maybe later":
  // treating it as "ask again on the next page" is how a visitor ends up
  // tracked by attrition.
  const refuse = useCallback(() => {
    if (!saving) void save([], "banner");
  }, [saving, save]);

  // Escape anywhere on the page, not only inside the banner — the banner
  // does not trap focus, so the key has to be caught where the visitor is.
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") refuse();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible, refuse]);

  // Move focus to the banner when it appears, so a keyboard or screen reader
  // visitor meets the question instead of discovering it at the end of the
  // document. The region is labelled, so landing on it announces what it is.
  useEffect(() => {
    if (visible) panel.current?.focus();
  }, [visible]);

  if (!visible) return null;

  const stale = state === "stale";
  const optional = (policy?.categories ?? []).filter((category) => !category.required);
  const everything = optional.map((category) => category.key);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <section
        ref={panel}
        tabIndex={-1}
        role="region"
        aria-labelledby="consent-banner-heading"
        className="container panel max-w-5xl border-t-4 border-t-[color:var(--brand-yellow)] shadow-[0_24px_64px_-28px_#38377299] outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="kicker">Cookies</p>
            <h2
              id="consent-banner-heading"
              className="mt-2 text-xl font-bold text-[color:var(--brand-navy)]"
            >
              {stale ? "Our cookie notice has changed" : "Your choice about cookies"}
            </h2>
          </div>
          <button
            type="button"
            onClick={refuse}
            disabled={saving}
            title={DISMISS_HINT}
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[color:var(--brand-navy)] disabled:opacity-60"
          >
            <FaTimes aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Close and refuse optional cookies</span>
          </button>
        </div>

        {/* Tighter on a phone: at 375px the banner is a bottom sheet the
            visitor has to read past, so the measure is kept short without
            dropping any of what they are agreeing to. */}
        <p className="mt-3 max-w-[68ch] text-sm leading-6 text-slate-700 sm:text-[15px] sm:leading-7">
          {stale
            ? "We have updated what we measure and how we describe it, so the choice you made earlier no longer covers it. Please tell us again."
            : "Some cookies keep the site working — signing in, protecting forms, remembering this answer. The rest are optional and are off until you say otherwise."}{" "}
          We measure visits on our own servers. Nothing is sold and no profile is built.
        </p>

        {optional.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2 sm:mt-4" aria-label="Optional cookie categories">
            {optional.map((category) => (
              <li key={category.key} className="chip">
                {category.label}
              </li>
            ))}
          </ul>
        )}

        {/* Accept and Reject are deliberately the same button twice. Do not
            make one of them an outline or a link. */}
        <div className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
          <button
            type="button"
            className="action w-full"
            disabled={saving}
            onClick={() => void save(everything, "banner")}
          >
            Accept all
          </button>
          <button type="button" className="action w-full" disabled={saving} onClick={refuse}>
            Reject all
          </button>
          <button
            type="button"
            className="action action-outline w-full"
            disabled={saving}
            onClick={openPreferences}
          >
            Choose cookies
          </button>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-600 sm:mt-4 sm:leading-6">
          {DISMISS_HINT} You can change your mind at any time from{" "}
          <span className="font-semibold">Cookie settings</span> in the footer. Read the{" "}
          <Link className="font-semibold underline hover:text-[color:var(--brand-navy)]" href="/cookies">
            cookie notice
          </Link>{" "}
          or the{" "}
          <Link className="font-semibold underline hover:text-[color:var(--brand-navy)]" href="/privacy">
            privacy policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
