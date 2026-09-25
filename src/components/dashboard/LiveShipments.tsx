"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getShipments } from "@/lib/shipments";
import { displayDate } from "@/components/tracking/TrackingResult";
import { errorMessage } from "@/lib/api";
export default function LiveShipments({
  overview = false,
  admin = false,
}: {
  overview?: boolean;
  admin?: boolean;
}) {
  const [search, setSearch] = useState("");
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["shipments", admin],
    queryFn: () => getShipments(admin),
  });
  const filtered = data.filter((shipment) =>
    [
      shipment.tracking_no,
      shipment.destination,
      shipment.origin,
      shipment.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 text-teal-700">SHIPMENT WORKSPACE</p>
          <h1 className="text-3xl font-bold">
            {overview
              ? "Your deliveries, at a glance."
              : admin
                ? "All shipments"
                : "My shipments"}
          </h1>
        </div>
        <Link href="/dashboard/create-shipment" className="action">
          + Create shipment
        </Link>
      </div>
      {error ? (
        <div className="panel" role="alert">
          <p>{errorMessage(error, "Unable to load shipments.")}</p>
          <button className="mt-3 text-teal-700" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <p role="status">Loading shipments…</p>
      ) : (
        <>
          {overview && (
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                ["Total shipments", data.length],
                [
                  "In transit",
                  data.filter((s) => s.status === "in_transit").length,
                ],
                [
                  "Delivered",
                  data.filter((s) => s.status === "delivered").length,
                ],
                [
                  "Awaiting pickup",
                  data.filter((s) => s.status === "pending").length,
                ],
              ].map(([label, value]) => (
                <div key={label} className="panel">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          )}
          <div className="panel">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold">
                {overview ? "Recent shipments" : "Shipment history"}
              </h2>
              <input
                aria-label="Search shipments"
                placeholder="Search number, route or status"
                className="field max-w-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {!filtered.length ? (
              <div className="py-12 text-center">
                <h3 className="text-lg font-semibold">
                  {search
                    ? "No matching shipments"
                    : "Your next delivery starts here"}
                </h3>
                <p className="mt-3 text-sm text-slate-500">
                  {search
                    ? "Try another tracking number or destination."
                    : "Create your first shipment to see its progress here."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      {[
                        "Tracking number",
                        "Route",
                        "Status",
                        "Created",
                        "",
                      ].map((h, i) => (
                        <th
                          key={i}
                          scope="col"
                          className="whitespace-nowrap px-3 py-4"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(overview ? filtered.slice(0, 5) : filtered).map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-5 font-semibold">
                          {s.tracking_no}
                        </td>
                        <td className="px-3 py-5">
                          {s.origin} → {s.destination}
                        </td>
                        <td className="px-3 py-5">
                          <span className="whitespace-nowrap rounded-full bg-teal-50 px-3 py-1 text-xs capitalize text-teal-800">
                            {s.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-slate-500">
                          {displayDate(s.created_at)}
                        </td>
                        <td className="px-3 py-5">
                          <Link
                            className="font-semibold text-teal-700"
                            href={`/dashboard/shipments/${s.id}`}
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
