"use client";
import type { SitePage } from "@/lib/content";
import PageIntro from "@/components/common/PageIntro";
import { useState } from "react";
import api, { errorMessage } from "@/lib/api";
export default function ContactContent({ page }: { page: SitePage }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(
        "/contact",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      setSent(true);
    } catch (error) {
      setError(
        errorMessage(
          error,
          "Your message could not be sent. Please try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container py-16 sm:py-20">
      <PageIntro page={page} />
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="space-y-8">
          {page.sections.map(({ heading: label, body: text }) => (
            <div key={label}>
              <h2 className="mb-2 text-lg font-bold">{label}</h2>
              {label === "Call us" ? (
                <a className="text-teal-700" href={`tel:${text.replace(/[^+0-9]/g, "")}`}>
                  {text}
                </a>
              ) : label === "Email us" ? (
                <a className="break-all text-teal-700" href={`mailto:${text}`}>
                  {text}
                </a>
              ) : (
                <p className="text-sm text-slate-500">{text}</p>
              )}
            </div>
          ))}
        </div>
        <div className="panel">
          {sent ? (
            <div role="status" className="py-12">
              <h2 className="text-2xl font-bold">Message received.</h2>
              <p className="mt-4 leading-7 text-slate-500">
                Thank you for getting in touch. Our team will respond using the
                email address you provided.
              </p>
              <button
                className="action action-outline mt-6"
                onClick={() => setSent(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-2xl font-bold">Send us a message</h2>
              <form onSubmit={submit} className="space-y-5">
                {[
                  ["name", "Your name"],
                  ["email", "Email address"],
                  ["subject", "Subject"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label
                      className="mb-2 block text-sm font-medium"
                      htmlFor={name}
                    >
                      {label}
                    </label>
                    <input
                      id={name}
                      name={name}
                      className="field"
                      type={name === "email" ? "email" : "text"}
                      required
                      maxLength={150}
                    />
                  </div>
                ))}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    htmlFor="message"
                  >
                    How can we help?
                  </label>
                  <textarea
                    className="field"
                    id="message"
                    name="message"
                    rows={5}
                    required
                    maxLength={5000}
                  />
                </div>
                {error && (
                  <p role="alert" className="text-sm text-red-700">
                    {error}
                  </p>
                )}
                <button className="action w-full" disabled={busy}>
                  {busy ? "Sending…" : "Send message →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
