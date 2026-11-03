import Link from "next/link";
import type { ReactNode } from "react";

export interface CallToActionProps {
  title: string;
  body: ReactNode;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}

/** Closing panel with one obvious next step and at most one alternative. */
export default function CallToAction({ title, body, primary, secondary }: CallToActionProps) {
  return (
    <section
      aria-labelledby="cta-heading"
      className="panel border-[#d7d6ea] bg-[#f4f4fb]"
    >
      <h2 id="cta-heading" className="text-2xl font-bold text-[color:var(--brand-navy)]">
        {title}
      </h2>
      <div className="mt-3 max-w-[68ch] text-[15px] leading-7 text-slate-700">{body}</div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="action" href={primary.href}>
          {primary.label}
        </Link>
        {secondary ? (
          <Link className="action action-outline" href={secondary.href}>
            {secondary.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
