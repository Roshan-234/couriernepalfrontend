"use client";

/**
 * Surcharge create/edit form.
 *
 * The API has no delete for a surcharge — history has to stay resolvable —
 * so retiring one is `{ is_active: false }`, which this form also does from
 * the Active checkbox.
 */

import { useState } from "react";
import { Button, Checkbox, Field, Input, Select, Textarea } from "@/components/kit";
import type { Surcharge } from "@/types/logistics";
import { optionalNumber, optionalText } from "./shared";

export type SurchargePayload = Partial<Surcharge> & { code: string; name: string };

interface FormState {
  code: string;
  name: string;
  description: string;
  appliesTo: string;
  calculation: Surcharge["calculation"];
  value: string;
  minAmount: string;
  maxAmount: string;
  zone: string;
  isTaxable: boolean;
  isActive: boolean;
  sortOrder: string;
}

function initialForm(surcharge: Surcharge | null): FormState {
  return {
    code: surcharge?.code ?? "",
    name: surcharge?.name ?? "",
    description: surcharge?.description ?? "",
    appliesTo: surcharge?.applies_to ?? "all",
    calculation: surcharge?.calculation ?? "flat",
    value: surcharge ? String(surcharge.value) : "",
    minAmount: surcharge ? String(surcharge.min_amount) : "0",
    maxAmount:
      surcharge?.max_amount === null || surcharge?.max_amount === undefined ? "" : String(surcharge.max_amount),
    zone: surcharge?.zone ?? "",
    isTaxable: surcharge?.is_taxable ?? true,
    isActive: surcharge?.is_active ?? true,
    sortOrder: surcharge ? String(surcharge.sort_order) : "0",
  };
}

export interface SurchargeFormProps {
  surcharge: Surcharge | null;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (payload: SurchargePayload) => void;
}

export function SurchargeForm({ surcharge, busy = false, onCancel, onSubmit }: SurchargeFormProps) {
  const [form, setForm] = useState<FormState>(() => initialForm(surcharge));
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    if (form.code.trim() === "" || form.name.trim() === "") {
      setError("A code and a name are both required.");
      return;
    }
    const value = optionalNumber(form.value);
    if (value === undefined) {
      setError("Enter the surcharge value.");
      return;
    }

    setError(null);
    onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      description: optionalText(form.description) ?? null,
      applies_to: form.appliesTo.trim() || "all",
      calculation: form.calculation,
      value,
      min_amount: optionalNumber(form.minAmount) ?? 0,
      max_amount: optionalNumber(form.maxAmount) ?? null,
      zone: form.zone === "" ? null : (form.zone as Surcharge["zone"]),
      is_taxable: form.isTaxable,
      is_active: form.isActive,
      sort_order: optionalNumber(form.sortOrder) ?? 0,
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Code" required hint="e.g. FRAGILE, REMOTE_AREA.">
          <Input value={form.code} onChange={(event) => set("code", event.target.value)} autoComplete="off" />
        </Field>
        <Field label="Name" required hint="Shown as a named line on every quote.">
          <Input value={form.name} onChange={(event) => set("name", event.target.value)} />
        </Field>
      </div>

      <Field label="Description" showOptional>
        <Textarea
          rows={2}
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Applies to" hint="The condition flag the engine checks.">
          <Input value={form.appliesTo} onChange={(event) => set("appliesTo", event.target.value)} />
        </Field>
        <Field label="Calculation">
          <Select
            value={form.calculation}
            onChange={(event) => set("calculation", event.target.value as Surcharge["calculation"])}
            options={[
              { value: "flat", label: "Flat amount" },
              { value: "percent", label: "Percent of freight" },
              { value: "per_kg", label: "Per chargeable kg" },
            ]}
          />
        </Field>
        <Field
          label="Value"
          required
          hint={form.calculation === "percent" ? "A percentage, e.g. 2.5" : "An amount."}
        >
          <Input
            type="number"
            step="0.01"
            min={0}
            className="text-right tabular-nums"
            value={form.value}
            onChange={(event) => set("value", event.target.value)}
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
        <Field label="Maximum amount" showOptional hint="Blank means uncapped.">
          <Input
            type="number"
            step="0.01"
            min={0}
            className="text-right tabular-nums"
            value={form.maxAmount}
            onChange={(event) => set("maxAmount", event.target.value)}
          />
        </Field>
        <Field label="Zone" showOptional hint="Limit the surcharge to one zone.">
          <Select
            value={form.zone}
            onChange={(event) => set("zone", event.target.value)}
            options={[
              { value: "", label: "Every zone" },
              { value: "valley", label: "Valley" },
              { value: "cities", label: "Cities" },
              { value: "hills", label: "Hills" },
              { value: "remote", label: "Remote" },
            ]}
          />
        </Field>
        <Field label="Sort order">
          <Input
            type="number"
            className="text-right tabular-nums"
            value={form.sortOrder}
            onChange={(event) => set("sortOrder", event.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox
          label="Taxable"
          hint="Included in the amount VAT is charged on."
          checked={form.isTaxable}
          onChange={(event) => set("isTaxable", event.target.checked)}
        />
        <Checkbox
          label="Active"
          hint="Unchecking this is how a surcharge is retired — there is no delete."
          checked={form.isActive}
          onChange={(event) => set("isActive", event.target.checked)}
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
        <Button type="button" onClick={submit} loading={busy} loadingLabel="Saving surcharge">
          {surcharge ? "Save surcharge" : "Create surcharge"}
        </Button>
      </div>
    </div>
  );
}

export default SurchargeForm;
