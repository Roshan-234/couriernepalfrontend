"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api, { errorMessage } from "@/lib/api";

export default function ShipmentUpdate({ id }: { id: number }) {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (!user?.is_admin) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage("");
    try {
      await api.put(`/shipments/${id}`, Object.fromEntries(new FormData(form)));
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["shipment", String(id)] }),
        cache.invalidateQueries({ queryKey: ["shipments"] }),
        cache.invalidateQueries({ queryKey: ["tracking"] }),
      ]);
      form.reset();
      setMessage("Tracking update saved.");
    } catch (error) {
      setMessage(errorMessage(error, "Unable to save this update."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel mt-6 space-y-5">
      <div>
        <p className="eyebrow mb-2 text-teal-700">OPERATIONS</p>
        <h2 className="text-xl font-bold">Add a tracking update</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Shipment status
          <select name="status" className="field mt-2" required>
            <option value="">Choose status</option>
            {[
              "pending", "picked_up", "in_transit", "out_for_delivery",
              "delivered", "cancelled", "returned",
            ].map(status => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          Current location
          <input className="field mt-2" name="location" required maxLength={100} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Update description
        <textarea className="field mt-2" name="description" rows={3} maxLength={1000} />
      </label>
      <p className="text-xs text-slate-500">This update will be visible on the public tracking page.</p>
      {message && <p role="status" className="text-sm">{message}</p>}
      <button className="action" disabled={busy}>{busy ? "Saving…" : "Save tracking update"}</button>
    </form>
  );
}
