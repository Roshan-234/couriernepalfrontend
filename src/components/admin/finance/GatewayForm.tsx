"use client";

/**
 * Payment gateway create/edit form.
 *
 * Credentials are the delicate part. The API returns them masked only
 * (`secret_key_masked` and friends) and treats an omitted key as "leave it
 * alone" and an empty string as "clear it". A naive form that round-trips the
 * mask would write the mask back as the credential, and one that posts every
 * field would wipe a secret the operator never touched. So each credential is
 * an explicit three-way choice — keep, replace, clear — shown next to the
 * mask, and only "replace" and "clear" put the key in the request body.
 */

import { useMemo, useState } from "react";
import { Badge, Button, Checkbox, Field, Input, Select, Textarea } from "@/components/kit";
import type { PaymentGateway } from "@/types/logistics";
import { optionalNumber, optionalText } from "./shared";

export interface SecretFieldSpec {
  /** Key sent in the request body. */
  key: string;
  /** Key the masked value arrives under. */
  maskedKey: string;
  label: string;
  hint?: string;
}

/** The credential keys the gateway admin API is known to accept. */
export const SECRET_FIELDS: SecretFieldSpec[] = [
  { key: "merchant_code", maskedKey: "merchant_code_masked", label: "Merchant code" },
  { key: "api_key", maskedKey: "api_key_masked", label: "API key" },
  { key: "secret_key", maskedKey: "secret_key_masked", label: "Secret key" },
  {
    key: "webhook_secret",
    maskedKey: "webhook_secret_masked",
    label: "Webhook secret",
    hint: "Used to verify callbacks from the provider.",
  },
];

type SecretAction = "keep" | "replace" | "clear";

/** Pull a masked credential off a gateway without widening the type to `any`. */
export function maskedValue(gateway: PaymentGateway, maskedKey: string): string | null {
  const value = (gateway as unknown as Record<string, unknown>)[maskedKey];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Whether this gateway reports any credential at all. */
export function hasAnyCredential(gateway: PaymentGateway): boolean {
  return SECRET_FIELDS.some((spec) => maskedValue(gateway, spec.maskedKey) !== null);
}

export type GatewayPayload = Record<string, unknown>;

interface SecretState {
  action: SecretAction;
  value: string;
}

interface FormState {
  code: string;
  name: string;
  displayName: string;
  logoUrl: string;
  instructions: string;
  isActive: boolean;
  isSandbox: boolean;
  sortOrder: string;
  currencies: string;
  minAmount: string;
  maxAmount: string;
  servicePercent: string;
  serviceFlat: string;
}

function initialForm(gateway: PaymentGateway | null): FormState {
  return {
    code: gateway?.code ?? "",
    name: gateway?.name ?? "",
    displayName: gateway?.display_name ?? "",
    logoUrl: gateway?.logo_url ?? "",
    instructions: gateway?.instructions ?? "",
    isActive: gateway?.is_active ?? true,
    isSandbox: gateway?.is_sandbox ?? true,
    sortOrder: gateway ? String(gateway.sort_order) : "0",
    currencies: (gateway?.supported_currencies ?? ["NPR"]).join(", "),
    minAmount: gateway ? String(gateway.min_amount) : "",
    maxAmount: gateway?.max_amount === null || gateway?.max_amount === undefined ? "" : String(gateway.max_amount),
    servicePercent: gateway ? String(gateway.service_charge_percent) : "",
    serviceFlat: gateway ? String(gateway.service_charge_flat) : "",
  };
}

function initialSecrets(gateway: PaymentGateway | null): Record<string, SecretState> {
  const out: Record<string, SecretState> = {};
  for (const spec of SECRET_FIELDS) {
    // On create there is nothing to keep, so start in "replace".
    out[spec.key] = { action: gateway ? "keep" : "replace", value: "" };
  }
  return out;
}

export interface GatewayFormProps {
  /** `null` creates a new gateway. */
  gateway: PaymentGateway | null;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (payload: GatewayPayload) => void;
}

export function GatewayForm({ gateway, busy = false, onCancel, onSubmit }: GatewayFormProps) {
  const [form, setForm] = useState<FormState>(() => initialForm(gateway));
  const [secrets, setSecrets] = useState<Record<string, SecretState>>(() => initialSecrets(gateway));
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const setSecret = (key: string, next: Partial<SecretState>) =>
    setSecrets((current) => ({ ...current, [key]: { ...current[key], ...next } }));

  const currencyList = useMemo(
    () =>
      form.currencies
        .split(",")
        .map((part) => part.trim().toUpperCase())
        .filter((part) => part.length > 0),
    [form.currencies],
  );

  const submit = () => {
    if (form.code.trim() === "") {
      setError("A gateway code is required.");
      return;
    }
    if (form.name.trim() === "") {
      setError("A gateway name is required.");
      return;
    }

    const payload: GatewayPayload = {
      code: form.code.trim(),
      name: form.name.trim(),
      display_name: optionalText(form.displayName) ?? form.name.trim(),
      logo_url: optionalText(form.logoUrl) ?? null,
      instructions: optionalText(form.instructions) ?? null,
      is_active: form.isActive,
      is_sandbox: form.isSandbox,
      sort_order: optionalNumber(form.sortOrder) ?? 0,
      supported_currencies: currencyList.length > 0 ? currencyList : ["NPR"],
      min_amount: optionalNumber(form.minAmount) ?? 0,
      max_amount: optionalNumber(form.maxAmount) ?? null,
      service_charge_percent: optionalNumber(form.servicePercent) ?? 0,
      service_charge_flat: optionalNumber(form.serviceFlat) ?? 0,
    };

    for (const spec of SECRET_FIELDS) {
      const state = secrets[spec.key];
      if (!state || state.action === "keep") continue; // omitted ⇒ unchanged
      if (state.action === "clear") {
        payload[spec.key] = ""; // empty string ⇒ cleared
        continue;
      }
      const value = state.value.trim();
      if (value === "") {
        setError(`${spec.label}: choose "Keep current" or type the new value.`);
        return;
      }
      payload[spec.key] = value;
    }

    setError(null);
    onSubmit(payload);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Code"
          required
          hint={gateway ? "Changing a live code can orphan existing payments." : "e.g. esewa, khalti."}
        >
          <Input value={form.code} onChange={(event) => set("code", event.target.value)} autoComplete="off" />
        </Field>
        <Field label="Name" required>
          <Input value={form.name} onChange={(event) => set("name", event.target.value)} />
        </Field>
        <Field label="Display name" hint="Shown to customers at checkout." showOptional>
          <Input value={form.displayName} onChange={(event) => set("displayName", event.target.value)} />
        </Field>
        <Field label="Logo URL" showOptional>
          <Input value={form.logoUrl} onChange={(event) => set("logoUrl", event.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Sort order">
          <Input
            type="number"
            className="text-right tabular-nums"
            value={form.sortOrder}
            onChange={(event) => set("sortOrder", event.target.value)}
          />
        </Field>
        <Field label="Supported currencies" hint="Comma separated ISO codes.">
          <Input value={form.currencies} onChange={(event) => set("currencies", event.target.value)} />
        </Field>
        <Field label="Mode">
          <Select
            value={form.isSandbox ? "sandbox" : "live"}
            onChange={(event) => set("isSandbox", event.target.value === "sandbox")}
            options={[
              { value: "sandbox", label: "Sandbox" },
              { value: "live", label: "Live" },
            ]}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Minimum amount">
          <Input
            type="number"
            step="0.01"
            min={0}
            className="text-right tabular-nums"
            value={form.minAmount}
            onChange={(event) => set("minAmount", event.target.value)}
          />
        </Field>
        <Field label="Maximum amount" showOptional hint="Blank means no cap.">
          <Input
            type="number"
            step="0.01"
            min={0}
            className="text-right tabular-nums"
            value={form.maxAmount}
            onChange={(event) => set("maxAmount", event.target.value)}
          />
        </Field>
        <Field label="Service charge %">
          <Input
            type="number"
            step="0.01"
            min={0}
            className="text-right tabular-nums"
            value={form.servicePercent}
            onChange={(event) => set("servicePercent", event.target.value)}
          />
        </Field>
        <Field label="Service charge flat">
          <Input
            type="number"
            step="0.01"
            min={0}
            className="text-right tabular-nums"
            value={form.serviceFlat}
            onChange={(event) => set("serviceFlat", event.target.value)}
          />
        </Field>
      </div>

      <Field label="Checkout instructions" showOptional>
        <Textarea
          rows={3}
          value={form.instructions}
          onChange={(event) => set("instructions", event.target.value)}
        />
      </Field>

      <Checkbox
        label="Active"
        hint="Inactive gateways disappear from the customer's checkout."
        checked={form.isActive}
        onChange={(event) => set("isActive", event.target.checked)}
      />

      <section aria-label="Credentials" className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-[color:var(--brand-navy)]">Credentials</h3>
        <p className="mt-1 text-sm text-slate-600">
          Stored secrets are never sent back to the browser — only a mask. Leave a field on{" "}
          <strong>Keep current</strong> and it is not touched. <strong>Clear</strong> removes it.
        </p>

        <div className="mt-4 space-y-4">
          {SECRET_FIELDS.map((spec) => {
            const state = secrets[spec.key] ?? { action: "keep" as SecretAction, value: "" };
            const mask = gateway ? maskedValue(gateway, spec.maskedKey) : null;
            return (
              <div key={spec.key} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <Field
                  label={spec.label}
                  hint={
                    state.action === "clear"
                      ? "This credential will be cleared when you save."
                      : spec.hint
                  }
                >
                  {state.action === "replace" ? (
                    <Input
                      type="password"
                      value={state.value}
                      onChange={(event) => setSecret(spec.key, { value: event.target.value })}
                      placeholder={`New ${spec.label.toLowerCase()}`}
                      autoComplete="new-password"
                    />
                  ) : (
                    <p className="field flex items-center gap-2 bg-slate-50 font-mono text-sm text-slate-700">
                      {mask ?? <span className="font-sans text-slate-600">Not set</span>}
                      {state.action === "clear" && <Badge tone="red">Clearing</Badge>}
                    </p>
                  )}
                </Field>

                <Field label="On save" labelClassName="sr-only">
                  <Select
                    aria-label={`${spec.label} on save`}
                    value={state.action}
                    onChange={(event) =>
                      setSecret(spec.key, { action: event.target.value as SecretAction, value: "" })
                    }
                    options={[
                      { value: "keep", label: mask ? "Keep current" : "Leave unset" },
                      { value: "replace", label: "Replace" },
                      { value: "clear", label: "Clear" },
                    ]}
                  />
                </Field>
              </div>
            );
          })}
        </div>
      </section>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="button" onClick={submit} loading={busy} loadingLabel="Saving gateway">
          {gateway ? "Save gateway" : "Create gateway"}
        </Button>
      </div>
    </div>
  );
}

export default GatewayForm;
