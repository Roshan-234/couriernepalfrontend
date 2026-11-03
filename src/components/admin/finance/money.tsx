"use client";

/**
 * Money rendering for the finance console.
 *
 * Every amount on these screens goes through here so a figure never reaches
 * the operator without a currency attached, and so columns of figures line up
 * on the decimal point. Nothing in this file derives a total: the API already
 * computed every sum shown, and a browser-side recomputation that disagreed
 * with the server would be worse than showing nothing at all.
 */

import { cn } from "@/lib/utils";

export const DEFAULT_CURRENCY = "NPR";

/** Tailwind for a money cell: right aligned, tabular, dark enough to read. */
export const MONEY_CELL = "text-right tabular-nums font-semibold text-slate-800";

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: string): Intl.NumberFormat | null {
  const cached = formatters.get(currency);
  if (cached) return cached;
  try {
    const made = new Intl.NumberFormat("ne-NP", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatters.set(currency, made);
    return made;
  } catch {
    // An unknown ISO code must not blank the screen.
    return null;
  }
}

/**
 * Format an amount with its currency code. Always two decimals; always a
 * currency marker. `null`/`undefined` is "no figure", not zero.
 */
export function formatMoney(
  amount: number | null | undefined,
  currency?: string | null,
): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return "—";
  const code = (currency ?? DEFAULT_CURRENCY).toUpperCase();
  const formatter = formatterFor(code);
  if (!formatter) return `${code} ${amount.toFixed(2)}`;
  return formatter.format(amount);
}

export interface MoneyProps {
  amount: number | null | undefined;
  currency?: string | null;
  /** Render without the cell alignment classes (inline in prose). */
  inline?: boolean;
  /** Dim the figure — used for zero-value fee lines. */
  muted?: boolean;
  className?: string;
}

/** One amount, right aligned and tabular unless `inline`. */
export function Money({ amount, currency, inline = false, muted = false, className }: MoneyProps) {
  const text = formatMoney(amount, currency);
  return (
    <span
      className={cn(
        inline ? "tabular-nums font-semibold" : MONEY_CELL,
        muted && "font-normal text-slate-600",
        className,
      )}
    >
      {text}
    </span>
  );
}

/** Weight, shown to three decimals so a 0.005 kg rounding step is visible. */
export function formatWeight(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value.toFixed(3)} kg`;
}

/** Percentages come back as plain numbers (7.5 meaning 7.5%). */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value}%`;
}

export default Money;
