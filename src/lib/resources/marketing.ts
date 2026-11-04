/**
 * Email marketing: the contact list, the campaigns and what happened when
 * one went out.
 *
 * Four rules of the API are encoded in these types rather than left for a
 * screen to remember:
 *
 * 1. **Nothing here can create a subscribed contact.** There is no
 *    `contacts.create`, because the API has no such endpoint: an import
 *    writes `pending` rows and a person becomes `subscribed` only by
 *    confirming from their own inbox.
 * 2. **A contact's status and email are not editable.** `ContactWrite`
 *    carries tags, language and name, and nothing else; sending `status`
 *    is a 403 that names the suppress endpoint.
 * 3. **A send needs an approval and the campaign's own code.** `send`
 *    takes `confirm`, which must equal `campaign.code`, and the API refuses
 *    an unapproved campaign with 409.
 * 4. **There is no open rate and no click rate.** The report returns them
 *    as `null` with `tracking_note` saying why; the note is part of the
 *    contract, not an error string.
 */

import { del, get, getPage, post, put, type Query } from "./client";

/* ── Contacts ───────────────────────────────────────────────────────────── */

export type ContactStatus =
  | "pending"
  | "subscribed"
  | "unsubscribed"
  | "bounced"
  | "complained";

export const CONTACT_STATUSES: ContactStatus[] = [
  "pending",
  "subscribed",
  "unsubscribed",
  "bounced",
  "complained",
];

export interface MarketingContact {
  id: number;
  email: string;
  name: string | null;
  language: string;
  country: string | null;
  status: ContactStatus;
  tags: string[];
  /** Confirmed, not suppressed, not bounced: the only state a send mails. */
  is_mailable: boolean;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  last_sent_at: string | null;
  created_at: string | null;
}

/** `GET /contacts/<id>` and the write endpoints attach the consent evidence. */
export interface MarketingContactDetail extends MarketingContact {
  source: string | null;
  consent_text: string | null;
  confirm_sent_at: string | null;
  signup_ip_hash: string | null;
  confirm_ip_hash: string | null;
  bounce_count: number;
  unsubscribe_reason: string | null;
}

/** The three fields `PUT /contacts/<id>` accepts. Anything else is a 403. */
export interface ContactWrite {
  tags?: string[];
  language?: "en" | "ne";
  name?: string | null;
}

export interface ContactFilters extends Query {
  status?: string;
  tag?: string;
  country?: string;
  q?: string;
  page?: number;
  per_page?: number;
}

export interface ImportRow {
  email: string;
  name?: string;
  language?: string;
  country?: string;
  tags?: string[];
}

export interface ImportResult {
  created: number;
  skipped_existing: number;
  invalid: string[];
  status: ContactStatus;
  confirmation_sent: boolean;
  note: string;
}

export const marketingContacts = {
  list: (query: ContactFilters = {}) => getPage<MarketingContact>("/marketing/contacts", query),
  get: (id: number) => get<MarketingContactDetail>(`/marketing/contacts/${id}`),
  update: (id: number, body: ContactWrite) =>
    put<MarketingContactDetail>(`/marketing/contacts/${id}`, body),
  /**
   * Record an objection that arrived off-channel. `complained` is stronger
   * than an unsubscribe: it also bars the confirmation mail.
   */
  suppress: (id: number, body: { reason?: string; complained?: boolean } = {}) =>
    post<MarketingContactDetail>(`/marketing/contacts/${id}/suppress`, body),
  /**
   * Load addresses as **pending**. There is no parameter that would make
   * them subscribed; `send_confirmation` mails each new row once.
   */
  import: (body: {
    contacts: ImportRow[];
    source: string;
    consent_text: string;
    send_confirmation?: boolean;
  }) => post<ImportResult>("/marketing/contacts/import", body),
};

/* ── Campaigns ──────────────────────────────────────────────────────────── */

export type EmailCampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled";

export const EMAIL_CAMPAIGN_STATUSES: EmailCampaignStatus[] = [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "cancelled",
];

/** Who a campaign goes to. `{}` means confirmed subscribers and nobody else. */
export interface Audience {
  tags?: string[];
  status?: ContactStatus[];
  country?: string[];
}

export interface EmailCampaignRow {
  id: number;
  code: string;
  name: string;
  subject: string;
  preheader: string | null;
  status: EmailCampaignStatus;
  audience: Audience;
  ad_campaign_id: number | null;
  utm_campaign: string | null;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  /** Cleared by any edit to subject, preheader, body or audience. */
  is_approved: boolean;
  approved_by: number | null;
  recipients: number;
  delivered: number;
  failed: number;
  unsubscribed: number;
  created_at: string | null;
}

/** The detail endpoint adds the bodies and counts the audience live. */
export interface EmailCampaignDetail extends EmailCampaignRow {
  body_en: string | null;
  body_ne: string | null;
  audience_size: number;
}

export interface EmailCampaignWrite {
  code?: string;
  name?: string;
  subject?: string;
  preheader?: string | null;
  body_en?: string | null;
  body_ne?: string | null;
  audience?: Audience;
  utm_campaign?: string | null;
  scheduled_for?: string | null;
  ad_campaign_id?: number | null;
}

/** The fields whose edit withdraws an existing approval. */
export const APPROVAL_CLEARING_FIELDS = [
  "subject",
  "preheader",
  "body_en",
  "body_ne",
  "audience",
] as const;

export interface EmailCampaignFilters extends Query {
  status?: string;
  q?: string;
  page?: number;
  per_page?: number;
}

export interface TestSendResult {
  campaign_id: number;
  recipient: string;
  sent: boolean;
  error: string | null;
}

export interface SendResult {
  campaign_id: number;
  sent_now: number;
  failed_now: number;
  skipped: number;
  already_handled: number;
  recipients: number;
  delivered: number;
  /** False means every "send" was recorded as never attempted. */
  mail_configured: boolean;
}

export interface CampaignReport {
  campaign: EmailCampaignRow;
  recipients: number;
  delivered: number;
  failed: number;
  queued: number;
  skipped: number;
  skipped_by_reason: Record<string, number>;
  unsubscribes: number;
  /** Always null, by design. */
  open_rate: number | null;
  /** Always null, by design. */
  click_rate: number | null;
  /** The API's own statement of why. Rendered verbatim. */
  tracking_note: string;
}

export type SendRowStatus = "queued" | "sent" | "failed" | "skipped";

export interface EmailSendRow {
  id: number;
  campaign_id: number;
  contact_id: number;
  status: SendRowStatus;
  error: string | null;
  skip_reason: string | null;
  sent_at: string | null;
}

/** Written into a failed row when there was no mail server to try. */
export const MAIL_NOT_CONFIGURED = "not sent - mail not configured";

/** `skip_reason` values the send writes, with what each one means. */
export const SKIP_REASONS: Record<string, string> = {
  unconfirmed: "Never confirmed the subscription from their own inbox",
  unsubscribed: "Unsubscribed, by link or by an administrator",
  bounced: "Mail to this address bounced",
  complained: "Marked a previous mailing as spam",
  no_address: "No email address on the record",
  unknown: "Recorded without a reason",
};

export const emailCampaigns = {
  list: (query: EmailCampaignFilters = {}) =>
    getPage<EmailCampaignRow>("/marketing/campaigns", query),
  get: (id: number) => get<EmailCampaignDetail>(`/marketing/campaigns/${id}`),
  create: (body: EmailCampaignWrite) =>
    post<EmailCampaignRow>("/marketing/campaigns", body),
  /** 409 once the campaign is sending or sent. Clears approval on a material edit. */
  update: (id: number, body: EmailCampaignWrite) =>
    put<EmailCampaignRow>(`/marketing/campaigns/${id}`, body),
  /** Only an untouched draft. A campaign that sent is the record of what went out. */
  remove: (id: number) => del<{ deleted: number }>(`/marketing/campaigns/${id}`),

  approve: (id: number) => post<EmailCampaignRow>(`/marketing/campaigns/${id}/approve`),
  /** One named address. Writes no send rows, so it cannot consume a slot. */
  test: (id: number, email: string) =>
    post<TestSendResult>(`/marketing/campaigns/${id}/test`, { email }),
  /** `confirm` must equal the campaign's own code. The most irreversible call here. */
  send: (id: number, confirm: string) =>
    post<SendResult>(`/marketing/campaigns/${id}/send`, { confirm }),

  report: (id: number) => get<CampaignReport>(`/marketing/campaigns/${id}/report`),
  sends: (id: number, query: Query = {}) =>
    getPage<EmailSendRow>(`/marketing/campaigns/${id}/sends`, query),
};
