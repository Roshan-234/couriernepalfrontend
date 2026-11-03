"use client";

/**
 * The rolling 30-day view from `/admin/dashboard/stats`, each figure paired
 * with its change against the 30 days before it. Separate from the live
 * counts above because these answer "how is the month going", not "what
 * needs doing now".
 */

import { FaChartLine, FaClock, FaMoneyBillWave, FaUsers } from "react-icons/fa";
import { StatCard, type StatCardTrend } from "@/components/kit";
import { formatCurrency } from "@/lib/utils";
import { PanelError } from "./PanelError";
import { useDashboardStats } from "./queries";

/**
 * A percentage change into a trend chip. `invertColour` marks the figures
 * where a rise is bad news — a longer average delivery time is not a win.
 */
function trend(change: number | undefined, invertColour = false): StatCardTrend | undefined {
  if (change === undefined || Number.isNaN(change)) return undefined;
  const rounded = Math.round(change * 10) / 10;
  return {
    direction: rounded > 0 ? "up" : rounded < 0 ? "down" : "flat",
    value: `${rounded > 0 ? "+" : ""}${rounded}%`,
    label: "vs previous 30 days",
    invertColour,
  };
}

export function ThirtyDayStats() {
  const stats = useDashboardStats();
  const data = stats.data;

  if (stats.isError) {
    return (
      <PanelError
        error={stats.error}
        subject="the 30-day figures"
        onRetry={() => stats.refetch()}
      />
    );
  }

  return (
    <section aria-labelledby="thirty-day-heading" className="space-y-4">
      <h2
        id="thirty-day-heading"
        className="text-lg font-bold text-[color:var(--brand-navy)]"
      >
        Last 30 days
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Shipments booked"
          value={(data?.totalShipments ?? 0).toLocaleString()}
          loading={stats.isPending}
          icon={<FaChartLine aria-hidden="true" />}
          trend={trend(data?.shipmentChange)}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(data?.revenue ?? 0)}
          loading={stats.isPending}
          icon={<FaMoneyBillWave aria-hidden="true" />}
          trend={trend(data?.revenueChange)}
          hint="Issued and paid invoices"
        />
        <StatCard
          label="New customers"
          value={(data?.activeCustomers ?? 0).toLocaleString()}
          loading={stats.isPending}
          icon={<FaUsers aria-hidden="true" />}
          trend={trend(data?.customerChange)}
        />
        <StatCard
          label="Average delivery"
          value={`${data?.avgDeliveryTime ?? 0} h`}
          loading={stats.isPending}
          icon={<FaClock aria-hidden="true" />}
          trend={trend(data?.deliveryTimeChange, true)}
          hint="Booking to delivery"
        />
      </div>
    </section>
  );
}

export default ThirtyDayStats;
