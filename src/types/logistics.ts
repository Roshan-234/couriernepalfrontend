/**
 * Shapes returned by the Flask logistics API.
 *
 * These mirror the `to_dict()` output of the backend models one-for-one. When
 * a model changes, change it here too: nothing generates these, so a silent
 * drift between the two is the failure mode to watch for.
 */

// ── Geography ───────────────────────────────────────────────────────────────

/** Delivery zones, which drive rate lanes and transit times. */
export type DeliveryZone = "valley" | "cities" | "hills" | "remote";

export interface District {
  name: string;
  slug: string;
  headquarters: string;
  province: string;
  province_code: string;
  zone: DeliveryZone;
}

export interface Province {
  name: string;
  code: string;
  capital: string;
  district_count: number;
}

export interface ZoneInfo {
  code: DeliveryZone;
  label: string;
  eta: string;
}

// ── Shipment lifecycle ──────────────────────────────────────────────────────

export type ShipmentStatus =
  | "draft"
  | "pending"
  | "pickup_assigned"
  | "picked_up"
  | "at_origin_branch"
  | "in_transit"
  | "at_destination_branch"
  | "customs_hold"
  | "out_for_delivery"
  | "delivery_attempted"
  | "delivered"
  | "rto_initiated"
  | "rto_in_transit"
  | "returned"
  | "on_hold"
  | "lost"
  | "damaged"
  | "cancelled";

export type StatusGroup =
  | "booking"
  | "collection"
  | "line_haul"
  | "last_mile"
  | "return"
  | "exception";

export type CodStatus =
  | "not_applicable"
  | "pending"
  | "collected"
  | "deposited"
  | "remitted"
  | "cancelled";

export type PaymentMode = "prepaid" | "cod" | "credit";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type ServiceLevel = "express" | "standard" | "economy" | "same_day";

// ── Network ─────────────────────────────────────────────────────────────────

export type BranchType = "hub" | "branch" | "pickup_point" | "franchise";

export interface BranchBrief {
  id: number;
  code: string;
  name: string;
  type: BranchType;
  district: string | null;
  city: string | null;
}

export interface Branch extends BranchBrief {
  province: string | null;
  address: string | null;
  landmark: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  alternate_phone: string | null;
  email: string | null;
  manager_name: string | null;
  manager_user_id: number | null;
  opening_hours: string | null;
  serves_districts: string[];
  parent_branch_id: number | null;
  accepts_walk_in: boolean;
  handles_cod: boolean;
  handles_international: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export type RiderStatus =
  | "available"
  | "on_duty"
  | "off_duty"
  | "on_leave"
  | "suspended";

export type VehicleType = "bike" | "scooter" | "cycle" | "van" | "truck" | "foot";

export interface RiderBrief {
  id: number;
  rider_code: string;
  name: string;
  phone: string | null;
  status: RiderStatus;
  vehicle_type: VehicleType;
}

export interface Rider extends RiderBrief {
  user_id: number;
  branch_id: number | null;
  national_id: string | null;
  license_number: string | null;
  license_expiry: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  vehicle_number: string | null;
  serves_districts: string[];
  max_daily_capacity: number;
  handles_cod: boolean;
  latitude: number | null;
  longitude: number | null;
  location_updated_at: string | null;
  is_active: boolean;
  can_take_work: boolean;
  joined_at: string | null;
}

// ── Pickups ─────────────────────────────────────────────────────────────────

export type PickupStatus =
  | "requested"
  | "scheduled"
  | "assigned"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export type PickupSlot = "morning" | "midday" | "afternoon" | "evening";

export interface Pickup {
  id: number;
  pickup_no: string;
  requested_by: number;
  merchant_id: number | null;
  branch_id: number | null;
  rider_id: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  scheduled_date: string | null;
  time_slot: PickupSlot;
  window_start: string | null;
  window_end: string | null;
  package_count: number;
  estimated_weight_kg: number;
  notes: string | null;
  status: PickupStatus;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  collected_count: number;
  failure_reason: string | null;
  created_at: string | null;
  rider: RiderBrief | null;
}

// ── Delivery outcome ────────────────────────────────────────────────────────

export type AttemptOutcome = "delivered" | "failed" | "rescheduled";

export type AttemptReason =
  | "recipient_unavailable"
  | "address_incorrect"
  | "address_not_found"
  | "recipient_refused"
  | "payment_not_ready"
  | "business_closed"
  | "rescheduled_by_recipient"
  | "weather_or_road"
  | "security_situation"
  | "damaged_in_transit"
  | "other";

export interface DeliveryAttempt {
  id: number;
  shipment_id: number;
  rider_id: number | null;
  attempt_no: number;
  outcome: AttemptOutcome;
  reason_code: AttemptReason | null;
  reason_note: string | null;
  latitude: number | null;
  longitude: number | null;
  next_attempt_date: string | null;
  attempted_at: string | null;
  rider: RiderBrief | null;
}

export interface ProofOfDelivery {
  id: number;
  shipment_id: number;
  rider_id: number | null;
  recipient_name: string | null;
  recipient_relation: string | null;
  recipient_id_ref: string | null;
  signature_path: string | null;
  photo_path: string | null;
  /** The code itself is never sent to a client; only these flags are. */
  otp_required: boolean;
  otp_verified: boolean;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  delivered_at: string | null;
}

// ── Money ───────────────────────────────────────────────────────────────────

export type CodCollectionMode =
  | "cash"
  | "esewa"
  | "khalti"
  | "fonepay"
  | "connectips"
  | "imepay"
  | "card"
  | "bank_transfer";

export interface CodCollection {
  id: number;
  shipment_id: number;
  merchant_id: number | null;
  branch_id: number | null;
  rider_id: number | null;
  remittance_id: number | null;
  amount: number;
  currency: string;
  collection_mode: CodCollectionMode;
  status: Exclude<CodStatus, "not_applicable">;
  reference_no: string | null;
  collected_at: string | null;
  deposited_at: string | null;
  deposit_reference: string | null;
  verified_by: number | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string | null;
}

export type RemittanceStatus = "draft" | "approved" | "paid" | "cancelled";

export interface CodRemittance {
  id: number;
  remittance_no: string;
  merchant_id: number;
  branch_id: number | null;
  period_start: string | null;
  period_end: string | null;
  total_collected: number;
  service_fee: number;
  tax_amount: number;
  adjustment: number;
  net_payable: number;
  currency: string;
  status: RemittanceStatus;
  payment_method: string | null;
  payment_reference: string | null;
  bank_account: string | null;
  approved_by: number | null;
  approved_at: string | null;
  paid_at: string | null;
  notes: string | null;
  collection_count: number;
  created_at: string | null;
  collections?: CodCollection[];
}

export interface PaymentGateway {
  id: number;
  code: string;
  name: string;
  display_name: string;
  logo_url: string | null;
  instructions: string | null;
  is_active: boolean;
  is_sandbox: boolean;
  sort_order: number;
  supported_currencies: string[];
  min_amount: number;
  max_amount: number | null;
  service_charge_percent: number;
  service_charge_flat: number;
  is_configured: boolean;
}

export type PaymentState =
  | "initiated"
  | "pending"
  | "success"
  | "failed"
  | "cancelled"
  | "refunded";

export interface Payment {
  id: number;
  payment_no: string;
  user_id: number | null;
  shipment_id: number | null;
  invoice_id: number | null;
  gateway_id: number | null;
  gateway_code: string | null;
  amount: number;
  currency: string;
  service_charge: number;
  status: PaymentState;
  transaction_id: string | null;
  gateway_reference: string | null;
  failure_reason: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  refund_amount: number;
  created_at: string | null;
}

// ── Rating ──────────────────────────────────────────────────────────────────

export interface RateCard {
  id: number;
  code: string;
  name: string;
  scope: "domestic" | "international";
  service_level: ServiceLevel;
  currency: string;
  merchant_id: number | null;
  is_default: boolean;
  is_active: boolean;
  effective_from: string | null;
  effective_to: string | null;
  volumetric_divisor: number;
  min_chargeable_weight_kg: number;
  weight_step_kg: number;
  fuel_surcharge_percent: number;
  vat_percent: number;
  cod_fee_percent: number;
  cod_fee_min: number;
  insurance_percent: number;
  notes: string | null;
  entry_count: number;
  entries?: RateCardEntry[];
}

export interface RateCardEntry {
  id: number;
  rate_card_id: number;
  origin_zone: DeliveryZone | null;
  destination_zone: DeliveryZone | null;
  origin_district: string | null;
  destination_district: string | null;
  destination_country: string | null;
  min_weight_kg: number;
  max_weight_kg: number | null;
  base_price: number;
  price_per_kg: number;
  min_charge: number;
  transit_days_min: number | null;
  transit_days_max: number | null;
  is_active: boolean;
}

export interface Surcharge {
  id: number;
  code: string;
  name: string;
  description: string | null;
  applies_to: string;
  calculation: "flat" | "percent" | "per_kg";
  value: number;
  min_amount: number;
  max_amount: number | null;
  zone: DeliveryZone | null;
  is_taxable: boolean;
  is_active: boolean;
  sort_order: number;
}

/** One named line in a quote, so the customer can see what they are paying. */
export interface QuoteLine {
  code: string;
  label: string;
  amount: number;
}

export interface Quote {
  currency: string;
  actual_weight_kg: number;
  volumetric_weight_kg: number;
  chargeable_weight_kg: number;
  rate_card_id: number | null;
  rate_card_code: string | null;
  entry_id: number | null;
  origin_zone: DeliveryZone | null;
  destination_zone: DeliveryZone | null;
  freight_charge: number;
  surcharges: QuoteLine[];
  surcharge_total: number;
  taxable_amount: number;
  tax_amount: number;
  total: number;
  transit_days_min: number | null;
  transit_days_max: number | null;
}

// ── Integrations ────────────────────────────────────────────────────────────

export type CarrierAuthType =
  | "none"
  | "api_key"
  | "basic"
  | "bearer"
  | "oauth2"
  | "hmac";

export interface CarrierCapabilities {
  tracking: boolean;
  booking: boolean;
  label: boolean;
  rates: boolean;
  pickup: boolean;
  cancel: boolean;
  webhook: boolean;
}

/** Public shape. The admin console additionally receives the config fields. */
export interface Carrier {
  id: number;
  code: string;
  name: string;
  display_name: string;
  logo_url: string | null;
  website_url: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
  supported_countries: string[];
  supported_services: string[];
  tracking_url_template: string | null;
  capabilities: CarrierCapabilities;
}

export type ApiKeyScope =
  | "shipments:read"
  | "shipments:write"
  | "tracking:read"
  | "rates:read"
  | "pickups:write"
  | "cod:read"
  | "webhooks:manage";

export interface MerchantApiKey {
  id: number;
  merchant_id: number;
  name: string;
  environment: "live" | "test";
  key_prefix: string;
  scopes: ApiKeyScope[];
  rate_limit_per_minute: number;
  allowed_ips: string[];
  is_active: boolean;
  is_usable: boolean;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  last_used_ip: string | null;
  use_count: number;
  created_at: string | null;
}

/**
 * Only ever returned by the create call, and only once.
 *
 * The secret arrives as `api_key`; it is never stored in clear, so a lost key
 * has to be revoked and replaced rather than looked up.
 */
export interface MerchantApiKeyCreated extends MerchantApiKey {
  api_key: string;
  api_key_notice: string;
}

export interface WebhookEndpoint {
  id: number;
  merchant_id: number;
  url: string;
  description: string | null;
  events: string[];
  signature_header: string;
  signature_algo: string;
  is_active: boolean;
  timeout_seconds: number;
  max_retries: number;
  consecutive_failures: number;
  disabled_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_error: string | null;
  created_at: string | null;
  secret_masked?: string;
}

export interface WebhookDelivery {
  id: number;
  endpoint_id: number;
  event_type: string;
  event_id: string | null;
  status: "pending" | "delivered" | "failed" | "exhausted";
  attempt_count: number;
  response_status: number | null;
  error: string | null;
  next_retry_at: string | null;
  delivered_at: string | null;
  created_at: string | null;
}

export interface NotificationTemplate {
  id: number;
  code: string;
  name: string;
  event: string;
  channel: "email" | "sms" | "push" | "whatsapp";
  subject: string | null;
  body_en: string | null;
  body_ne: string | null;
  variables: string[];
  is_active: boolean;
  send_to_sender: boolean;
  send_to_receiver: boolean;
  updated_at: string | null;
}

// ── Claims ──────────────────────────────────────────────────────────────────

export type ClaimStatus =
  | "open"
  | "under_review"
  | "awaiting_customer"
  | "approved"
  | "rejected"
  | "settled"
  | "withdrawn";

export type ClaimType =
  | "lost"
  | "damaged"
  | "partial_loss"
  | "delay"
  | "wrong_delivery"
  | "cod_discrepancy"
  | "overcharge"
  | "other";

export interface Claim {
  id: number;
  claim_no: string;
  shipment_id: number | null;
  raised_by: number;
  assigned_to: number | null;
  claim_type: ClaimType;
  status: ClaimStatus;
  priority: string;
  description: string | null;
  claimed_amount: number;
  approved_amount: number;
  currency: string;
  evidence: unknown[];
  resolution_note: string | null;
  rejection_reason: string | null;
  resolved_by: number | null;
  resolved_at: string | null;
  settled_at: string | null;
  due_at: string | null;
  is_closed: boolean;
  created_at: string | null;
}

export interface AddressBookEntry {
  id: number;
  user_id: number;
  label: string | null;
  contact_name: string;
  company: string | null;
  phone: string | null;
  alternate_phone: string | null;
  email: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  country: string;
  postal_code: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default_sender: boolean;
  is_default_receiver: boolean;
}

// ── Shipment ────────────────────────────────────────────────────────────────

export interface TrackingEvent {
  id: number;
  shipment_id?: number;
  status: string;
  location: string | null;
  description: string | null;
  timestamp: string;
}

export interface Parcel {
  id: number;
  shipment_id?: number;
  weight_kg: number;
  description: string | null;
}

export interface Shipment {
  id: number;
  tracking_no: string;
  status: ShipmentStatus;
  status_label: string;
  status_group: StatusGroup;
  is_terminal: boolean;

  origin: string | null;
  destination: string | null;
  origin_country: string | null;
  destination_country: string | null;
  origin_district: string | null;
  destination_district: string | null;
  origin_branch_id: number | null;
  destination_branch_id: number | null;
  current_branch_id: number | null;

  sender_name: string | null;
  sender_address: string | null;
  sender_phone: string | null;
  sender_email: string | null;
  receiver_name: string | null;
  receiver_address: string | null;
  receiver_phone: string | null;
  receiver_email: string | null;

  declared_value: number;
  currency: string;
  incoterms: string | null;
  total_weight_kg: number;
  total_packages: number;

  rider_id: number | null;
  pickup_id: number | null;
  merchant_id: number | null;
  reference_no: string | null;

  service_level: ServiceLevel;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  volumetric_weight_kg: number;
  chargeable_weight_kg: number;

  contents_description: string | null;
  is_fragile: boolean;
  is_insured: boolean;
  insurance_amount: number;

  is_cod: boolean;
  cod_amount: number;
  cod_currency: string;
  cod_status: CodStatus;
  cod_collected_at: string | null;

  payment_mode: PaymentMode;
  payment_status: PaymentStatus;
  freight_charge: number;
  surcharge_total: number;
  tax_amount: number;
  total_charge: number;

  carrier_id: number | null;
  carrier_tracking_no: string | null;

  delivery_attempt_count: number;
  delivered_at: string | null;
  sla_due_at: string | null;
  estimated_delivery: string | null;

  rto_reason: string | null;
  parent_shipment_id: number | null;

  notes: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: number;
  service_id: number | null;

  // Present only when the endpoint includes relations.
  parcels?: Parcel[];
  events?: TrackingEvent[];
  attempts?: DeliveryAttempt[];
  proof?: ProofOfDelivery | null;
  cod_collection?: CodCollection | null;
  payments?: Payment[];
  rider?: RiderBrief | null;
  origin_branch?: BranchBrief | null;
  destination_branch?: BranchBrief | null;
  service?: { id: number; name: string } | null;
}

// ── Pagination ──────────────────────────────────────────────────────────────

/**
 * The shape the newer list endpoints return. Older ones return a bare array
 * or a `{data, meta}` envelope, so check the endpoint before assuming.
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}
