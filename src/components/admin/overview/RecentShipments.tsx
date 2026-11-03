"use client";

/**
 * The last few bookings, newest first. Runs off the same query as the stat
 * row, so the two never disagree and only one request is made.
 */

import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle, DataTable, StatusBadge } from "@/components/kit";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Shipment } from "@/types/logistics";
import { PanelError } from "./PanelError";
import { RECENT_LIMIT, useOverviewPage } from "./queries";

export function RecentShipments() {
  const overview = useOverviewPage();
  const rows = overview.data?.items ?? [];

  return (
    <Card as="section" aria-labelledby="recent-heading">
      <CardHeader
        actions={
          <Link href="/admin/shipments" className="action action-outline">
            All shipments
          </Link>
        }
      >
        <CardTitle id="recent-heading">Latest bookings</CardTitle>
      </CardHeader>

      <CardBody>
        {overview.isError ? (
          <PanelError
            error={overview.error}
            subject="the latest bookings"
            onRetry={() => overview.refetch()}
          />
        ) : (
          <DataTable<Shipment>
            caption={`The ${RECENT_LIMIT} most recently created shipments`}
            rows={rows}
            rowKey={(row) => row.id}
            loading={overview.isPending}
            skeletonRows={RECENT_LIMIT}
            emptyTitle="No shipments yet"
            emptyDescription="Bookings appear here as soon as the first one is created."
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
                id: "route",
                header: "Route",
                cell: (row) => (
                  <span className="text-slate-800">
                    {row.origin_district || row.origin || "—"} →{" "}
                    {row.destination_district || row.destination || "—"}
                  </span>
                ),
              },
              {
                id: "receiver",
                header: "Receiver",
                hideOnMobile: true,
                cell: (row) => (
                  <span className="text-slate-800">{row.receiver_name || "—"}</span>
                ),
              },
              {
                id: "charge",
                header: "Charge",
                align: "right",
                cell: (row) => (
                  <span className="text-slate-800 tabular-nums">
                    {formatCurrency(row.total_charge, row.currency || "NPR")}
                  </span>
                ),
              },
              {
                id: "cod",
                header: "COD",
                align: "right",
                hideOnMobile: true,
                cell: (row) =>
                  row.is_cod ? (
                    <span className="text-slate-800 tabular-nums">
                      {formatCurrency(row.cod_amount, row.cod_currency || "NPR")}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  ),
              },
              {
                id: "status",
                header: "Status",
                cell: (row) => <StatusBadge status={row.status} label={row.status_label} />,
              },
              {
                id: "created",
                header: "Booked",
                hideOnMobile: true,
                cell: (row) => (
                  <span className="text-slate-700">{formatDate(row.created_at)}</span>
                ),
              },
            ]}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default RecentShipments;
