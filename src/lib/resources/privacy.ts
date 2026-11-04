/**
 * Data subject requests and the retention schedule.
 *
 * The endpoints behind this module enforce rules the UI has to respect
 * rather than discover: `/export` and `/erase` answer 409 until identity is
 * verified, `/erase` is super-admin only and wants the request's own
 * reference echoed back, and `/export` writes the bundle to a file on the
 * server and returns a path. Each of those is stated on the wrapper so a
 * screen built from this module cannot offer an action the API will refuse.
 *
 * House style: thin, typed, and leaning on the shared client so credentials
 * and CSRF come along.
 */

import { get, getPage, post, put, type Query } from "./client";
import type { Paginated } from "@/types/logistics";

/** The six rights the API accepts. Anything else is a 400. */
export type DataRequestKind =
  | "access"
  | "rectification"
  | "erasure"
  | "restriction"
  | "portability"
  | "objection";

export type DataRequestStatus =
  | "received"
  | "verifying"
  | "in_progress"
  | "completed"
  | "refused";

export const DATA_REQUEST_KINDS: readonly DataRequestKind[] = [
  "access",
  "rectification",
  "erasure",
  "restriction",
  "portability",
  "objection",
];

export const DATA_REQUEST_STATUSES: readonly DataRequestStatus[] = [
  "received",
  "verifying",
  "in_progress",
  "completed",
  "refused",
];

/** The statuses that take a request out of the queue. No deadline left to miss. */
export const CLOSED_STATUSES: readonly DataRequestStatus[] = ["completed", "refused"];

export interface DataRequestRow {
  id: number;
  reference: string;
  kind: DataRequestKind;
  status: DataRequestStatus;
  email: string;
  user_id: number | null;
  details: string | null;
  /** Export and erase both refuse while this is false. */
  identity_verified: boolean;
  identity_verified_at: string | null;
  due_at: string | null;
  extended_until: string | null;
  /** `extended_until` when the extension was taken, otherwise `due_at`. */
  deadline: string | null;
  /** Null once the request is closed. */
  days_remaining: number | null;
  is_overdue: boolean;
  handled_by: number | null;
  completed_at: string | null;
  outcome_note: string | null;
  created_at: string | null;
}

export interface DataRequestFilters extends Query {
  kind?: string;
  status?: string;
  /** "true" / "false". Omitted means both. */
  overdue?: string;
  page?: number;
  per_page?: number;
}

/** `GET /privacy/overdue`. The number that belongs on a dashboard. */
export interface OverdueSummary {
  overdue: number;
  due_within_7_days: number;
  oldest_reference: string | null;
}

/**
 * What an erasure actually did.
 *
 * Three buckets, because Art. 17 is not a delete button: some rows are
 * anonymised and kept, some are deleted outright, and some are retained in
 * full under another legal obligation. `notes` says why for each.
 */
export interface ErasureReport {
  subject_email: string;
  user_id: number | null;
  anonymised: Record<string, number>;
  deleted: Record<string, number>;
  retained: Record<string, number>;
  notes: string[];
}

export interface ErasureResult {
  reference: string;
  report: ErasureReport;
}

/**
 * `POST /requests/<id>/export` never returns the bundle.
 *
 * It writes a file server-side at 0600 and hands back the path. There is
 * nothing here for a browser to download, and a screen that offers one is
 * promising something the API deliberately does not do.
 */
export interface ExportResult {
  reference: string;
  export_path: string;
  sections: string[];
  note: string;
}

export interface RetentionRule {
  id: number;
  code: string;
  label: string;
  /** The model the purge job deletes from. Fixed; not editable. */
  target: string;
  retain_days: number;
  /** Why this period. Several seeded rules carry "[TO CONFIRM with counsel]". */
  basis: string | null;
  /** Scheduled deletion. Off until somebody turns it on deliberately. */
  auto_purge: boolean;
  last_purged_at: string | null;
  last_purged_count: number;
  is_active: boolean;
}

export interface RetentionSchedule {
  items: RetentionRule[];
  total: number;
  /** How many rules still carry a "[TO CONFIRM" marker in their basis. */
  unconfirmed: number;
}

export interface RetentionUpdate {
  retain_days?: number;
  basis?: string;
  auto_purge?: boolean;
  is_active?: boolean;
}

export interface RetentionSeedResult {
  created: number;
  updated: number;
  total: number;
}

export const privacy = {
  /** Nearest deadline first; closed requests sort last. */
  queue: (query: DataRequestFilters = {}): Promise<Paginated<DataRequestRow>> =>
    getPage<DataRequestRow>("/privacy/queue", query),

  overdue: () => get<OverdueSummary>("/privacy/overdue"),

  /** The note has to say *how* identity was established, not merely that it was. */
  verify: (id: number, note: string) =>
    post<DataRequestRow>(`/privacy/requests/${id}/verify`, { note }),

  /** Art. 12(3)'s two extra months. The reason is sent to the requester, so it is required. */
  extend: (id: number, reason: string) =>
    post<DataRequestRow>(`/privacy/requests/${id}/extend`, { reason }),

  complete: (id: number, note: string) =>
    post<DataRequestRow>(`/privacy/requests/${id}/complete`, { note }),

  /** Art. 12(4): a refusal has to be explained. */
  refuse: (id: number, note: string) =>
    post<DataRequestRow>(`/privacy/requests/${id}/refuse`, { note }),

  /** 409 until identity is verified. Returns a server-side path, never the bundle. */
  exportBundle: (id: number) => post<ExportResult>(`/privacy/requests/${id}/export`),

  /** Super-admin, verified identity, and `confirm` set to the request's reference. */
  erase: (id: number, confirm: string, note: string) =>
    post<ErasureResult>(`/privacy/requests/${id}/erase`, { confirm, note }),

  retention: () => get<RetentionSchedule>("/privacy/retention"),
  /** `code` and `target` are fixed: they name the rows a purge would delete. */
  updateRetention: (id: number, body: RetentionUpdate) =>
    put<RetentionRule>(`/privacy/retention/${id}`, body),
  seedRetention: () => post<RetentionSeedResult>("/privacy/retention/seed"),
};
