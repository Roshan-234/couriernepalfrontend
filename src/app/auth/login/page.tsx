"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { errorMessage } from "@/lib/api";
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const user = await login(
        String(form.get("email")),
        String(form.get("password")),
      );
      const redirect = params.get("redirect");
      router.replace(
        redirect && /^\/(dashboard|admin)(\/|$)/.test(redirect)
          ? redirect
          : user.is_admin
            ? "/admin/dashboard"
            : "/dashboard",
      );
    } catch (error) {
      setError(
        errorMessage(
          error,
          "Unable to sign in. Check your email and password.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container py-16 sm:py-24">
      <div className="panel mx-auto max-w-md">
        <p className="eyebrow mb-3 text-teal-700">YOUR SHIPPING SPACE</p>
        <h1 className="text-3xl font-bold">Welcome back.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sign in to manage your shipments and keep things moving.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email address
            </label>
            <input
              className="field"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <label htmlFor="password" className="font-medium">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-teal-700">
                Forgot password?
              </Link>
            </div>
            <input
              className="field"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <button disabled={busy} className="action w-full">
            {busy ? "Signing in…" : "Sign in →"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link className="font-semibold text-teal-700" href="/auth/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
