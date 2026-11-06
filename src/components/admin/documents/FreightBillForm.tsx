"use client";

/**
 * The freight bill form.
 *
 * A freight bill charges for carriage. It is not a commercial invoice for
 * goods, even though it is stored in the `invoices` table and numbered
 * INV-…: the lines read "Air freight charge 45kgs x 3.20", it totals in US
 * dollars, it converts at the rate agreed that day, and it settles in rupees
 * with the amount repeated in words.
 *
 * Two consequences are visible in this form. The letterhead here *is* ours —
 * unlike a packing list, which carries the exporter's — so the biller block
 * is our own details and the bill is addressed "TO" the customer. And the
 * goods-invoice fields the model also carries (tax, discount, incoterms,
 * ports, TINs) are deliberately absent: none of them is printed on a freight
 * bill, and a form that offered them would invite figures onto a document
 * that has nowhere to show them.
 *
 * The rupee total is the one figure computed in the browser. That is
 * deliberate and matches the generator: it is `subtotal × rate`, shown live
 * so the rate can be sanity-checked before the file is written, and the same
 * figure is what gets stored.
 */

import { useState } from "react";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/kit";
import { Notice } from "@/components/admin/integrations/ScreenHeader";
import { Money } from "@/components/admin/finance/money";
import {
  BILL_ADMIN_STATUSES,
  FREIGHT_BILL_STATUSES,
  nprTotal,
  type FreightBill,
  type FreightBillStatus,
  type FreightBillWrite,
} from "@/lib/resources/documents";
import {
  ChargeEditor,
  chargesFromRows,
  emptyChargeRow,
  rowsFromCharges,
  rowsSubtotal,
  type ChargeRow,
} from "./ChargeEditor";
import { LIMITS, ShipmentPrefill, documentLabel, optionalNumber } from "./shared";

interface FormState {
  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerCountry: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerCountry: string;
  awbNo: string;
  accountName: string;
  currency: string;
  fxRate: string;
  shipmentId: string;
  notes: string;
  status: FreightBillStatus;
  overrideWords: boolean;
  amountInWords: string;
}

function initialForm(bill: FreightBill | null): FormState {
  return {
    sellerName: bill?.seller_name ?? "",
    sellerAddress: bill?.seller_address ?? "",
    sellerPhone: bill?.seller_phone ?? "",
    sellerEmail: bill?.seller_email ?? "",
    sellerCountry: bill?.seller_country ?? "KATHMANDU,NEPAL",
    buyerName: bill?.buyer_name ?? "",
    buyerAddress: bill?.buyer_address ?? "",
    buyerPhone: bill?.buyer_phone ?? "",
    buyerCountry: bill?.buyer_country ?? "",
    awbNo: bill?.awb_no ?? "",
    accountName: bill?.account_name ?? "",
    currency: bill?.currency ?? "USD",
    fxRate: bill?.fx_rate === null || bill === null ? "" : String(bill.fx_rate),
    shipmentId: bill?.shipment_id === null || bill === null ? "" : String(bill.shipment_id),
    notes: bill?.notes ?? "",
    status: bill?.status ?? "draft",
    overrideWords: Boolean(bill?.amount_in_words),
    amountInWords: bill?.amount_in_words ?? "",
  };
}

export interface FreightBillFormProps {
  bill: FreightBill | null;
  /** `issued` and `paid` are refused by the API to anyone else. */
  isAdmin: boolean;
  busy?: boolean;
  readOnly?: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (payload: FreightBillWrite) => void;
}

export function FreightBillForm({
  bill,
  isAdmin,
  busy = false,
  readOnly = false,
  submitLabel,
  onCancel,
  onSubmit,
}: FreightBillFormProps) {
  const [form, setForm] = useState<FormState>(() => initialForm(bill));
  const [rows, setRows] = useState<ChargeRow[]>(() =>
    bill ? rowsFromCharges(bill.items) : [emptyChargeRow()],
  );
  const [error, setError] = useState<string | null>(null);

  const disabled = readOnly || busy;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const currency = form.currency.trim().toUpperCase() || "USD";
  const subtotal = rowsSubtotal(rows);
  const fxRate = optionalNumber(form.fxRate);
  const rupees = nprTotal(subtotal, fxRate);

  /**
   * A non-admin keeps whatever status the bill already carries, even when the
   * API would refuse to set it — the alternative is a select that silently
   * drops the bill back to draft on the next save.
   */
  const statusOptions = FREIGHT_BILL_STATUSES.filter(
    (value) =>
      isAdmin || !BILL_ADMIN_STATUSES.includes(value) || value === (bill?.status ?? "draft"),
  );

  function submit() {
    const items = chargesFromRows(rows);
    if (form.sellerName.trim() === "") {
      setError("The billing company's name is required — it is the letterhead on the bill.");
      return;
    }
    if (form.buyerName.trim() === "") {
      setError("The customer being billed is required.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one charge line.");
      return;
    }
    setError(null);

    const shipmentId = form.shipmentId.trim();
    const payload: FreightBillWrite = {
      seller_name: form.sellerName.trim(),
      seller_address: form.sellerAddress.trim(),
      seller_phone: form.sellerPhone.trim(),
      seller_email: form.sellerEmail.trim(),
      seller_country: form.sellerCountry.trim(),
      buyer_name: form.buyerName.trim(),
      buyer_address: form.buyerAddress.trim(),
      buyer_phone: form.buyerPhone.trim(),
      buyer_country: form.buyerCountry.trim(),
      awb_no: form.awbNo.trim(),
      account_name: form.accountName.trim(),
      items,
      currency,
      notes: form.notes.trim(),
      status: form.status,
      shipment_id: shipmentId === "" ? null : Number(shipmentId),
      // Blank unless deliberately overridden, so the generator writes the
      // wording. A stored wording is reprinted verbatim, which is what makes
      // a reprint match the original.
      amount_in_words: form.overrideWords ? form.amountInWords.trim() : "",
    };

    // The validator runs `number()` whenever the key is present and `null` is
    // not a number, so an unset rate or rupee total is left out entirely.
    if (fxRate !== undefined) payload.fx_rate = fxRate;
    if (rupees !== undefined) payload.total_npr = rupees;

    onSubmit(payload);
  }

  return (
    <div className="space-y-6">
      <Notice title="This is a freight bill, not a commercial invoice">
        It charges for carriage. The lines read as charges — &ldquo;Air freight charge 45kgs x
        3.20&rdquo; — it totals in {currency}, and it settles in rupees at the rate agreed on the
        day.
      </Notice>

      <section aria-label="Billing company" className="panel">
        <h2 className="eyebrow mb-3">Billing company — printed as the letterhead</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" required className="sm:col-span-2">
            <Input
              value={form.sellerName}
              disabled={disabled}
              maxLength={LIMITS.name}
              autoComplete="off"
              onChange={(event) => set("sellerName", event.target.value)}
            />
          </Field>
          <Field label="Place" hint="The second letterhead line, e.g. KATHMANDU,NEPAL.">
            <Input
              value={form.sellerCountry}
              disabled={disabled}
              maxLength={LIMITS.country}
              autoComplete="off"
              onChange={(event) => set("sellerCountry", event.target.value)}
            />
          </Field>
          <Field label="Telephone" showOptional>
            <Input
              value={form.sellerPhone}
              disabled={disabled}
              maxLength={LIMITS.phone}
              autoComplete="off"
              onChange={(event) => set("sellerPhone", event.target.value)}
            />
          </Field>
          <Field label="Email" showOptional>
            <Input
              type="email"
              value={form.sellerEmail}
              disabled={disabled}
              maxLength={LIMITS.email}
              autoComplete="off"
              onChange={(event) => set("sellerEmail", event.target.value)}
            />
          </Field>
          <Field label="Address" showOptional hint="Filed with the bill; not printed on it.">
            <Input
              value={form.sellerAddress}
              disabled={disabled}
              maxLength={LIMITS.address}
              autoComplete="off"
              onChange={(event) => set("sellerAddress", event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section aria-label="Billed to" className="panel">
        <h2 className="eyebrow mb-3">Billed to — printed after &ldquo;TO&rdquo;</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name" required className="sm:col-span-2">
            <Input
              value={form.buyerName}
              disabled={disabled}
              maxLength={LIMITS.name}
              autoComplete="off"
              onChange={(event) => set("buyerName", event.target.value)}
            />
          </Field>
          <Field
            label="Address"
            className="sm:col-span-2"
            hint="One line per line typed here; the bill prints them down the page."
          >
            <Textarea
              rows={3}
              value={form.buyerAddress}
              disabled={disabled}
              maxLength={LIMITS.address}
              onChange={(event) => set("buyerAddress", event.target.value)}
            />
          </Field>
          <Field label="Country" showOptional>
            <Input
              value={form.buyerCountry}
              disabled={disabled}
              maxLength={LIMITS.country}
              autoComplete="off"
              onChange={(event) => set("buyerCountry", event.target.value)}
            />
          </Field>
          <Field label="Telephone" showOptional hint="Filed with the bill; not printed on it.">
            <Input
              value={form.buyerPhone}
              disabled={disabled}
              maxLength={LIMITS.phone}
              autoComplete="off"
              onChange={(event) => set("buyerPhone", event.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <ShipmentPrefill
            value={form.shipmentId}
            disabled={disabled}
            fills="the customer"
            onChange={(value) => set("shipmentId", value)}
            onPrefill={(shipment) =>
              setForm((current) => ({
                ...current,
                // The bill goes to whoever booked the carriage, which is the
                // shipment's sender — not its consignee.
                buyerName: shipment.sender_name ?? current.buyerName,
                buyerAddress: shipment.sender_address ?? current.buyerAddress,
                buyerPhone: shipment.sender_phone ?? current.buyerPhone,
                buyerCountry: shipment.origin_country ?? current.buyerCountry,
              }))
            }
          />
        </div>
      </section>

      <section aria-label="Waybill" className="panel">
        <h2 className="eyebrow mb-3">Waybill</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="AWB no." showOptional hint="Filed by day, month and year on the bill.">
            <Input
              value={form.awbNo}
              disabled={disabled}
              maxLength={LIMITS.awbNo}
              placeholder="180-45678901"
              autoComplete="off"
              onChange={(event) => set("awbNo", event.target.value)}
            />
          </Field>
          <Field label="Account" showOptional hint="The agent the shipment was booked through.">
            <Input
              value={form.accountName}
              disabled={disabled}
              maxLength={LIMITS.name}
              autoComplete="off"
              onChange={(event) => set("accountName", event.target.value)}
            />
          </Field>
          <Field label="Charge currency">
            <Input
              value={form.currency}
              disabled={disabled}
              maxLength={10}
              autoComplete="off"
              onChange={(event) => set("currency", event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section aria-label="Charges" className="panel">
        <h2 className="eyebrow mb-3">Charges</h2>
        <ChargeEditor
          rows={rows}
          onChange={setRows}
          currency={currency}
          disabled={disabled}
        />
      </section>

      <section aria-label="Settlement" className="panel">
        <h2 className="eyebrow mb-3">Settlement</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[0.75rem] border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Charges total
            </p>
            <p className="mt-1 text-lg">
              <Money amount={subtotal} currency={currency} inline />
            </p>
          </div>
          <Field
            label="Exchange rate"
            hint={`${currency} to NPR, as agreed on the day.`}
            error={
              form.fxRate.trim() !== "" && fxRate === undefined
                ? "Enter a rate above zero."
                : undefined
            }
          >
            <Input
              type="number"
              min={0}
              step="0.0001"
              className="text-right tabular-nums"
              value={form.fxRate}
              disabled={disabled}
              onChange={(event) => set("fxRate", event.target.value)}
            />
          </Field>
          <div className="rounded-[0.75rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Settles in rupees
            </p>
            <p className="mt-1 text-lg">
              {rupees === undefined ? (
                <span className="text-sm text-slate-600">Enter a rate to see the total.</span>
              ) : (
                <Money amount={rupees} currency="NPR" inline />
              )}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
          <Checkbox
            label="Write the amount in words myself"
            hint="Left off, the server writes the wording when the file is generated. A wording saved here is reprinted verbatim, so a reprint matches the original."
            checked={form.overrideWords}
            disabled={disabled}
            onChange={(event) => set("overrideWords", event.target.checked)}
          />
          {form.overrideWords && (
            <Field label="Amount in words">
              <Input
                value={form.amountInWords}
                disabled={disabled}
                maxLength={LIMITS.words}
                placeholder="Twenty two thousand eight hundred eighty seven only."
                autoComplete="off"
                onChange={(event) => set("amountInWords", event.target.value)}
              />
            </Field>
          )}
        </div>
      </section>

      <section aria-label="Filing" className="panel">
        <h2 className="eyebrow mb-3">Filing</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Status"
            hint={
              isAdmin
                ? undefined
                : "Issued and paid are set by an administrator; the API refuses them here."
            }
          >
            <Select
              value={form.status}
              disabled={disabled}
              options={statusOptions.map((value) => ({ value, label: documentLabel(value) }))}
              onChange={(event) => set("status", event.target.value as FreightBillStatus)}
            />
          </Field>
          <Field label="Internal notes" showOptional className="sm:col-span-2">
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

export default FreightBillForm;
