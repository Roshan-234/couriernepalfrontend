import Link from "next/link";
import type { DistrictFaq } from "./copy";

/**
 * Renders the questions that are also marked up as `FAQPage`.
 *
 * Both come from the same array on the page, because structured data for a
 * question a visitor cannot read is a policy problem, not a shortcut.
 *
 * Answers may mention a site path such as `/pricing`; it is turned into a
 * real link here while the JSON-LD keeps the same plain text, so the two
 * versions say exactly the same thing.
 */
const LINKABLE = ["/pricing", "/tracking", "/branches", "/courier"] as const;

const PATTERN = new RegExp(`(${LINKABLE.join("|")})`, "g");

function withLinks(answer: string) {
  return answer.split(PATTERN).map((part, index) =>
    (LINKABLE as readonly string[]).includes(part) ? (
      <Link
        key={index}
        href={part}
        className="font-semibold text-[color:var(--brand-teal)] underline underline-offset-2"
      >
        {part}
      </Link>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export function FaqList({ items }: { items: DistrictFaq[] }) {
  return (
    <dl className="divide-y divide-slate-200">
      {items.map((item) => (
        <div key={item.question} className="py-4 first:pt-0 last:pb-0">
          <dt className="text-base font-bold text-[color:var(--brand-navy)]">{item.question}</dt>
          <dd className="mt-2 text-sm leading-7 text-slate-700">{withLinks(item.answer)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default FaqList;
