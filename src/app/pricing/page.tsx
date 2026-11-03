import Link from 'next/link';
import PricingCalculator from '@/components/common/PricingCalculator';
import PageIntro from '@/components/common/PageIntro';
import JsonLd from '@/components/seo/JsonLd';
import { getPage, buildMetadata, siteUrl } from '@/lib/content';
import { breadcrumbs, faqPage } from '@/lib/seo/jsonld';
import { ZONE_LABELS } from '@/lib/seo/districts';

/**
 * The calculator is a client component, so a crawler arriving here used to
 * find a heading and an empty panel — on a page targeting "courier charge in
 * Nepal". Everything below the calculator is server-rendered and explains how
 * a price is actually arrived at.
 *
 * No rupee figures appear here on purpose. The tariff lives in the database
 * and operations change it; a number hard-coded into the page would quietly
 * start contradicting the quote beside it. What is described instead is the
 * method, which does not change.
 */

export const generateMetadata = () =>
  buildMetadata({
    title: 'Courier Charges & Shipping Rates in Nepal',
    description:
      'Work out what a parcel costs to send. How weight, size, distance and '
      + 'cash on delivery affect the price, and an instant quote for domestic '
      + 'and international shipping from Nepal.',
    path: '/pricing',
  });

const FACTORS = [
  {
    title: 'Chargeable weight, not just actual weight',
    body:
      'A parcel is charged on whichever is greater: what it weighs on the scale, or its '
      + 'volumetric weight — length × width × height in centimetres, divided by 5,000. A large, '
      + 'light box takes the same space on a vehicle as a small heavy one, so it is priced on '
      + 'the space it occupies. Measure the box, not just the contents.',
  },
  {
    title: 'Where it is going',
    body:
      'Domestic rates are banded by delivery zone rather than by kilometre, because what drives '
      + 'cost in Nepal is road access, not distance. A parcel from Kathmandu to Pokhara travels '
      + 'a sealed highway; one to Humla may finish its journey by air.',
  },
  {
    title: 'How fast you need it',
    body:
      'Express moves on the first available run and costs more than standard. For most domestic '
      + 'routes the difference in transit time is a day or two; on remote lanes it can be longer, '
      + 'because departures are scheduled rather than daily.',
  },
  {
    title: 'Cash on delivery',
    body:
      'If we collect payment from the recipient, a handling fee applies as a small percentage of '
      + 'the amount collected, with a minimum charge. The money is reconciled and remitted to the '
      + 'sender on a settlement cycle.',
  },
  {
    title: 'Declared value and insurance',
    body:
      'Declaring the value of the contents is what sets the basis for any claim. Optional cover '
      + 'is charged as a percentage of that declared value. Under-declaring to save on cover also '
      + 'caps what can be claimed if something goes wrong.',
  },
  {
    title: 'VAT and surcharges',
    body:
      'Nepal’s 13% VAT applies to the taxable portion of the charge. Specific surcharges may apply '
      + 'for remote delivery, fragile handling, oversize parcels or weekend delivery — each one is '
      + 'shown as its own line on the quote rather than folded into the base price.',
  },
];

const FAQ = [
  {
    question: 'How is courier charge calculated in Nepal?',
    answer:
      'On chargeable weight — the greater of actual weight and volumetric weight (length × width × '
      + 'height ÷ 5,000) — combined with the delivery zone of the origin and destination, the '
      + 'service level chosen, and any surcharges such as cash-on-delivery handling or remote '
      + 'delivery. VAT is added to the taxable portion.',
  },
  {
    question: 'Why is my large but light parcel expensive?',
    answer:
      'Because it is priced on volumetric weight. A box measuring 60 × 40 × 40 cm has a volumetric '
      + 'weight of 19.2 kg regardless of what is inside it, since that is the space it takes on the '
      + 'vehicle. Packing the same goods into a smaller box lowers the charge.',
  },
  {
    question: 'Is the quote from the calculator final?',
    answer:
      'It is accurate for the weight and dimensions you enter. If the parcel measures differently '
      + 'when it is scanned at the branch, the charge is recalculated on the measured figures.',
  },
  {
    question: 'Do you offer contract rates for businesses?',
    answer:
      'Yes. Regular shippers and online sellers can be put on a contract rate card that replaces '
      + 'list pricing, with cash-on-delivery remittance on an agreed cycle. Get in touch to arrange it.',
  },
];

export default async function Page() {
  const page = await getPage('/pricing');

  return (
    <div className="container max-w-3xl py-16 sm:py-20">
      <JsonLd
        data={[
          breadcrumbs(siteUrl, [
            { name: 'Home', path: '/' },
            { name: 'Pricing', path: '/pricing' },
          ]),
          faqPage(FAQ),
        ]}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
        <Link href="/" className="hover:text-teal-700">Home</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span aria-current="page" className="font-medium text-slate-800">Pricing</span>
      </nav>

      <PageIntro page={page} />

      <div className="panel">
        <PricingCalculator />
      </div>

      <section className="mt-14" aria-labelledby="factors">
        <h2 id="factors" className="text-2xl font-bold">What decides the price</h2>
        <div className="mt-6 grid gap-6">
          {FACTORS.map((factor) => (
            <div key={factor.title} className="panel p-6">
              <h3 className="font-semibold text-slate-800">{factor.title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{factor.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="zones">
        <h2 id="zones" className="text-2xl font-bold">Delivery zones</h2>
        <p className="mt-3 leading-7 text-slate-600">
          Every one of Nepal’s 77 districts sits in one of four zones, and the zone sets both the
          price band and the expected transit time.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {Object.entries(ZONE_LABELS).map(([code, zone]) => (
            <div key={code} className="panel p-5">
              <dt className="font-semibold text-slate-800">{zone.label}</dt>
              <dd className="mt-1 text-sm text-slate-600">{zone.eta}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-slate-600">
          See which zone your district falls in on the{' '}
          <Link href="/courier" className="font-medium text-teal-700 hover:underline">
            district coverage pages
          </Link>
          , or check{' '}
          <Link href="/shipping" className="font-medium text-teal-700 hover:underline">
            international destinations
          </Link>
          .
        </p>
      </section>

      <section className="mt-12" aria-labelledby="pricing-faq">
        <h2 id="pricing-faq" className="text-2xl font-bold">Common questions about cost</h2>
        <dl className="mt-6 grid gap-6">
          {FAQ.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold text-slate-800">{item.question}</dt>
              <dd className="mt-1 leading-7 text-slate-600">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-10 text-slate-600">
        Ready to send?{' '}
        <Link href="/dashboard/create-shipment" className="font-medium text-teal-700 hover:underline">
          Book a shipment
        </Link>{' '}
        or{' '}
        <Link href="/contact" className="font-medium text-teal-700 hover:underline">
          ask us for a tailored quote
        </Link>
        .
      </p>
    </div>
  );
}
