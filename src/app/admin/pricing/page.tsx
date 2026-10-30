"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { errorMessage } from "@/lib/api";

interface Rule {
  id: number; service_type: string; shipment_type: string; origin_country: string;
  destination_country: string; base_price: number; price_per_kg: number; min_weight: number;
  max_weight: number | null; insurance_percentage: number; tax_percentage: number; is_active: boolean;
}
const fields = [
  ["service_type", "Service type", "text"], ["shipment_type", "Shipment type", "text"],
  ["origin_country", "Origin country", "text"], ["destination_country", "Destination country", "text"],
  ["base_price", "Base price", "number"], ["price_per_kg", "Price per kg", "number"],
  ["min_weight", "Minimum weight (kg)", "number"], ["max_weight", "Maximum weight (kg, optional)", "number"],
  ["insurance_percentage", "Insurance (%)", "number"], ["tax_percentage", "Tax (%)", "number"],
] as const;

export default function PricingPage() {
  const cache = useQueryClient();
  const { data = [], isLoading, error } = useQuery<Rule[]>({ queryKey: ["admin-pricing"], queryFn: async () => (await api.get("/pricing/rules")).data.rules });
  const [editing, setEditing] = useState<Rule | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const payload: Record<string, string | number | boolean | null> = { is_active: values.get("is_active") === "on" };
    fields.forEach(([key, , type]) => { const value = String(values.get(key) || ""); payload[key] = key === "max_weight" && !value ? null : type === "number" ? Number(value) : value.trim(); });
    setBusy(true); setMessage("");
    try {
      if (editing) await api.put(`/pricing/rules/${editing.id}`, payload);
      else await api.post("/pricing/rules", payload);
      await Promise.all([cache.invalidateQueries({ queryKey: ["admin-pricing"] }), cache.invalidateQueries({ queryKey: ["pricing"] })]);
      setEditing(null); form.reset(); setMessage("Rate saved. Active rates are available in the public calculator.");
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <div><p className="eyebrow text-teal-700">OPERATIONS</p><h1 className="mt-2 text-3xl font-bold">Shipping rates</h1><p className="mt-3 text-sm text-slate-500">Manage real route and weight brackets. Use one consistent billing currency across all rates.</p></div>
    <div className="panel overflow-x-auto">
      {isLoading ? <p role="status">Loading rates…</p> : error ? <p role="alert">{errorMessage(error)}</p> : !data.length ? <p>No rates yet. Add your first route below.</p> : <table className="w-full text-left text-sm"><thead><tr>{["Route", "Service", "Weight (kg)", "Base / per kg", "Status", "Action"].map(label => <th className="p-3" key={label}>{label}</th>)}</tr></thead><tbody>{data.map(rule => <tr className="border-t border-slate-100" key={rule.id}>
        <td className="p-3">{rule.origin_country} → {rule.destination_country}</td><td className="p-3">{rule.service_type} · {rule.shipment_type}</td><td className="p-3">{rule.min_weight}–{rule.max_weight ?? "Unlimited"}</td><td className="p-3">{rule.base_price} / {rule.price_per_kg}</td><td className="p-3">{rule.is_active ? "Active" : "Inactive"}</td><td className="p-3"><button disabled={busy} className="font-semibold text-teal-700" onClick={() => { setEditing(rule); setMessage(""); }}>Edit</button></td>
      </tr>)}</tbody></table>}
    </div>
    <form key={editing?.id ?? "new"} onSubmit={save} className="panel space-y-5">
      <h2 className="text-xl font-bold">{editing ? "Edit rate" : "Add a rate"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label, type]) => <label key={key} className="text-sm font-medium">{label}<input className="field mt-2" name={key} type={type} min={type === "number" ? 0 : undefined} max={key.endsWith("percentage") ? 100 : undefined} step={type === "number" ? "0.01" : undefined} maxLength={type === "text" ? (key.endsWith("country") ? 100 : 50) : undefined} required={key !== "max_weight"} defaultValue={editing?.[key] ?? (type === "number" && key !== "max_weight" ? 0 : "")} /></label>)}</div>
      <label className="flex items-center gap-3 text-sm"><input name="is_active" type="checkbox" defaultChecked={editing?.is_active ?? true} /> Available for public quotes</label>
      <div className="flex gap-3"><button className="action" disabled={busy}>{busy ? "Saving…" : "Save rate"}</button>{editing && <button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel edit</button>}</div>
    </form>
    {message && <p role="status" className="panel text-sm">{message}</p>}
  </div>;
}
