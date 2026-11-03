/** Carrier connectors, merchant API keys, webhooks, notifications and claims. */

import { del, get, getPage, post, put, type Query } from "./client";
import type {
  Carrier,
  Claim,
  MerchantApiKey,
  MerchantApiKeyCreated,
  NotificationTemplate,
  WebhookDelivery,
  WebhookEndpoint,
} from "@/types/logistics";

// ── Carrier connectors ──────────────────────────────────────────────────────

/**
 * The admin view of a connector. `to_dict(include_config=True)` adds roughly
 * sixty wiring fields on top of the public shape; they are loosely typed here
 * because the set is driven by whatever a carrier's API needs.
 */
export type CarrierConfig = Carrier & {
  is_sandbox: boolean;
  api_base_url: string | null;
  sandbox_base_url: string | null;
  api_version: string | null;
  content_type: string | null;
  auth_type: string;
  auth_header_name: string | null;
  auth_header_prefix: string | null;
  auth_query_param: string | null;
  extra_headers: Record<string, string>;
  extra_query_params: Record<string, string>;
  account_number: string | null;
  username: string | null;
  client_id: string | null;
  oauth_token_url: string | null;
  oauth_scope: string | null;
  track_endpoint: string | null;
  create_shipment_endpoint: string | null;
  label_endpoint: string | null;
  rate_endpoint: string | null;
  pickup_endpoint: string | null;
  cancel_endpoint: string | null;
  track_method: string | null;
  create_method: string | null;
  tracking_number_path: string | null;
  status_path: string | null;
  events_path: string | null;
  event_status_path: string | null;
  event_time_path: string | null;
  event_location_path: string | null;
  event_description_path: string | null;
  status_map: Record<string, string>;
  webhook_url: string | null;
  webhook_signature_header: string | null;
  timeout_seconds: number;
  max_retries: number;
  rate_limit_per_minute: number;
  health_status: string;
  consecutive_failures: number;
  last_sync_at: string | null;
  last_error: string | null;
  is_configured: boolean;
  // Masked, never the raw credential.
  api_key_masked?: string;
  api_secret_masked?: string;
  password_masked?: string;
  client_secret_masked?: string;
  webhook_secret_masked?: string;
};

/**
 * Result of the config audit. Makes no network call — `network_call_made` is
 * always false, and `live_dispatch` reports what the (currently disabled)
 * send seam would have returned.
 */
export interface CarrierTestResult {
  code: string;
  is_configured: boolean;
  /** True when nothing is missing. */
  ready: boolean;
  missing: string[];
  base_url: string | null;
  environment: "sandbox" | "live";
  network_call_made: boolean;
  live_dispatch: { enabled: boolean; ok?: boolean; reason?: string };
  checked_at: string;
}

export const carriers = {
  /** Public: active connectors, no config. */
  list: () => get<Carrier[]>("/carriers/"),
  get: (code: string) => get<Carrier>(`/carriers/${code}`),
  trackingUrl: (code: string, trackingNo: string) =>
    get<{ code: string; tracking_no: string; tracking_url: string }>(
      `/carriers/${code}/tracking-url/${trackingNo}`,
    ),

  /** super_admin: every connector with config and masked secrets. */
  all: () => get<CarrierConfig[]>("/carriers/all"),
  create: (body: Partial<CarrierConfig> & { code: string; name: string }) =>
    post<CarrierConfig>("/carriers/", body),
  /** Omit a secret to keep it; send "" to clear it. */
  update: (code: string, body: Partial<CarrierConfig>) =>
    put<CarrierConfig>(`/carriers/${code}`, body),
  deactivate: (code: string) => del<unknown>(`/carriers/${code}`),
  test: (code: string) => post<CarrierTestResult>(`/carriers/${code}/test`),
};

// ── Merchant API keys ───────────────────────────────────────────────────────

export const merchantKeys = {
  list: () => get<MerchantApiKey[]>("/merchant/keys"),
  /** The plaintext key is in this response only, and never again. */
  create: (body: { name: string; scopes: string[]; environment?: "live" | "test"; expires_at?: string }) =>
    post<MerchantApiKeyCreated>("/merchant/keys", body),
  revoke: (id: number) => del<unknown>(`/merchant/keys/${id}`),
};

// ── Webhooks ────────────────────────────────────────────────────────────────

export const webhooks = {
  list: () => get<WebhookEndpoint[]>("/webhooks/"),
  get: (id: number) => get<WebhookEndpoint>(`/webhooks/${id}`),
  /** The signing secret is returned once here, masked afterwards. */
  create: (body: { url: string; events: string[]; description?: string }) =>
    post<WebhookEndpoint & { secret?: string }>("/webhooks/", body),
  update: (id: number, body: Partial<WebhookEndpoint>) =>
    put<WebhookEndpoint>(`/webhooks/${id}`, body),
  remove: (id: number) => del<unknown>(`/webhooks/${id}`),
  deliveries: (id: number, query: Query = {}) =>
    getPage<WebhookDelivery>(`/webhooks/${id}/deliveries`, query),
  /** Enqueues a pending delivery row. Nothing is sent until sending is on. */
  test: (id: number) => post<WebhookDelivery>(`/webhooks/${id}/test`),
};

// ── Notifications ───────────────────────────────────────────────────────────

export interface SmsProvider {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  is_primary: boolean;
  sender_id: string | null;
  is_configured: boolean;
  is_sandbox?: boolean;
  api_base_url?: string | null;
  send_endpoint?: string | null;
  param_map?: Record<string, string>;
  token_masked?: string;
  secret_masked?: string;
  last_error?: string | null;
}

export interface NotificationLogRow {
  id: number;
  user_id: number | null;
  channel: string;
  payload: string | null;
  status: string | null;
  sent_at: string | null;
}

export const notifications = {
  templates: () => get<NotificationTemplate[]>("/notifications/templates"),
  template: (code: string) => get<NotificationTemplate>(`/notifications/templates/${code}`),
  createTemplate: (body: Partial<NotificationTemplate> & { code: string; event: string; channel: string }) =>
    post<NotificationTemplate>("/notifications/templates", body),
  updateTemplate: (code: string, body: Partial<NotificationTemplate>) =>
    put<NotificationTemplate>(`/notifications/templates/${code}`, body),
  removeTemplate: (code: string) => del<unknown>(`/notifications/templates/${code}`),
  /** Renders against sample context in `en` or `ne`. */
  preview: (code: string, body: { language?: "en" | "ne"; context?: Record<string, unknown> }) =>
    post<{ subject: string; body: string }>(`/notifications/templates/${code}/preview`, body),

  providers: () => get<SmsProvider[]>("/notifications/providers"),
  createProvider: (body: Partial<SmsProvider> & { code: string; name: string }) =>
    post<SmsProvider>("/notifications/providers", body),
  updateProvider: (code: string, body: Partial<SmsProvider>) =>
    put<SmsProvider>(`/notifications/providers/${code}`, body),
  removeProvider: (code: string) => del<unknown>(`/notifications/providers/${code}`),

  logs: (query: Query = {}) => getPage<NotificationLogRow>("/notifications/logs", query),
};

// ── Claims ──────────────────────────────────────────────────────────────────

export interface ClaimFilters extends Query {
  status?: string;
  claim_type?: string;
  assigned_to?: number;
  shipment_id?: number;
  page?: number;
  per_page?: number;
}

export const claims = {
  /** Admin queue. */
  list: (query: ClaimFilters = {}) => getPage<Claim>("/claims/", query),
  /** Paginated under a `claims` key, despite the name. */
  mine: (query: ClaimFilters = {}) => getPage<Claim>("/claims/mine", query),
  get: (id: number) => get<Claim>(`/claims/${id}`),
  create: (body: {
    shipment_id: number;
    claim_type: string;
    description: string;
    claimed_amount?: number;
  }) => post<Claim>("/claims/", body),
  /** Rejects a body carrying `status` or `approved_amount` outright. */
  update: (id: number, body: Partial<Pick<Claim, "description" | "priority" | "claimed_amount">>) =>
    put<Claim>(`/claims/${id}`, body),
  withdraw: (id: number) => post<Claim>(`/claims/${id}/withdraw`),
  assign: (id: number, assigned_to: number) => post<Claim>(`/claims/${id}/assign`, { assigned_to }),
  /** Only moves between open / under_review / awaiting_customer. */
  setStatus: (id: number, status: string) => post<Claim>(`/claims/${id}/status`, { status }),
  /** `approved_amount` may not exceed the claimed amount. */
  approve: (id: number, approved_amount: number, resolution_note?: string) =>
    post<Claim>(`/claims/${id}/approve`, { approved_amount, resolution_note }),
  reject: (id: number, rejection_reason: string) =>
    post<Claim>(`/claims/${id}/reject`, { rejection_reason }),
  settle: (id: number) => post<Claim>(`/claims/${id}/settle`),
};
