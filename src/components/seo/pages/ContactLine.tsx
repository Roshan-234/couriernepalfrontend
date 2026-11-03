import { BUSINESS, OPENING_HOURS_TEXT } from "@/lib/seo/business";

/**
 * Phone, email and hours, read from the single source in `business.ts`.
 *
 * Several of these pages end by telling the reader to ask a human, and the
 * details must match the footer and the structured data exactly.
 */
export default function ContactLine({ className }: { className?: string }) {
  return (
    <p className={className ?? "max-w-[68ch] text-[15px] leading-7 text-slate-700"}>
      Call{" "}
      <a
        className="font-semibold text-[color:var(--brand-navy)] underline"
        href={BUSINESS.telephoneHref}
      >
        {BUSINESS.telephone}
      </a>{" "}
      or email{" "}
      <a
        className="font-semibold text-[color:var(--brand-navy)] underline"
        href={`mailto:${BUSINESS.email}`}
      >
        {BUSINESS.email}
      </a>
      . {OPENING_HOURS_TEXT}
    </p>
  );
}
