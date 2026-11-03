import Link from "next/link";
import Brand from "@/components/layout/Brand";
import { BUSINESS, OPENING_HOURS_TEXT } from "@/lib/seo/business";

/**
 * The footer is the one place every page links from, so it is what carries
 * crawl budget into the district and corridor clusters. Contact details come
 * from `BUSINESS`, the same source the structured data reads, because search
 * engines weigh how consistently a name, address and phone number appear.
 */

const COLUMNS: { heading: string; links: [label: string, href: string][] }[] = [
  {
    heading: "Ship with us",
    links: [
      ["Our services", "/services"],
      ["Get a quote", "/pricing"],
      ["Track a shipment", "/tracking"],
      ["For businesses", "/business"],
      ["Book a shipment", "/dashboard/create-shipment"],
    ],
  },
  {
    heading: "Where we deliver",
    links: [
      ["All 77 districts", "/courier"],
      ["International shipping", "/shipping"],
      ["Branches & pickup points", "/branches"],
    ],
  },
  {
    heading: "Before you send",
    links: [
      ["Questions & answers", "/faq"],
      ["Prohibited items", "/prohibited-items"],
      ["Customs guide", "/customs-guide"],
      ["Packing guide", "/packing-guide"],
    ],
  },
  {
    heading: "Company",
    links: [
      ["About us", "/about"],
      ["Blog", "/blog"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#24234f] text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-3 lg:grid-cols-6">
        <div className="md:col-span-3 lg:col-span-2">
          <Brand inverse />
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-200">
            Thoughtful logistics. Dependable deliveries.
            <br />
            Connecting people and businesses from Nepal to the world.
          </p>

          <address className="mt-6 grid gap-2 text-sm not-italic text-slate-200">
            <a href={BUSINESS.telephoneHref} className="hover:text-[#ffda16]">
              {BUSINESS.telephone}
            </a>
            <a href={`mailto:${BUSINESS.email}`} className="break-all hover:text-[#ffda16]">
              {BUSINESS.email}
            </a>
            <span>
              {BUSINESS.streetAddress}, {BUSINESS.addressLocality}, Nepal
            </span>
          </address>
          <p className="mt-3 text-xs text-slate-300">{OPENING_HOURS_TEXT}</p>

          <p className="mt-5 text-xs text-slate-300">
            Operated by {BUSINESS.legalName}
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h2 className="mb-5 text-sm font-semibold">{column.heading}</h2>
            <ul className="grid gap-3 text-sm text-slate-200">
              {column.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#ffda16]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-slate-300">
        <span>
          © {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.
        </span>
        <Link href="/contact" className="text-[#ffda16] hover:underline">
          Contact our team ↗
        </Link>
      </div>
    </footer>
  );
}
