/**
 * Typed wrappers over the Flask API.
 *
 * Import the resource you need rather than the whole barrel in a client
 * component, so an admin-only screen does not pull the rest into its bundle:
 *
 *     import { shipments } from "@/lib/resources/operations";
 */

export * from "./client";
export {
  branches,
  deliveries,
  geo,
  pickups,
  riders,
  shipments,
} from "./operations";
export type {
  AttemptBody,
  BranchFilters,
  PickupFilters,
  PodBody,
  RiderFilters,
  ShipmentFilters,
  ShipmentPage,
} from "./operations";

export { cod, payments, rates } from "./finance";
export type {
  CodFilters,
  CodSummary,
  PaymentFilters,
  ProviderResult,
  QuoteCriteria,
  QuoteResult,
} from "./finance";

export {
  BILL_ADMIN_STATUSES,
  FREIGHT_BILL_STATUSES,
  PACKING_LIST_STATUSES,
  chargeAmount,
  chargeLine,
  chargeSubtotal,
  freightBills,
  nprTotal,
  packingLists,
} from "./documents";
export type {
  DocumentFilters,
  FreightBill,
  FreightBillCharge,
  FreightBillStatus,
  FreightBillWrite,
  GeneratedFile,
  PackingList,
  PackingListItem,
  PackingListStatus,
  PackingListWrite,
} from "./documents";

export { carriers, claims, merchantKeys, notifications, webhooks } from "./integrations";
export type {
  CarrierConfig,
  CarrierTestResult,
  ClaimFilters,
  NotificationLogRow,
  SmsProvider,
} from "./integrations";

export { serveAds, getNotices, dismissNotice, sendAdEvent } from "./ads";
export type {
  AdCreative,
  AdEventKind,
  AdFormat,
  AdServeResponse,
  NoticeDismissal,
  NoticeFeed,
  NoticeQuery,
  NoticeStyle,
  NoticeTone,
  ServeQuery,
  SiteNotice,
} from "./ads";

export {
  getConsentPolicy,
  getConsentStatus,
  saveConsent,
  withdrawConsent,
  getMyConsentHistory,
  NO_CONSENT,
} from "./consent";
export type {
  ConsentAllowances,
  ConsentCategory,
  ConsentCategoryKey,
  ConsentPolicy,
  ConsentRecord,
  ConsentSource,
  ConsentState,
  ConsentStatus,
} from "./consent";
