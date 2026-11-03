"use client";

/**
 * Monthly revenue over the last 12 months.
 *
 * Revenue only. The endpoint also returns `expenses` and `profit`, both
 * arrays of `null`, because the business has no expense ledger behind this
 * API. Neither is charted, totalled or alluded to: a margin drawn from
 * nothing would be read as real.
 */

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardBody, CardHeader, CardTitle, DataTable, EmptyState, Skeleton } from "@/components/kit";
import { formatCurrency } from "@/lib/utils";
import { shortMonth } from "./chartTheme";
import { PanelError } from "./PanelError";
import { useRevenueAnalytics } from "./queries";

const RevenueCanvas = dynamic(() => import("./RevenueCanvas"), {
  ssr: false,
  loading: () => <Skeleton height="16rem" />,
});

interface RevenueRow {
  month: string;
  revenue: number;
}

export function RevenuePanel() {
  const analytics = useRevenueAnalytics();

  const rows = useMemo<RevenueRow[]>(() => {
    const data = analytics.data;
    if (!data) return [];
    return data.labels.map((month, index) => ({
      month,
      revenue: data.revenue[index] ?? 0,
    }));
  }, [analytics.data]);

  const total = rows.reduce((sum, row) => sum + row.revenue, 0);
  const best = rows.reduce<RevenueRow | null>(
    (highest, row) => (highest === null || row.revenue > highest.revenue ? row : highest),
    null,
  );

  return (
    <Card as="section" aria-labelledby="revenue-heading">
      <CardHeader>
        <CardTitle id="revenue-heading">Revenue by month</CardTitle>
      </CardHeader>

      <CardBody className="space-y-4">
        {analytics.isError ? (
          <PanelError
            error={analytics.error}
            subject="the revenue figures"
            onRetry={() => analytics.refetch()}
          />
        ) : analytics.isPending ? (
          <Skeleton height="16rem" />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No revenue recorded yet"
            description="Invoices appear here once they are issued or paid."
            size="sm"
          />
        ) : (
          <figure className="space-y-3">
            <RevenueCanvas labels={analytics.data.labels} revenue={analytics.data.revenue} />
            <figcaption className="text-sm text-slate-700">
              {formatCurrency(total)} invoiced across the last {rows.length} months.
              {best && best.revenue > 0 && (
                <>
                  {" "}
                  The strongest month was {shortMonth(best.month)} at{" "}
                  {formatCurrency(best.revenue)}.
                </>
              )}{" "}
              Costs are not tracked in this system, so no profit figure is shown.
            </figcaption>
          </figure>
        )}

        {rows.length > 0 && (
          <details className="rounded-lg border border-slate-200 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-teal-800">
              Show the monthly figures as a table
            </summary>
            <div className="mt-3">
              <DataTable<RevenueRow>
                caption="Revenue invoiced per month over the last 12 months"
                rows={rows}
                rowKey={(row) => row.month}
                density="compact"
                mobileCards={false}
                columns={[
                  {
                    id: "month",
                    header: "Month",
                    primary: true,
                    cell: (row) => shortMonth(row.month),
                  },
                  {
                    id: "revenue",
                    header: "Revenue",
                    align: "right",
                    cell: (row) => formatCurrency(row.revenue),
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

export default RevenuePanel;
