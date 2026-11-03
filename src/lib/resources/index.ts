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

export { carriers, claims, merchantKeys, notifications, webhooks } from "./integrations";
export type {
  CarrierConfig,
  CarrierTestResult,
  ClaimFilters,
  NotificationLogRow,
  SmsProvider,
} from "./integrations";
