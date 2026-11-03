import type { Metadata } from "next";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { Badge, Card, EmptyState } from "@/components/kit";
import {
  FaqList,
  PageBreadcrumbs,
  Prose,
  SectionHeading,
  districtByName,
  listNames,
} from "@/components/seo/district";
import { backendHeaders, backendUrl, buildMetadata, siteUrl } from "@/lib/content";
import { BUSINESS, OPENING_HOURS_TEXT } from "@/lib/seo/business";
import { PROVINCES } from "@/lib/seo/districts";
import { branchList, type BranchInput } from "@/lib/seo/jsonld";

const DESCRIPTION =
  "Moonlight Freight branches, hubs and pickup points across Nepal, with addresses, phone numbers and opening hours, plus the head office in Nayabazar, Kathmandu.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Branches and Pickup Points in Nepal",
    description: DESCRIPTION,
    path: "/branches",
  });
}

/** The subset of the Flask branch payload this page renders. */
interface Branch {
  id: number;
  code: string;
  name: string;
  type: string;
  district: string | null;
  province: string | null;
  city: string | null;
  address: string | null;
  landmark: string | null;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  latitude: number | null;
  longitude: number | null;
  accepts_walk_in: boolean | null;
  handles_cod: boolean | null;
  handles_international: boolean | null;
}

const TYPE_LABELS: Record<string, string> = {
  hub: "Sorting hub",
  branch: "Branch",
  pickup_point: "Pickup point",
  franchise: "Franchise",
};

const TYPE_TONES: Record<string, "navy" | "teal" | "amber" | "neutral"> = {
  hub: "navy",
  branch: "teal",
  pickup_point: "amber",
  franchise: "neutral",
};

/**
 * Branch records come from the Flask API, which is not reachable during a CI
 * build and can be down in production. A locator that throws in that case
 * turns a soft failure into a 500 on an indexed page, so the fetch is wrapped
 * and the page falls back to the head-office details and a phone number.
 */
async function getBranches(): Promise<{ branches: Branch[]; reachable: boolean }> {
  try {
    const response = await fetch(`${backendUrl}/api/branches/`, {
      headers: backendHeaders(),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { branches: [], reachable: false };
    const payload: unknown = await response.json();
    const items =
      payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)
        ? ((payload as { items: Branch[] }).items as Branch[])
        : [];
    return { branches: items, reachable: true };
  } catch {
    return { branches: [], reachable: false };
  }
}

/** Province order follows the district table so the page reads west to east consistently. */
function groupByProvince(branches: Branch[]): { province: string; branches: Branch[] }[] {
  const order = PROVINCES.map((province) => province.name);
  const groups = new Map<string, Branch[]>();

  for (const branch of branches) {
    const province =
      branch.province || districtByName(branch.district)?.province || "Other locations";
    const bucket = groups.get(province);
    if (bucket) bucket.push(branch);
    else groups.set(province, [branch]);
  }

  return [...groups.entries()]
    .sort((a, b) => {
      const ai = order.indexOf(a[0]);
      const bi = order.indexOf(b[0]);
      return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
    })
    .map(([province, list]) => ({
      province,
      branches: list.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

const FAQS = [
  {
    question: "Can I drop a parcel off at a branch without booking first?",
    answer:
      "At branches that accept walk-ins, yes. Booking online before you arrive is still faster, because the consignment is already on the system and the tracking number exists before you reach the counter.",
  },
  {
    question: "What if there is no branch in my district?",
    answer:
      "Delivery does not depend on a branch being in your district. All 77 districts are served — see /courier for the transit time to yours — and a pickup can be arranged from your address instead.",
  },
  {
    question: "Which branches handle cash on delivery?",
    answer:
      "Cash on delivery is collected network-wide. Branch records mark whether that branch also handles COD remittance at the counter; where it is not marked, the remittance is settled centrally.",
  },
];

export default async function BranchesPage() {
  const { branches, reachable } = await getBranches();
  const grouped = groupByProvince(branches);
  const walkIn = branches.filter((branch) => branch.accepts_walk_in).length;
  const districtsCovered = new Set(branches.map((branch) => branch.district).filter(Boolean)).size;

  const jsonLdBranches: BranchInput[] = branches.map((branch) => ({
    name: branch.name,
    path: `/branches#${branch.code}`,
    district: branch.district,
    city: branch.city,
    address: branch.address,
    phone: branch.phone,
    latitude: branch.latitude,
    longitude: branch.longitude,
  }));

  return (
    <div className="container py-12 sm:py-16">
      <PageBreadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Branches and pickup points", path: "/branches" },
        ]}
      />

      {jsonLdBranches.length > 0 && <JsonLd data={branchList(siteUrl, jsonLdBranches)} />}

      <header className="max-w-3xl">
        <p className="eyebrow text-[color:var(--brand-teal)]">Network</p>
        <h1 className="mt-3 text-3xl font-bold text-[color:var(--brand-navy)] sm:text-4xl">
          Branches and pickup points
        </h1>
        <p className="mt-5 text-[15px] leading-8 text-slate-700">
          Counters where you can hand a parcel over in person, and the hubs that sort what moves
          between them. You never need a branch nearby to send or receive — a pickup can be
          arranged from any address, and delivery reaches all 77 districts either way — but if you
          would rather walk in, these are the places to do it.
        </p>
        {branches.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="navy" variant="soft">
              {branches.length} active {branches.length === 1 ? "location" : "locations"}
            </Badge>
            {districtsCovered > 0 && (
              <Badge tone="teal" variant="soft">
                {districtsCovered} {districtsCovered === 1 ? "district" : "districts"}
              </Badge>
            )}
            {walkIn > 0 && (
              <Badge tone="amber" variant="soft">
                {walkIn} accepting walk-ins
              </Badge>
            )}
          </div>
        )}
      </header>

      <Card as="section" className="mt-8" aria-labelledby="head-office">
        <SectionHeading id="head-office">Head office</SectionHeading>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow text-slate-600">Address</p>
            <p className="mt-1 text-sm text-slate-800">
              {BUSINESS.streetAddress}, {BUSINESS.addressLocality} {BUSINESS.postalCode},{" "}
              {BUSINESS.addressRegion}
            </p>
          </div>
          <div>
            <p className="eyebrow text-slate-600">Phone</p>
            <p className="mt-1 text-sm">
              <a
                href={BUSINESS.telephoneHref}
                className="font-semibold text-[color:var(--brand-navy)] hover:underline"
              >
                {BUSINESS.telephone}
              </a>
            </p>
          </div>
          <div>
            <p className="eyebrow text-slate-600">Email</p>
            <p className="mt-1 text-sm">
              <a
                href={`mailto:${BUSINESS.email}`}
                className="font-semibold text-[color:var(--brand-navy)] hover:underline"
              >
                {BUSINESS.email}
              </a>
            </p>
          </div>
          <div>
            <p className="eyebrow text-slate-600">Hours</p>
            <p className="mt-1 text-sm text-slate-800">{OPENING_HOURS_TEXT}</p>
          </div>
        </div>
      </Card>

      {grouped.length > 0 ? (
        <div className="mt-12 space-y-10">
          {grouped.map((group) => (
            <section key={group.province} aria-labelledby={`p-${group.province}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <SectionHeading id={`p-${group.province}`}>{group.province}</SectionHeading>
                <p className="text-sm text-slate-600">
                  {group.branches.length}{" "}
                  {group.branches.length === 1 ? "location" : "locations"} ·{" "}
                  {listNames([...new Set(group.branches.map((b) => b.district).filter(Boolean))] as string[])}
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.branches.map((branch) => (
                  <Card as="article" padding="sm" key={branch.id} id={branch.code}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-[color:var(--brand-navy)]">
                        {branch.name}
                      </h3>
                      <Badge tone={TYPE_TONES[branch.type] ?? "neutral"} variant="soft" size="sm">
                        {TYPE_LABELS[branch.type] ?? "Location"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-semibold tracking-wide text-slate-600">
                      {branch.code}
                    </p>
                    <address className="mt-3 space-y-1 text-sm not-italic leading-6 text-slate-700">
                      {branch.address && <span className="block">{branch.address}</span>}
                      {branch.landmark && (
                        <span className="block text-slate-600">Near {branch.landmark}</span>
                      )}
                      <span className="block">
                        {[branch.city, branch.district].filter(Boolean).join(", ")}
                      </span>
                      {branch.phone && (
                        <a
                          href={`tel:${branch.phone.replace(/[^+\d]/g, "")}`}
                          className="block font-semibold text-[color:var(--brand-navy)] hover:underline"
                        >
                          {branch.phone}
                        </a>
                      )}
                    </address>
                    <p className="mt-3 text-xs text-slate-600">
                      {branch.opening_hours || OPENING_HOURS_TEXT}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {branch.accepts_walk_in && (
                        <Badge tone="green" variant="soft" size="sm">
                          Walk-in
                        </Badge>
                      )}
                      {branch.handles_cod && (
                        <Badge tone="blue" variant="soft" size="sm">
                          COD
                        </Badge>
                      )}
                      {branch.handles_international && (
                        <Badge tone="indigo" variant="soft" size="sm">
                          International
                        </Badge>
                      )}
                    </div>
                    {(() => {
                      const home = districtByName(branch.district);
                      if (!home) return null;
                      return (
                        <p className="mt-3 text-sm">
                          <Link
                            href={`/courier/${home.slug}`}
                            className="font-semibold text-[color:var(--brand-teal)] underline underline-offset-2"
                          >
                            Delivery in {home.name}
                          </Link>
                        </p>
                      );
                    })()}
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="mt-12">
          <EmptyState
            title="The branch list is not available right now"
            description={
              reachable
                ? "No branches are published yet. Everything still routes through the head office in Nayabazar, and a pickup can be arranged from any address in the country."
                : "We could not load the branch directory. It is a display problem, not a delivery one — the network is running, and the head office can book a pickup or tell you the nearest counter over the phone."
            }
          />
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <a href={BUSINESS.telephoneHref} className="action">
              Call {BUSINESS.telephone}
            </a>
            <Link href="/courier" className="action action-outline">
              Check delivery to your district
            </Link>
          </div>
        </Card>
      )}

      <section className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading>Sending without a branch nearby</SectionHeading>
          <Prose>
            <p className="mt-3">
              Most of the country is served by pickup rather than by counter. Book the consignment
              online, choose a pickup window, and a rider or the local partner collects it from
              your address — the tracking number exists from the moment you book, so the parcel is
              on the manifest before anyone touches it.
            </p>
            <p>
              What a nearby branch does change is the cut-off. Handing a parcel over at a counter
              before the afternoon departure gets it onto that night&rsquo;s vehicle; a pickup
              booked late in the day usually catches the following one.
            </p>
          </Prose>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/create-shipment" className="action">
              Book a pickup
            </Link>
            <Link href="/courier" className="action action-outline">
              All 77 districts
            </Link>
          </div>
        </div>
        <div>
          <SectionHeading>Questions about branches</SectionHeading>
          <Card className="mt-4">
            <FaqList items={FAQS} />
          </Card>
        </div>
      </section>
    </div>
  );
}
