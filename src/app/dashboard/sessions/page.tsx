"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { errorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { displayDate } from "@/components/tracking/TrackingResult";

interface Session { id: number; user_id: number; ip_address: string; created_at: string; expires_at: string; current: boolean; }
export default function SessionsPage() {
  const { user, logout } = useAuth();
  const cache = useQueryClient();
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const { data = [], isLoading, error } = useQuery<Session[]>({ queryKey: ["sessions", user?.id], queryFn: async () => (await api.get("/sessions")).data });
  async function revoke(session: Session) {
    setBusy(session.id); setMessage("");
    try {
      if (session.current) { await logout(); return; }
      await api.delete(`/sessions/${session.id}`);
      await cache.invalidateQueries({ queryKey: ["sessions"] });
      setMessage("Session signed out. Its access and refresh tokens are revoked.");
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(null); }
  }
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Account sessions</h1><p className="text-slate-500">Review active sign-ins and sign out devices you no longer use.</p>
    {message && <p role="status">{message}</p>}
    <div className="panel space-y-4">{isLoading ? <p role="status">Loading sessions…</p> : error ? <p role="alert">{errorMessage(error)}</p> : data.filter(session => session.user_id === user?.id).map(session => <div key={session.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0"><div><p className="font-semibold">{session.current ? "This device" : "Other session"}</p><p className="mt-2 text-sm text-slate-500">Signed in {displayDate(session.created_at)} · {session.ip_address || "Address unavailable"}</p></div><button className="action" disabled={busy !== null} onClick={() => revoke(session)}>{busy === session.id ? "Signing out…" : "Sign out"}</button></div>)}</div>
  </div>;
}
