"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import api, { errorMessage } from "@/lib/api";
export default function Page() {
  const router = useRouter();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const { data } = await api.post("/shipments", {
        ...form,
        total_weight_kg: Number(form.total_weight_kg),
        total_packages: Number(form.total_packages),
        currency: "NPR",
      });
      await cache.invalidateQueries({ queryKey: ["shipments"] });
      router.push(`/dashboard/shipments/${data.id}`);
    } catch (error) {
      setError(
        errorMessage(
          error,
          "We could not save your shipment. Please try again.",
        ),
      );
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow mb-3 text-teal-700">LET’S GET IT THERE</p>
      <h1 className="text-3xl font-bold">Create a shipment</h1>
      <p className="mb-8 mt-3 text-sm text-slate-500">
        Enter the delivery details. Our team will coordinate pickup and confirm
        the final cost.
      </p>
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {["sender", "receiver"].map((person) => (
            <fieldset key={person} className="panel">
              <legend className="px-2 text-lg font-bold capitalize">
                {person} details
              </legend>
              <div className="space-y-4">
                {[
                  ["name", "Full name"],
                  ["address", "Street address"],
                  ["phone", "Phone number"],
                  ["email", "Email address"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label
                      htmlFor={`${person}_${field}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      {label}
                      {field === "email" ? " (optional)" : ""}
                    </label>
                    <input
                      className="field"
                      id={`${person}_${field}`}
                      name={`${person}_${field}`}
                      type={
                        field === "email"
                          ? "email"
                          : field === "phone"
                            ? "tel"
                            : "text"
                      }
                      required={field !== "email"}
                      maxLength={field === "address" ? 300 : 100}
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <fieldset className="panel">
          <legend className="px-2 text-lg font-bold">Route & package</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["origin", "Origin city", "text"],
              ["destination", "Destination city", "text"],
              ["origin_country", "Origin country", "text"],
              ["destination_country", "Destination country", "text"],
              ["total_weight_kg", "Total weight (kg)", "number"],
              ["total_packages", "Number of packages", "number"],
            ].map(([name, label, type]) => (
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
                  type={type}
                  required
                  defaultValue={
                    name.includes("country")
                      ? "Nepal"
                      : name === "total_packages"
                        ? 1
                        : undefined
                  }
                  min={
                    name === "total_packages"
                      ? 1
                      : type === "number"
                        ? 0.01
                        : undefined
                  }
                  step={
                    name === "total_packages"
                      ? 1
                      : type === "number"
                        ? 0.01
                        : undefined
                  }
                  maxLength={100}
                />
              </div>
            ))}
          </div>
          <label
            className="mb-2 mt-5 block text-sm font-medium"
            htmlFor="notes"
          >
            Package description & delivery notes
          </label>
          <textarea
            className="field"
            id="notes"
            name="notes"
            rows={3}
            maxLength={2000}
          />
        </fieldset>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Your tracking number is created when you submit.
          </p>
          <button className="action" disabled={busy}>
            {busy ? "Creating shipment…" : "Create shipment →"}
          </button>
        </div>
      </form>
    </div>
  );
}
