/**
 * Cookie and processing consent.
 *
 * The server is the source of truth for what a visitor agreed to. The
 * decision is a row keyed by an HttpOnly cookie, so JavaScript cannot read
 * it and must not keep its own copy: the previous banner cached the answer
 * in `localStorage`, which meant the browser and the server could disagree
 * and only the browser was ever consulted. Everything here asks the server.
 *
 * Wrappers follow the house style in this directory — thin, typed, and
 * leaning on the shared axios client so credentials and CSRF come along.
 */

import { del, get, post } from "./client";

/** The four categories the policy endpoint publishes. */
export type ConsentCategoryKey = "necessary" | "analytics" | "marketing" | "preferences";

/**
 * Where the visitor stands.
 *
 * `stale` means they answered an older policy version — worth asking again,
 * but not from a standing start, so the banner words it as a change to the
 * notice rather than a first request.
 */
export type ConsentState = "unknown" | "stale" | "decided" | "withdrawn";

/** Which surface a decision came from. Recorded as evidence. */
export type ConsentSource = "banner" | "preferences";

export interface ConsentCategory {
  key: string;
  label: string;
  description: string;
  /** `necessary` only. Shown, explained, and never switchable. */
  required: boolean;
}

export interface ConsentPolicy {
  policy_version: string;
  lifetime_days: number;
  cookie_name: string;
  categories: ConsentCategory[];
}

export type ConsentAllowances = Record<ConsentCategoryKey, boolean>;

export interface ConsentStatus {
  state: ConsentState;
  policy_version: string;
  categories: string[];
  /** True when the banner should be shown. */
  needs_decision: boolean;
  allows: ConsentAllowances;
  decided_at?: string | null;
  expires_at?: string | null;
}

export interface ConsentRecord {
  id: number;
  action: string;
  source: string;
  categories: string[];
  policy_version: string;
  created_at: string;
  expires_at?: string | null;
}

/** Nothing optional is on. The shape to assume before the server answers. */
export const NO_CONSENT: ConsentAllowances = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

/**
 * The categories on offer and the version they belong to.
 *
 * The banner renders its list from this rather than from a hard-coded one,
 * so the wording a visitor agrees to is the wording the record is written
 * against.
 */
export const getConsentPolicy = () => get<ConsentPolicy>("/consent/policy");

/** What this visitor has agreed to, as the server sees it. */
export const getConsentStatus = () => get<ConsentStatus>("/consent/");

/**
 * Record a decision. `[]` refuses everything optional, which is a decision
 * and is stored as one — silence is not refusal, a refusal is.
 */
export const saveConsent = (categories: string[], source: ConsentSource) =>
  post<ConsentRecord>("/consent/", { categories, source });

/** Withdraw consent. Art. 7(3): as easy as giving it. */
export const withdrawConsent = () => del<ConsentStatus>("/consent/");

/** The signed-in visitor's own consent history. */
export const getMyConsentHistory = () => get<{ items: ConsentRecord[] }>("/consent/me");
