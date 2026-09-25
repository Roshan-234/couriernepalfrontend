"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api, { errorMessage } from "@/lib/api";
export default function PasswordForm({ reset = false }: { reset?: boolean }) {
  const token = useSearchParams().get("token");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    if (reset && form.get("password") !== form.get("confirm")) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post(
        reset ? "/auth/password-reset/confirm" : "/auth/password-reset",
        reset
          ? { token, password: form.get("password") }
          : { email: form.get("email") },
      );
      setMessage(data.msg);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container py-16">
      <div className="panel mx-auto max-w-md">
        <p className="eyebrow mb-3 text-teal-700">ACCOUNT RECOVERY</p>
        <h1 className="text-3xl font-bold">
          {reset ? "Set a new password." : "Let’s get you back in."}
        </h1>
        <p className="mb-7 mt-4 text-sm leading-7 text-slate-500">
          {reset
            ? "Choose a strong password to secure your account."
            : "Enter your account email to request a password reset link."}
        </p>
        {reset && !token ? (
          <p role="alert">This reset link is incomplete. Request a new link.</p>
        ) : message ? (
          <p
            role="status"
            className="rounded-lg bg-teal-50 p-4 text-sm text-teal-800"
          >
            {message}
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {(reset
              ? [
                  ["password", "New password"],
                  ["confirm", "Confirm new password"],
                ]
              : [["email", "Email address"]]
            ).map(([name, label]) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="mb-2 block text-sm font-medium"
                >
                  {label}
                </label>
                <input
                  className="field"
                  id={name}
                  name={name}
                  type={reset ? "password" : "email"}
                  autoComplete={reset ? "new-password" : "email"}
                  minLength={reset ? 8 : undefined}
                  required
                />
              </div>
            ))}
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button className="action w-full" disabled={busy}>
              {busy
                ? "Please wait…"
                : reset
                  ? "Update password"
                  : "Send reset link"}
            </button>
          </form>
        )}
        <Link
          href="/auth/login"
          className="mt-7 block text-center text-sm font-semibold text-teal-700"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
