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

import { del, get, getPage, post, type Query } from "./client";
import type { Paginated } from "@/types/logistics";

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

// ── The register (admin / super_admin) ──────────────────────────────────────

/**
 * The evidence side, read by whoever has to answer a regulator.
 *
 * Art. 7(1) puts the burden of *demonstrating* consent on the controller,
 * so the register has to make one record readable on its own: what was
 * agreed, under which version of the notice, when, and when it lapses. The
 * admin listing adds the thin evidence fields the public endpoints never
 * return — a salted `ip_hash` (the address itself is not stored), the
 * user agent, the country and the pseudonymous `subject_key`.
 */

/** A register row: `ConsentRecord` plus `include_evidence=True`. */
export interface ConsentRegisterRow extends ConsentRecord {
  subject_key: string;
  user_id: number | null;
  country: string | null;
  user_agent: string | null;
  /** Salted SHA-256. There is no address behind it to recover. */
  ip_hash: string | null;
}

export interface ConsentRecordFilters extends Query {
  subject_key?: string;
  user_id?: number | string;
  action?: string;
  policy_version?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

/**
 * `GET /consent/summary`. Acceptance per category over the decisions still
 * in force — current policy version, not expired, latest per subject.
 */
export interface ConsentSummary {
  policy_version: string;
  decisions_in_force: number;
  withdrawn: number;
  accepted: Record<string, { count: number; rate: number }>;
  total_records: number;
}

/** `given`, `updated` or `withdrawn`. */
export const CONSENT_ACTIONS = ["given", "updated", "withdrawn"] as const;

export const consentRegister = {
  records: (query: ConsentRecordFilters = {}): Promise<Paginated<ConsentRegisterRow>> =>
    getPage<ConsentRegisterRow>("/consent/records", query),
  summary: () => get<ConsentSummary>("/consent/summary"),
};
