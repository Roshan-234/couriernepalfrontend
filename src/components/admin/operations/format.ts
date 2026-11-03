/**
 * Display helpers shared by the operations screens.
 *
 * Every value the logistics API returns is nullable, so each helper here
 * collapses null, undefined, empty strings and unparseable dates to a single
 * em dash rather than leaking "null" or "Invalid Date" into a table cell.
 */

import { formatCurrency } from "@/lib/utils";

/** What an absent value looks like in a cell or a detail row. */
export const EMPTY = "—";

export function text(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? EMPTY : trimmed;
}

export function count(value: number | null | undefined): string {
  return value === null || value === undefined || Number.isNaN(value)
    ? EMPTY
    : String(value);
}

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Date and time, e.g. "03 Nov 2026, 14:20". */
export function dateTime(value: string | null | undefined): string {
  const parsed = parse(value);
  if (!parsed) return EMPTY;
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Date only, e.g. "03 Nov 2026". */
export function dateOnly(value: string | null | undefined): string {
  const parsed = parse(value);
  if (!parsed) return EMPTY;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** The `YYYY-MM-DD` form a date input and the API both expect. */
export function isoDate(value: string | null | undefined): string {
  const parsed = parse(value);
  return parsed ? parsed.toISOString().slice(0, 10) : "";
}

/**
 * Money with its currency. `Intl` throws on a currency code it does not
 * recognise, and the API has been known to send an empty one, so the code is
 * checked before it reaches the formatter.
 */
export function money(
  amount: number | null | undefined,
  currency: string | null | undefined = "NPR",
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return EMPTY;
  const code = (currency ?? "").trim().toUpperCase();
  try {
    return formatCurrency(amount, /^[A-Z]{3}$/.test(code) ? code : "NPR");
  } catch {
    return `${code || "NPR"} ${amount.toFixed(2)}`;
  }
}

export function weight(kg: number | null | undefined): string {
  if (kg === null || kg === undefined || Number.isNaN(kg)) return EMPTY;
  return `${kg.toFixed(2)} kg`;
}

/** `recipient_unavailable` becomes `Recipient unavailable`. */
export function titleCase(value: string | null | undefined): string {
  const spaced = (value ?? "").replace(/_/g, " ").trim();
  return spaced === "" ? EMPTY : spaced[0].toUpperCase() + spaced.slice(1);
}

/** "Kathmandu to Pokhara", skipping either end when it is missing. */
export function route(
  origin: string | null | undefined,
  destination: string | null | undefined,
): string {
  const from = (origin ?? "").trim();
  const to = (destination ?? "").trim();
  if (!from && !to) return EMPTY;
  if (!from) return `→ ${to}`;
  if (!to) return `${from} →`;
  return `${from} → ${to}`;
}
