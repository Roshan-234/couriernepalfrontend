"use client";

/**
 * The headline row: what the network is holding right now, and what of it is
 * stuck. Every tile is a count an operator can act on, not a vanity total.
 */

import {
  FaBoxOpen,
  FaCheckCircle,
  FaCoins,
  FaExclamationTriangle,
  FaShippingFast,
  FaTruck,
} from "react-icons/fa";
import { StatCard } from "@/components/kit";
import { formatCurrency } from "@/lib/utils";
import { PanelError } from "./PanelError";
import {
  ATTENTION_LIMIT,
  DELIVERED_SCAN,
  isToday,
  useCodSummary,
  useOverviewPage,
  useRecentlyDelivered,
  useRequestedPickups,
  useShipmentsByStatus,
} from "./queries";

const DASH = "—";

/** The subset of a query result this row needs to report a failure. */
interface FailureSource {
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/** A tile shows a dash rather than a zero when the number is unknown. */
function figure(value: number | undefined, failed: boolean): React.ReactNode {
  if (failed) return DASH;
  return value === undefined ? DASH : value.toLocaleString();
}

export function OverviewStats() {
  const overview = useOverviewPage();
  const outForDelivery = useShipmentsByStatus("out_for_delivery", 1);
  const delivered = useRecentlyDelivered();
  const attempted = useShipmentsByStatus("delivery_attempted", ATTENTION_LIMIT);
  const onHold = useShipmentsByStatus("on_hold", ATTENTION_LIMIT);
  const requestedPickups = useRequestedPickups();
  const codSummary = useCodSummary();

  const summary = overview.data?.summary;
  const deliveredToday = delivered.data?.items.filter((shipment) =>
    isToday(shipment.delivered_at),
  ).length;
  const deliveredScanned = delivered.data?.items.length ?? 0;
  const outstanding = codSummary.data?.total_outstanding;
  const pickupsWaiting = requestedPickups.data?.total ?? 0;

  const failures: Array<{ query: FailureSource; subject: string }> = [
    { query: overview, subject: "the shipment totals" },
    { query: outForDelivery, subject: "the out-for-delivery count" },
    { query: delivered, subject: "today's deliveries" },
    { query: attempted, subject: "the failed attempts" },
    { query: onHold, subject: "the held shipments" },
    { query: requestedPickups, subject: "the pickup queue" },
    { query: codSummary, subject: "the COD position" },
  ].filter((entry) => entry.query.isError);

  return (
    <section aria-labelledby="overview-stats-heading" className="space-y-4">
      <h2 id="overview-stats-heading" className="sr-only">
        Today at a glance
      </h2>

      {failures.map((entry) => (
        <PanelError
          key={entry.subject}
          error={entry.query.error}
          subject={entry.subject}
          onRetry={() => entry.query.refetch()}
        />
      ))}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total shipments"
          value={figure(summary?.total, overview.isError)}
          loading={overview.isPending}
          icon={<FaBoxOpen aria-hidden="true" />}
          hint="Every shipment on record"
          href="/admin/shipments"
        />

        <StatCard
          label="In transit"
          value={figure(summary?.in_transit, overview.isError)}
          loading={overview.isPending}
          icon={<FaTruck aria-hidden="true" />}
          hint="Moving between branches"
          href="/admin/shipments"
        />

        <StatCard
          label="Out for delivery"
          value={figure(outForDelivery.data?.total, outForDelivery.isError)}
          loading={outForDelivery.isPending}
          icon={<FaShippingFast aria-hidden="true" />}
          hint="With a rider on the last mile"
          href="/admin/shipments"
        />

        <StatCard
          label="Delivered today"
          value={figure(deliveredToday, delivered.isError)}
          loading={delivered.isPending}
          icon={<FaCheckCircle aria-hidden="true" />}
          hint={
            delivered.isError
              ? "Completed in the last 24 hours"
              : `Counted across the ${deliveredScanned || DELIVERED_SCAN} most recent deliveries`
          }
        />

        <StatCard
          label="Failed attempts"
          value={figure(attempted.data?.total, attempted.isError)}
          loading={attempted.isPending}
          icon={<FaExclamationTriangle aria-hidden="true" />}
          hint={
            onHold.isError
              ? "Needs a re-attempt or a return"
              : `${(onHold.data?.total ?? 0).toLocaleString()} more on hold`
          }
        />

        <StatCard
          label="COD outstanding"
          value={
            codSummary.isError || outstanding === undefined
              ? DASH
              : formatCurrency(outstanding)
          }
          loading={codSummary.isPending}
          icon={<FaCoins aria-hidden="true" />}
          hint="Collected, not yet remitted"
          href="/admin/remittances"
        />
      </div>

      <p className="text-sm text-slate-600">
        {requestedPickups.isPending
          ? "Checking the pickup queue…"
          : requestedPickups.isError
            ? "The pickup queue could not be read."
            : `${pickupsWaiting.toLocaleString()} pickup ${
                pickupsWaiting === 1 ? "request is" : "requests are"
              } still waiting to be scheduled.`}
      </p>
    </section>
  );
}

export default OverviewStats;
