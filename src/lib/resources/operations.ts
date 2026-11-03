/** Geography, branch network, riders, pickups and delivery outcomes. */

import { del, get, getList, getPage, patch, post, put, type Query } from "./client";
import type {
  Branch,
  DeliveryAttempt,
  District,
  Paginated,
  Pickup,
  ProofOfDelivery,
  Province,
  Rider,
  RiderStatus,
  Shipment,
  ZoneInfo,
} from "@/types/logistics";

// ── Geography (public, read-only) ───────────────────────────────────────────

// These return `{items, total}`, not a bare array — hence getList.
export const geo = {
  provinces: () => getList<Province>("/geo/provinces"),
  districts: (query: { province?: string; zone?: string } = {}) =>
    getList<District>("/geo/districts", query as Query),
  district: (slug: string) => get<District>(`/geo/districts/${slug}`),
  zones: () => getList<ZoneInfo>("/geo/zones"),
};

// ── Branches ────────────────────────────────────────────────────────────────

export interface BranchFilters extends Query {
  district?: string;
  type?: string;
  province?: string;
}

export const branches = {
  list: (query: BranchFilters = {}) => getList<Branch>("/branches/", query),
  /** `ident` accepts the numeric id or the branch code. */
  get: (ident: string | number) => get<Branch>(`/branches/${ident}`),
  serving: (district: string) => get<Branch[]>(`/branches/serving/${district}`),
  create: (body: Partial<Branch>) => post<Branch>("/branches/", body),
  update: (ident: string | number, body: Partial<Branch>) =>
    put<Branch>(`/branches/${ident}`, body),
  /** Soft deactivate — the row is kept so historic shipments still resolve. */
  deactivate: (ident: string | number) => del<unknown>(`/branches/${ident}`),
};

// ── Riders ──────────────────────────────────────────────────────────────────

export interface RiderFilters extends Query {
  branch_id?: number;
  status?: RiderStatus;
  district?: string;
  page?: number;
  per_page?: number;
}

export const riders = {
  list: (query: RiderFilters = {}) => getPage<Rider>("/riders/", query),
  get: (id: number) => get<Rider>(`/riders/${id}`),
  create: (body: Partial<Rider> & { user_id: number }) => post<Rider>("/riders/", body),
  update: (id: number, body: Partial<Rider>) => put<Rider>(`/riders/${id}`, body),
  deactivate: (id: number) => del<unknown>(`/riders/${id}`),

  // Rider self-service. These are gated on having a rider profile, not a role.
  me: () => get<Rider>("/riders/me"),
  setStatus: (status: RiderStatus) => patch<Rider>("/riders/me/status", { status }),
  setLocation: (latitude: number, longitude: number) =>
    post<Rider>("/riders/me/location", { latitude, longitude }),
  myShipments: () => getList<Shipment>("/riders/me/shipments"),
};

// ── Pickups ─────────────────────────────────────────────────────────────────

export interface PickupFilters extends Query {
  status?: string;
  date?: string;
  branch_id?: number;
  rider_id?: number;
  page?: number;
  per_page?: number;
}

export const pickups = {
  list: (query: PickupFilters = {}) => getPage<Pickup>("/pickups/", query),
  /** Paginated, despite the name — returns the first page by default. */
  mine: (query: PickupFilters = {}) => getPage<Pickup>("/pickups/my", query),
  /** A rider's own queue. 403 for a caller with no rider profile. */
  assigned: () => getList<Pickup>("/pickups/assigned"),
  get: (id: number) => get<Pickup>(`/pickups/${id}`),
  create: (body: Partial<Pickup>) => post<Pickup>("/pickups/", body),
  assign: (id: number, rider_id: number) => post<Pickup>(`/pickups/${id}/assign`, { rider_id }),
  reschedule: (id: number, body: { scheduled_date?: string; time_slot?: string }) =>
    post<Pickup>(`/pickups/${id}/reschedule`, body),
  complete: (id: number, collected_count: number) =>
    post<Pickup>(`/pickups/${id}/complete`, { collected_count }),
  fail: (id: number, failure_reason: string) =>
    post<Pickup>(`/pickups/${id}/fail`, { failure_reason }),
  cancel: (id: number) => post<Pickup>(`/pickups/${id}/cancel`),
};

// ── Delivery outcomes ───────────────────────────────────────────────────────

export interface AttemptBody {
  outcome: "delivered" | "failed" | "rescheduled";
  reason_code?: string;
  reason_note?: string;
  latitude?: number;
  longitude?: number;
  next_attempt_date?: string;
}

export interface PodBody {
  recipient_name: string;
  recipient_relation?: string;
  recipient_id_ref?: string;
  signature_path?: string;
  photo_path?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  /** Required when an OTP was issued for this shipment. */
  otp?: string;
}

export const deliveries = {
  attempts: (shipmentId: number) =>
    get<DeliveryAttempt[]>(`/deliveries/shipments/${shipmentId}/attempts`),
  recordAttempt: (shipmentId: number, body: AttemptBody) =>
    post<{ attempt: DeliveryAttempt; next_statuses?: string[] }>(
      `/deliveries/shipments/${shipmentId}/attempt`,
      body,
    ),
  /** Issues a delivery code. The code itself is never returned. */
  issueOtp: (shipmentId: number) =>
    post<{ msg: string; otp_required: boolean; expires_at: string | null }>(
      `/deliveries/shipments/${shipmentId}/otp`,
    ),
  recordPod: (shipmentId: number, body: PodBody) =>
    post<ProofOfDelivery>(`/deliveries/shipments/${shipmentId}/pod`, body),
  startReturn: (shipmentId: number, rto_reason: string) =>
    post<Shipment>(`/deliveries/shipments/${shipmentId}/rto`, { rto_reason }),
};

// ── Shipments (the pre-existing endpoints, typed) ───────────────────────────

export interface ShipmentFilters extends Query {
  /** Admin only: widen the list beyond the caller's own shipments. */
  all?: 1;
  search?: string;
  page?: number;
  per_page?: number;
  overview?: 1;
}

export interface ShipmentPage extends Paginated<Shipment> {
  summary?: {
    total?: number;
    in_transit?: number;
    delivered?: number;
    pending?: number;
  };
}

export const shipments = {
  page: async (query: ShipmentFilters = {}) => {
    // This endpoint carries a summary block alongside the page, so it is not
    // run through getPage — the extra key would be dropped.
    const raw = await get<ShipmentPage>("/shipments/page", query);
    return {
      items: raw.items ?? [],
      total: raw.total ?? 0,
      page: raw.page ?? 1,
      pages: raw.pages ?? 1,
      per_page: raw.per_page ?? Number(query.per_page ?? 20),
      summary: raw.summary,
    } satisfies ShipmentPage;
  },
  get: (id: number | string) => get<Shipment>(`/shipments/${id}`),
  mine: () => get<Shipment[]>("/shipments/my"),
  create: (body: Partial<Shipment>) => post<Shipment>("/shipments/", body),
  /** Sets a status and appends a tracking event. */
  update: (id: number | string, body: { status: string; location?: string; description?: string }) =>
    put<Shipment>(`/shipments/${id}`, body),
  remove: (id: number | string) => del<unknown>(`/shipments/${id}`),
  byTrackingNo: (trackingNo: string) => get<Shipment>(`/shipments/tracking/${trackingNo}`),
};
