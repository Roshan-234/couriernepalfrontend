"use client";

/**
 * Tracking history for one shipment: the status events, newest first, and
 * the delivery attempts with the reason each one failed.
 *
 * They are kept apart deliberately. An attempt is not a status change — a
 * shipment can be attempted three times without leaving `out_for_delivery` —
 * and merging the two into one stream has historically made it look as
 * though the parcel moved when it only sat on a doorstep.
 */

import { Badge, Skeleton, StatusBadge } from "@/components/kit";
import type {
  AttemptOutcome,
  DeliveryAttempt,
  ShipmentStatus,
  TrackingEvent,
} from "@/types/logistics";
import { EMPTY, dateTime, text, titleCase } from "./format";

const OUTCOME_TONE: Record<AttemptOutcome, "green" | "red" | "amber"> = {
  delivered: "green",
  failed: "red",
  rescheduled: "amber",
};

function byNewest<T>(items: T[], at: (item: T) => string | null | undefined): T[] {
  return [...items].sort((a, b) => {
    const left = new Date(at(a) ?? 0).getTime() || 0;
    const right = new Date(at(b) ?? 0).getTime() || 0;
    return right - left;
  });
}

export interface ShipmentTimelineProps {
  events: TrackingEvent[];
  attempts: DeliveryAttempt[];
  /** Attempts load from their own endpoint, so they can still be in flight. */
  attemptsLoading?: boolean;
}

export function ShipmentTimeline({
  events,
  attempts,
  attemptsLoading = false,
}: ShipmentTimelineProps) {
  const ordered = byNewest(events, (event) => event.timestamp);
  const orderedAttempts = byNewest(attempts, (attempt) => attempt.attempted_at);

  return (
    <div className="space-y-8">
      <section aria-labelledby="timeline-events">
        <h3
          id="timeline-events"
          className="mb-4 text-base font-bold text-[color:var(--brand-navy)]"
        >
          Tracking events
        </h3>

        {ordered.length === 0 ? (
          <p className="text-sm text-slate-600">
            No tracking events have been recorded for this shipment yet.
          </p>
        ) : (
          <ol className="relative space-y-6 border-l-2 border-slate-200 pl-6">
            {ordered.map((event, index) => (
              <li key={event.id ?? `${event.status}-${event.timestamp}`} className="relative">
                <span
                  aria-hidden="true"
                  className={
                    "absolute -left-[1.9rem] top-1 h-3 w-3 rounded-full ring-4 ring-white " +
                    (index === 0 ? "bg-[color:var(--brand-teal)]" : "bg-slate-300")
                  }
                />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={event.status as ShipmentStatus}
                    size="sm"
                    dot={false}
                  />
                  {index === 0 && (
                    <Badge tone="teal" size="sm" variant="outline">
                      Latest
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-slate-800">{text(event.description)}</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {dateTime(event.timestamp)}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="timeline-attempts">
        <h3
          id="timeline-attempts"
          className="mb-4 text-base font-bold text-[color:var(--brand-navy)]"
        >
          Delivery attempts
        </h3>

        {attemptsLoading ? (
          <Skeleton lines={3} />
        ) : orderedAttempts.length === 0 ? (
          <p className="text-sm text-slate-600">No delivery has been attempted yet.</p>
        ) : (
          <ul className="space-y-3">
            {orderedAttempts.map((attempt) => (
              <li
                key={attempt.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[color:var(--brand-navy)]">
                      Attempt {attempt.attempt_no}
                    </span>
                    <Badge tone={OUTCOME_TONE[attempt.outcome] ?? "neutral"} size="sm">
                      {titleCase(attempt.outcome)}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-600">
                    {dateTime(attempt.attempted_at)}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Reason code
                    </dt>
                    <dd className="text-sm text-slate-800">
                      {attempt.reason_code ? titleCase(attempt.reason_code) : EMPTY}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Rider
                    </dt>
                    <dd className="text-sm text-slate-800">
                      {attempt.rider?.name ?? EMPTY}
                    </dd>
                  </div>
                  {attempt.reason_note && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Note
                      </dt>
                      <dd className="text-sm text-slate-800">{attempt.reason_note}</dd>
                    </div>
                  )}
                  {attempt.next_attempt_date && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Next attempt
                      </dt>
                      <dd className="text-sm text-slate-800">
                        {dateTime(attempt.next_attempt_date)}
                      </dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default ShipmentTimeline;
