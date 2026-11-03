/**
 * Shared chart colours and label formatting.
 *
 * Chart.js paints onto a canvas, so it cannot read the CSS custom properties
 * in `globals.css`. The brand hexes are repeated here as literals and must
 * stay in step with `--brand-navy`, `--brand-teal` and `--brand-yellow`.
 */

export const BRAND_NAVY = "#383772";
export const BRAND_TEAL = "#117b8e";
export const BRAND_YELLOW = "#ffda16";

/** slate-600: the darkest small text the brand rules allow. */
export const CHART_TEXT = "#475569";
/** slate-200, for gridlines that stay behind the data. */
export const CHART_GRID = "#e2e8f0";

/** `2026-11-03` becomes `3 Nov`. Falls back to the raw label. */
export function shortDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

/** `November 2026` becomes `Nov 2026`. Falls back to the raw label. */
export function shortMonth(label: string): string {
  const date = new Date(`1 ${label}`);
  if (Number.isNaN(date.getTime())) return label;
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(date);
}
