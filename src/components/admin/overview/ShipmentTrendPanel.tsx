"use client";

/**
 * Daily shipment volume over the last 30 days.
 *
 * The chart is a canvas, which a screen reader cannot see into, so the same
 * data is also stated in prose under the figure and listed row by row in a
 * table behind a disclosure. Chart.js loads only on the client.
 */

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardBody, CardHeader, CardTitle, DataTable, EmptyState, Skeleton } from "@/components/kit";
import { shortDay } from "./chartTheme";
import { PanelError } from "./PanelError";
import { useShipmentTrends } from "./queries";

const ShipmentTrendCanvas = dynamic(() => import("./ShipmentTrendCanvas"), {
  ssr: false,
  loading: () => <Skeleton height="16rem" />,
});

interface TrendRow {
  date: string;
  domestic: number;
  international: number;
  total: number;
}

export function ShipmentTrendPanel() {
  const trends = useShipmentTrends();

  const rows = useMemo<TrendRow[]>(() => {
    const data = trends.data;
    if (!data) return [];
    return data.labels.map((date, index) => {
      const domestic = data.domestic[index] ?? 0;
      const international = data.international[index] ?? 0;
      return { date, domestic, international, total: domestic + international };
    });
  }, [trends.data]);

  const totals = useMemo(() => {
    const domestic = rows.reduce((sum, row) => sum + row.domestic, 0);
    const international = rows.reduce((sum, row) => sum + row.international, 0);
    const busiest = rows.reduce<TrendRow | null>(
      (best, row) => (best === null || row.total > best.total ? row : best),
      null,
    );
    return { domestic, international, all: domestic + international, busiest };
  }, [rows]);

  return (
    <Card as="section" aria-labelledby="trend-heading">
      <CardHeader>
        <CardTitle id="trend-heading">Shipments booked, last 30 days</CardTitle>
      </CardHeader>

      <CardBody className="space-y-4">
        {trends.isError ? (
          <PanelError
            error={trends.error}
            subject="the shipment trend"
            onRetry={() => trends.refetch()}
          />
        ) : trends.isPending ? (
          <Skeleton height="16rem" />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No bookings in the last 30 days"
            description="The trend chart fills in as shipments are created."
            size="sm"
          />
        ) : (
          <figure className="space-y-3">
            <ShipmentTrendCanvas
              labels={trends.data.labels}
              domestic={trends.data.domestic}
              international={trends.data.international}
            />
            <figcaption className="text-sm text-slate-700">
              {totals.all.toLocaleString()} shipments booked over the last 30 days —{" "}
              {totals.domestic.toLocaleString()} domestic and{" "}
              {totals.international.toLocaleString()} international.
              {totals.busiest && totals.busiest.total > 0 && (
                <>
                  {" "}
                  The busiest day was {shortDay(totals.busiest.date)} with{" "}
                  {totals.busiest.total.toLocaleString()}.
                </>
              )}
            </figcaption>
          </figure>
        )}

        {rows.length > 0 && (
          <details className="rounded-lg border border-slate-200 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-teal-800">
              Show the daily figures as a table
            </summary>
            <div className="mt-3">
              <DataTable<TrendRow>
                caption="Shipments booked per day over the last 30 days"
                rows={rows}
                rowKey={(row) => row.date}
                density="compact"
                mobileCards={false}
                columns={[
                  {
                    id: "date",
                    header: "Date",
                    primary: true,
                    cell: (row) => shortDay(row.date),
                  },
                  {
                    id: "domestic",
                    header: "Domestic",
                    align: "right",
                    cell: (row) => row.domestic.toLocaleString(),
                  },
                  {
                    id: "international",
                    header: "International",
                    align: "right",
                    cell: (row) => row.international.toLocaleString(),
                  },
                  {
                    id: "total",
                    header: "Total",
                    align: "right",
                    cell: (row) => row.total.toLocaleString(),
                  },
                ]}
              />
            </div>
          </details>
        )}
      </CardBody>
    </Card>
  );
}

export default ShipmentTrendPanel;
