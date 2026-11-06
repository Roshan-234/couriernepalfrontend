import Link from 'next/link';
import { FaArrowRight, FaPlane, FaShip, FaFileAlt, FaSuitcaseRolling, FaBoxOpen, FaHouseUser, FaTruck } from 'react-icons/fa';
import AdSlot from '@/components/ads/AdSlot';
import { HomeReviews } from '@/components/reviews/HomeReviews';
import { getPage, pageMetadata } from '@/lib/content';
import { CORRIDORS } from '@/lib/seo/business';

export const generateMetadata = () => pageMetadata('/');

/**
 * The homepage leads with international freight because that is the business.
 *
 * The previous version opened on a logo and a generic promise, then showed
 * three managed service blurbs. It never said where the company ships to,
 * which is the first thing a visitor wants and the main thing it competes on.
 * Domestic coverage is still here, positioned as the feeder network it is.
 */

/** The lanes that carry the most traffic, grouped the way customers think. */
const REGIONS: { label: string; blurb: string; slugs: string[] }[] = [
  {
    label: 'Gulf & Middle East',
    blurb: 'Direct services for workers and families sending in both directions.',
    slugs: ['uae', 'qatar', 'saudi-arabia'],
  },
  {
    label: 'Europe, North America & Australia',
    blurb: 'Long-haul air and sea for students, settled families and exporters.',
    slugs: ['usa', 'uk', 'canada', 'australia'],
  },
  {
    label: 'East & Southeast Asia',
    blurb: 'Scheduled air routes through regional hubs.',
    slugs: ['japan', 'south-korea', 'malaysia'],
  },
  {
    label: 'Land neighbours',
    blurb: 'Road and air into India and China, where the border sets the timetable.',
    slugs: ['india', 'china'],
  },
];

const SERVICES = [
  { icon: FaPlane, title: 'Air freight', body: 'Consolidated and full air cargo out of Kathmandu, priced on chargeable weight.', href: '/services/international' },
  { icon: FaShip, title: 'Sea freight', body: 'LCL and FCL routed through Kolkata or Birgunj. Nepal is landlocked, so we arrange the whole multimodal chain.', href: '/services/international' },
  { icon: FaFileAlt, title: 'Document express', body: 'Passports, transcripts and contracts, tracked end to end with signature on delivery.', href: '/services/express' },
  { icon: FaSuitcaseRolling, title: 'Excess baggage', body: 'For students and workers flying out — send what will not fit in the airline allowance.', href: '/services' },
  { icon: FaHouseUser, title: 'Personal effects', body: 'Household goods for people moving country, with the inventory customs will ask for.', href: '/services/packing' },
  { icon: FaBoxOpen, title: 'Import to Nepal', body: 'Inbound clearance, duty assessment and delivery onward to any district.', href: '/shipping' },
];

const ASSURANCES = [
  ['Customs handled', 'We prepare the paperwork and tell you what the receiver will owe before you commit.'],
  ['Tracked throughout', 'Every scan is visible, from the Kathmandu counter to the doorstep abroad.'],
  ['Priced before you book', 'Volumetric weight, surcharges and tax shown as separate lines — no surprise on collection.'],
];

export default async function Home() {
  const page = await getPage('/');
  // Keyed as plain strings: CORRIDORS is `as const`, so the inferred key
  // would be a literal union that the region lists below cannot satisfy.
  const bySlug = new Map<string, { country: string }>(
    CORRIDORS.map((corridor) => [corridor.slug, corridor]),
  );

  return (
    <div>
      {/* ── Seasonal takeover, when one is running ───────────────────────
          Directly under the header and above the hero, which is where the
          `home_hero` placement is defined to sit and the only slot above the
          fold. It renders nothing at all when no campaign is live, so the
          page below is untouched in the ordinary case. */}
      <AdSlot placement="home_hero" path="/" variant="hero" />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="surface-deep overflow-hidden">
        <div className="container grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="kicker mb-6">{page.eyebrow}</p>
            <h1 className="display max-w-2xl">
              Ship from Nepal
              <span className="block text-[#ffda16]">to anywhere.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-200">
              Air and sea freight, express courier, excess baggage and customs-cleared
              imports — out of Kathmandu to the world, and back again.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/pricing" className="action action-accent w-full sm:w-auto">
                Get a shipping quote <FaArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="/shipping"
                className="action w-full border border-white/25 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
              >
                See destinations
              </Link>
            </div>

            {/* Two up on a phone: three columns forces "Air & sea" to wrap
                mid-phrase at 375px. */}
            <dl className="mt-11 grid max-w-lg grid-cols-2 gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
              {[
                ['12', 'countries served directly'],
                ['77', 'districts inside Nepal'],
                ['Air + sea', 'on every major lane'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-extrabold text-[#ffda16]">{value}</dt>
                  <dd className="mt-1 text-xs leading-5 text-slate-300">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Tracking is the most-used thing on the site, so it sits in the
              hero rather than below the fold. */}
          <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="display-sm text-[#242344]">Where is your shipment?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter the tracking number from your receipt. Anyone holding the number can
              follow it — share it with the person receiving.
            </p>
            <form action="/tracking" className="mt-5 grid gap-3">
              <label htmlFor="home-tracking" className="sr-only">
                Tracking number
              </label>
              <input
                id="home-tracking"
                name="id"
                required
                maxLength={100}
                className="field"
                placeholder="e.g. MNL4F2A9C1B7"
              />
              <button className="action w-full">
                Track shipment <FaArrowRight aria-hidden="true" />
              </button>
            </form>
            <p className="mt-4 text-xs text-slate-600">
              No account needed.{' '}
              <Link href="/tracking" className="font-semibold text-teal-700 hover:underline">
                What the statuses mean
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* A single line under the hero: a cut-off date, a seasonal rate, a
          service change. Nothing when there is nothing to say. */}
      <AdSlot placement="home_strip" path="/" variant="strip" />

      {/* ── Where we ship ────────────────────────────────────────────── */}
      <section className="section container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="kicker mb-4">Where we ship</p>
            <h2 className="display-sm max-w-xl">Out of Nepal, and home to it.</h2>
            <p className="mt-4 max-w-2xl leading-8 text-slate-600">
              Each destination has its own page covering what can be sent, the paperwork
              customs will want, and what the person at the other end should expect —
              written separately for sending out and for sending home.
            </p>
          </div>
          <Link href="/shipping" className="font-semibold text-teal-700 hover:underline">
            All destinations →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {REGIONS.map((region) => (
            <div key={region.label} className="card-lift p-6">
              <h3 className="text-lg font-bold">{region.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{region.blurb}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {region.slugs.map((slug) => {
                  const corridor = bySlug.get(slug);
                  if (!corridor) return null;
                  return (
                    <li key={slug}>
                      <Link href={`/shipping/nepal-to-${slug}`} className="chip hover:underline">
                        {corridor.country}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────── */}
      <section className="surface-tint border-y border-slate-200">
        <div className="section container">
          <p className="kicker mb-4">What we move</p>
          <h2 className="display-sm max-w-xl">Every kind of shipping, one operator.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, body, href }) => (
              <Link key={title} href={href} className="card-lift p-6">
                <Icon className="mb-5 text-2xl text-teal-700" aria-hidden="true" />
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </Link>
            ))}
          </div>
          <Link href="/services" className="mt-8 inline-block font-semibold text-teal-700 hover:underline">
            Compare all services →
          </Link>
        </div>
      </section>

      {/* Offers sit after the services grid: by here a visitor knows what we
          do, which is the point at which a seasonal rate means something. */}
      <AdSlot
        placement="home_offers"
        path="/"
        variant="cards"
        heading="Seasonal offers, straight from us."
      />

      {/* ── How it works, from the managed content ───────────────────── */}
      {page.sections.length > 0 && (
        <section className="section container">
          <p className="kicker mb-4">How it works</p>
          <h2 className="display-sm mb-10 max-w-xl">{page.heading}</h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {page.sections.map((section, i) => (
              <li key={section.heading}>
                <span className="text-sm font-bold text-teal-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-bold">{section.heading}</h3>
                <p className="mt-2 leading-7 text-slate-600">{section.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Assurances ───────────────────────────────────────────────── */}
      <section className="surface-deep">
        <div className="section container grid gap-10 md:grid-cols-3">
          {ASSURANCES.map(([title, body]) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-[#ffda16]">{title}</h2>
              <p className="mt-3 leading-7 text-slate-200">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What customers said ──────────────────────────────────────
          Straight after the assurances, which is where a claim wants
          somebody other than us backing it up. Renders nothing at all until
          a review has been approved, so the assurances meet the domestic
          block directly while the list is empty. */}
      <HomeReviews />

      {/* ── Domestic, as the feeder network ──────────────────────────── */}
      <section className="section container">
        <div className="card-lift grid gap-8 p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
          <div>
            <FaTruck className="mb-5 text-2xl text-teal-700" aria-hidden="true" />
            <h2 className="display-sm">Inside Nepal, all 77 districts.</h2>
            <p className="mt-4 max-w-xl leading-8 text-slate-600">
              The same network that feeds our international lanes delivers domestically —
              next day across the Kathmandu Valley and the highway cities, on scheduled
              runs into the hills and the mountain districts. Cash on delivery is
              available for online sellers.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/courier" className="action">
                District coverage <FaArrowRight aria-hidden="true" />
              </Link>
              <Link href="/business" className="action action-outline">
                For online sellers
              </Link>
            </div>
          </div>
          <div className="grid content-start gap-3 text-sm">
            {[
              ['Kathmandu Valley', 'Same day and next day'],
              ['Highway cities', 'Next day on the overnight lane'],
              ['District headquarters', '2–4 working days'],
              ['Mountain districts', 'Scheduled runs, air where there is no road'],
            ].map(([zone, eta]) => (
              <div key={zone} className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="font-semibold text-slate-800">{zone}</span>
                <span className="text-right text-slate-600">{eta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
