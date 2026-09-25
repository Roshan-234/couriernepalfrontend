"use client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api, { errorMessage } from "@/lib/api";
export interface TrackingData {
  tracking_no: string;
  status: string;
  origin: string;
  destination: string;
  created_at: string;
  estimated_delivery: string | null;
  events: {
    id: number;
    status: string;
    location: string;
    description?: string;
    timestamp: string;
  }[];
}
export function displayDate(value?: string | null) {
  if (!value) return "To be confirmed";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "To be confirmed"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}
export function TrackingCard({ tracking }: { tracking: TrackingData }) {
  return (
    <div className="panel">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="eyebrow mb-2 text-slate-500">SHIPMENT DETAILS</p>
          <h2 className="break-all text-2xl font-bold">
            {tracking.tracking_no}
          </h2>
        </div>
        <span className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold capitalize text-teal-800">
          {tracking.status.replaceAll("_", " ")}
        </span>
      </div>
      <dl className="my-7 grid grid-cols-2 gap-6 text-sm">
        {[
          ["From", tracking.origin],
          ["To", tracking.destination],
          ["Created", displayDate(tracking.created_at)],
          ["Estimated delivery", displayDate(tracking.estimated_delivery)],
        ].map(([key, value]) => (
          <div key={key}>
            <dt className="text-slate-500">{key}</dt>
            <dd className="mt-1 font-semibold">{value || "To be confirmed"}</dd>
          </div>
        ))}
      </dl>
      <h3 className="mb-6 text-lg font-bold">Shipment journey</h3>
      {!tracking.events.length && (
        <p className="text-sm text-slate-500">
          Updates will appear here once your shipment starts moving.
        </p>
      )}
      <ol className="space-y-0">
        {tracking.events.map((event) => (
          <li
            key={event.id}
            className="relative ml-2 border-l border-teal-200 pb-7 pl-6 last:border-transparent"
          >
            <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-teal-700 ring-4 ring-white" />
            <h4 className="font-semibold capitalize">
              {event.status.replaceAll("_", " ")}
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              {event.location} · {displayDate(event.timestamp)}
            </p>
            {event.description && (
              <p className="mt-2 text-sm text-slate-600">{event.description}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
export default function TrackingResult() {
  const id = useSearchParams().get("id")?.trim();
  const { data, isLoading, error, refetch } = useQuery<TrackingData>({
    queryKey: ["tracking", id],
    queryFn: async () =>
      (await api.get(`/tracking/${encodeURIComponent(id!)}`)).data,
    enabled: !!id,
  });
  if (!id)
    return (
      <div className="panel text-center text-sm text-slate-500">
        Your shipment updates will appear here. Find your tracking number in
        your booking confirmation.
      </div>
    );
  if (isLoading)
    return (
      <p role="status" className="py-12 text-center">
        Finding your shipment…
      </p>
    );
  if (error)
    return (
      <div role="alert" className="panel text-center">
        <h2 className="text-lg font-bold">We couldn’t find that shipment</h2>
        <p className="my-4 text-sm text-slate-600">
          {errorMessage(
            error,
            "Check the tracking number and try again. If it was just booked, contact our team for help.",
          )}
        </p>
        <button className="action action-outline" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  return data ? <TrackingCard tracking={data} /> : null;
}
