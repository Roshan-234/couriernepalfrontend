"use client";

/**
 * Quote tester — "what would we charge this customer?"
 *
 * This posts the same criteria the public calculator posts and renders the
 * whole breakdown the engine returns: which weight it charged on and why,
 * which lane matched, the freight, every named surcharge, the tax and the
 * total. The lines are the server's; nothing here is re-added, so what staff
 * read off this panel is exactly what the customer would be billed.
 *
 * `{ status: "no_rate" }` is a legitimate answer — an uncovered lane — and is
 * rendered as a finding, not a fault.
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  Input,
  Select,
  type SelectOption,
} from "@/components/kit";
import { Money, formatWeight } from "./money";
import { DetailList, DetailRow, InfoNotice, QueryError, optionalNumber, titleCase } from "./shared";
import { rates, type QuoteCriteria, type QuoteResult } from "@/lib/resources/finance";
import type { District } from "@/types/logistics";

interface FormState {
  scope: "domestic" | "international";
  originDistrict: string;
  destinationDistrict: string;
  destinationCountry: string;
  serviceLevel: string;
  merchantId: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  isCod: boolean;
  codAmount: string;
  isFragile: boolean;
  isInsured: boolean;
  declaredValue: string;
  isOversize: boolean;
  isWeekend: boolean;
}

const EMPTY: FormState = {
  scope: "domestic",
  originDistrict: "",
  destinationDistrict: "",
  destinationCountry: "",
  serviceLevel: "standard",
  merchantId: "",
  weight: "1",
  length: "",
  width: "",
  height: "",
  isCod: false,
  codAmount: "",
  isFragile: false,
  isInsured: false,
  declaredValue: "",
  isOversize: false,
  isWeekend: false,
};

/** Say plainly which of the two weights the engine billed. */
function weightBasis(actual: number, volumetric: number, chargeable: number): string {
  if (volumetric > actual) {
    return `volumetric weight (${formatWeight(volumetric)}) exceeded actual (${formatWeight(
      actual,
    )}), then rounded to the card's weight step`;
  }
  if (chargeable > actual) {
    return `actual weight (${formatWeight(actual)}), raised to the card's minimum or weight step`;
  }
  return `actual weight (${formatWeight(actual)})`;
}

export interface QuoteTesterProps {
  districts: District[];
}

export function QuoteTester({ districts }: QuoteTesterProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResult | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const districtOptions: SelectOption[] = districts.map((district) => ({
    value: district.name,
    label: `${district.name} (${district.zone})`,
  }));

  const quoteMutation = useMutation({
    mutationFn: (criteria: QuoteCriteria) => rates.quote(criteria),
    onSuccess: (quote) => setResult(quote),
  });

  const run = () => {
    const weight = optionalNumber(form.weight);
    if (weight === undefined || weight <= 0) {
      setError("Enter a weight above zero.");
      return;
    }
    if (form.scope === "domestic" && form.destinationDistrict === "") {
      setError("Pick a destination district.");
      return;
    }
    if (form.scope === "international" && form.destinationCountry.trim() === "") {
      setError("Enter a destination country.");
      return;
    }

    setError(null);
    setResult(null);
    quoteMutation.mutate({
      scope: form.scope,
      origin_district: form.originDistrict || undefined,
      destination_district: form.scope === "domestic" ? form.destinationDistrict || undefined : undefined,
      destination_country:
        form.scope === "international" ? form.destinationCountry.trim().toUpperCase() : undefined,
      service_level: form.serviceLevel as QuoteCriteria["service_level"],
      merchant_id: optionalNumber(form.merchantId),
      weight_kg: weight,
      length_cm: optionalNumber(form.length),
      width_cm: optionalNumber(form.width),
      height_cm: optionalNumber(form.height),
      is_cod: form.isCod || undefined,
      cod_amount: form.isCod ? optionalNumber(form.codAmount) : undefined,
      is_fragile: form.isFragile || undefined,
      is_insured: form.isInsured || undefined,
      declared_value: optionalNumber(form.declaredValue),
      is_oversize: form.isOversize || undefined,
      is_weekend: form.isWeekend || undefined,
    });
  };

  return (
    <Card as="section" className="mt-8">
      <CardHeader>
        <CardTitle as="h2">Quote tester</CardTitle>
        <CardDescription>
          Run the live rate engine against a hypothetical shipment. This is the same call the public
          calculator makes, so the breakdown below is what a customer would be charged today.
        </CardDescription>
      </CardHeader>

      <CardBody className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <Field label="Origin district" showOptional>
            <Select
              value={form.originDistrict}
              onChange={(event) => set("originDistrict", event.target.value)}
              options={[{ value: "", label: "Any origin" }, ...districtOptions]}
            />
          </Field>
          {form.scope === "domestic" ? (
            <Field label="Destination district" required>
              <Select
                value={form.destinationDistrict}
                onChange={(event) => set("destinationDistrict", event.target.value)}
                placeholder="Choose a district"
                options={districtOptions}
              />
            </Field>
          ) : (
            <Field label="Destination country" required hint="ISO code, e.g. IN.">
              <Input
                value={form.destinationCountry}
                onChange={(event) => set("destinationCountry", event.target.value)}
                autoComplete="off"
              />
            </Field>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Weight kg" required>
            <Input
              type="number"
              step="0.001"
              min={0}
              className="text-right tabular-nums"
              value={form.weight}
              onChange={(event) => set("weight", event.target.value)}
            />
          </Field>
          <Field label="Length cm" showOptional>
            <Input
              type="number"
              step="0.1"
              min={0}
              className="text-right tabular-nums"
              value={form.length}
              onChange={(event) => set("length", event.target.value)}
            />
          </Field>
          <Field label="Width cm" showOptional>
            <Input
              type="number"
              step="0.1"
              min={0}
              className="text-right tabular-nums"
              value={form.width}
              onChange={(event) => set("width", event.target.value)}
            />
          </Field>
          <Field label="Height cm" showOptional>
            <Input
              type="number"
              step="0.1"
              min={0}
              className="text-right tabular-nums"
              value={form.height}
              onChange={(event) => set("height", event.target.value)}
            />
          </Field>
          <Field label="Merchant ID" showOptional hint="Applies their contract rate.">
            <Input
              type="number"
              min={1}
              className="text-right tabular-nums"
              value={form.merchantId}
              onChange={(event) => set("merchantId", event.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Checkbox
              label="Cash on delivery"
              checked={form.isCod}
              onChange={(event) => set("isCod", event.target.checked)}
            />
            {form.isCod && (
              <Field label="COD amount" showOptional>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  className="text-right tabular-nums"
                  value={form.codAmount}
                  onChange={(event) => set("codAmount", event.target.value)}
                />
              </Field>
            )}
          </div>
          <div className="space-y-2">
            <Checkbox
              label="Insured"
              checked={form.isInsured}
              onChange={(event) => set("isInsured", event.target.checked)}
            />
            <Field label="Declared value" showOptional>
              <Input
                type="number"
                step="0.01"
                min={0}
                className="text-right tabular-nums"
                value={form.declaredValue}
                onChange={(event) => set("declaredValue", event.target.value)}
              />
            </Field>
          </div>
          <div className="space-y-2">
            <Checkbox
              label="Fragile"
              checked={form.isFragile}
              onChange={(event) => set("isFragile", event.target.checked)}
            />
            <Checkbox
              label="Oversize"
              checked={form.isOversize}
              onChange={(event) => set("isOversize", event.target.checked)}
            />
            <Checkbox
              label="Weekend delivery"
              checked={form.isWeekend}
              onChange={(event) => set("isWeekend", event.target.checked)}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={run}
            loading={quoteMutation.isPending}
            loadingLabel="Calculating the quote"
          >
            Get quote
          </Button>
        </div>

        {quoteMutation.isError && (
          <QueryError
            error={quoteMutation.error}
            title="The rate engine could not be reached"
            onRetry={run}
          />
        )}

        {result?.status === "no_rate" && (
          <InfoNotice title="No rate covers this lane">
            <p>{result.message}</p>
            <p className="mt-1">
              Add a lane on the Entries tab for this zone or district pair, or widen an existing weight
              band.
            </p>
          </InfoNotice>
        )}

        {result?.status === "ok" && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-[color:var(--brand-navy)]">Quote breakdown</h3>

            <section aria-label="Chargeable weight" className="mt-3">
              <h4 className="eyebrow mb-1">Chargeable weight</h4>
              <DetailList>
                <DetailRow label="Actual">{formatWeight(result.actual_weight_kg)}</DetailRow>
                <DetailRow label="Volumetric">{formatWeight(result.volumetric_weight_kg)}</DetailRow>
                <DetailRow label="Charged on" emphasis>
                  {formatWeight(result.chargeable_weight_kg)}
                </DetailRow>
              </DetailList>
              <p className="mt-1 text-xs text-slate-600">
                Derived from{" "}
                {weightBasis(
                  result.actual_weight_kg,
                  result.volumetric_weight_kg,
                  result.chargeable_weight_kg,
                )}
                .
              </p>
            </section>

            <section aria-label="Matched lane" className="mt-4">
              <h4 className="eyebrow mb-1">Matched lane</h4>
              <DetailList>
                <DetailRow label="Rate card">
                  {result.rate_card_code ?? "—"}
                  {result.rate_card_id !== null && (
                    <span className="ml-1 text-xs text-slate-600">(#{result.rate_card_id})</span>
                  )}
                </DetailRow>
                <DetailRow label="Lane entry">
                  {result.entry_id === null ? "—" : `#${result.entry_id}`}
                </DetailRow>
                <DetailRow label="Zones">
                  {result.origin_zone ? titleCase(result.origin_zone) : "—"} →{" "}
                  {result.destination_zone ? titleCase(result.destination_zone) : "—"}
                </DetailRow>
                <DetailRow label="Transit">
                  {result.transit_days_min === null && result.transit_days_max === null
                    ? "—"
                    : `${result.transit_days_min ?? "?"}–${result.transit_days_max ?? "?"} days`}
                </DetailRow>
              </DetailList>
            </section>

            <section aria-label="Charges" className="mt-4">
              <h4 className="eyebrow mb-1">Charges</h4>
              <DetailList>
                <DetailRow label="Freight">
                  <Money amount={result.freight_charge} currency={result.currency} inline />
                </DetailRow>
                {result.surcharges.map((line) => (
                  <DetailRow key={line.code} label={line.label || line.code}>
                    <Money amount={line.amount} currency={result.currency} inline />
                  </DetailRow>
                ))}
                <DetailRow label="Surcharge total">
                  <Money amount={result.surcharge_total} currency={result.currency} inline />
                </DetailRow>
                <DetailRow label="Taxable amount">
                  <Money amount={result.taxable_amount} currency={result.currency} inline />
                </DetailRow>
                <DetailRow label="Tax">
                  <Money amount={result.tax_amount} currency={result.currency} inline />
                </DetailRow>
                <DetailRow label="Total" emphasis>
                  <Money amount={result.total} currency={result.currency} inline />
                </DetailRow>
              </DetailList>
              {result.surcharges.length === 0 && (
                <p className="mt-1 text-xs text-slate-600">No surcharges applied to this shipment.</p>
              )}
            </section>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default QuoteTester;
