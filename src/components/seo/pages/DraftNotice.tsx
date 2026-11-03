import type { ReactNode } from "react";

import { BUSINESS } from "@/lib/seo/business";

/**
 * The banner that opens an unreviewed legal document.
 *
 * `/terms` and `/refund-policy` are drafts: they describe the shape of the
 * company's position without stating figures nobody has signed off. The pages
 * carry `noindex` for the same reason — an unreviewed policy should not be
 * indexed, nor relied on, until counsel has read it.
 */
export default function DraftNotice({
  document: documentName,
  children,
}: {
  document: string;
  children?: ReactNode;
}) {
  return (
    <aside
      role="note"
      aria-label={`${documentName} status`}
      className="panel max-w-[72ch] border-amber-300 bg-amber-50"
    >
      <p className="eyebrow text-amber-900">Draft — not yet in force</p>
      <p className="mt-3 text-[15px] leading-7 text-amber-950">
        This {documentName} is a working draft prepared for {BUSINESS.legalName} and is
        pending the company&apos;s own legal review. It is published here so it can be read
        and corrected, not as a binding statement of our terms. Bracketed items are gaps
        the company still has to fill.
      </p>
      {children ? <div className="mt-3 text-[15px] leading-7 text-amber-950">{children}</div> : null}
      <p className="mt-3 text-[15px] leading-7 text-amber-950">
        For the terms that apply to a shipment today, ask us in writing at{" "}
        <a className="font-semibold underline" href={`mailto:${BUSINESS.email}`}>
          {BUSINESS.email}
        </a>{" "}
        or call{" "}
        <a className="font-semibold underline" href={BUSINESS.telephoneHref}>
          {BUSINESS.telephone}
        </a>
        .
      </p>
    </aside>
  );
}
