import type { ReactNode } from "react";

/**
 * A figure the company still has to supply.
 *
 * These pages are written without inventing commitments: no liability caps,
 * no refund windows, no duty rates, no weight limits. Wherever a real number
 * belongs, this marker stands in its place so the gap is obvious both to the
 * owner reviewing the page and to anyone who reads it before it is filled.
 */
export default function ToConfirm({
  qualifier,
  children,
}: {
  /**
   * Who has to answer, when it is not simply the company — the managed
   * pages carry notes such as "[TO CONFIRM with an accountant: …]", and the
   * marker has to reproduce them as written rather than flatten them.
   */
  qualifier?: string;
  children: ReactNode;
}) {
  return (
    <mark className="mx-0.5 inline rounded bg-amber-100 px-1.5 py-0.5 text-[0.95em] font-semibold text-amber-900 ring-1 ring-amber-300 ring-inset">
      [TO CONFIRM{qualifier}: {children}]
    </mark>
  );
}
