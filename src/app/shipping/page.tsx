import Link from "next/link";
import { FaArrowRight, FaPlane, FaShip, FaTruck } from "react-icons/fa";
import JsonLd from "@/components/seo/JsonLd";
import { Card } from "@/components/kit";
import { buildMetadata, siteUrl } from "@/lib/content";
import { breadcrumbs, service } from "@/lib/seo/jsonld";
import {
  CorridorTrail,
  CorridorCta,
  Section,
} from "@/components/seo/corridor/ui";
import {
  corridorLabel,
  inboundPath,
  outboundPath,
  regionGroups,
  theCountry,
} from "@/components/seo/corridor";

const TITLE = "International Shipping from Nepal | Corridors and Destinations";
const DESCRIPTION =
  "Air and sea freight between Nepal and twelve countries, in both directions. How each corridor actually moves, what customs expects, and where to price your shipment.";

export const metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/shipping",
});

/**
 * The index of the corridor cluster.
 *
 * Grouped by region rather than alphabetically, because the regions are the
 * thing that genuinely differs: a land border behaves nothing like a
 * long-haul air lane, and a reader who understands that picks the right
 * service. Every corridor is reachable from here as a real `<Link>` in both
 * directions, so crawl budget reaches all twenty-four pages from one hop.
 */
export default function ShippingIndexPage() {
  const groups = regionGroups();
  const corridorCount = groups.reduce((total, group) => total + group.corridors.length, 0);

  return (
    <div className="container max-w-5xl py-12 md:py-16">
      <JsonLd
        data={[
          breadcrumbs(siteUrl, [
            { name: "Home", path: "/" },
            { name: "International shipping", path: "/shipping" },
          ]),
          service(siteUrl, {
            name: "International shipping from and to Nepal",
            description: DESCRIPTION,
            path: "/shipping",
            areaServed: ["Nepal"],
            serviceType: "International air freight, sea freight and overland freight",
          }),
        ]}
      />

      <CorridorTrail
        items={[{ label: "Home", href: "/" }, { label: "International shipping" }]}
      />

      <header>
        <p className="eyebrow mb-4 flex items-center gap-2 text-teal-700">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal-700" />
          From Nepal to the world, and back
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] sm:text-5xl">
          International shipping corridors
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-700">
          We move freight between Nepal and {corridorCount} countries in both directions. Each
          corridor has its own page, because they are not the same job wearing different flags —
          a truck through Birgunj and a long-haul flight to Sydney have different paperwork,
          different timings and different reasons a shipment gets held.
        </p>
      </header>

      <Section title="How international shipping from Nepal actually works" kicker="Orientation">
        <div className="space-y-5 text-sm leading-7 text-slate-700">
          <p>
            Nepal is landlocked, and that single fact shapes everything. There is no port, so
            anything that travels by sea has to go overland first — by road to Kolkata or Haldia
            in India, where it is containerised and put on a ship. That makes sea freight a
            multimodal, multi-week proposition on every lane except the two land borders. It is
            genuinely cheaper for volume, and genuinely slow.
          </p>
          <p>
            Air freight leaves from Tribhuvan International Airport in Kathmandu. Short sectors to
            the Gulf and to India are well served and quick. Everywhere else connects through a
            hub — a Gulf airport, Delhi, or an East or Southeast Asian gateway — because there are
            no direct long-haul services from Nepal. For anything parcel-sized, air is almost
            always the right answer; sea starts to make sense at pallet volumes, for furniture, or
            for a household move.
          </p>
          <p>
            India and China are the exceptions. Both share a land border with Nepal, so road
            freight through a land customs office is the normal route rather than the fallback.
            That makes them the fastest corridors we run and the ones where the variable is the
            crossing itself — a strike, a festival, a landslide — rather than the distance.
          </p>
          <p>
            In every direction there are two customs events: an export clearance and an import
            clearance. The import side is where the money and most of the delay sit. Goods coming
            into Nepal are assessed for duty and VAT on how they are classified and the value
            declared, and that applies to gifts as much as to commercial stock. We will estimate
            the charge from an itemised list before you ship — what we will not do anywhere on
            this site is publish a rate, a transit time in days or a duty percentage, because
            those depend on the shipment and a confident wrong number costs you real money.{" "}
            <Link
              href="/pricing"
              className="font-semibold text-teal-800 underline underline-offset-4"
            >
              The calculator prices your actual shipment
            </Link>{" "}
            against the live tariff.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card padding="sm">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[color:var(--brand-navy)]">
              <FaPlane aria-hidden="true" className="text-teal-700" /> Air
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              Out of Kathmandu, connecting through a hub on all but the shortest lanes. The
              default for parcels and anything with a date on it.
            </p>
          </Card>
          <Card padding="sm">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[color:var(--brand-navy)]">
              <FaShip aria-hidden="true" className="text-teal-700" /> Sea
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              Overland to Kolkata or Haldia first, then containerised. Several weeks, and worth it
              only for volume or a relocation.
            </p>
          </Card>
          <Card padding="sm">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[color:var(--brand-navy)]">
              <FaTruck aria-hidden="true" className="text-teal-700" /> Road
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              Only to India and China, through the land customs offices. The quickest option we
              have, and the one most exposed to a closed border.
            </p>
          </Card>
        </div>
      </Section>

      {groups.map((group) => (
        <Section key={group.id} title={group.label} kicker="Region">
          <p className="max-w-3xl text-sm leading-7 text-slate-700">{group.blurb}</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {group.corridors.map(({ corridor, content }) => (
              <li key={corridor.slug}>
                <Card as="article" padding="sm" className="h-full">
                  <h3 className="text-lg font-bold text-[color:var(--brand-navy)]">
                    {corridor.country}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{content.summary}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href={outboundPath(corridor.slug)}
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-700"
                    >
                      {corridorLabel("outbound", corridor)}
                      <FaArrowRight aria-hidden="true" className="text-xs" />
                    </Link>
                    <Link
                      href={inboundPath(corridor.slug)}
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-700"
                    >
                      {corridorLabel("inbound", corridor)}
                      <FaArrowRight aria-hidden="true" className="text-xs" />
                    </Link>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-slate-600">
                    Outbound is written for senders in Nepal; the {theCountry(corridor)} to Nepal
                    page is written for the family sending home.
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section title="Before you book" kicker="Elsewhere on the site">
        <ul className="grid gap-4 sm:grid-cols-2">
          {[
            {
              href: "/pricing",
              title: "Shipping rates",
              body: "The live tariff, priced on your actual weight, dimensions and destination.",
            },
            {
              href: "/services/international",
              title: "International freight services",
              body: "What air, sea and express each do, and which one suits your shipment.",
            },
            {
              href: "/tracking",
              title: "Track a shipment",
              body: "One number, followable from anywhere, with updates to the Nepali mobile on file.",
            },
            {
              href: "/courier",
              title: "Domestic network",
              body: "Pickup and delivery across Nepal's districts, at both ends of every import.",
            },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="panel block h-full transition hover:-translate-y-0.5 hover:border-teal-700 hover:shadow-md"
              >
                <span className="flex items-center gap-2 text-base font-semibold text-[color:var(--brand-navy)]">
                  {link.title}
                  <FaArrowRight aria-hidden="true" className="text-xs text-teal-700" />
                </span>
                <span className="mt-2 block text-sm leading-7 text-slate-600">{link.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CorridorCta
        heading="Not sure which service your shipment needs?"
        body="Tell us what you are sending, where it is going and when it has to be there. We will tell you whether it should fly or sail, what the receiving customs will want, and what it costs from the live tariff."
      />
    </div>
  );
}
