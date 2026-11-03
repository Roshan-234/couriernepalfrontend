import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import JsonLd from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/content";
import type { Corridor } from "@/lib/seo/business";
import { breadcrumbs, faqPage, service } from "@/lib/seo/jsonld";
import { regionLabel } from "./data";
import { corridorLabel, inboundPath, outboundPath, theCountry } from "./routes";
import type { CorridorContent } from "./types";
import {
  ArrivalNote,
  CorridorCta,
  CorridorHero,
  CorridorTrail,
  FactList,
  FaqBlock,
  ModeComparison,
  Prose,
  RelatedLinks,
  Section,
  WatchOut,
} from "./ui";

/**
 * Destination → Nepal.
 *
 * Written for the diaspora reader, who is not an exporter and does not open
 * with a question about freight mode. They want to know what the family in
 * Nepal will be asked to pay and whether a parcel reaches a district
 * address, so this page answers both before it discusses anything else. The
 * outbound page runs the opposite way round on purpose.
 */
export default function InboundCorridorPage({
  corridor,
  content,
}: {
  corridor: Corridor;
  content: CorridorContent;
}) {
  const direction = content.inbound;
  const path = inboundPath(corridor.slug);
  const label = corridorLabel("inbound", corridor);
  const country = theCountry(corridor);

  return (
    <div className="container max-w-5xl py-12 md:py-16">
      <JsonLd
        data={[
          breadcrumbs(siteUrl, [
            { name: "Home", path: "/" },
            { name: "International shipping", path: "/shipping" },
            { name: label, path },
          ]),
          service(siteUrl, {
            name: `${label} shipping`,
            description: direction.description,
            path,
            areaServed: [corridor.country, "Nepal"],
            serviceType: direction.serviceType,
          }),
          faqPage(direction.faqs),
        ]}
      />

      <CorridorTrail
        items={[
          { label: "Home", href: "/" },
          { label: "International shipping", href: "/shipping" },
          { label },
        ]}
      />

      <CorridorHero
        eyebrow={direction.eyebrow}
        heading={direction.heading}
        lede={direction.lede}
        tags={[regionLabel(content.region), "Air freight", "Delivery to every district"]}
      >
        <Link href="/pricing" className="action">
          Estimate the cost <FaArrowRight aria-hidden="true" />
        </Link>
        <Link href="/tracking" className="action action-outline">
          Track a shipment
        </Link>
      </CorridorHero>

      {/* The two questions this reader actually arrived with, before anything else. */}
      <div className="mt-12">
        <WatchOut {...direction.watchOut} />
      </div>

      <div className="mt-8">
        <ArrivalNote {...direction.arrival} />
      </div>

      <Section title={`Who sends from ${country} to Nepal`} kicker="The reader">
        <div className="space-y-8">
          <Prose {...direction.audience} />
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[color:var(--brand-navy)]">
              What people usually send
            </h3>
            <FactList items={direction.goods} icon="box" />
          </div>
        </div>
      </Section>

      <Section title="How the shipment travels" kicker="Routing">
        <ModeComparison modes={direction.modes} />
      </Section>

      <Section title="What to send with it" kicker="Documents">
        <FactList items={direction.paperwork} icon="file" />
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
          The itemised list is the part people skip, and it is the part that decides how long
          clearance takes and what gets charged. Send it to us before you ship and we will tell you
          what to expect rather than leaving your family to find out at the counter.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          <strong className="font-semibold text-slate-800">Rules change.</strong> Customs
          requirements, restricted categories and border openings are revised by the authorities
          at both ends, sometimes at short notice. Treat this page as orientation and confirm the
          current position with us when you book — that confirmation is what we stand behind.
        </p>
      </Section>

      <Section title={`Questions about sending from ${country}`} kicker="FAQ">
        <FaqBlock items={direction.faqs} />
      </Section>

      <Section title="Related pages" kicker="Keep reading">
        <RelatedLinks
          links={[
            {
              href: outboundPath(corridor.slug),
              title: `Shipping from Nepal to ${country}`,
              body: `The other direction, for exporters and families in Nepal sending to ${corridor.country}.`,
            },
            {
              href: "/courier",
              title: "Delivery across Nepal",
              body: "The district network that takes a cleared shipment from Kathmandu to wherever your family actually lives.",
            },
            {
              href: "/pricing",
              title: "Rates and the shipping calculator",
              body: "Work out the freight on your real weight and dimensions, and ask us for the duty estimate separately.",
            },
            {
              href: "/tracking",
              title: "Track a shipment",
              body: "One tracking number, usable from anywhere, with updates to the recipient's Nepali mobile.",
            },
            {
              href: "/services/international",
              title: "International freight services",
              body: "Air, sea and express options, and when each of them is the right answer.",
            },
            {
              href: "/shipping",
              title: "All international corridors",
              body: "Every country we ship between, both directions, grouped by region.",
            },
          ]}
        />
      </Section>

      <CorridorCta
        heading={`Sending home from ${country}?`}
        body="Send us an itemised list of what is in the shipment and the district it is going to. We will come back with the freight rate from the live tariff and an estimate of what Nepali customs will assess, so you can settle it yourself instead of leaving the bill to your family."
      />
    </div>
  );
}
