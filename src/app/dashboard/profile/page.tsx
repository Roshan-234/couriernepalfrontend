"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api, { errorMessage } from "@/lib/api";
export default function Page() {
  const { user, updateUser } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { data } = await api.patch(
        "/auth/profile",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      updateUser(data);
      setMessage("Your profile has been saved.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">My profile</h1>
      <form onSubmit={submit} className="panel space-y-5">
        {[
          ["first_name", "First name", user?.first_name],
          ["last_name", "Last name", user?.last_name],
        ].map(([name, label, value]) => (
          <div key={name}>
            <label htmlFor={name} className="mb-2 block text-sm font-medium">
              {label}
            </label>
            <input
              id={name}
              name={name}
              className="field"
              defaultValue={value}
              required
              maxLength={50}
            />
          </div>
        ))}
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor="profile-email"
          >
            Email address
          </label>
          <input
            className="field bg-slate-50"
            id="profile-email"
            readOnly
            value={user?.email || ""}
          />
          <p className="mt-2 text-xs text-slate-500">
            Contact support to change your account email.
          </p>
        </div>
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
        <button className="action" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
