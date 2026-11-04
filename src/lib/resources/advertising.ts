/**
 * The admin half of the advertising namespace: campaigns, placements,
 * creatives, site notices and the performance report.
 *
 * `./ads.ts` is the public side — what a visitor's browser asks for and the
 * counters it fires. This file is everything behind the login, and the two
 * are kept apart so a public page never pulls the admin surface into its
 * bundle.
 *
 * Three properties of the API shape the types here:
 *
 * 1. **Status is not a writable field.** `PUT /campaigns/<id>` answers 400
 *    naming the lifecycle endpoints, so `CampaignWrite` has no `status` and
 *    `activate`/`pause`/`finish` are separate calls.
 * 2. **Unknown keys are rejected by name.** The API answers
 *    `Unknown field(s): …` rather than ignoring a typo, so every payload
 *    sent from the editors is built from the whitelists below.
 * 3. **Admin reads and public reads are different shapes.** `to_dict()` on
 *    a creative and on a notice takes `admin=True`, which swaps the
 *    language-resolved `headline`/`title` for the stored English and adds
 *    the `_ne` columns, `page_paths`, `countries` and `needs_nepali`. Every
 *    admin route here passes it; `/serve` and `/notices` deliberately do
 *    not, so the public payload still withholds all of it. The editors rely
 *    on that round-trip: a form loaded from the public shape would open its
 *    Nepali boxes empty and blank the stored copy on the next save.
 */

import { del, get, getPage, post, put, type Query } from "./client";
import type { AdFormat, NoticeStyle, NoticeTone } from "./ads";
import type { Paginated } from "@/types/logistics";

/* ── Campaigns ──────────────────────────────────────────────────────────── */

export type CampaignStatus = "draft" | "scheduled" | "running" | "paused" | "finished";

/** Every status the API will accept as a `status` filter. */
export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "draft",
  "scheduled",
  "running",
  "paused",
  "finished",
];

export interface AdCampaignRow {
  id: number;
  code: string;
  name: string;
  objective: string | null;
  status: CampaignStatus;
  occasion: string | null;
  landing_path: string | null;
  utm_campaign: string | null;
  starts_at: string | null;
  ends_at: string | null;
  /** Running *and* inside its date window — the only state a visitor sees. */
  is_live: boolean;
  creative_count: number;
  created_at: string | null;
}

/**
 * `GET /campaigns/<id>` adds the creatives; the list endpoint does not.
 *
 * Those nested creatives are the *public* shape: `AdCampaign.to_dict` calls
 * `c.to_dict()` without `admin=True`, so they carry a language-resolved
 * headline and none of the editing fields. Anything that edits a creative
 * reads `/campaigns/<id>/creatives` instead, which is the admin shape.
 */
export type AdCampaignDetail = AdCampaignRow & { creatives: PublicCreativeShape[] };

/** What the nested array on a campaign detail actually contains. */
export type PublicCreativeShape = Omit<AdCreativeRow, keyof AdminCreativeFields>;

/**
 * The fields `_apply_campaign` whitelists. `status` is absent on purpose:
 * including it is a 400, not a no-op.
 */
export interface CampaignWrite {
  code?: string;
  name?: string;
  objective?: string | null;
  occasion?: string | null;
  utm_campaign?: string | null;
  landing_path?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface CampaignFilters extends Query {
  status?: string;
  occasion?: string;
  /** `true` narrows to campaigns live at this moment. */
  live?: boolean | string;
  page?: number;
  per_page?: number;
}

export const adCampaigns = {
  list: (query: CampaignFilters = {}) =>
    getPage<AdCampaignRow>("/ads/campaigns", query),
  get: (id: number) => get<AdCampaignDetail>(`/ads/campaigns/${id}`),
  create: (body: CampaignWrite) => post<AdCampaignRow>("/ads/campaigns", body),
  update: (id: number, body: CampaignWrite) =>
    put<AdCampaignRow>(`/ads/campaigns/${id}`, body),
  /** Refused with 409 while the campaign is running. */
  remove: (id: number) => del<unknown>(`/ads/campaigns/${id}`),

  /**
   * Put a campaign live — or `scheduled`, if its start date is still ahead.
   * This is the call that makes an advert visible to the public.
   */
  activate: (id: number) => post<AdCampaignRow>(`/ads/campaigns/${id}/activate`),
  pause: (id: number) => post<AdCampaignRow>(`/ads/campaigns/${id}/pause`),
  /** Terminal. A finished campaign cannot be restarted. */
  finish: (id: number) => post<AdCampaignRow>(`/ads/campaigns/${id}/finish`),
};

/** Which statuses each action may be reached from, mirroring `_TRANSITIONS`. */
export const CAMPAIGN_TRANSITIONS: Record<"activate" | "pause" | "finish", CampaignStatus[]> = {
  activate: ["draft", "scheduled", "paused"],
  pause: ["running", "scheduled"],
  finish: ["draft", "scheduled", "running", "paused"],
};

export const canTransition = (status: CampaignStatus, action: keyof typeof CAMPAIGN_TRANSITIONS) =>
  CAMPAIGN_TRANSITIONS[action].includes(status);

/* ── Placements ─────────────────────────────────────────────────────────── */

export interface AdPlacementRow {
  id: number;
  code: string;
  name: string;
  description: string | null;
  recommended_width: number | null;
  recommended_height: number | null;
  /** Honest capacity of the slot: a hero holds one, an offers row three. */
  max_creatives: number;
  is_active: boolean;
}

export interface PlacementWrite {
  code?: string;
  name?: string;
  description?: string | null;
  recommended_width?: number | null;
  recommended_height?: number | null;
  max_creatives?: number;
  is_active?: boolean;
}

export const adPlacements = {
  /** Unpaginated: `{items, total}` over every slot, ordered by code. */
  list: async () => (await get<{ items: AdPlacementRow[] }>("/ads/placements")).items,
  create: (body: PlacementWrite) => post<AdPlacementRow>("/ads/placements", body),
  update: (id: number, body: PlacementWrite) =>
    put<AdPlacementRow>(`/ads/placements/${id}`, body),
  /** 409 while any creative still points at it. */
  remove: (id: number) => del<unknown>(`/ads/placements/${id}`),
};

/* ── Creatives ──────────────────────────────────────────────────────────── */

/**
 * The fields `to_dict(admin=True)` adds on top of the public creative shape.
 *
 * They exist so an editor can round-trip: without them a form loaded from
 * this endpoint would render the Nepali and targeting boxes empty and blank
 * the stored values on the next save.
 */
export interface AdminCreativeFields {
  /** The stored Nepali, not a fallback. Null when nobody has written it. */
  headline_ne: string | null;
  body_ne: string | null;
  page_paths: string[];
  /** Two-letter codes, upper-cased by the API. */
  countries: string[];
  /**
   * The server's own summary: true when *either* Nepali field is empty.
   * Coarse by design — read `headline_ne` and `body_ne` directly to tell a
   * partly translated creative from an untranslated one.
   */
  needs_nepali: boolean;
}

/**
 * What an admin read of a creative returns.
 *
 * `headline` and `body` here are the stored English, not the
 * language-resolved values the public `/serve` endpoint sends.
 */
export interface AdCreativeRow extends AdminCreativeFields {
  id: number;
  campaign_id: number;
  placement_id: number;
  placement: string | null;
  format: AdFormat;
  headline: string;
  body: string | null;
  call_to_action: string | null;
  target_path: string | null;
  image_path: string | null;
  image_alt: string | null;
  priority: number;
  is_active: boolean;
  impressions: number;
  clicks: number;
  click_through_rate: number;
}

/** How much Nepali copy a row actually has. */
export type NepaliState = "complete" | "partial" | "none";

/**
 * Three states rather than the server's two.
 *
 * `needs_nepali` is `not (headline_ne and body_ne)`, which is true for every
 * seeded creative — including the two that already carry a reviewed festival
 * headline. A column that said "missing" on all of them would hide exactly
 * the distinction the flag exists to show, so the fields are read directly
 * and `needs_nepali` is the boolean behind "not complete".
 */
export function nepaliState(
  row: { headline_ne?: string | null; body_ne?: string | null; title_ne?: string | null },
): NepaliState {
  const primary = (row.headline_ne ?? row.title_ne ?? "").trim();
  const secondary = (row.body_ne ?? "").trim();
  if (primary && secondary) return "complete";
  if (primary || secondary) return "partial";
  return "none";
}

export const AD_FORMATS: AdFormat[] = ["banner", "strip", "card", "inline"];

export interface CreativeWrite {
  placement_id?: number;
  format?: AdFormat;
  headline?: string;
  body?: string | null;
  call_to_action?: string | null;
  target_path?: string | null;
  image_path?: string | null;
  /** Required before activation whenever `image_path` is set. */
  image_alt?: string | null;
  headline_ne?: string | null;
  body_ne?: string | null;
  /** Each entry must be site-relative. */
  page_paths?: string[];
  /** Two-letter codes, upper-cased by the API. */
  countries?: string[];
  priority?: number;
  is_active?: boolean;
}

export const adCreatives = {
  listFor: async (campaignId: number) =>
    (await get<{ items: AdCreativeRow[] }>(`/ads/campaigns/${campaignId}/creatives`)).items,
  create: (campaignId: number, body: CreativeWrite) =>
    post<AdCreativeRow>(`/ads/campaigns/${campaignId}/creatives`, body),
  update: (id: number, body: CreativeWrite) =>
    put<AdCreativeRow>(`/ads/creatives/${id}`, body),
  remove: (id: number) => del<unknown>(`/ads/creatives/${id}`),
  /** 400 when the creative carries an image and no alt text. */
  activate: (id: number) => post<AdCreativeRow>(`/ads/creatives/${id}/activate`),
  deactivate: (id: number) => post<AdCreativeRow>(`/ads/creatives/${id}/deactivate`),
};

/* ── Notices ────────────────────────────────────────────────────────────── */

/**
 * The admin read of a notice.
 *
 * `title` and `body` are the stored English; the Nepali comes back beside
 * them rather than resolved into them, which is what makes the editor a
 * round-trip rather than a one-way write.
 */
export interface AdminNoticeRow {
  id: number;
  code: string;
  title: string;
  body: string | null;
  title_ne: string | null;
  body_ne: string | null;
  page_paths: string[];
  /** True when either Nepali field is empty. See `nepaliState`. */
  needs_nepali: boolean;
  style: NoticeStyle;
  tone: NoticeTone;
  link_path: string | null;
  link_label: string | null;
  dismiss_days: number | null;
  max_impressions: number | null;
  is_dismissible: boolean;
  priority: number;
  is_active: boolean;
  /** Active *and* inside its window. Active alone does not mean visible. */
  is_live: boolean;
  starts_at: string | null;
  ends_at: string | null;
  impressions: number;
  dismissals: number;
}

export interface NoticeWrite {
  code?: string;
  title?: string;
  body?: string | null;
  title_ne?: string | null;
  body_ne?: string | null;
  style?: NoticeStyle;
  tone?: NoticeTone;
  link_path?: string | null;
  link_label?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  /** Each entry must be site-relative. */
  page_paths?: string[];
  dismiss_days?: number;
  max_impressions?: number;
  is_dismissible?: boolean;
  priority?: number;
}

export const NOTICE_STYLES: NoticeStyle[] = ["bar", "modal", "toast"];
export const NOTICE_TONES: NoticeTone[] = ["info", "promotion", "warning", "disruption"];

export interface NoticeFilters extends Query {
  tone?: string;
  active?: boolean | string;
  page?: number;
  per_page?: number;
}

export const adminNotices = {
  list: (query: NoticeFilters = {}) =>
    getPage<AdminNoticeRow>("/ads/admin/notices", query),
  get: (id: number) => get<AdminNoticeRow>(`/ads/admin/notices/${id}`),
  create: (body: NoticeWrite) => post<AdminNoticeRow>("/ads/admin/notices", body),
  update: (id: number, body: NoticeWrite) =>
    put<AdminNoticeRow>(`/ads/admin/notices/${id}`, body),
  remove: (id: number) => del<unknown>(`/ads/admin/notices/${id}`),
  /** Puts the notice on the live site, subject to its date window. */
  activate: (id: number) => post<AdminNoticeRow>(`/ads/admin/notices/${id}/activate`),
  deactivate: (id: number) => post<AdminNoticeRow>(`/ads/admin/notices/${id}/deactivate`),
};

/* ── Reporting ──────────────────────────────────────────────────────────── */

export interface AdReportCreative {
  creative_id: number;
  headline: string;
  placement: string | null;
  is_active: boolean;
  impressions: number;
  clicks: number;
  click_through_rate: number;
}

export interface AdReportCampaign {
  campaign_id: number;
  code: string;
  name: string;
  status: CampaignStatus;
  occasion: string | null;
  starts_at: string | null;
  ends_at: string | null;
  impressions: number;
  clicks: number;
  click_through_rate: number;
  creatives: AdReportCreative[];
}

export interface AdReport {
  items: AdReportCampaign[];
  total: number;
  from: string | null;
  to: string | null;
  totals: { impressions: number; clicks: number; click_through_rate: number };
  /**
   * The API's own statement that these numbers are lifetime totals and the
   * date range selects campaigns rather than days. Rendered verbatim: a
   * report that implied a time series here would be wrong.
   */
  counters_are: string;
}

export const adReport = (query: { from?: string; to?: string } = {}) =>
  get<AdReport>("/ads/report", query);

/** Re-exported so a screen importing this module gets the page shape too. */
export type { Paginated };
