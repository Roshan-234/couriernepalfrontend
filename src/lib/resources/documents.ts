/**
 * The two export documents the office issues: packing lists and freight
 * bills. Both are CRUD plus "write the Excel file" plus "stream it back".
 *
 * Four things about the API are encoded here rather than left for a screen to
 * rediscover:
 *
 * 1. **A freight bill is `/invoices`.** The endpoint, the model and the
 *    generated number all say "invoice"; the document the office issues is a
 *    freight bill, which charges for carriage rather than for goods. The
 *    names below follow the document, not the table.
 * 2. **A charge line's amount cannot be posted directly.** The server derives
 *    `total_price` from `quantity × unit_price` and discards whatever was
 *    sent, so `{description, total_price}` is stored as zero. See
 *    {@link chargeLine}.
 * 3. **`issued` and `paid` are administrator-only.** Anyone else gets a 403
 *    from the validator, before the handler runs. {@link BILL_ADMIN_STATUSES}
 *    is the list a screen must not offer to a non-admin.
 * 4. **Numeric fields reject null.** The validator runs `number()` over
 *    `fx_rate`, `total_npr` and `total_packages` whenever the key is present,
 *    and `null` is not a number — so an unset figure is omitted from the body
 *    rather than sent empty.
 */

import { del, get, getFile, getList, getPage, post, put, type FetchedFile, type Query } from "./client";

/* ── Packing lists ──────────────────────────────────────────────────────── */

export type PackingListStatus = "draft" | "finalized";

export const PACKING_LIST_STATUSES: PackingListStatus[] = ["draft", "finalized"];

/**
 * One line of a packing list.
 *
 * `box` is the carton label — "BOX NO:01" — and is what the generated
 * document groups and heads the rows by. An item with no box falls into a
 * single unlabelled group, so a flat list still produces a sensible document.
 */
export interface PackingListItem {
  description: string;
  quantity: number;
  box?: string;
  /** Carton dimensions as the office writes them, e.g. "40x30x25". */
  cms?: string;
  remarks?: string;
  unit_weight_kg?: number;
  /** Server-derived: `quantity × unit_weight_kg`. Read-only. */
  total_weight_kg?: number;
}

export interface PackingList {
  id: number;
  pl_number: string;
  shipment_id: number | null;
  status: PackingListStatus;
  /** The exporter's. Their letterhead goes on the document, not ours. */
  sender_name: string;
  sender_address: string | null;
  sender_phone: string | null;
  sender_country: string | null;
  sender_email: string | null;
  receiver_name: string;
  receiver_address: string | null;
  receiver_phone: string | null;
  receiver_country: string | null;
  /** The exporter's own commercial invoice reference, printed as "INV NO:-". */
  invoice_no: string | null;
  mode_of_shipment: string | null;
  goods_summary: string | null;
  quantity_unit: string | null;
  signed_for: string | null;
  items: PackingListItem[];
  total_packages: number;
  total_weight_kg: number;
  total_items: number;
  /** Null until `generate` has been called at least once. */
  file_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: number;
}

/** The body `POST /` and `PUT /<id>` accept. */
export interface PackingListWrite {
  sender_name: string;
  sender_address: string;
  sender_phone: string;
  sender_country: string;
  sender_email: string;
  receiver_name: string;
  receiver_address: string;
  receiver_phone: string;
  receiver_country: string;
  invoice_no: string;
  mode_of_shipment: string;
  goods_summary: string;
  quantity_unit: string;
  signed_for: string;
  items: PackingListItem[];
  notes: string;
  status?: PackingListStatus;
  shipment_id?: number | null;
  /** Cartons, not line items. Omitted rather than sent empty. */
  total_packages?: number;
}

/* ── Freight bills ──────────────────────────────────────────────────────── */

export type FreightBillStatus = "draft" | "issued" | "paid" | "cancelled";

export const FREIGHT_BILL_STATUSES: FreightBillStatus[] = ["draft", "issued", "paid", "cancelled"];

/** The two the validator refuses to anyone without an admin role. */
export const BILL_ADMIN_STATUSES: FreightBillStatus[] = ["issued", "paid"];

/**
 * One charge line — "Air freight charge 45kgs x 3.20", USD 144.00.
 *
 * The quantity is already inside the wording the office uses, so a line
 * carries one amount and not a rate times a count. The API will not take that
 * amount directly; see {@link chargeLine}.
 */
export interface FreightBillCharge {
  description: string;
  quantity: number;
  unit_price: number;
  /** Server-derived: `quantity × unit_price`. Read-only. */
  total_price?: number;
}

export interface FreightBill {
  id: number;
  invoice_number: string;
  shipment_id: number | null;
  packing_list_id: number | null;
  status: FreightBillStatus;
  seller_name: string;
  seller_address: string | null;
  seller_phone: string | null;
  seller_country: string | null;
  seller_tin: string | null;
  seller_email: string | null;
  buyer_name: string;
  buyer_address: string | null;
  buyer_phone: string | null;
  buyer_country: string | null;
  buyer_tin: string | null;
  items: FreightBillCharge[];
  /** Air waybill number, filed by day/month/year on the printed bill. */
  awb_no: string | null;
  /** The agent the shipment was booked through, printed top right. */
  account_name: string | null;
  /** USD to NPR on the day the bill was raised. Stored, not looked up. */
  fx_rate: number | null;
  total_npr: number | null;
  /** Blank unless somebody overrode it; the generator writes the words. */
  amount_in_words: string | null;
  currency: string;
  subtotal: number;
  discount: number;
  tax_percentage: number;
  tax_amount: number;
  shipping_charge: number;
  total_amount: number;
  payment_terms: string | null;
  incoterms: string | null;
  port_of_loading: string | null;
  port_of_discharge: string | null;
  file_name: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: number;
}

/** The body `POST /` and `PUT /<id>` accept. */
export interface FreightBillWrite {
  seller_name: string;
  seller_address: string;
  seller_phone: string;
  seller_country: string;
  seller_email: string;
  buyer_name: string;
  buyer_address: string;
  buyer_phone: string;
  buyer_country: string;
  awb_no: string;
  account_name: string;
  items: FreightBillCharge[];
  currency: string;
  notes: string;
  status?: FreightBillStatus;
  shipment_id?: number | null;
  packing_list_id?: number | null;
  /** Omitted rather than sent empty: the validator refuses a null number. */
  fx_rate?: number;
  total_npr?: number;
  /** Omitted unless deliberately overridden, so the generator writes it. */
  amount_in_words?: string;
}

/**
 * A charge line in the shape the API will actually store.
 *
 * `document_data` recomputes `total_price` as `quantity × unit_price` and
 * overwrites whatever the client sent, so a line posted as
 * `{description, total_price: 144}` comes back with `total_price: 0` — the
 * quantity defaulted to zero. Every line therefore goes out with a quantity
 * of one and the amount as the unit price, which is the only shape that
 * survives the round trip with its figure intact.
 */
export function chargeLine(description: string, amount: number): FreightBillCharge {
  return { description, quantity: 1, unit_price: amount, total_price: amount };
}

/** What a charge line is worth, however it was stored. */
export function chargeAmount(line: FreightBillCharge): number {
  const total = line.total_price;
  if (typeof total === "number" && Number.isFinite(total) && total !== 0) return total;
  return (line.quantity || 0) * (line.unit_price || 0);
}

/** The USD figure the bill converts at the agreed rate. */
export function chargeSubtotal(lines: FreightBillCharge[]): number {
  return Math.round(lines.reduce((sum, line) => sum + chargeAmount(line), 0) * 100) / 100;
}

/** What the customer settles, at the rate entered on the bill. */
export function nprTotal(subtotal: number, fxRate: number | undefined): number | undefined {
  if (fxRate === undefined || !Number.isFinite(fxRate) || fxRate <= 0) return undefined;
  return Math.round(subtotal * fxRate * 100) / 100;
}

/* ── Endpoints ──────────────────────────────────────────────────────────── */

export interface DocumentFilters extends Query {
  status?: string;
  page?: number;
  per_page?: number;
}

/** What `/generate` answers with. The file itself comes from `/download`. */
export interface GeneratedFile {
  msg: string;
  file_name: string;
}

export const packingLists = {
  list: (query: DocumentFilters = {}) => getPage<PackingList>("/packing-lists", query),
  /** Unpaginated, capped at 50, matched against sender, receiver and number. */
  search: (q: string) => getList<PackingList>("/packing-lists/search", { q }),
  get: (id: number) => get<PackingList>(`/packing-lists/${id}`),
  create: (body: PackingListWrite) => post<PackingList>("/packing-lists", body),
  update: (id: number, body: PackingListWrite) => put<PackingList>(`/packing-lists/${id}`, body),
  remove: (id: number) => del<{ msg: string }>(`/packing-lists/${id}`),
  /** Writes (or rewrites) the workbook on the server. */
  generate: (id: number) => post<GeneratedFile>(`/packing-lists/${id}/generate`),
  /** 404s with "Excel not generated yet" until `generate` has run. */
  file: (id: number): Promise<FetchedFile> => getFile(`/packing-lists/${id}/download`),
};

export const freightBills = {
  list: (query: DocumentFilters = {}) => getPage<FreightBill>("/invoices", query),
  search: (q: string) => getList<FreightBill>("/invoices/search", { q }),
  get: (id: number) => get<FreightBill>(`/invoices/${id}`),
  create: (body: FreightBillWrite) => post<FreightBill>("/invoices", body),
  update: (id: number, body: FreightBillWrite) => put<FreightBill>(`/invoices/${id}`, body),
  remove: (id: number) => del<{ msg: string }>(`/invoices/${id}`),
  generate: (id: number) => post<GeneratedFile>(`/invoices/${id}/generate`),
  file: (id: number): Promise<FetchedFile> => getFile(`/invoices/${id}/download`),
};
