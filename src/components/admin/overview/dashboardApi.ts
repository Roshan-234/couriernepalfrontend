/**
 * The three `/admin/dashboard/*` endpoints, typed.
 *
 * These live here rather than in `src/lib/resources/` because they serve one
 * screen only. They go through the shared axios instance so the CSRF header
 * and the 401 refresh retry apply, exactly like every other call.
 *
 * `src/lib/adminApi.ts` wraps the same three routes with bare `fetch`, which
 * skips both of those. Nothing imports it; this module replaces it for the
 * overview screen.
 */

import api from "@/lib/api";

/** `GET /admin/dashboard/stats` — rolling 30 days against the 30 before it. */
export interface DashboardStats {
  totalShipments: number;
  shipmentChange: number;
  revenue: number;
  revenueChange: number;
  activeCustomers: number;
  customerChange: number;
  /** Hours between creation and delivery, averaged. */
  avgDeliveryTime: number;
  deliveryTimeChange: number;
}

/** `GET /admin/dashboard/shipment-trends` — 30 daily buckets, oldest first. */
export interface ShipmentTrends {
  /** ISO dates, `YYYY-MM-DD`. */
  labels: string[];
  domestic: number[];
  international: number[];
}

/**
 * `GET /admin/dashboard/revenue-analytics` — 12 monthly buckets.
 *
 * `expenses` and `profit` are arrays of `null` by design: there is no expense
 * ledger behind this API, so the backend refuses to invent one. They are
 * typed as nullable here so nothing downstream can quietly plot them.
 */
export interface RevenueAnalytics {
  labels: string[];
  revenue: number[];
  expenses: Array<number | null>;
  profit: Array<number | null>;
}

export const adminDashboard = {
  stats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>("/admin/dashboard/stats");
    return data;
  },
  shipmentTrends: async (): Promise<ShipmentTrends> => {
    const { data } = await api.get<ShipmentTrends>("/admin/dashboard/shipment-trends");
    return data;
  },
  revenueAnalytics: async (): Promise<RevenueAnalytics> => {
    const { data } = await api.get<RevenueAnalytics>("/admin/dashboard/revenue-analytics");
    return data;
  },
};
