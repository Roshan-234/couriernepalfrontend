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
 * Nepal → destination.
 *
 * The reader is a Nepali business or family sending abroad, so the page is
 * ordered the way an exporter thinks: who ships this, how it moves, what
 * paperwork it needs, what the receiving border objects to. The inbound page
 * deliberately runs in a different order, because its reader opens with a
 * different question.
 */
export default function OutboundCorridorPage({
  corridor,
  content,
}: {
  corridor: Corridor;
  content: CorridorContent;
}) {
  const direction = content.outbound;
  const path = outboundPath(corridor.slug);
  const label = corridorLabel("outbound", corridor);
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
            areaServed: ["Nepal", corridor.country],
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
        tags={[regionLabel(content.region), "Air freight", direction.modes.surfaceLabel]}
      >
        <Link href="/pricing" className="action">
          Check the rate <FaArrowRight aria-hidden="true" />
        </Link>
        <Link href={inboundPath(corridor.slug)} className="action action-outline">
          Sending the other way?
        </Link>
      </CorridorHero>

      <Section title={`Who ships Nepal to ${country}`} kicker="The reader">
        <div className="space-y-8">
          <Prose {...direction.audience} />
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[color:var(--brand-navy)]">
              What usually goes in the box
            </h3>
            <FactList items={direction.goods} icon="box" />
          </div>
        </div>
      </Section>

      <Section title={`Air or ${direction.modes.surfaceLabel.toLowerCase()}`} kicker="How it moves">
        <ModeComparison modes={direction.modes} />
      </Section>

      <Section title="Paperwork that travels with the shipment" kicker="Documents">
        <FactList items={direction.paperwork} icon="file" />
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
          We prepare the export documentation with you before the shipment moves. If you are not
          sure which category your goods fall into, send us a description first — it is far cheaper
          to answer that question in Kathmandu than at the destination.
        </p>
      </Section>

      <div className="mt-14">
        <WatchOut {...direction.watchOut} />
      </div>

      <div className="mt-8">
        <ArrivalNote {...direction.arrival} />
      </div>

      <Section title={`Questions about shipping to ${country}`} kicker="FAQ">
        <FaqBlock items={direction.faqs} />
      </Section>

      <Section title="Related pages" kicker="Keep reading">
        <RelatedLinks
          links={[
            {
              href: inboundPath(corridor.slug),
              title: `Shipping to Nepal from ${country}`,
              body: `The other direction, written for someone in ${corridor.country} sending home — customs in Nepal, and delivery outside Kathmandu.`,
            },
            {
              href: "/shipping",
              title: "All international corridors",
              body: "Every destination we ship to, both directions, grouped by region.",
            },
            {
              href: "/pricing",
              title: "Rates and the shipping calculator",
              body: "Price your actual weight and dimensions against the live tariff rather than a published guess.",
            },
            {
              href: "/services/international",
              title: "International freight services",
              body: "Air, sea and express options, and what each one is built for.",
            },
            {
              href: "/tracking",
              title: "Track a shipment",
              body: "Follow a consignment from pickup in Nepal to delivery abroad with its tracking number.",
            },
            {
              href: "/courier",
              title: "Pickup across Nepal",
              body: "Our district network, for collecting the goods wherever in Nepal they start from.",
            },
          ]}
        />
      </Section>

      <CorridorCta
        heading={`Sending to ${country}?`}
        body={`Tell us what is in the shipment and where it is going. We will confirm what can travel on the ${corridor.country} lane, what paperwork it needs, and the rate from the live tariff — in writing, before anything moves.`}
      />
    </div>
  );
}
