"use client";

/**
 * One lane on a rate card: where to where, for what weight band, at what
 * price.
 *
 * A lane is keyed one of three ways and the matcher prefers the most
 * specific: a district pair beats a zone pair, which beats a destination
 * country. The form makes that an explicit choice rather than letting an
 * operator half-fill two keyings and wonder which one the engine picked.
 */

import { useState } from "react";
import { Button, Checkbox, Field, Input, Select, type SelectOption } from "@/components/kit";
import type { District, RateCardEntry } from "@/types/logistics";
import { optionalNumber } from "./shared";

export type RateEntryPayload = Partial<RateCardEntry>;

type LaneKind = "zone" | "district" | "country";

const ZONE_OPTIONS: SelectOption[] = [
  { value: "valley", label: "Valley" },
  { value: "cities", label: "Cities" },
  { value: "hills", label: "Hills" },
  { value: "remote", label: "Remote" },
];

interface FormState {
  kind: LaneKind;
  originZone: string;
  destinationZone: string;
  originDistrict: string;
  destinationDistrict: string;
  destinationCountry: string;
  minWeight: string;
  maxWeight: string;
  basePrice: string;
  pricePerKg: string;
  minCharge: string;
  transitMin: string;
  transitMax: string;
  isActive: boolean;
}

function laneKindOf(entry: RateCardEntry | null): LaneKind {
  if (!entry) return "zone";
  if (entry.origin_district || entry.destination_district) return "district";
  if (entry.destination_country) return "country";
  return "zone";
}

function initialForm(entry: RateCardEntry | null): FormState {
  return {
    kind: laneKindOf(entry),
    originZone: entry?.origin_zone ?? "",
    destinationZone: entry?.destination_zone ?? "",
    originDistrict: entry?.origin_district ?? "",
    destinationDistrict: entry?.destination_district ?? "",
    destinationCountry: entry?.destination_country ?? "",
    minWeight: entry ? String(entry.min_weight_kg) : "0",
    maxWeight: entry?.max_weight_kg === null || entry?.max_weight_kg === undefined ? "" : String(entry.max_weight_kg),
    basePrice: entry ? String(entry.base_price) : "",
    pricePerKg: entry ? String(entry.price_per_kg) : "0",
    minCharge: entry ? String(entry.min_charge) : "0",
    transitMin: entry?.transit_days_min === null || entry?.transit_days_min === undefined ? "" : String(entry.transit_days_min),
    transitMax: entry?.transit_days_max === null || entry?.transit_days_max === undefined ? "" : String(entry.transit_days_max),
    isActive: entry?.is_active ?? true,
  };
}

export interface RateEntryFormProps {
  entry: RateCardEntry | null;
  districts: District[];
  currency: string;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (payload: RateEntryPayload) => void;
}

export function RateEntryForm({
  entry,
  districts,
  currency,
  busy = false,
  onCancel,
  onSubmit,
}: RateEntryFormProps) {
  const [form, setForm] = useState<FormState>(() => initialForm(entry));
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const districtOptions: SelectOption[] = districts.map((district) => ({
    value: district.name,
    label: `${district.name} (${district.zone})`,
  }));

  const submit = () => {
    const minWeight = optionalNumber(form.minWeight) ?? 0;
    const maxWeight = optionalNumber(form.maxWeight);
    const basePrice = optionalNumber(form.basePrice);

    if (basePrice === undefined) {
      setError("A base price is required.");
      return;
    }
    if (maxWeight !== undefined && maxWeight <= minWeight) {
      setError("The weight band's upper bound must be above its lower bound.");
      return;
    }

    const payload: RateEntryPayload = {
      origin_zone: null,
      destination_zone: null,
      origin_district: null,
      destination_district: null,
      destination_country: null,
      min_weight_kg: minWeight,
      max_weight_kg: maxWeight ?? null,
      base_price: basePrice,
      price_per_kg: optionalNumber(form.pricePerKg) ?? 0,
      min_charge: optionalNumber(form.minCharge) ?? 0,
      transit_days_min: optionalNumber(form.transitMin) ?? null,
      transit_days_max: optionalNumber(form.transitMax) ?? null,
      is_active: form.isActive,
    };

    if (form.kind === "zone") {
      if (form.originZone === "" || form.destinationZone === "") {
        setError("Pick both an origin and a destination zone.");
        return;
      }
      payload.origin_zone = form.originZone as RateCardEntry["origin_zone"];
      payload.destination_zone = form.destinationZone as RateCardEntry["destination_zone"];
    } else if (form.kind === "district") {
      if (form.originDistrict === "" || form.destinationDistrict === "") {
        setError("Pick both an origin and a destination district.");
        return;
      }
      payload.origin_district = form.originDistrict;
      payload.destination_district = form.destinationDistrict;
    } else {
      if (form.destinationCountry.trim() === "") {
        setError("Enter a destination country.");
        return;
      }
      payload.destination_country = form.destinationCountry.trim().toUpperCase();
    }

    setError(null);
    onSubmit(payload);
  };

  return (
    <div className="space-y-6">
      <Field
        label="Lane keyed by"
        hint="Most specific wins: a district pair beats a zone pair, and a zone pair beats a destination country."
      >
        <Select
          value={form.kind}
          onChange={(event) => set("kind", event.target.value as LaneKind)}
          options={[
            { value: "district", label: "District pair (most specific)" },
            { value: "zone", label: "Zone pair" },
            { value: "country", label: "Destination country (least specific)" },
          ]}
        />
      </Field>

      {form.kind === "zone" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Origin zone" required>
            <Select
              value={form.originZone}
              onChange={(event) => set("originZone", event.target.value)}
              placeholder="Choose a zone"
              options={ZONE_OPTIONS}
            />
          </Field>
          <Field label="Destination zone" required>
            <Select
              value={form.destinationZone}
              onChange={(event) => set("destinationZone", event.target.value)}
              placeholder="Choose a zone"
              options={ZONE_OPTIONS}
            />
          </Field>
        </div>
      )}

      {form.kind === "district" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Origin district" required>
            <Select
              value={form.originDistrict}
              onChange={(event) => set("originDistrict", event.target.value)}
              placeholder="Choose a district"
              options={districtOptions}
            />
          </Field>
          <Field label="Destination district" required>
            <Select
              value={form.destinationDistrict}
              onChange={(event) => set("destinationDistrict", event.target.value)}
              placeholder="Choose a district"
              options={districtOptions}
            />
          </Field>
        </div>
      )}

      {form.kind === "country" && (
        <Field label="Destination country" required hint="ISO country code, e.g. IN, AE, US.">
          <Input
            value={form.destinationCountry}
            onChange={(event) => set("destinationCountry", event.target.value)}
            autoComplete="off"
          />
        </Field>
      )}

      <section aria-label="Weight band">
        <h3 className="eyebrow mb-2">Weight band</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="From kg" hint="Inclusive lower bound.">
            <Input
              type="number"
              step="0.001"
              min={0}
              className="text-right tabular-nums"
              value={form.minWeight}
              onChange={(event) => set("minWeight", event.target.value)}
            />
          </Field>
          <Field label="To kg" showOptional hint="Blank means the band has no upper bound.">
            <Input
              type="number"
              step="0.001"
              min={0}
              className="text-right tabular-nums"
              value={form.maxWeight}
              onChange={(event) => set("maxWeight", event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section aria-label="Price">
        <h3 className="eyebrow mb-2">Price ({currency})</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Base price" required>
            <Input
              type="number"
              step="0.01"
              min={0}
              className="text-right tabular-nums"
              value={form.basePrice}
              onChange={(event) => set("basePrice", event.target.value)}
            />
          </Field>
          <Field label="Price per kg" hint="Applied beyond the band's lower bound.">
            <Input
              type="number"
              step="0.01"
              min={0}
              className="text-right tabular-nums"
              value={form.pricePerKg}
              onChange={(event) => set("pricePerKg", event.target.value)}
            />
          </Field>
          <Field label="Minimum charge">
            <Input
              type="number"
              step="0.01"
              min={0}
              className="text-right tabular-nums"
              value={form.minCharge}
              onChange={(event) => set("minCharge", event.target.value)}
            />
          </Field>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Transit days (min)" showOptional>
          <Input
            type="number"
            min={0}
            className="text-right tabular-nums"
            value={form.transitMin}
            onChange={(event) => set("transitMin", event.target.value)}
          />
        </Field>
        <Field label="Transit days (max)" showOptional>
          <Input
            type="number"
            min={0}
            className="text-right tabular-nums"
            value={form.transitMax}
            onChange={(event) => set("transitMax", event.target.value)}
          />
        </Field>
      </div>

      <Checkbox
        label="Active"
        hint="An inactive lane is skipped by the matcher."
        checked={form.isActive}
        onChange={(event) => set("isActive", event.target.checked)}
      />

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="button" onClick={submit} loading={busy} loadingLabel="Saving lane">
          {entry ? "Save lane" : "Add lane"}
        </Button>
      </div>
    </div>
  );
}

export default RateEntryForm;
