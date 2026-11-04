"use client";

/**
 * Website analytics.
 *
 * Every figure on this screen is a SQL aggregate the server computed; the
 * page adds nothing up and rounds nothing off. The one number that needs
 * care is `unique_visitors`: it counts only visitors who agreed to
 * analytics, so it is a floor rather than an audience size. The API returns
 * that caveat in prose and it is rendered next to the number, not hidden in
 * a tooltip — a dashboard that prints it as a confident figure undoes the
 * reason the measurement was brought in-house in the first place.
 *
 * `/events` deliberately omits visitor keys and IP hashes. Nothing here
 * tries to show them.
 */

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  DataTable,
  Field,
  Input,
  Pagination,
  Select,
  Skeleton,
  StatCard,
  Tabs,
  type DataTableColumn,
} from "@/components/kit";
import { Notice, ScreenHeader, when } from "@/components/admin/integrations/ScreenHeader";
import { FilterBar, QueryError, optionalText } from "@/components/admin/finance/shared";
import {
  SeriesBars,
  TopList,
  count,
  recordToRows,
} from "@/components/admin/analytics/charts";
import { queryKeys } from "@/lib/queryKeys";
import {
  analyticsReports,
  type AnalyticsEventFilters,
  type AnalyticsEventRow,
} from "@/lib/resources/reporting";

const PER_PAGE = 20;

/**
 * Fallback vocabulary for the event filter.
 *
 * The real list is whatever `events_by_name` on the overview returns, which
 * is the server's own `AnalyticsEvent.NAMES` and therefore includes the
 * names written server-side (ad impressions, notice dismissals) that the
 * browser beacon never sends. This is only used before the overview has
 * answered; filtering on a name the API does not declare is a 400.
 */
const EVENT_NAMES = [
  "page_view",
  "quote_requested",
  "tracking_lookup",
  "shipment_booked",
  "contact_submitted",
  "newsletter_subscribe",
  "outbound_click",
] as const;

const PRESETS: { label: string; days: number }[] = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const label = (value: string) => value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/** `NP` → `Nepal (NP)`. Unknown codes are passed through untouched. */
function regionName(code: string): string {
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase());
    return name && name !== code.toUpperCase() ? `${name} (${code.toUpperCase()})` : code;
  } catch {
    return code;
  }
}

function isoDay(offsetDays: number): string {
  const day = new Date();
  day.setDate(day.getDate() - offsetDays);
  return day.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState("overview");

  // Empty means "let the server decide", which is the last 30 days.
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [eventName, setEventName] = useState("");
  const [eventPath, setEventPath] = useState("");
  const [eventCountry, setEventCountry] = useState("");
  const [eventCampaign, setEventCampaign] = useState("");
  const [page, setPage] = useState(1);

  const range = useMemo(
    () => ({ from: optionalText(from), to: optionalText(to) }),
    [from, to],
  );

  const overview = useQuery({
    queryKey: queryKeys.analytics.overview(range),
    queryFn: () => analyticsReports.overview(range),
    placeholderData: keepPreviousData,
  });

  const realtime = useQuery({
    queryKey: queryKeys.analytics.realtime,
    queryFn: () => analyticsReports.realtime(),
  });

  const eventFilters: AnalyticsEventFilters = useMemo(
    () => ({
      ...range,
      name: optionalText(eventName),
      path: optionalText(eventPath),
      country: optionalText(eventCountry),
      utm_campaign: optionalText(eventCampaign),
      page,
      per_page: PER_PAGE,
    }),
    [range, eventName, eventPath, eventCountry, eventCampaign, page],
  );

  const events = useQuery({
    queryKey: queryKeys.analytics.events(eventFilters),
    queryFn: () => analyticsReports.events(eventFilters),
    placeholderData: keepPreviousData,
    enabled: tab === "events",
  });

  const data = overview.data;
  const conversionTotal = Object.values(data?.conversions ?? {}).reduce((sum, n) => sum + n, 0);
  const eventNameOptions: readonly string[] = data
    ? Object.keys(data.events_by_name)
    : EVENT_NAMES;

  function applyPreset(days: number) {
    setFrom(isoDay(days - 1));
    setTo(isoDay(0));
    setPage(1);
  }

  const rangeFilters = (
    <FilterBar
      label="Reporting range"
      onReset={() => {
        setFrom("");
        setTo("");
        setPage(1);
      }}
    >
      <Field label="From" hint="Blank means the last 30 days.">
        <Input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => {
            setFrom(event.target.value);
            setPage(1);
          }}
        />
      </Field>
      <Field label="To">
        <Input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => {
            setTo(event.target.value);
            setPage(1);
          }}
        />
      </Field>
      <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.days}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => applyPreset(preset.days)}
          >
            Last {preset.label}
          </Button>
        ))}
        {data && (
          <p className="text-xs text-slate-600">
            Showing {data.from} to {data.to} ({data.days} days). The API allows at most 366.
          </p>
        )}
      </div>
    </FilterBar>
  );

  const overviewPane = overview.isError ? (
    <QueryError
      error={overview.error}
      title="Could not load the analytics overview"
      onRetry={() => void overview.refetch()}
    />
  ) : overview.isLoading || !data ? (
    <div className="grid gap-4">
      <div className="panel">
        <Skeleton lines={3} />
      </div>
      <div className="panel">
        <Skeleton lines={6} />
      </div>
    </div>
  ) : (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Events" value={count(data.total_events)} hint="Everything recorded in range" />
        <StatCard label="Page views" value={count(data.page_views)} hint="The page_view event only" />
        <StatCard
          label="Conversions"
          value={count(conversionTotal)}
          hint="Quotes, tracking lookups, bookings and contact forms"
        />
        <StatCard
          label="Events with no visitor key"
          value={count(data.events_without_visitor_key)}
          hint="Visitors who declined analytics, and the no-JS pixel"
        />
      </div>

      {/* The honesty panel. This number is a floor and has to read as one. */}
      <section className="panel border-amber-300! bg-amber-50/60!" aria-labelledby="visitors-floor">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="visitors-floor" className="eyebrow text-amber-900">
              Unique visitors — lower bound
            </h2>
            <p className="mt-1 text-3xl font-bold text-[color:var(--brand-navy)] tabular-nums">
              at least {count(data.unique_visitors)}
            </p>
          </div>
          <Badge tone="amber" variant="soft">
            {data.unique_visitors_source === "daily_rollup"
              ? "From the daily rollup — further approximated"
              : "Counted from events"}
          </Badge>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-amber-900">{data.unique_visitors_basis}</p>
        <p className="mt-2 max-w-3xl text-sm text-amber-900">
          {data.total_events === 0 ? (
            "Nothing was measured in this range, so there is no figure to misread yet."
          ) : (
            <>
              {count(data.events_without_visitor_key)} of {count(data.total_events)} events in this
              range carry no visitor key at all, so the people behind them cannot be counted here
              and cannot be told apart from one another. Do not quote this figure as an audience
              size.
            </>
          )}
        </p>
      </section>

      <section className="panel" aria-labelledby="daily-series">
        <h2 id="daily-series" className="mb-3 text-sm font-bold text-[color:var(--brand-navy)]">
          Daily activity
        </h2>
        <SeriesBars points={data.series} caption={`Events per day, ${data.from} to ${data.to}`} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopList
          title="Top pages"
          rows={data.top_paths}
          emptyText="No page views in this range."
        />
        <TopList
          title="Top referrers"
          rows={data.top_referrer_hosts}
          emptyText="No referred traffic in this range. Direct visits carry no referrer."
        />
        <TopList
          title="Countries"
          rows={data.top_countries}
          render={regionName}
          emptyText="No country was resolved for any event in this range."
        />
        <TopList title="Devices" rows={recordToRows(data.devices)} render={label} />
        <TopList
          title="Events by name"
          rows={recordToRows(data.events_by_name).filter((row) => row.events > 0)}
          render={label}
          emptyText="Nothing was recorded in this range."
        />
        <TopList
          title="Conversions"
          rows={recordToRows(data.conversions).filter((row) => row.events > 0)}
          render={label}
          emptyText="No quote, tracking lookup, booking or contact form in this range."
        />
      </div>

      <section className="panel" aria-labelledby="realtime">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="realtime" className="text-sm font-bold text-[color:var(--brand-navy)]">
              Last 30 minutes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {realtime.data
                ? `${count(realtime.data.total_events)} events since ${when(realtime.data.since)}.`
                : "Loading…"}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void realtime.refetch()}
            loading={realtime.isFetching}
            loadingLabel="Refreshing"
          >
            Refresh
          </Button>
        </div>
        {realtime.isError ? (
          <p className="mt-3 text-sm text-red-800">The realtime panel could not be loaded.</p>
        ) : (realtime.data?.active_paths.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Nothing in the last half hour. On a quiet site that is normal rather than a fault.
          </p>
        ) : (
          <ul className="mt-3 grid gap-1.5">
            {realtime.data?.active_paths.map((row) => (
              <li key={row.value} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-slate-800">{row.value}</span>
                <span className="shrink-0 tabular-nums text-slate-700">{count(row.events)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );

  const eventColumns: DataTableColumn<AnalyticsEventRow>[] = [
    {
      id: "occurred",
      header: "When",
      primary: true,
      cell: (row) => <span className="text-sm text-slate-800">{when(row.occurred_at)}</span>,
    },
    {
      id: "name",
      header: "Event",
      cell: (row) => (
        <Badge tone={row.name === "page_view" ? "neutral" : "teal"} variant="soft">
          {label(row.name)}
        </Badge>
      ),
    },
    {
      id: "path",
      header: "Path",
      cell: (row) => (
        <span className="block max-w-xs truncate text-sm text-slate-800" title={row.path ?? ""}>
          {row.path ?? "—"}
        </span>
      ),
    },
    {
      id: "country",
      header: "Country",
      cell: (row) => (
        <span className="text-sm text-slate-800">{row.country ? regionName(row.country) : "—"}</span>
      ),
    },
    {
      id: "device",
      header: "Device",
      hideOnMobile: true,
      cell: (row) => <span className="text-sm text-slate-800">{label(row.device ?? "unknown")}</span>,
    },
    {
      id: "referrer",
      header: "Referrer",
      hideOnMobile: true,
      cell: (row) => <span className="text-sm text-slate-800">{row.referrer_host ?? "—"}</span>,
    },
    {
      id: "campaign",
      header: "Campaign",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-slate-800">
          {row.utm_campaign ?? "—"}
          {row.utm_source && (
            <span className="block text-xs text-slate-600">via {row.utm_source}</span>
          )}
        </span>
      ),
    },
  ];

  const eventsPane = (
    <div className="grid gap-5">
      <Notice title="What this listing does not contain">
        Visitor keys, session keys and IP hashes are left out of the response on purpose. They are
        what makes counting possible in SQL; they are not what makes traffic readable, and a list
        that showed them would let a visit be matched to a person identifiable by other means.
      </Notice>

      <FilterBar
        label="Filter events"
        onReset={() => {
          setEventName("");
          setEventPath("");
          setEventCountry("");
          setEventCampaign("");
          setPage(1);
        }}
      >
        <Field label="Event">
          <Select
            value={eventName}
            onChange={(event) => {
              setEventName(event.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "Any event" },
              ...eventNameOptions.map((name) => ({ value: name, label: label(name) })),
            ]}
          />
        </Field>
        <Field label="Path" hint="An exact match, not a prefix.">
          <Input
            value={eventPath}
            placeholder="/pricing"
            onChange={(event) => {
              setEventPath(event.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="Country" hint="Two-letter code.">
          <Input
            value={eventCountry}
            placeholder="NP"
            maxLength={2}
            onChange={(event) => {
              setEventCountry(event.target.value.toUpperCase());
              setPage(1);
            }}
          />
        </Field>
        <Field label="Campaign">
          <Input
            value={eventCampaign}
            placeholder="utm_campaign"
            onChange={(event) => {
              setEventCampaign(event.target.value);
              setPage(1);
            }}
          />
        </Field>
      </FilterBar>

      {events.isError ? (
        <QueryError
          error={events.error}
          title="Could not load events"
          onRetry={() => void events.refetch()}
        />
      ) : (
        <>
          <div className="panel p-0! sm:p-0!">
            <DataTable
              caption="Analytics events"
              columns={eventColumns}
              rows={events.data?.items ?? []}
              rowKey={(row) => row.id}
              loading={events.isLoading}
              density="compact"
              emptyTitle="No events match"
              emptyDescription="Widen the date range, or clear the event, path, country and campaign filters."
            />
          </div>
          {events.data && (
            <Pagination
              page={events.data.page}
              pageCount={events.data.pages}
              pageSize={events.data.per_page}
              totalItems={events.data.total}
              onPageChange={setPage}
              label="Event pages"
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <ScreenHeader
        eyebrow="Site"
        title="Website analytics"
        description="First-party measurement, on our own servers. Every figure here is the server's aggregate; nothing on this page recomputes one."
      />

      {rangeFilters}

      <Tabs
        label="Analytics sections"
        value={tab}
        onValueChange={setTab}
        items={[
          { id: "overview", label: "Overview", content: overviewPane },
          { id: "events", label: "Events", content: eventsPane },
        ]}
      />
    </>
  );
}
