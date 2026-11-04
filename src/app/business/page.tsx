import Link from "next/link";

import { Badge, Card } from "@/components/kit";
import {
  Bullets,
  CallToAction,
  ContactLine,
  PageShell,
  Prose,
  Section,
  Steps,
  ToConfirm,
} from "@/components/seo/pages";
import { buildMetadata, siteUrl } from "@/lib/content";
import { service } from "@/lib/seo/jsonld";

const PATH = "/business";

const TITLE = "Courier for online sellers and businesses | Moonlight Freight";
const DESCRIPTION =
  "Cash on delivery, bulk booking, scheduled pickups, cash remittance and an API for your storefront. Delivery built for Nepali e-commerce sellers and merchants.";

/**
 * `noindex` until the bracketed gaps on this page are filled.
 *
 * The page still carries [TO CONFIRM] markers where a commercial fact
 * belongs, and those render to the public. Half-written content indexed
 * under a twenty-year-old company's name costs more than a page Google
 * has not found yet, and the flag comes off in one line once the figures
 * are in. See CONTENT-TO-CONFIRM.md.
 */
export const generateMetadata = () =>
  buildMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, noindex: true });

const PILLARS = [
  {
    title: "Cash on delivery",
    body: "Most orders in Nepal are still paid at the door. We collect on your behalf and remit the cash back to you on an agreed cycle, with every collection reconciled to its order.",
  },
  {
    title: "Bulk booking",
    body: "Upload a day's orders at once instead of filling in a form for each one. Labels come back ready to print, and the manifest is handed over in a single scan at pickup.",
  },
  {
    title: "An API for your storefront",
    body: "Create shipments, fetch rates and read tracking status straight from your own system, so your customers see live status without anyone re-keying anything.",
  },
  {
    title: "Scheduled pickups",
    body: "A rider comes to your shop, warehouse or home on a standing schedule. No daily phone calls, no trips to a counter.",
  },
  {
    title: "One dashboard",
    body: "Every shipment, its status, its COD amount and its remittance state in one place, with the history you need when a customer asks where their order is.",
  },
  {
    title: "A person who knows your account",
    body: "For anything exceptional — a disputed delivery, a returned order, a festival-season surge — you talk to someone who already knows how you ship.",
  },
];

export default function Page() {
  return (
    <PageShell
      trail={[
        { name: "Home", path: "/" },
        { name: "For business", path: PATH },
      ]}
      eyebrow="For merchants and sellers"
      title="Delivery that fits how you actually sell"
      intro="Online selling in Nepal runs on cash at the door, same-day expectations and thin margins. We built our merchant service around those three facts: collect the cash, move the parcel, remit the money, and give your system a way to talk to ours."
      jsonLd={[
        service(siteUrl, {
          name: "Business and e-commerce courier service",
          description:
            "Cash on delivery, bulk booking, scheduled pickups, cash remittance and API integration for merchants and online sellers in Nepal.",
          path: PATH,
          serviceType: "E-commerce fulfilment and courier service",
        }),
      ]}
    >
      <Section
        id="what-you-get"
        title="What a merchant account gives you"
        lede="Six things that a counter booking does not."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <li key={pillar.title}>
              <Card padding="sm" className="h-full">
                <h3 className="text-base font-bold text-[color:var(--brand-navy)]">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-[15px] leading-7 text-slate-700">{pillar.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="cod"
        title="Cash on delivery, and getting your money back fast"
        lede="The part of e-commerce in Nepal that decides whether a business works."
      >
        <Prose>
          <p>
            We collect the order value from your customer at the door and credit it to your
            account against that shipment. You see each collection in the dashboard as it
            happens, so your reconciliation is a check rather than an investigation.
          </p>
          <p>
            Remittance runs on a fixed cycle so you can plan cash flow around it, and arrives as
            one payment with a statement you can match line by line against your own orders.{" "}
            <ToConfirm>the COD remittance cycle and payout cut-off</ToConfirm>{" "}
            <ToConfirm>the COD collection charge, as a percentage or flat fee</ToConfirm>
          </p>
          <p>
            Returns and refused deliveries are handled against the same record, so a failed
            order does not become a missing one.{" "}
            <ToConfirm>the charge for a return to origin on a refused COD order</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="bulk"
        title="Bulk booking"
        lede="Built for the hour before dispatch, not for a single parcel."
      >
        <Bullets
          items={[
            "Create a batch of shipments in one go instead of one form at a time.",
            "Print labels for the whole batch, in order, so packing and labelling stay in step.",
            "Hand over against a single manifest: one scan at pickup, one record on both sides.",
            "See the whole batch's status in one view the next morning, rather than chasing tracking numbers individually.",
          ]}
        />
        <Prose>
          <p>
            Pricing for volume is agreed per account rather than published, because what a
            seller shipping across the valley needs is not what a seller shipping nationwide
            needs. <ToConfirm>volume thresholds and the discount structure that applies at each</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="api"
        title="Connect your storefront"
        lede="If your orders live in a system, your shipments should start there too."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card padding="sm">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-[color:var(--brand-navy)]">
                Create a shipment from your own checkout
              </h3>
              <Badge tone="teal">API</Badge>
            </div>
            <p className="mt-2 text-[15px] leading-7 text-slate-700">
              Push an order to us the moment it is confirmed, get a tracking number back, and
              show it to your customer in your own order page.
            </p>
          </Card>
          <Card padding="sm">
            <h3 className="text-base font-bold text-[color:var(--brand-navy)]">
              Rates and status, live
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-700">
              Quote delivery at checkout from real rates, and keep order status current without
              anyone copying a tracking number between two screens.
            </p>
          </Card>
        </div>
        <Prose>
          <p>
            Integration starts with an API key, which you create yourself in the dashboard at{" "}
            <Link
              className="font-semibold text-[color:var(--brand-navy)] underline"
              href="/dashboard/api-keys"
            >
              API keys
            </Link>
            . Keys are issued per account, and a key should be stored on your server rather than
            in anything a browser can read.
          </p>
          <p>
            <ToConfirm>the public URL of the API reference, the endpoints a merchant may call, and any rate limits</ToConfirm>{" "}
            <ToConfirm>which storefront platforms have a ready-made plugin, if any</ToConfirm>
          </p>
          <p>
            If you have a developer, send them to us and we will get the first shipment created
            from your system in a single session.
          </p>
        </Prose>
      </Section>

      <Section
        id="pickups"
        title="Scheduled pickups"
        lede="The rider comes to you, on a schedule you set."
      >
        <Prose>
          <p>
            Tell us the days and the window, and a rider arrives against a standing booking.
            For seasonal peaks — Dashain, Tihar, a campaign week — we add capacity to the
            schedule in advance rather than reacting on the day, provided you tell us it is
            coming.
          </p>
          <p>
            <ToConfirm>daily pickup cut-off times by area, and the minimum daily volume for a standing pickup</ToConfirm>{" "}
            <ToConfirm>which districts standing pickups currently cover</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="getting-started"
        title="Getting started"
        lede="Four steps, and the first one takes a phone call."
      >
        <Steps
          items={[
            "Talk to us about what you ship, where, and how much of it. That conversation is what sets your rates and your pickup schedule.",
            <>
              Open an account. <ToConfirm>the documents required to open a merchant account — registration, PAN, bank details</ToConfirm>
            </>,
            <>
              Create an API key at{" "}
              <Link className="font-semibold underline" href="/dashboard/api-keys">
                /dashboard/api-keys
              </Link>{" "}
              if you are integrating, or start with bulk booking in the dashboard if you are
              not.
            </>,
            "Ship a first batch, check the remittance lands as expected, and scale from there.",
          ]}
        />
      </Section>

      <Section
        id="who-this-suits"
        title="Who this is built for"
        lede="If one of these is you, the account pays for itself quickly."
      >
        <Bullets
          items={[
            "Instagram and Facebook sellers shipping daily across the valley, taking cash at the door.",
            "Online stores on their own platform that want delivery quoted and booked inside their own checkout.",
            "Wholesalers and distributors sending regular consignments to the same districts.",
            "Exporters sending handicrafts, pashmina, tea or coffee to customers abroad, who need the customs paperwork handled properly.",
            "Offices and clinics with a steady flow of documents and samples that should not be booked one at a time.",
          ]}
        />
        <Prose>
          <p>
            Not sure which of those you are? Tell us what a normal week looks like and we will
            tell you honestly whether an account helps or whether counter booking is still
            cheaper for you.
          </p>
        </Prose>
        <ContactLine />
      </Section>

      <CallToAction
        title="Let's work out what this costs for your volume"
        body="Rates for merchant accounts are set against what you actually ship, so the useful next step is a short conversation rather than a price list. Tell us your volume, your districts and whether you need COD, and we will come back with numbers."
        primary={{ href: "/contact", label: "Talk to our business team" }}
        secondary={{ href: "/pricing", label: "See standard pricing" }}
      />
    </PageShell>
  );
}
