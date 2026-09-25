"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api, { errorMessage } from "@/lib/api";
export default function Page() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/register", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      router.push("/auth/login");
    } catch (error) {
      setError(errorMessage(error, "Unable to create your account."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container py-16">
      <div className="panel mx-auto max-w-lg">
        <p className="eyebrow mb-3 text-teal-700">A BETTER WAY TO SEND</p>
        <h1 className="text-3xl font-bold">Create your account.</h1>
        <p className="mb-7 mt-3 text-sm text-slate-500">
          Book, manage and track your deliveries in one place.
        </p>
        <form onSubmit={submit} className="space-y-4">
          {[
            ["first_name", "First name", "text"],
            ["last_name", "Last name", "text"],
            ["email", "Email address", "email"],
            ["password", "Password", "password"],
            ["confirm", "Confirm password", "password"],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label htmlFor={name} className="mb-2 block text-sm font-medium">
                {label}
              </label>
              <input
                className="field"
                id={name}
                name={name}
                type={type}
                required
                minLength={type === "password" ? 8 : 1}
                maxLength={type === "password" ? 72 : 100}
                autoComplete={
                  type === "password"
                    ? "new-password"
                    : name === "email"
                      ? "email"
                      : name === "first_name"
                        ? "given-name"
                        : "family-name"
                }
              />
            </div>
          ))}
          <p className="text-xs leading-5 text-slate-500">
            Use at least 8 characters, with uppercase and lowercase letters, a
            number and a symbol.
          </p>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <button className="action w-full" disabled={busy}>
            {busy ? "Creating account…" : "Create account →"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          Already registered?{" "}
          <Link className="font-semibold text-teal-700" href="/auth/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
