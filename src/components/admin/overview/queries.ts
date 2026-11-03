"use client";

/**
 * Every read the overview screen makes, in one place.
 *
 * Panels call these hooks rather than `useQuery` directly so two panels that
 * want the same data land on the same cache key and share one request — the
 * stat row and the recent-shipments table both run off `useOverviewPage()`.
 *
 * Keys are built from `queryKeys`, never written out by hand. The dashboard
 * endpoints have no entry of their own, so they hang off
 * `queryKeys.admin.dashboard`; invalidating that prefix clears all three.
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { cod } from "@/lib/resources/finance";
import { pickups, shipments, type ShipmentFilters } from "@/lib/resources/operations";
import type { ShipmentStatus } from "@/types/logistics";
import { adminDashboard } from "./dashboardApi";

/** An overview is a glance, not a live feed; a minute of staleness is fine. */
const STALE_TIME = 60_000;

/** Rows shown in the recent-shipments table. */
export const RECENT_LIMIT = 8;
/** Rows shown per attention queue before the panel points at the full list. */
export const ATTENTION_LIMIT = 25;

/**
 * `/shipments/page` computes its `summary` block before the `search` filter
 * is applied but `total` after it, so a status search gives both the whole
 * network's totals and that status's count in one request.
 *
 * `search` is matched against the status column and as a prefix/substring of
 * the tracking number, origin and destination. A status token like
 * `on_hold` cannot occur in a Nepali address, so the match is exact in
 * practice.
 */
const overviewFilters: ShipmentFilters = { all: 1, overview: 1, per_page: RECENT_LIMIT };

function statusFilters(status: ShipmentStatus, perPage: number): ShipmentFilters {
  return { all: 1, search: status, per_page: perPage };
}

/** Network totals plus the most recent shipments. */
export function useOverviewPage() {
  return useQuery({
    queryKey: queryKeys.shipments.list(overviewFilters),
    queryFn: () => shipments.page(overviewFilters),
    staleTime: STALE_TIME,
  });
}

/** One status's rows and its count. `perPage` of 1 asks for the count only. */
export function useShipmentsByStatus(status: ShipmentStatus, perPage: number) {
  const filters = statusFilters(status, perPage);
  return useQuery({
    queryKey: queryKeys.shipments.list(filters),
    queryFn: () => shipments.page(filters),
    staleTime: STALE_TIME,
  });
}

/**
 * How many delivered shipments the "delivered today" tile looks at.
 *
 * The API has no "delivered on this date" filter and caps a page at 100, so
 * the tile counts today's `delivered_at` across the 100 most recently created
 * delivered shipments. That is a floor, not a certainty, and the tile says so.
 */
export const DELIVERED_SCAN = 100;

/** The most recent delivered shipments, for the delivered-today count. */
export function useRecentlyDelivered() {
  return useShipmentsByStatus("delivered", DELIVERED_SCAN);
}

/** Same calendar day in the viewer's timezone. */
export function isToday(timestamp: string | null): boolean {
  if (!timestamp) return false;
  const when = new Date(timestamp);
  if (Number.isNaN(when.getTime())) return false;
  const now = new Date();
  return (
    when.getFullYear() === now.getFullYear() &&
    when.getMonth() === now.getMonth() &&
    when.getDate() === now.getDate()
  );
}

/** Pickups nobody has scheduled or assigned yet. */
export function useRequestedPickups() {
  const filters = { status: "requested" as const, per_page: ATTENTION_LIMIT };
  return useQuery({
    queryKey: queryKeys.pickups.list(filters),
    queryFn: () => pickups.list(filters),
    staleTime: STALE_TIME,
  });
}

/** Cash collected but not yet remitted to merchants. */
export function useCodSummary() {
  return useQuery({
    queryKey: queryKeys.cod.summary,
    queryFn: () => cod.summary(),
    staleTime: STALE_TIME,
  });
}

/** Rolling 30-day headline figures. */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats("30d"),
    queryFn: () => adminDashboard.stats(),
    staleTime: STALE_TIME,
  });
}

/** 30 daily shipment buckets, split domestic/international. */
export function useShipmentTrends() {
  return useQuery({
    queryKey: [...queryKeys.admin.dashboard, "shipment-trends"] as const,
    queryFn: () => adminDashboard.shipmentTrends(),
    staleTime: STALE_TIME,
  });
}

/** 12 monthly revenue buckets. */
export function useRevenueAnalytics() {
  return useQuery({
    queryKey: [...queryKeys.admin.dashboard, "revenue-analytics"] as const,
    queryFn: () => adminDashboard.revenueAnalytics(),
    staleTime: STALE_TIME,
  });
}
