"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import api, { errorMessage } from "@/lib/api";
import type { Shipment } from "@/lib/shipments";
import { TrackingCard } from "@/components/tracking/TrackingResult";
import ShipmentUpdate from "@/components/dashboard/ShipmentUpdate";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { data, error, isLoading } = useQuery<Shipment>({
    queryKey: ["shipment", id],
    queryFn: async () =>
      (await api.get(`/shipments/${encodeURIComponent(id)}`)).data,
  });
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/shipments" className="text-sm text-teal-700">
        ← All shipments
      </Link>
      <h1 className="my-6 text-3xl font-bold">Shipment details</h1>
      {isLoading && <p role="status">Loading shipment…</p>}
      {error && (
        <p role="alert">
          {errorMessage(error, "Unable to load this shipment.")}
        </p>
      )}
      {data && (
        <>
          <TrackingCard tracking={data} />
          <ShipmentUpdate id={data.id} />
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {[
              [
                "Sender",
                data.sender_name,
                data.sender_address,
                data.sender_phone,
              ],
              [
                "Receiver",
                data.receiver_name,
                data.receiver_address,
                data.receiver_phone,
              ],
            ].map(([title, ...values]) => (
              <div key={title} className="panel">
                <h2 className="mb-4 font-bold">{title}</h2>
                {values.map((value, i) => (
                  <p key={i} className="mt-2 text-sm text-slate-600">
                    {value || "Not provided"}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
