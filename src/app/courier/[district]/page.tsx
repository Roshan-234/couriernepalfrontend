import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/components/seo/JsonLd";
import { Badge, Card } from "@/components/kit";
import {
  DistrictLinks,
  FaqList,
  PageBreadcrumbs,
  Prose,
  SectionHeading,
  ZoneGuide,
  districtCopy,
  provinceAnchor,
  sameProvinceDistricts,
} from "@/components/seo/district";
import { buildMetadata, siteUrl } from "@/lib/content";
import { BUSINESS, OPENING_HOURS_TEXT } from "@/lib/seo/business";
import { DISTRICTS, ZONE_LABELS, districtBySlug } from "@/lib/seo/districts";
import { faqPage, service } from "@/lib/seo/jsonld";

type Props = { params: Promise<{ district: string }> };

/**
 * All 77 districts are built at `next build` time from the static table in
 * `src/lib/seo/districts.ts`. Nothing is fetched here: the build runs in CI
 * where the Flask API is unreachable, and a page family that needed the
 * backend to enumerate itself would simply fail to build.
 */
export function generateStaticParams() {
  return DISTRICTS.map((district) => ({ district: district.slug }));
}

/** An unknown slug is a 404, never an empty page with a title. */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const district = districtBySlug((await params).district);
  if (!district) {
    return buildMetadata({
      title: "District not found | Moonlight Freight",
      description: "That district page does not exist.",
      path: "/courier",
      noindex: true,
    });
  }

  const copy = districtCopy(district);
  return buildMetadata({
    title: `Courier and Parcel Delivery in ${district.name} | Moonlight Freight`,
    description: copy.summary,
    path: `/courier/${district.slug}`,
  });
}

export default async function DistrictPage({ params }: Props) {
  const district = districtBySlug((await params).district);
  if (!district) notFound();

  const copy = districtCopy(district);
  const zone = ZONE_LABELS[district.zone];
  const peers = sameProvinceDistricts(district);
  const path = `/courier/${district.slug}`;

  const facts = [
    { label: "District headquarters", value: district.headquarters },
    { label: "Province", value: district.province },
    { label: "Delivery zone", value: zone.label },
    { label: "Expected transit", value: zone.eta },
  ];

  return (
    <div className="container py-12 sm:py-16">
      <PageBreadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Courier network", path: "/courier" },
          { name: district.name, path },
        ]}
      />

      <JsonLd
        data={[
          service(siteUrl, {
            name: `Courier and parcel delivery in ${district.name}`,
            description: copy.summary,
            path,
            // A district is an administrative area, not a country.
            areaServed: [{ name: district.name, type: "AdministrativeArea" }, "Nepal"],
            serviceType: "Domestic courier and parcel delivery",
          }),
          faqPage(copy.faqs),
        ]}
      />

      <header className="max-w-3xl">
        <p className="eyebrow text-[color:var(--brand-teal)]">
          {district.province} province · {district.headquarters}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[color:var(--brand-navy)] sm:text-4xl">
          Courier and parcel delivery in {district.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="navy" variant="soft">
            {zone.label}
          </Badge>
          <Badge tone="teal" variant="outline">
            {zone.eta}
          </Badge>
        </div>
        <p className="mt-5 text-[15px] leading-8 text-slate-700">{copy.lead}</p>
      </header>

      <Card as="section" className="mt-8" aria-label={`Delivery facts for ${district.name}`}>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="eyebrow text-slate-600">{fact.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-[color:var(--brand-navy)]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-10">
          <section aria-labelledby="transit">
            <SectionHeading id="transit">
              How long a parcel takes to reach {district.name}
            </SectionHeading>
            <Prose>
              <p className="mt-3">{copy.transit}</p>
              <p>{copy.coverage}</p>
              {copy.note && (
                <p className="rounded-lg border-l-4 border-[color:var(--brand-yellow)] bg-[#fffdf0] px-4 py-3 text-slate-800">
                  <span className="font-semibold">Local note. </span>
                  {copy.note}
                </p>
              )}
            </Prose>
          </section>

          <section aria-labelledby="sending">
            <SectionHeading id="sending">What you can send to {district.name}</SectionHeading>
            <Prose>
              <p className="mt-3">{copy.sending}</p>
            </Prose>
          </section>

          <section aria-labelledby="cod">
            <SectionHeading id="cod">Cash on delivery in {district.name}</SectionHeading>
            <Prose>
              <p className="mt-3">{copy.cod}</p>
            </Prose>
          </section>

          <section aria-labelledby="booking">
            <SectionHeading id="booking">Booking a delivery to {district.name}</SectionHeading>
            <Prose>
              <p className="mt-3">{copy.booking}</p>
              <p>
                Prices depend on weight, volumetric size and the delivery zone, so rather than
                print a figure that will not match your parcel, the live calculator at{" "}
                <Link
                  href="/pricing"
                  className="font-semibold text-[color:var(--brand-teal)] underline underline-offset-2"
                >
                  /pricing
                </Link>{" "}
                quotes the consignment you are actually sending. Once it is moving, follow it at{" "}
                <Link
                  href="/tracking"
                  className="font-semibold text-[color:var(--brand-teal)] underline underline-offset-2"
                >
                  /tracking
                </Link>{" "}
                with the number on your receipt.
              </p>
            </Prose>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/pricing" className="action">
                Get a price for {district.name}
              </Link>
              <Link href="/dashboard/create-shipment" className="action action-accent">
                Book a shipment
              </Link>
              <Link href="/tracking" className="action action-outline">
                Track a parcel
              </Link>
            </div>
          </section>

          <section aria-labelledby="zones">
            <SectionHeading id="zones">
              Why {district.name} is a {zone.label.toLowerCase()} destination
            </SectionHeading>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              Every district sits in one of four delivery zones. The zone, not the distance on the
              map, is what decides how many days a parcel takes and how the last leg is run.
            </p>
            <div className="mt-5">
              <ZoneGuide highlight={district.zone} />
            </div>
          </section>

          <section aria-labelledby="faq">
            <SectionHeading id="faq">
              Questions about delivery to {district.name}
            </SectionHeading>
            <Card className="mt-4">
              <FaqList items={copy.faqs} />
            </Card>
          </section>
        </div>

        <aside className="space-y-6">
          <Card as="section" aria-labelledby="peers">
            <SectionHeading as="h3" id="peers">
              Other districts in {district.province}
            </SectionHeading>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {peers.length} other {peers.length === 1 ? "district" : "districts"} share this
              province, and most consignments for {district.name} pass through the same provincial
              lanes.
            </p>
            <ul className="mt-4 grid gap-1">
              {peers.map((peer) => (
                <li key={peer.slug}>
                  <Link
                    href={`/courier/${peer.slug}`}
                    className="flex items-center justify-between gap-3 rounded px-2 py-2 text-sm text-slate-700 hover:bg-[#f2f8f9] hover:text-[color:var(--brand-navy)]"
                  >
                    <span className="font-medium">{peer.name}</span>
                    <span className="text-xs text-slate-600">{peer.headquarters}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link
                href={`/courier#${provinceAnchor(district.province)}`}
                className="font-semibold text-[color:var(--brand-teal)] underline underline-offset-2"
              >
                All of {district.province} on the network map
              </Link>
            </p>
          </Card>

          <Card as="section" aria-labelledby="talk">
            <SectionHeading as="h3" id="talk">
              Talk to someone about {district.name}
            </SectionHeading>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              If a deadline matters, call before you book and we will tell you what is realistic on
              this lane rather than what the brochure says.
            </p>
            <dl className="mt-4 space-y-2 text-sm text-slate-700">
              <div>
                <dt className="eyebrow text-slate-600">Phone</dt>
                <dd>
                  <a
                    href={BUSINESS.telephoneHref}
                    className="font-semibold text-[color:var(--brand-navy)] hover:underline"
                  >
                    {BUSINESS.telephone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-slate-600">Office hours</dt>
                <dd>{OPENING_HOURS_TEXT}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm">
              <Link
                href="/branches"
                className="font-semibold text-[color:var(--brand-teal)] underline underline-offset-2"
              >
                Find a branch or pickup point
              </Link>
            </p>
          </Card>
        </aside>
      </div>

      <section className="mt-12" aria-labelledby="nearby-provinces">
        <SectionHeading id="nearby-provinces">The rest of the network</SectionHeading>
        <p className="mt-3 max-w-3xl text-[15px] leading-8 text-slate-700">
          We deliver to all 77 districts. If you ship to more than one, the index below is the
          quickest way to compare what each lane realistically takes.
        </p>
        <div className="mt-5">
          <DistrictLinks districts={peers.slice(0, 6)} />
        </div>
        <p className="mt-4 text-sm">
          <Link
            href="/courier"
            className="font-semibold text-[color:var(--brand-teal)] underline underline-offset-2"
          >
            Browse all 77 districts by province
          </Link>
        </p>
      </section>
    </div>
  );
}
