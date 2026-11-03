import type { Metadata } from "next";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { Badge, Card } from "@/components/kit";
import {
  DistrictLinks,
  FaqList,
  PageBreadcrumbs,
  PROVINCE_PROFILES,
  SectionHeading,
  ZoneGuide,
  provinceIntro,
} from "@/components/seo/district";
import { buildMetadata, siteUrl } from "@/lib/content";
import { DISTRICTS, PROVINCES, ZONE_LABELS } from "@/lib/seo/districts";
import { faqPage, service } from "@/lib/seo/jsonld";

const DESCRIPTION =
  "Courier and parcel delivery to all 77 districts of Nepal, by province, with the realistic transit time for each one: same-day in the Kathmandu Valley to 4-10 days in the mountains.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Courier Delivery to All 77 Districts of Nepal",
    description: DESCRIPTION,
    path: "/courier",
  });
}

const FAQS = [
  {
    question: "Do you deliver to every district in Nepal?",
    answer:
      "Yes. All 77 districts are served, though not on the same timetable. The Kathmandu Valley is same-day or next-day, highway towns are next-day, hill headquarters are 2-4 working days, and the remote mountain districts are 4-10 working days by air or seasonal road.",
  },
  {
    question: "What decides how long delivery takes?",
    answer:
      "The delivery zone of the destination district, not the distance on a map. A hill district an hour off the highway can take longer than a town twice as far away on it, because the trunk leg is scheduled and the last leg is not.",
  },
  {
    question: "Is cash on delivery available everywhere?",
    answer:
      "Cash on delivery is offered network-wide. What changes by district is the time: on a remote lane a seller can wait two to three weeks between dispatch and remittance, so prepaid is usually the better choice there.",
  },
  {
    question: "How do I get a price for a specific district?",
    answer:
      "Use the calculator at /pricing. It prices your actual parcel by weight, volumetric size and destination zone, which is the only honest way to quote across 77 districts.",
  },
];

export default function CourierIndexPage() {
  const zoneTotals = PROVINCE_PROFILES.reduce(
    (totals, profile) => {
      totals.valley += profile.zoneCounts.valley;
      totals.cities += profile.zoneCounts.cities;
      totals.hills += profile.zoneCounts.hills;
      totals.remote += profile.zoneCounts.remote;
      return totals;
    },
    { valley: 0, cities: 0, hills: 0, remote: 0 },
  );

  return (
    <div className="container py-12 sm:py-16">
      <PageBreadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Courier network", path: "/courier" },
        ]}
      />

      <JsonLd
        data={[
          service(siteUrl, {
            name: "Domestic courier delivery across Nepal",
            description: DESCRIPTION,
            path: "/courier",
            areaServed: ["Nepal"],
            serviceType: "Domestic courier and parcel delivery",
          }),
          faqPage(FAQS),
        ]}
      />

      <header className="max-w-3xl">
        <p className="eyebrow text-[color:var(--brand-teal)]">Domestic network</p>
        <h1 className="mt-3 text-3xl font-bold text-[color:var(--brand-navy)] sm:text-4xl">
          Courier delivery to all {DISTRICTS.length} districts of Nepal
        </h1>
        <p className="mt-5 text-[15px] leading-8 text-slate-700">
          Every district in the country is on the network, but they are not all the same job.
          Delivery inside the Kathmandu Valley is our own riders on our own round; Birgunj or
          Biratnagar is an overnight highway lane; Tamghas or Chautara is a scheduled trunk leg and
          then a hill road; Simikot is an aircraft. The pages below say which of those applies to
          your destination and roughly what it costs you in days, so you can quote a customer a
          date you will actually hit.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="navy" variant="soft">
            {zoneTotals.valley} valley districts
          </Badge>
          <Badge tone="teal" variant="soft">
            {zoneTotals.cities} city-tier districts
          </Badge>
          <Badge tone="amber" variant="soft">
            {zoneTotals.hills} hill districts
          </Badge>
          <Badge tone="orange" variant="soft">
            {zoneTotals.remote} remote districts
          </Badge>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/pricing" className="action">
            Price a parcel
          </Link>
          <Link href="/branches" className="action action-outline">
            Find a branch
          </Link>
        </div>
      </header>

      <section className="mt-12" aria-labelledby="zones">
        <SectionHeading id="zones">The four delivery zones</SectionHeading>
        <p className="mt-3 max-w-3xl text-[15px] leading-8 text-slate-700">
          Each district belongs to one of four zones. The zone sets the transit expectation and the
          way the last leg is run, and it is also what the rate calculator prices against.
        </p>
        <div className="mt-6">
          <ZoneGuide />
        </div>
      </section>

      <section className="mt-14" aria-labelledby="provinces">
        <SectionHeading id="provinces">
          All {DISTRICTS.length} districts, by province
        </SectionHeading>
        <p className="mt-3 max-w-3xl text-[15px] leading-8 text-slate-700">
          Nepal&rsquo;s {PROVINCES.length} provinces each present a different delivery problem.
          Pick a district for the transit time, the headquarters it is delivered from and what cash
          on delivery realistically means there.
        </p>

        <div className="mt-8 space-y-10">
          {PROVINCE_PROFILES.map((profile) => (
            <Card as="section" key={profile.code} id={profile.anchor} aria-labelledby={`${profile.anchor}-heading`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <SectionHeading as="h3" id={`${profile.anchor}-heading`}>
                  {profile.name} province
                </SectionHeading>
                <p className="text-sm text-slate-600">
                  {profile.districts.length} districts · capital {profile.capital}
                </p>
              </div>
              <p className="mt-3 max-w-4xl text-[15px] leading-8 text-slate-700">
                {provinceIntro(profile)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(["valley", "cities", "hills", "remote"] as const)
                  .filter((zone) => profile.zoneCounts[zone] > 0)
                  .map((zone) => (
                    <Badge key={zone} tone="neutral" variant="outline" size="sm">
                      {profile.zoneCounts[zone]} × {ZONE_LABELS[zone].label}
                    </Badge>
                  ))}
              </div>
              <div className="mt-5">
                <DistrictLinks districts={profile.districts} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="faq">
        <SectionHeading id="faq">Questions about the district network</SectionHeading>
        <Card className="mt-4 max-w-3xl">
          <FaqList items={FAQS} />
        </Card>
      </section>
    </div>
  );
}
