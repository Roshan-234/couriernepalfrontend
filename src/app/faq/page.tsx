import Link from "next/link";

import { Card } from "@/components/kit";
import {
  CallToAction,
  ContactLine,
  PageShell,
  Prose,
  Section,
} from "@/components/seo/pages";
import { getFaqs, groupByCategory, slugify } from "@/components/seo/pages/faqData";
import { buildMetadata } from "@/lib/content";
import { faqPage } from "@/lib/seo/jsonld";

const PATH = "/faq";

const TITLE = "Frequently asked questions | Moonlight Freight";
const DESCRIPTION =
  "Answers on tracking, booking, pricing, customs, cash on delivery and what to do when a parcel is late, from Moonlight Freight in Kathmandu.";

export const generateMetadata = () =>
  buildMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default async function Page() {
  const { entries } = await getFaqs();
  const groups = groupByCategory(entries);
  const showGroupHeadings = groups.length > 1;

  return (
    <PageShell
      trail={[
        { name: "Home", path: "/" },
        { name: "FAQ", path: PATH },
      ]}
      eyebrow="Help centre"
      title="Frequently asked questions"
      intro="The questions our counter staff answer most often, about tracking, booking, pricing, customs and what happens when something goes wrong. If your question is not here, call us — we would rather talk it through than have you guess."
      // Only the questions rendered below are marked up. Marking up anything
      // a visitor cannot see is a manual-action risk, not a shortcut.
      jsonLd={[faqPage(entries.map(({ question, answer }) => ({ question, answer })))]}
    >
      {showGroupHeadings ? (
        <nav aria-label="Question categories" className="-mt-4">
          <ul className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <li key={group.category}>
                <a
                  href={`#${slugify(group.category)}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-[color:var(--brand-teal)] hover:text-[color:var(--brand-navy)]"
                >
                  {group.category}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {groups.map((group) => (
        <Section
          key={group.category}
          id={slugify(group.category)}
          title={showGroupHeadings ? group.category : "Questions and answers"}
        >
          <dl className="space-y-4">
            {group.entries.map((entry) => (
              <Card key={entry.question} as="div" padding="sm">
                <dt className="text-base font-bold text-[color:var(--brand-navy)]">
                  {entry.question}
                </dt>
                <dd className="mt-2 max-w-[68ch] text-[15px] leading-7 whitespace-pre-line text-slate-700">
                  {entry.answer}
                </dd>
              </Card>
            ))}
          </dl>
        </Section>
      ))}

      <Section
        id="more-detail"
        title="Where to read more"
        lede="Four pages cover the questions that need more than a paragraph."
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {[
            {
              href: "/prohibited-items",
              title: "What we cannot carry",
              body: "Categories that are refused outright and categories that need clearance first.",
            },
            {
              href: "/customs-guide",
              title: "Customs guide",
              body: "What a declaration needs, who pays duty, and why parcels get held.",
            },
            {
              href: "/packing-guide",
              title: "Packing guide",
              body: "How to pack so your parcel survives handling, transfers and a long road.",
            },
            {
              href: "/pricing",
              title: "Pricing",
              body: "Work out an estimate from weight, dimensions and destination.",
            },
          ].map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block h-full">
                <Card interactive padding="sm" className="h-full">
                  <p className="text-base font-bold text-[color:var(--brand-navy)]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="ask-us" title="Still not answered?">
        <Prose>
          <p>
            Anything about a specific parcel — a held shipment, an unusual item, a remote
            district, a bulk booking — is faster to settle on the phone than by reading a
            general page.
          </p>
        </Prose>
        <ContactLine />
      </Section>

      <CallToAction
        title="Track a parcel or get a quote"
        body="If you already have a tracking number, start there. If you are pricing a shipment, the calculator will get you close before you call."
        primary={{ href: "/tracking", label: "Track a shipment" }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </PageShell>
  );
}
