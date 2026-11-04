"use client";

/**
 * The small amount of drawing the analytics screen needs.
 *
 * There is no charting library in this project and this is not the place to
 * add one: the whole module is three admin screens reading aggregates the
 * server already computed. Everything here is plain markup sized with
 * percentages, which costs nothing, reflows at 375px, carries no animation
 * for `prefers-reduced-motion` to suppress, and — because a bar chart is
 * unreadable to a screen reader however it is drawn — ships the same figures
 * as a real table beside it.
 */

import type { AnalyticsSeriesPoint, AnalyticsTopRow } from "@/lib/resources/reporting";

const NUMBER = new Intl.NumberFormat("en-GB");

export function count(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return NUMBER.format(value);
}

const DAY_LABEL = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });

/** "04 Nov" from an ISO day, or the raw string if it will not parse. */
export function dayLabel(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? iso : DAY_LABEL.format(parsed);
}

export interface SeriesBarsProps {
  points: AnalyticsSeriesPoint[];
  /** Names the chart for assistive technology and labels the data table. */
  caption: string;
}

/**
 * Daily events, split into page views and everything else.
 *
 * The split is a stack rather than two side-by-side series because page
 * views are a subset of events: stacking them adds up to the bar's own
 * total, where a grouped pair would invite reading the two as separate
 * populations.
 */
export function SeriesBars({ points, caption }: SeriesBarsProps) {
  const peak = points.reduce((max, point) => Math.max(max, point.events), 0);
  const totalEvents = points.reduce((sum, point) => sum + point.events, 0);

  if (points.length === 0) {
    return <p className="text-sm text-slate-600">No days in this range.</p>;
  }

  return (
    <figure className="m-0">
      <div className="mb-2 flex items-baseline justify-between gap-3 text-xs text-slate-600">
        <span>
          Peak <span className="font-semibold text-slate-800 tabular-nums">{count(peak)}</span>{" "}
          events in a day
        </span>
        <span className="tabular-nums">{count(totalEvents)} events in range</span>
      </div>

      <div
        role="img"
        aria-label={`${caption}. ${count(totalEvents)} events over ${points.length} days, peaking at ${count(peak)} in a day.`}
        className="flex h-40 items-end gap-px rounded-lg border border-slate-200 bg-slate-50/70 p-2"
      >
        {points.map((point) => {
          // A measured day never draws as nothing: a hairline says "we have
          // data and it is small", a gap says "we have no data".
          const height = peak === 0 ? 0 : Math.max((point.events / peak) * 100, point.events > 0 ? 2 : 0);
          const viewsShare = point.events === 0 ? 0 : (point.page_views / point.events) * 100;
          return (
            <div
              key={point.day}
              className="flex h-full flex-1 items-end"
              title={`${dayLabel(point.day)}: ${count(point.events)} events, ${count(point.page_views)} page views, ${count(point.visitors)} consented visitors`}
            >
              <div
                className="flex w-full flex-col justify-end overflow-hidden rounded-sm bg-teal-200"
                style={{ height: `${height}%` }}
              >
                <div
                  className="w-full bg-[color:var(--brand-teal)]"
                  style={{ height: `${viewsShare}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
        <span>{dayLabel(points[0].day)}</span>
        <span className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-xs bg-[color:var(--brand-teal)]"
            />
            Page views
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-xs bg-teal-200" />
            Other events
          </span>
        </span>
        <span>{dayLabel(points[points.length - 1].day)}</span>
      </div>

      <figcaption className="sr-only">{caption}</figcaption>
      <table className="sr-only">
        <caption>{caption}, as a table</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Events</th>
            <th scope="col">Page views</th>
            <th scope="col">Consented visitors</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.day}>
              <th scope="row">{point.day}</th>
              <td>{point.events}</td>
              <td>{point.page_views}</td>
              <td>{point.visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export interface TopListProps {
  title: string;
  rows: AnalyticsTopRow[];
  /** Shown instead of the list when the server returned nothing. */
  emptyText?: string;
  /** Renders the value as something other than plain text, e.g. a country name. */
  render?: (value: string) => React.ReactNode;
}

/** A top-N breakdown: the label, its count, and a bar for the eye to scan. */
export function TopList({ title, rows, emptyText = "Nothing measured yet.", render }: TopListProps) {
  const peak = rows.reduce((max, row) => Math.max(max, row.events), 0);

  return (
    <section className="panel">
      <h2 className="text-sm font-bold text-[color:var(--brand-navy)]">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">{emptyText}</p>
      ) : (
        <ol className="mt-3 grid gap-2">
          {rows.map((row) => (
            <li key={row.value} className="grid gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-sm text-slate-800" title={row.value}>
                  {render ? render(row.value) : row.value}
                </span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-700">
                  {count(row.events)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  aria-hidden="true"
                  className="h-1.5 rounded-full bg-teal-400"
                  style={{ width: `${peak === 0 ? 0 : Math.max((row.events / peak) * 100, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** A `Record<string, number>` shown as a top list, largest first. */
export function recordToRows(source: Record<string, number> | undefined): AnalyticsTopRow[] {
  return Object.entries(source ?? {})
    .map(([value, events]) => ({ value, events }))
    .sort((a, b) => b.events - a.events || a.value.localeCompare(b.value));
}
