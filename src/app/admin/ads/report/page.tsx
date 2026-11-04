"use client";

/**
 * Advert performance.
 *
 * The one thing this screen must not do is look like a time series. The
 * counters on a creative are lifetime totals held in a single column, and
 * the date range selects *which campaigns appear* rather than which days
 * are counted. The API says so in `counters_are`; that sentence is rendered
 * verbatim next to the range, and the range control is labelled as a filter
 * on campaigns rather than on days.
 *
 * The bars are plain divs. There is no charting library in this project and
 * adding one to draw six horizontal rectangles would be the wrong trade.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Skeleton,
  StatCard,
} from "@/components/kit";
import { Notice, ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { RateBar, on } from "@/components/admin/marketing/shared";
import { adReport, type AdReportCampaign } from "@/lib/resources/advertising";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

function CampaignBlock({ row, maxImpressions }: { row: AdReportCampaign; maxImpressions: number }) {
  return (
    <section className="border-b border-slate-200 py-4 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[color:var(--brand-navy)]">
            <Link
              href={`/admin/ads/${row.campaign_id}`}
              className="underline underline-offset-4"
            >
              {row.name}
            </Link>
          </h3>
          <p className="text-xs text-slate-600">
            <code>{row.code}</code> · {row.status}
            {row.occasion ? ` · ${row.occasion}` : ""} ·{" "}
            {row.starts_at || row.ends_at ? `${on(row.starts_at)} → ${on(row.ends_at)}` : "no dates"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-slate-900">
            {row.impressions.toLocaleString()} impressions
          </p>
          <p className="text-xs tabular-nums text-slate-700">
            {row.clicks.toLocaleString()} clicks · {row.click_through_rate}% CTR
          </p>
        </div>
      </div>

      <div className="mt-3">
        <RateBar
          value={row.impressions}
          max={maxImpressions}
          label={`${row.impressions.toLocaleString()} impressions, lifetime`}
        />
      </div>

      {row.creatives.length > 0 && (
        <table className="mt-3 w-full text-left text-xs">
          <caption className="sr-only">
            Creatives in {row.name} with their lifetime impressions, clicks and click-through rate
          </caption>
          <thead>
            <tr className="text-slate-600">
              <th scope="col" className="py-1 font-semibold">
                Creative
              </th>
              <th scope="col" className="py-1 font-semibold">
                Placement
              </th>
              <th scope="col" className="py-1 text-right font-semibold">
                Impressions
              </th>
              <th scope="col" className="py-1 text-right font-semibold">
                Clicks
              </th>
              <th scope="col" className="py-1 text-right font-semibold">
                CTR
              </th>
            </tr>
          </thead>
          <tbody>
            {row.creatives.map((creative) => (
              <tr key={creative.creative_id} className="border-t border-slate-100">
                <td className="py-1.5 pr-3 text-slate-800">
                  {creative.headline}
                  {!creative.is_active && (
                    <Badge tone="neutral" variant="soft" size="sm" className="ml-2">
                      off
                    </Badge>
                  )}
                </td>
                <td className="py-1.5 pr-3">
                  <code className="text-slate-600">{creative.placement ?? "—"}</code>
                </td>
                <td className="py-1.5 text-right tabular-nums text-slate-800">
                  {creative.impressions.toLocaleString()}
                </td>
                <td className="py-1.5 text-right tabular-nums text-slate-800">
                  {creative.clicks.toLocaleString()}
                </td>
                <td className="py-1.5 text-right tabular-nums text-slate-800">
                  {creative.click_through_rate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default function Page() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const range = useMemo(() => ({ from, to }), [from, to]);

  const report = useQuery({
    queryKey: queryKeys.adsAdmin.report(range),
    queryFn: () => adReport(range),
  });

  const rows = report.data?.items ?? [];
  const maxImpressions = rows.reduce((max, row) => Math.max(max, row.impressions), 0);
  const rangeInvalid = Boolean(from && to && to < from);

  return (
    <>
      <ScreenHeader
        eyebrow="Marketing"
        title="Advert performance"
        description="Impressions, clicks and click-through rate for every campaign and creative."
        actions={
          <Link href="/admin/ads" className="action action-outline">
            Campaigns
          </Link>
        }
      />

      <Notice tone="info" title="These are lifetime totals, not a time series" className="mb-6">
        <p>
          A creative&rsquo;s impressions and clicks are single columns
          incremented in place, so no date range can slice them. The range
          below chooses <strong>which campaigns are listed</strong> — those
          whose period overlaps it, with an undated campaign always eligible —
          and changes none of the numbers beside them.
        </p>
        {report.data && (
          <p className="mt-2 text-xs">
            The API states it as:{" "}
            <q className="font-semibold">{report.data.counters_are}</q>
          </p>
        )}
      </Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Campaigns listed"
          value={report.data?.total ?? 0}
          loading={report.isLoading}
        />
        <StatCard
          label="Impressions"
          value={(report.data?.totals.impressions ?? 0).toLocaleString()}
          hint="Lifetime, across the listed campaigns"
          loading={report.isLoading}
        />
        <StatCard
          label="Clicks"
          value={(report.data?.totals.clicks ?? 0).toLocaleString()}
          hint={`${report.data?.totals.click_through_rate ?? 0}% click-through`}
          loading={report.isLoading}
        />
      </div>

      <div className="panel">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Campaigns that could have run from"
            hint="Leave empty for no lower bound."
          >
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </Field>
          <Field
            label="…to"
            error={rangeInvalid ? "The end must not be before the start." : undefined}
          >
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </Field>
          <div className="flex items-end pb-1">
            <Button
              variant="outline"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              disabled={!from && !to}
            >
              Clear range
            </Button>
          </div>
        </div>

        {report.isError ? (
          <EmptyState
            title="Could not load the report"
            description={errorMessage(report.error)}
            action={<Button onClick={() => report.refetch()}>Try again</Button>}
          />
        ) : report.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No campaign falls in that range"
            description="Clear the dates to see every campaign. An undated campaign is always eligible, so an empty list here means the range excludes every dated one."
          />
        ) : (
          <div>
            {rows.map((row) => (
              <CampaignBlock key={row.campaign_id} row={row} maxImpressions={maxImpressions} />
            ))}
          </div>
        )}

        {report.data && report.data.totals.impressions === 0 && rows.length > 0 && (
          <p className="mt-4 rounded-[0.75rem] border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            Every counter is zero, which is the expected state: no campaign has
            been live, so nothing has been served or clicked.
          </p>
        )}
      </div>
    </>
  );
}
