"use client";

/**
 * The work queue: everything that has stopped moving on its own.
 *
 * Three queues sit behind one set of tabs so the counts are visible together
 * without three panels competing for the fold. Every row links to the record
 * it is about, because the next action is always taken there.
 */

import Link from "next/link";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DataTable,
  StatusBadge,
  Tabs,
  type BadgeTone,
  type TabItem,
} from "@/components/kit";
import { formatDate } from "@/lib/utils";
import type { Pickup, PickupStatus, Shipment, ShipmentStatus } from "@/types/logistics";
import { PanelError } from "./PanelError";
import { ATTENTION_LIMIT, useRequestedPickups, useShipmentsByStatus } from "./queries";

/** Pickup states have no kit equivalent of `StatusBadge`, so map them here. */
const PICKUP_TONES: Record<PickupStatus, BadgeTone> = {
  requested: "amber",
  scheduled: "blue",
  assigned: "indigo",
  in_progress: "teal",
  completed: "green",
  failed: "red",
  cancelled: "neutral",
};

const PICKUP_LABELS: Record<PickupStatus, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  assigned: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function PickupStatusBadge({ status }: { status: PickupStatus }) {
  return (
    <Badge tone={PICKUP_TONES[status] ?? "neutral"}>
      {PICKUP_LABELS[status] ?? status}
    </Badge>
  );
}

/** A count chip for a tab. Zero is still worth showing: it means "clear". */
function countBadge(count: number | undefined, loading: boolean, failed: boolean) {
  if (loading) return undefined;
  if (failed) return <Badge tone="red">!</Badge>;
  return <Badge tone={count ? "amber" : "green"}>{count ?? 0}</Badge>;
}

function ShipmentQueue({
  status,
  caption,
  emptyTitle,
  emptyDescription,
}: {
  status: ShipmentStatus;
  caption: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const query = useShipmentsByStatus(status, ATTENTION_LIMIT);

  if (query.isError) {
    return <PanelError error={query.error} subject={caption} onRetry={() => query.refetch()} />;
  }

  const total = query.data?.total ?? 0;
  const rows = query.data?.items ?? [];

  return (
    <div className="space-y-3">
      <DataTable<Shipment>
        caption={caption}
        rows={rows}
        rowKey={(row) => row.id}
        loading={query.isPending}
        density="compact"
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        columns={[
          {
            id: "tracking",
            header: "Tracking",
            primary: true,
            cell: (row) => (
              <Link
                href={`/admin/shipments/${row.id}`}
                className="font-semibold text-teal-800 underline underline-offset-2"
              >
                {row.tracking_no}
              </Link>
            ),
          },
          {
            id: "destination",
            header: "Destination",
            cell: (row) => (
              <span className="text-slate-800">
                {row.destination_district || row.destination || "—"}
              </span>
            ),
          },
          {
            id: "receiver",
            header: "Receiver",
            hideOnMobile: true,
            cell: (row) => <span className="text-slate-800">{row.receiver_name || "—"}</span>,
          },
          {
            id: "attempts",
            header: "Attempts",
            align: "right",
            cell: (row) => row.delivery_attempt_count,
          },
          {
            id: "status",
            header: "Status",
            cell: (row) => <StatusBadge status={row.status} label={row.status_label} />,
          },
          {
            id: "updated",
            header: "Updated",
            hideOnMobile: true,
            cell: (row) => (
              <span className="text-slate-700">
                {row.updated_at ? formatDate(row.updated_at) : "—"}
              </span>
            ),
          },
        ]}
      />

      {total > rows.length && (
        <p className="text-sm text-slate-600">
          Showing the first {rows.length} of {total.toLocaleString()}.{" "}
          <Link href="/admin/shipments" className="font-semibold text-teal-800 underline">
            Open the full shipment list
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function PickupQueue() {
  const query = useRequestedPickups();

  if (query.isError) {
    return (
      <PanelError
        error={query.error}
        subject="the unscheduled pickups"
        onRetry={() => query.refetch()}
      />
    );
  }

  const total = query.data?.total ?? 0;
  const rows = query.data?.items ?? [];

  return (
    <div className="space-y-3">
      <DataTable<Pickup>
        caption="Pickup requests still waiting to be scheduled"
        rows={rows}
        rowKey={(row) => row.id}
        loading={query.isPending}
        density="compact"
        emptyTitle="Every pickup is scheduled"
        emptyDescription="New requests land here the moment a merchant books one."
        columns={[
          {
            id: "pickup",
            header: "Pickup",
            primary: true,
            cell: (row) => (
              <Link
                href={`/admin/pickups/${row.id}`}
                className="font-semibold text-teal-800 underline underline-offset-2"
              >
                {row.pickup_no}
              </Link>
            ),
          },
          {
            id: "contact",
            header: "Contact",
            cell: (row) => (
              <span className="text-slate-800">{row.contact_name || "—"}</span>
            ),
          },
          {
            id: "district",
            header: "District",
            cell: (row) => <span className="text-slate-800">{row.district || "—"}</span>,
          },
          {
            id: "scheduled",
            header: "Requested for",
            cell: (row) => (
              <span className="text-slate-800">
                {row.scheduled_date ? formatDate(row.scheduled_date) : "No date"}
              </span>
            ),
          },
          {
            id: "packages",
            header: "Parcels",
            align: "right",
            hideOnMobile: true,
            cell: (row) => row.package_count,
          },
          {
            id: "status",
            header: "Status",
            cell: (row) => <PickupStatusBadge status={row.status} />,
          },
        ]}
      />

      {total > rows.length && (
        <p className="text-sm text-slate-600">
          Showing the first {rows.length} of {total.toLocaleString()}.{" "}
          <Link href="/admin/pickups" className="font-semibold text-teal-800 underline">
            Open the full pickup list
          </Link>
          .
        </p>
      )}
    </div>
  );
}

export function AttentionPanel() {
  const attempted = useShipmentsByStatus("delivery_attempted", ATTENTION_LIMIT);
  const onHold = useShipmentsByStatus("on_hold", ATTENTION_LIMIT);
  const pickups = useRequestedPickups();

  const items: TabItem[] = [
    {
      id: "attempted",
      label: "Failed attempts",
      badge: countBadge(attempted.data?.total, attempted.isPending, attempted.isError),
      content: (
        <ShipmentQueue
          status="delivery_attempted"
          caption="Shipments with a failed delivery attempt"
          emptyTitle="No failed attempts"
          emptyDescription="Nothing came back from the last mile today."
        />
      ),
    },
    {
      id: "on-hold",
      label: "On hold",
      badge: countBadge(onHold.data?.total, onHold.isPending, onHold.isError),
      content: (
        <ShipmentQueue
          status="on_hold"
          caption="Shipments held in the network"
          emptyTitle="Nothing on hold"
          emptyDescription="No shipment is waiting on a decision."
        />
      ),
    },
    {
      id: "pickups",
      label: "Unscheduled pickups",
      badge: countBadge(pickups.data?.total, pickups.isPending, pickups.isError),
      content: <PickupQueue />,
    },
  ];

  return (
    <Card as="section" aria-labelledby="attention-heading">
      <CardHeader>
        <CardTitle id="attention-heading">Needs attention</CardTitle>
      </CardHeader>
      <CardBody>
        <Tabs items={items} label="Queues needing attention" variant="pill" />
      </CardBody>
    </Card>
  );
}

export default AttentionPanel;
