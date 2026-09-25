"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { errorMessage } from "@/lib/api";
import Link from "next/link";
interface Rule {
  id: number;
  service_type: string;
  shipment_type: string;
  origin_country: string;
  destination_country: string;
  min_weight: number;
  max_weight: number | null;
}
interface Quote {
  shipping_cost: number;
  insurance_cost: number;
  tax: number;
  total_cost: number;
}
export default function PricingCalculator() {
  const {
    data = [],
    isLoading,
    error: loadError,
  } = useQuery<Rule[]>({
    queryKey: ["pricing"],
    queryFn: async () => (await api.get("/pricing")).data,
  });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setQuote(null);
    setError("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const rule = data.find((r) => r.id === Number(form.get("rule")));
    try {
      const { data: result } = await api.post("/pricing/calculate", {
        ...rule,
        weight: Number(form.get("weight")),
        declared_value: Number(form.get("declared_value")),
      });
      setQuote(result);
    } catch (error) {
      setError(
        errorMessage(
          error,
          "A quote is not available for these details. Please contact our team.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  if (isLoading) return <p role="status">Loading available shipping routes…</p>;
  if (loadError || !data.length)
    return (
      <div className="py-6 text-center">
        <h3 className="text-xl font-bold">
          Let’s find the right rate for you.
        </h3>
        <p className="my-4 text-sm leading-7 text-slate-500">
          {loadError
            ? "We could not load shipping rates right now."
            : "Online rates are being updated. Contact our team for a quote tailored to your route and parcel."}
        </p>
        <Link href="/contact" className="action">
          Request a quote →
        </Link>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      onChange={() => setQuote(null)}
      className="space-y-5"
    >
      <div>
        <label htmlFor="rule" className="mb-2 block text-sm font-medium">
          Shipping route & service
        </label>
        <select className="field" id="rule" name="rule" required>
          {data.map((r) => (
            <option key={r.id} value={r.id}>
              {r.origin_country} → {r.destination_country} · {r.service_type} ·{" "}
              {r.shipment_type}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          ["weight", "Weight (kg)"],
          ["declared_value", "Declared value"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="mb-2 block text-sm font-medium" htmlFor={name}>
              {label}
            </label>
            <input
              className="field"
              id={name}
              name={name}
              type="number"
              step=".01"
              min={name === "weight" ? ".01" : "0"}
              required
              defaultValue={name === "weight" ? 1 : 0}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Amounts use the currency configured by the shipping team. Confirm
        currency and final charges before booking.
      </p>
      <button className="action w-full" disabled={busy}>
        {busy ? "Calculating…" : "Calculate estimate"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {quote && (
        <div role="status" className="rounded-xl bg-teal-50 p-6">
          <h3 className="text-lg font-bold">Your shipping estimate</h3>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Shipping", quote.shipping_cost],
              ["Insurance", quote.insurance_cost],
              ["Tax", quote.tax],
              ["Estimated total", quote.total_cost],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt>{label}</dt>
                <dd className="font-semibold">{Number(value).toFixed(2)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Final cost is subject to parcel measurement and service
            confirmation.
          </p>
        </div>
      )}
    </form>
  );
}
