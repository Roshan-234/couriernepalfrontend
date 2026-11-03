/** Cash on delivery, payments and the rate engine. */

import { del, get, getList, getPage, post, put, type Query } from "./client";
import type {
  CodCollection,
  CodRemittance,
  DeliveryZone,
  District,
  Payment,
  PaymentGateway,
  Quote,
  RateCard,
  RateCardEntry,
  ServiceLevel,
  Surcharge,
  ZoneInfo,
} from "@/types/logistics";

// ── Cash on delivery ────────────────────────────────────────────────────────

export interface CodFilters extends Query {
  status?: string;
  merchant_id?: number;
  branch_id?: number;
  rider_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

/** One merchant's COD position, as `GET /cod/summary` groups it. */
export interface CodMerchantPosition {
  merchant_id: number;
  /** Keyed by collection status: pending / collected / deposited / remitted / cancelled. */
  by_status: Record<string, { count: number; amount: number }>;
  /** Collected or deposited: money held but not yet paid out. */
  outstanding_amount: number;
  outstanding_count: number;
  remitted_amount: number;
}

/**
 * `GET /cod/summary`. Merchant-scoped for non-admins.
 *
 * The totals are org-wide; the per-status breakdown lives inside each
 * merchant row, not at the top level.
 */
export interface CodSummary {
  merchants: CodMerchantPosition[];
  total_outstanding: number;
  total_remitted: number;
  merchant_count: number;
}

export const cod = {
  collections: (query: CodFilters = {}) => getPage<CodCollection>("/cod/collections", query),
  summary: () => get<CodSummary>("/cod/summary"),

  /** Records money taken at the door. Amount must match the shipment's COD. */
  collect: (shipmentId: number, body: { amount: number; collection_mode?: string; reference_no?: string }) =>
    post<CodCollection>(`/cod/collections/${shipmentId}/collect`, body),
  deposit: (id: number, deposit_reference: string) =>
    post<CodCollection>(`/cod/collections/${id}/deposit`, { deposit_reference }),
  verify: (id: number) => post<CodCollection>(`/cod/collections/${id}/verify`),

  remittances: (query: CodFilters = {}) => getPage<CodRemittance>("/cod/remittances", query),
  remittance: (id: number) => get<CodRemittance>(`/cod/remittances/${id}`),
  /** Totals are derived server-side from the gathered collections. */
  createRemittance: (body: {
    merchant_id: number;
    period_start: string;
    period_end: string;
    service_fee?: number;
    tax_amount?: number;
    adjustment?: number;
    notes?: string;
  }) => post<CodRemittance>("/cod/remittances", body),
  approveRemittance: (id: number) => post<CodRemittance>(`/cod/remittances/${id}/approve`),
  payRemittance: (id: number, body: { payment_reference: string; payment_method?: string }) =>
    post<CodRemittance>(`/cod/remittances/${id}/pay`, body),
};

// ── Payments ────────────────────────────────────────────────────────────────

export interface PaymentFilters extends Query {
  status?: string;
  gateway_id?: number;
  page?: number;
  per_page?: number;
}

/** What a seam returns while a provider is not wired up. */
export interface ProviderResult {
  enabled: boolean;
  ok?: boolean;
  reason?: string;
  message?: string;
}

export const payments = {
  list: (query: PaymentFilters = {}) => getPage<Payment>("/payments", query),
  get: (id: number) => get<Payment>(`/payments/${id}`),
  initiate: (body: {
    gateway_id: number;
    shipment_id?: number;
    invoice_id?: number;
    amount?: number;
    currency?: string;
    idempotency_key?: string;
  }) => post<Payment>("/payments/initiate", body),
  /** Returns 501 with a provider message until an integration is enabled. */
  verify: (id: number) => post<Payment & { provider?: ProviderResult }>(`/payments/${id}/verify`),
  refund: (id: number, body: { amount: number; reason?: string }) =>
    post<Payment>(`/payments/${id}/refund`, body),

  gateways: {
    /** Public: active gateways only, no credential fields. */
    list: () => get<PaymentGateway[]>("/payments/gateways"),
    /** super_admin: every gateway, with masked credentials. */
    all: () => get<PaymentGateway[]>("/payments/gateways/all"),
    get: (id: number) => get<PaymentGateway>(`/payments/gateways/${id}`),
    create: (body: Partial<PaymentGateway> & { code: string }) =>
      post<PaymentGateway>("/payments/gateways", body),
    /**
     * Omitting a secret leaves it unchanged; sending "" clears it. That keeps
     * a round-trip of the masked admin form from wiping the credential.
     */
    update: (id: number, body: Partial<PaymentGateway>) =>
      put<PaymentGateway>(`/payments/gateways/${id}`, body),
    deactivate: (id: number) => del<unknown>(`/payments/gateways/${id}`),
  },
};

// ── Rates ───────────────────────────────────────────────────────────────────

export interface QuoteCriteria {
  origin_district?: string;
  destination_district?: string;
  destination_country?: string;
  weight_kg: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  service_level?: ServiceLevel;
  scope?: "domestic" | "international";
  merchant_id?: number;
  is_cod?: boolean;
  cod_amount?: number;
  is_fragile?: boolean;
  is_insured?: boolean;
  declared_value?: number;
  is_oversize?: boolean;
  is_weekend?: boolean;
}

/** A quote that found no matching lane reports it rather than throwing. */
export type QuoteResult =
  | ({ status: "ok" } & Quote)
  | { status: "no_rate"; message: string };

export const rates = {
  /** Public — the website calculator calls this. */
  quote: (criteria: QuoteCriteria) => post<QuoteResult>("/rates/quote", criteria),
  zones: () => get<{ zones: ZoneInfo[]; districts: District[] }>("/rates/zones"),

  cards: (query: Query = {}) => getPage<RateCard>("/rates/cards", query),
  card: (id: number) => get<RateCard>(`/rates/cards/${id}`),
  createCard: (body: Partial<RateCard> & { code: string; name: string }) =>
    post<RateCard>("/rates/cards", body),
  updateCard: (id: number, body: Partial<RateCard>) => put<RateCard>(`/rates/cards/${id}`, body),
  deactivateCard: (id: number) => del<unknown>(`/rates/cards/${id}`),

  addEntry: (cardId: number, body: Partial<RateCardEntry>) =>
    post<RateCardEntry>(`/rates/cards/${cardId}/entries`, body),
  /** Loads a whole tariff at once. Validated as a batch: all or nothing. */
  bulkEntries: (cardId: number, entries: Partial<RateCardEntry>[], replace = false) =>
    post<{ created: number }>(`/rates/cards/${cardId}/entries/bulk`, { entries, replace }),
  updateEntry: (id: number, body: Partial<RateCardEntry>) =>
    put<RateCardEntry>(`/rates/entries/${id}`, body),
  removeEntry: (id: number) => del<unknown>(`/rates/entries/${id}`),

  // Returns `{items, total}` rather than a bare array.
  surcharges: () => getList<Surcharge>("/rates/surcharges"),
  createSurcharge: (body: Partial<Surcharge> & { code: string; name: string }) =>
    post<Surcharge>("/rates/surcharges", body),
  /** There is no delete; deactivate with `{ is_active: false }`. */
  updateSurcharge: (id: number, body: Partial<Surcharge>) =>
    put<Surcharge>(`/rates/surcharges/${id}`, body),
};

export type { DeliveryZone };
