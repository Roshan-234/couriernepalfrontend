import Link from 'next/link';
import TrackingInput from '@/components/tracking/TrackingInput';
import TrackingResult from '@/components/tracking/TrackingResult';
import PageIntro from '@/components/common/PageIntro';
import JsonLd from '@/components/seo/JsonLd';
import { getPage, buildMetadata, siteUrl } from '@/lib/content';
import { breadcrumbs, faqPage } from '@/lib/seo/jsonld';
import { BUSINESS } from '@/lib/seo/business';
import { STATUS_LABELS } from '@/components/kit';
import type { ShipmentStatus } from '@/types/logistics';

/**
 * "Track courier nepal" is the highest-intent query this site gets, and the
 * page was previously blocked three ways at once: disallowed in robots.txt,
 * `noindex` in its metadata, and an `X-Robots-Tag` from the middleware. All
 * three are gone, so the page now has to be worth landing on — an empty
 * input box ranks for nothing and helps nobody whose parcel is late.
 *
 * Nothing private is exposed: results are fetched client-side only after a
 * visitor types a tracking number, so a crawler sees the explanatory page.
 */
export const generateMetadata = () =>
  buildMetadata({
    // Written for the query rather than taken from the managed copy, which
    // is phrased for the page body.
    title: 'Track Your Parcel in Nepal',
    description:
      'Enter your Moonlight Freight tracking number to see where your parcel is, '
      + 'what each delivery status means, and what to do if it has not moved.',
    path: '/tracking',
  });

/** The journey a parcel takes, in the order a customer sees it. */
const JOURNEY: { status: ShipmentStatus; meaning: string }[] = [
  { status: 'pending', meaning: 'We have your booking and the parcel is waiting to be collected.' },
  { status: 'picked_up', meaning: 'A rider has collected it from the sender.' },
  { status: 'at_origin_branch', meaning: 'It has reached the branch it was booked at and is being sorted.' },
  { status: 'in_transit', meaning: 'It is moving between branches, by road or by air.' },
  { status: 'at_destination_branch', meaning: 'It has arrived in the destination district.' },
  { status: 'out_for_delivery', meaning: 'A rider has it today and will attempt delivery.' },
  { status: 'delivered', meaning: 'It was handed over. The timeline records who received it.' },
];

/** The ones that mean something needs attention. */
const EXCEPTIONS: { status: ShipmentStatus; meaning: string }[] = [
  { status: 'delivery_attempted', meaning: 'Nobody was available, the address was wrong, or the recipient could not pay the cash-on-delivery amount. We try again.' },
  { status: 'customs_hold', meaning: 'An international parcel is waiting on customs clearance or paperwork.' },
  { status: 'on_hold', meaning: 'Movement has paused — weather, a road closure, or a query on the address.' },
  { status: 'returned', meaning: 'After repeated failed attempts the parcel went back to the sender.' },
];

const FAQ = [
  {
    question: 'Where do I find my tracking number?',
    answer:
      'It is on the receipt given at booking and in the confirmation message sent to the '
      + 'sender. Moonlight Freight tracking numbers begin with MNL followed by nine characters.',
  },
  {
    question: 'My tracking number is not found. What now?',
    answer:
      'A number usually becomes active within a few hours of booking, once the parcel has been '
      + 'scanned at a branch. If it still shows nothing the next day, call us on '
      + `${BUSINESS.telephone} with the receipt to hand.`,
  },
  {
    question: 'The status has not changed for several days. Is my parcel lost?',
    answer:
      'Usually not. Parcels to remote districts move on scheduled runs and can sit at a hub '
      + 'between them, and weather or road closures hold up hill routes. If a domestic parcel '
      + 'has not moved in three working days, contact us and we will trace it.',
  },
  {
    question: 'Can the person receiving it track the parcel too?',
    answer:
      'Yes. Tracking is open to anyone holding the number, so the sender can share it with the '
      + 'recipient. No personal details of either party are shown on the public tracking page.',
  },
  {
    question: 'Do I need an account to track a shipment?',
    answer: 'No. The tracking number alone is enough. An account is only needed to book and manage shipments.',
  },
];

export default async function Page() {
  const page = await getPage('/tracking');
  const label = (status: ShipmentStatus) => STATUS_LABELS[status] ?? status;

  return (
    <div className="container max-w-4xl py-16 sm:py-20">
      <JsonLd
        data={[
          breadcrumbs(siteUrl, [
            { name: 'Home', path: '/' },
            { name: 'Track a parcel', path: '/tracking' },
          ]),
          faqPage(FAQ),
        ]}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
        <Link href="/" className="hover:text-teal-700">Home</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span aria-current="page" className="font-medium text-slate-800">Track a parcel</span>
      </nav>

      <PageIntro page={page} />

      <div className="mb-8">
        <TrackingInput />
      </div>
      <TrackingResult />

      <section className="panel mt-14 p-6 sm:p-8" aria-labelledby="journey">
        <h2 id="journey" className="text-2xl font-bold">What each status means</h2>
        <p className="mt-3 text-slate-600">
          A parcel is scanned at each handover, and the timeline above shows every scan with the
          place and time it happened.
        </p>
        <ol className="mt-6 grid gap-4">
          {JOURNEY.map((step, index) => (
            <li key={step.status} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-slate-800">{label(step.status)}</h3>
                <p className="text-slate-600">{step.meaning}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel mt-8 p-6 sm:p-8" aria-labelledby="exceptions">
        <h2 id="exceptions" className="text-2xl font-bold">When something has gone wrong</h2>
        <dl className="mt-6 grid gap-5">
          {EXCEPTIONS.map((item) => (
            <div key={item.status}>
              <dt className="font-semibold text-slate-800">{label(item.status)}</dt>
              <dd className="text-slate-600">{item.meaning}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-slate-600">
          If a status does not look right, call{' '}
          <a href={BUSINESS.telephoneHref} className="font-medium text-teal-700 hover:underline">
            {BUSINESS.telephone}
          </a>{' '}
          or{' '}
          <Link href="/contact" className="font-medium text-teal-700 hover:underline">
            send us the tracking number
          </Link>
          . If the parcel was lost or damaged, you can raise a claim from your dashboard.
        </p>
      </section>

      <section className="panel mt-8 p-6 sm:p-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold">Tracking questions</h2>
        <dl className="mt-6 grid gap-6">
          {FAQ.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold text-slate-800">{item.question}</dt>
              <dd className="mt-1 text-slate-600">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-10 text-slate-600">
        Need to send something instead?{' '}
        <Link href="/pricing" className="font-medium text-teal-700 hover:underline">
          Check a price
        </Link>{' '}
        or see where we deliver across{' '}
        <Link href="/courier" className="font-medium text-teal-700 hover:underline">
          all 77 districts of Nepal
        </Link>
        .
      </p>
    </div>
  );
}
