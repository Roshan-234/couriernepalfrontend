"use client";

/**
 * Rate card create/edit form.
 *
 * A rate card carries the arithmetic that turns a lane price into a quote:
 * the volumetric divisor, the rounding rules on weight, and the percentage
 * add-ons. Leaving `merchant_id` blank makes it a public tariff; filling it
 * in makes it a contract rate that only that merchant is quoted.
 */

import { useState } from "react";
import { Button, Checkbox, Field, Input, Select, Textarea } from "@/components/kit";
import type { RateCard } from "@/types/logistics";
import { optionalNumber, optionalText } from "./shared";

export type RateCardPayload = Partial<RateCard> & { code: string; name: string };

interface FormState {
  code: string;
  name: string;
  scope: "domestic" | "international";
  serviceLevel: string;
  currency: string;
  merchantId: string;
  isDefault: boolean;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string;
  volumetricDivisor: string;
  minChargeableWeight: string;
  weightStep: string;
  fuelSurcharge: string;
  vat: string;
  codFeePercent: string;
  codFeeMin: string;
  insurancePercent: string;
  notes: string;
}

function dayValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function initialForm(card: RateCard | null): FormState {
  return {
    code: card?.code ?? "",
    name: card?.name ?? "",
    scope: card?.scope ?? "domestic",
    serviceLevel: card?.service_level ?? "standard",
    currency: card?.currency ?? "NPR",
    merchantId: card?.merchant_id === null || card?.merchant_id === undefined ? "" : String(card.merchant_id),
    isDefault: card?.is_default ?? false,
    isActive: card?.is_active ?? true,
    effectiveFrom: dayValue(card?.effective_from),
    effectiveTo: dayValue(card?.effective_to),
    volumetricDivisor: card ? String(card.volumetric_divisor) : "5000",
    minChargeableWeight: card ? String(card.min_chargeable_weight_kg) : "0.5",
    weightStep: card ? String(card.weight_step_kg) : "0.5",
    fuelSurcharge: card ? String(card.fuel_surcharge_percent) : "0",
    vat: card ? String(card.vat_percent) : "13",
    codFeePercent: card ? String(card.cod_fee_percent) : "0",
    codFeeMin: card ? String(card.cod_fee_min) : "0",
    insurancePercent: card ? String(card.insurance_percent) : "0",
    notes: card?.notes ?? "",
  };
}

export interface RateCardFormProps {
  card: RateCard | null;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (payload: RateCardPayload) => void;
}

export function RateCardForm({ card, busy = false, onCancel, onSubmit }: RateCardFormProps) {
  const [form, setForm] = useState<FormState>(() => initialForm(card));
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    if (form.code.trim() === "" || form.name.trim() === "") {
      setError("A code and a name are both required.");
      return;
    }
    if (form.effectiveFrom !== "" && form.effectiveTo !== "" && form.effectiveTo < form.effectiveFrom) {
      setError("The card expires before it takes effect.");
      return;
    }

    setError(null);
    onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      scope: form.scope,
      service_level: form.serviceLevel as RateCard["service_level"],
      currency: form.currency.trim().toUpperCase() || "NPR",
      merchant_id: optionalNumber(form.merchantId) ?? null,
      is_default: form.isDefault,
      is_active: form.isActive,
      effective_from: optionalText(form.effectiveFrom) ?? null,
      effective_to: optionalText(form.effectiveTo) ?? null,
      volumetric_divisor: optionalNumber(form.volumetricDivisor) ?? 5000,
      min_chargeable_weight_kg: optionalNumber(form.minChargeableWeight) ?? 0,
      weight_step_kg: optionalNumber(form.weightStep) ?? 0.5,
      fuel_surcharge_percent: optionalNumber(form.fuelSurcharge) ?? 0,
      vat_percent: optionalNumber(form.vat) ?? 0,
      cod_fee_percent: optionalNumber(form.codFeePercent) ?? 0,
      cod_fee_min: optionalNumber(form.codFeeMin) ?? 0,
      insurance_percent: optionalNumber(form.insurancePercent) ?? 0,
      notes: optionalText(form.notes) ?? null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Code" required hint="Unique, e.g. DOM-STD-2026.">
          <Input value={form.code} onChange={(event) => set("code", event.target.value)} autoComplete="off" />
        </Field>
        <Field label="Name" required>
          <Input value={form.name} onChange={(event) => set("name", event.target.value)} />
        </Field>
        <Field label="Scope">
          <Select
            value={form.scope}
            onChange={(event) => set("scope", event.target.value as FormState["scope"])}
            options={[
              { value: "domestic", label: "Domestic" },
              { value: "international", label: "International" },
            ]}
          />
        </Field>
        <Field label="Service level">
          <Select
            value={form.serviceLevel}
            onChange={(event) => set("serviceLevel", event.target.value)}
            options={[
              { value: "express", label: "Express" },
              { value: "standard", label: "Standard" },
              { value: "economy", label: "Economy" },
              { value: "same_day", label: "Same day" },
            ]}
          />
        </Field>
        <Field label="Currency" hint="ISO code shown on every quote from this card.">
          <Input value={form.currency} onChange={(event) => set("currency", event.target.value)} />
        </Field>
        <Field
          label="Merchant ID"
          showOptional
          hint="Fill this in to make the card a contract rate for one merchant only."
        >
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            className="text-right tabular-nums"
            value={form.merchantId}
            onChange={(event) => set("merchantId", event.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Effective from" showOptional>
          <Input
            type="date"
            value={form.effectiveFrom}
            onChange={(event) => set("effectiveFrom", event.target.value)}
          />
        </Field>
        <Field label="Effective to" showOptional hint="Blank means open-ended.">
          <Input
            type="date"
            value={form.effectiveTo}
            onChange={(event) => set("effectiveTo", event.target.value)}
          />
        </Field>
      </div>

      <section aria-label="Weight rules">
        <h3 className="eyebrow mb-2">Weight</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Volumetric divisor"
            hint="L×W×H in cm ÷ this = volumetric kg."
          >
            <Input
              type="number"
              min={1}
              className="text-right tabular-nums"
              value={form.volumetricDivisor}
              onChange={(event) => set("volumetricDivisor", event.target.value)}
            />
          </Field>
          <Field label="Minimum chargeable kg">
            <Input
              type="number"
              step="0.001"
              min={0}
              className="text-right tabular-nums"
              value={form.minChargeableWeight}
              onChange={(event) => set("minChargeableWeight", event.target.value)}
            />
          </Field>
          <Field label="Weight step kg" hint="Chargeable weight rounds up to this.">
            <Input
              type="number"
              step="0.001"
              min={0}
              className="text-right tabular-nums"
              value={form.weightStep}
              onChange={(event) => set("weightStep", event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section aria-label="Percentages and fees">
        <h3 className="eyebrow mb-2">Add-ons</h3>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="Fuel surcharge %">
            <Input
              type="number"
              step="0.01"
              min={0}
              className="text-right tabular-nums"
              value={form.fuelSurcharge}
              onChange={(event) => set("fuelSurcharge", event.target.value)}
            />
          </Field>
          <Field label="VAT %">
            <Input
              type="number"
              step="0.01"
              min={0}
              className="text-right tabular-nums"
              value={form.vat}
              onChange={(event) => set("vat", event.target.value)}
            />
          </Field>
          <Field label="COD fee %">
            <Input
              type="number"
              step="0.01"
              min={0}
              className="text-right tabular-nums"
              value={form.codFeePercent}
              onChange={(event) => set("codFeePercent", event.target.value)}
            />
          </Field>
          <Field label="COD fee minimum">
            <Input
              type="number"
              step="0.01"
              min={0}
              className="text-right tabular-nums"
              value={form.codFeeMin}
              onChange={(event) => set("codFeeMin", event.target.value)}
            />
          </Field>
          <Field label="Insurance %">
            <Input
              type="number"
              step="0.01"
              min={0}
              className="text-right tabular-nums"
              value={form.insurancePercent}
              onChange={(event) => set("insurancePercent", event.target.value)}
            />
          </Field>
        </div>
      </section>

      <Field label="Notes" showOptional>
        <Textarea rows={2} value={form.notes} onChange={(event) => set("notes", event.target.value)} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox
          label="Active"
          checked={form.isActive}
          onChange={(event) => set("isActive", event.target.checked)}
        />
        <Checkbox
          label="Default card"
          hint="Used when no other card matches the shipment."
          checked={form.isDefault}
          onChange={(event) => set("isDefault", event.target.checked)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="button" onClick={submit} loading={busy} loadingLabel="Saving rate card">
          {card ? "Save card" : "Create card"}
        </Button>
      </div>
    </div>
  );
}

export default RateCardForm;
