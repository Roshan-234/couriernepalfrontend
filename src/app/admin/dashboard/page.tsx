"use client";

/**
 * The operations overview — the first screen staff open each morning.
 *
 * Ordered by what gets acted on: live counts, then the queues that have
 * stopped moving, then the trends, then the newest bookings. The admin
 * layout already wraps this in `<Workspace admin>`, which carries the
 * `ProtectedRoute` gate, so nothing here re-checks the role.
 *
 * Each panel owns its own query, loading state and error, so one dead
 * endpoint costs one panel rather than the screen.
 */

import AttentionPanel from "@/components/admin/overview/AttentionPanel";
import OverviewStats from "@/components/admin/overview/OverviewStats";
import RecentShipments from "@/components/admin/overview/RecentShipments";
import RevenuePanel from "@/components/admin/overview/RevenuePanel";
import ShipmentTrendPanel from "@/components/admin/overview/ShipmentTrendPanel";
import ThirtyDayStats from "@/components/admin/overview/ThirtyDayStats";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2 text-teal-700">Operations overview</p>
        <h1 className="text-3xl font-bold text-[color:var(--brand-navy)]">
          What needs attention today
        </h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600">
          Live counts across the whole network, the queues that have stalled, and how
          the month is tracking.
        </p>
      </header>

      <OverviewStats />

      <AttentionPanel />

      <div className="grid gap-6 xl:grid-cols-2">
        <ShipmentTrendPanel />
        <RevenuePanel />
      </div>

      <ThirtyDayStats />

      <RecentShipments />
    </div>
  );
}
