"use client";

/**
 * The packing list form.
 *
 * The one thing this screen has to keep straight is whose document it is. A
 * packing list is the **exporter's** declaration of what is in their cartons,
 * and the generated file carries their letterhead — their company name, their
 * P.O. box, their telephone and email. Moonlight does not appear on it
 * anywhere. The shipper block is therefore labelled as the letterhead and
 * says so in as many words, because the obvious mistake is for whoever fills
 * it in to type our own details into the top of somebody else's declaration.
 *
 * Everything else follows the document: items grouped into boxes, one
 * quantity unit printed in the column header rather than on every row, and a
 * signature line that defaults to the shipper.
 */

import { useState } from "react";
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
  type SelectOption,
} from "@/components/kit";
import { Notice } from "@/components/admin/integrations/ScreenHeader";
import type { PackingList, PackingListWrite } from "@/lib/resources/documents";
import { PACKING_LIST_STATUSES } from "@/lib/resources/documents";
import {
  BoxEditor,
  cartonCount,
  emptyBoxGroup,
  groupsFromItems,
  itemsFromGroups,
  totalQuantity,
  type BoxGroup,
} from "./BoxEditor";
import { LIMITS, ShipmentPrefill, documentLabel, optionalNumber } from "./shared";

interface FormState {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;
  senderCountry: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  receiverCountry: string;
  invoiceNo: string;
  modeOfShipment: string;
  goodsSummary: string;
  quantityUnit: string;
  signedFor: string;
  shipmentId: string;
  totalPackages: string;
  notes: string;
  status: PackingList["status"];
}

const MODES: SelectOption[] = [
  { value: "BY-AIR", label: "BY-AIR" },
  { value: "BY-SEA", label: "BY-SEA" },
  { value: "BY-ROAD", label: "BY-ROAD" },
];

function initialForm(document: PackingList | null): FormState {
  return {
    senderName: document?.sender_name ?? "",
    senderAddress: document?.sender_address ?? "",
    senderPhone: document?.sender_phone ?? "",
    senderEmail: document?.sender_email ?? "",
    senderCountry: document?.sender_country ?? "Nepal",
    receiverName: document?.receiver_name ?? "",
    receiverAddress: document?.receiver_address ?? "",
    receiverPhone: document?.receiver_phone ?? "",
    receiverCountry: document?.receiver_country ?? "",
    invoiceNo: document?.invoice_no ?? "",
    modeOfShipment: document?.mode_of_shipment ?? "BY-AIR",
    goodsSummary: document?.goods_summary ?? "",
    quantityUnit: document?.quantity_unit ?? "PCS",
    signedFor: document?.signed_for ?? "",
    shipmentId: document?.shipment_id === null || document === null ? "" : String(document.shipment_id),
    totalPackages: document === null ? "" : String(document.total_packages ?? ""),
    notes: document?.notes ?? "",
    status: document?.status ?? "draft",
  };
}

export interface PackingListFormProps {
  document: PackingList | null;
  busy?: boolean;
  /** No control on the form writes while this is set. */
  readOnly?: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (payload: PackingListWrite) => void;
}

export function PackingListForm({
  document,
  busy = false,
  readOnly = false,
  submitLabel,
  onCancel,
  onSubmit,
}: PackingListFormProps) {
  const [form, setForm] = useState<FormState>(() => initialForm(document));
  const [groups, setGroups] = useState<BoxGroup[]>(() =>
    document ? groupsFromItems(document.items) : [emptyBoxGroup(0)],
  );
  /** Once the operator types a carton count, stop suggesting one. */
  const [packagesTouched, setPackagesTouched] = useState(() => document !== null);
  const [error, setError] = useState<string | null>(null);

  const disabled = readOnly || busy;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const suggestedPackages = cartonCount(groups);
  const packages = packagesTouched ? form.totalPackages : String(suggestedPackages);

  function submit() {
    const items = itemsFromGroups(groups);
    if (form.senderName.trim() === "") {
      setError("The shipper's company name is required — it is the letterhead on the document.");
      return;
    }
    if (form.receiverName.trim() === "") {
      setError("The consignee's name is required.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item with a description or a quantity.");
      return;
    }
    setError(null);

    const shipmentId = form.shipmentId.trim();
    const payload: PackingListWrite = {
      sender_name: form.senderName.trim(),
      sender_address: form.senderAddress.trim(),
      sender_phone: form.senderPhone.trim(),
      sender_email: form.senderEmail.trim(),
      sender_country: form.senderCountry.trim(),
      receiver_name: form.receiverName.trim(),
      receiver_address: form.receiverAddress.trim(),
      receiver_phone: form.receiverPhone.trim(),
      receiver_country: form.receiverCountry.trim(),
      invoice_no: form.invoiceNo.trim(),
      mode_of_shipment: form.modeOfShipment.trim(),
      goods_summary: form.goodsSummary.trim(),
      quantity_unit: form.quantityUnit.trim() || "PCS",
      signed_for: form.signedFor.trim(),
      items,
      notes: form.notes.trim(),
      status: form.status,
      shipment_id: shipmentId === "" ? null : Number(shipmentId),
    };

    // `number()` on the server refuses null, so an unset carton count is left
    // out of the body rather than sent empty.
    const cartons = optionalNumber(packages);
    if (cartons !== undefined) payload.total_packages = Math.max(0, Math.floor(cartons));

    onSubmit(payload);
  }

  return (
    <div className="space-y-6">
      <Notice tone="warning" title="This document is the shipper's, not ours">
        The header on the generated file is the exporter&apos;s own letterhead — their company
        name, address, telephone and email. Moonlight does not appear on a packing list.
      </Notice>

      <section aria-label="Shipper" className="panel">
        <h2 className="eyebrow mb-3">Shipper — printed as the letterhead</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" required className="sm:col-span-2">
            <Input
              value={form.senderName}
              disabled={disabled}
              maxLength={LIMITS.name}
              autoComplete="off"
              onChange={(event) => set("senderName", event.target.value)}
            />
          </Field>
          <Field
            label="Address"
            className="sm:col-span-2"
            hint="Printed on one line under the company name."
          >
            <Textarea
              rows={2}
              value={form.senderAddress}
              disabled={disabled}
              maxLength={LIMITS.address}
              onChange={(event) => set("senderAddress", event.target.value)}
            />
          </Field>
          <Field label="Telephone" showOptional>
            <Input
              value={form.senderPhone}
              disabled={disabled}
              maxLength={LIMITS.phone}
              autoComplete="off"
              onChange={(event) => set("senderPhone", event.target.value)}
            />
          </Field>
          <Field label="Email" showOptional>
            <Input
              type="email"
              value={form.senderEmail}
              disabled={disabled}
              maxLength={LIMITS.email}
              autoComplete="off"
              onChange={(event) => set("senderEmail", event.target.value)}
            />
          </Field>
          <Field label="Country" showOptional>
            <Input
              value={form.senderCountry}
              disabled={disabled}
              maxLength={LIMITS.country}
              autoComplete="off"
              onChange={(event) => set("senderCountry", event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section aria-label="Consignee" className="panel">
        <h2 className="eyebrow mb-3">Consignee — printed under &ldquo;SHIPPED TO&rdquo;</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required className="sm:col-span-2">
            <Input
              value={form.receiverName}
              disabled={disabled}
              maxLength={LIMITS.name}
              autoComplete="off"
              onChange={(event) => set("receiverName", event.target.value)}
            />
          </Field>
          <Field
            label="Address"
            className="sm:col-span-2"
            hint="One line per line typed here; the document prints them down the page."
          >
            <Textarea
              rows={3}
              value={form.receiverAddress}
              disabled={disabled}
              maxLength={LIMITS.address}
              onChange={(event) => set("receiverAddress", event.target.value)}
            />
          </Field>
          <Field label="Country" showOptional>
            <Input
              value={form.receiverCountry}
              disabled={disabled}
              maxLength={LIMITS.country}
              autoComplete="off"
              onChange={(event) => set("receiverCountry", event.target.value)}
            />
          </Field>
          <Field label="Telephone" showOptional>
            <Input
              value={form.receiverPhone}
              disabled={disabled}
              maxLength={LIMITS.phone}
              autoComplete="off"
              onChange={(event) => set("receiverPhone", event.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <ShipmentPrefill
            value={form.shipmentId}
            disabled={disabled}
            fills="shipper and consignee"
            onChange={(value) => set("shipmentId", value)}
            onPrefill={(shipment) =>
              setForm((current) => ({
                ...current,
                senderName: shipment.sender_name ?? current.senderName,
                senderAddress: shipment.sender_address ?? current.senderAddress,
                senderPhone: shipment.sender_phone ?? current.senderPhone,
                senderEmail: shipment.sender_email ?? current.senderEmail,
                senderCountry: shipment.origin_country ?? current.senderCountry,
                receiverName: shipment.receiver_name ?? current.receiverName,
                receiverAddress: shipment.receiver_address ?? current.receiverAddress,
                receiverPhone: shipment.receiver_phone ?? current.receiverPhone,
                receiverCountry: shipment.destination_country ?? current.receiverCountry,
              }))
            }
          />
        </div>
      </section>

      <section aria-label="Document details" className="panel">
        <h2 className="eyebrow mb-3">Document</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Invoice no."
            showOptional
            hint="The exporter's own reference, not a Moonlight number."
          >
            <Input
              value={form.invoiceNo}
              disabled={disabled}
              maxLength={LIMITS.invoiceNo}
              placeholder="VE/01/2008"
              autoComplete="off"
              onChange={(event) => set("invoiceNo", event.target.value)}
            />
          </Field>
          <Field label="Mode of shipment">
            <Select
              value={form.modeOfShipment}
              disabled={disabled}
              options={MODES}
              onChange={(event) => set("modeOfShipment", event.target.value)}
            />
          </Field>
          <Field label="Quantity unit" hint="Printed once in the QTY column header.">
            <Input
              value={form.quantityUnit}
              disabled={disabled}
              maxLength={LIMITS.quantityUnit}
              placeholder="PCS"
              autoComplete="off"
              onChange={(event) => set("quantityUnit", event.target.value)}
            />
          </Field>
          <Field
            label="Goods summary"
            showOptional
            className="sm:col-span-2"
            hint="The one line above the item table."
          >
            <Input
              value={form.goodsSummary}
              disabled={disabled}
              maxLength={LIMITS.goodsSummary}
              placeholder="NEPALESE COTTON & HANDICRAFT GOODS"
              autoComplete="off"
              onChange={(event) => set("goodsSummary", event.target.value)}
            />
          </Field>
          <Field
            label="Signed for"
            showOptional
            hint="The signature line. Blank uses the shipper's name. No full stop needed."
          >
            <Input
              value={form.signedFor}
              disabled={disabled}
              maxLength={LIMITS.name}
              autoComplete="off"
              onChange={(event) => set("signedFor", event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section aria-label="Boxes and items" className="panel">
        <h2 className="eyebrow mb-3">Boxes and items</h2>
        <p className="mb-4 text-sm text-slate-700">
          Each box prints as a heading row with its contents beneath it, and the quantity column
          totals across every box.
        </p>
        <BoxEditor
          groups={groups}
          onChange={setGroups}
          quantityUnit={form.quantityUnit}
          disabled={disabled}
        />
      </section>

      <section aria-label="Totals and filing" className="panel">
        <h2 className="eyebrow mb-3">Totals and filing</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Cartons handed over"
            hint={`Suggested from the boxes above: ${suggestedPackages}.`}
          >
            <Input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="text-right tabular-nums"
              value={packages}
              disabled={disabled}
              onChange={(event) => {
                setPackagesTouched(true);
                set("totalPackages", event.target.value);
              }}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              disabled={disabled}
              options={PACKING_LIST_STATUSES.map((value) => ({
                value,
                label: documentLabel(value),
              }))}
              onChange={(event) => set("status", event.target.value as PackingList["status"])}
            />
          </Field>
          <div className="self-end pb-1.5 text-sm text-slate-700">
            Total quantity on the document:{" "}
            <span className="font-semibold tabular-nums text-[color:var(--brand-navy)]">
              {totalQuantity(groups)}
            </span>{" "}
            {form.quantityUnit.trim() || "PCS"}
          </div>
          <Field label="Internal notes" showOptional className="sm:col-span-2 lg:col-span-3">
            <Textarea
              rows={2}
              value={form.notes}
              disabled={disabled}
              maxLength={LIMITS.notes}
              onChange={(event) => set("notes", event.target.value)}
            />
          </Field>
        </div>
      </section>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={submit}
          loading={busy}
          loadingLabel="Saving"
          disabled={readOnly}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export default PackingListForm;
