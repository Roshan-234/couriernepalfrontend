import Link from "next/link";

import { Card } from "@/components/kit";
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

const PATH = "/customs-guide";

const TITLE = "Customs guide for shipping from Nepal | Moonlight Freight";
const DESCRIPTION =
  "How customs works on a parcel sent from Nepal: declarations, commercial invoices, HS codes, who pays duty, why shipments are held, and how to get one released.";

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

export default function Page() {
  return (
    <PageShell
      trail={[
        { name: "Home", path: "/" },
        { name: "Customs guide", path: PATH },
      ]}
      eyebrow="International shipping"
      title="A plain guide to customs"
      intro="Customs is where most international parcels lose their time, and almost always for the same reason: a declaration that does not say clearly what is inside and what it is worth. This page explains what the paperwork is for, who pays what, and how to keep a shipment moving."
      jsonLd={[
        service(siteUrl, {
          name: "Customs documentation support",
          description:
            "Help preparing declarations, commercial invoices and supporting documents for parcels and cargo sent from Nepal.",
          path: PATH,
          serviceType: "Customs documentation and international courier",
        }),
      ]}
    >
      <Section
        id="what-customs-does"
        title="What customs is actually doing"
        lede="Two authorities look at every international parcel, and they want different things."
      >
        <Prose>
          <p>
            On the way out, Nepali customs checks that what you are sending is legal to export
            and correctly described. On the way in, the destination&apos;s customs authority
            decides three things: whether the goods may enter at all, how they should be
            classified, and how much duty and tax is owed on them. Nothing in that second
            decision is ours to make, and no courier can overrule it.
          </p>
          <p>
            Everything else on this page follows from that. The declaration is the only thing
            an officer has to go on. Make it accurate and specific, and most parcels pass
            without anyone touching them. Make it vague — &quot;gift&quot;, &quot;samples&quot;,
            &quot;personal items&quot; — and you have invited an inspection.
          </p>
        </Prose>
      </Section>

      <Section
        id="documents"
        title="The documents a shipment travels on"
        lede="Which ones you need depends on whether the shipment is commercial, and on the destination."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Customs declaration",
              body: "Travels with every international parcel. Lists each item, its quantity, its material or composition, its value, and the country it was made in.",
            },
            {
              title: "Commercial invoice",
              body: "Required when goods are sold, or sent for a business purpose. It is the document the destination assesses duty against, so the values on it must be real.",
            },
            {
              title: "Packing list",
              body: "Needed once a shipment runs to several pieces. It lets an officer check a box without opening all of them.",
            },
            {
              title: "Certificate of origin",
              body: "Proves where goods were produced. Some destinations require it; some preferential duty rates depend on it.",
            },
            {
              title: "Export permit or clearance",
              body: "Required for controlled categories — cultural property, some plant and animal material, certain commercial exports.",
            },
            {
              title: "Recipient identification",
              body: "Many countries will not release a shipment until the recipient has given customs their tax or identity number. Warn the person receiving it.",
            },
          ].map((doc) => (
            <Card key={doc.title} padding="sm" className="h-full">
              <h3 className="text-base font-bold text-[color:var(--brand-navy)]">{doc.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-700">{doc.body}</p>
            </Card>
          ))}
        </div>
        <Prose>
          <p>
            We prepare and lodge what the carrier and the route require, and we will tell you
            exactly which documents your shipment needs when you book.{" "}
            <ToConfirm>which documents we prepare on the customer&rsquo;s behalf, which the sender must supply, and any charge for documentation or brokerage</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="declaring"
        title="How to describe and value the contents"
        lede="The single highest-leverage thing you can do for your own shipment."
      >
        <Bullets
          items={[
            <>
              <strong>Be specific, not generic.</strong> Not &quot;clothes&quot; but
              &quot;2 men&rsquo;s cotton shirts&quot;. Not &quot;handicraft&quot; but
              &quot;1 hand-woven wool pashmina shawl&quot;. An officer who can picture the item
              does not need to open the box.
            </>,
            <>
              <strong>Declare the real value.</strong> Under-declaring to reduce duty is fraud
              in the destination country, and it also caps what anyone can compensate you for if
              the parcel is lost. Both consequences land on the sender.
            </>,
            <>
              <strong>Say what it is made of and where it was made.</strong> Classification —
              and therefore the duty rate — often turns on the material.
            </>,
            <>
              <strong>Include an HS code where you can.</strong> The Harmonised System code is
              the international classification number for a product. Commercial shippers should
              put it on the invoice; for a one-off gift it is usually not needed.
            </>,
            <>
              <strong>Count a gift as a gift only when it really is one.</strong> Gift
              allowances exist in some destinations, they are narrow, and goods bought for
              resale do not qualify however they are labelled.
            </>,
          ]}
        />
      </Section>

      <Section
        id="duty"
        title="Who pays duty and tax"
        lede="Normally the recipient, and normally before the parcel is released."
      >
        <Prose>
          <p>
            Duty and import tax are a charge the destination government levies on the person
            receiving the goods. The usual sequence is that customs assesses the shipment, the
            carrier or its agent notifies the recipient, and the parcel is released once the
            charge is paid. A recipient who is not expecting that call is the second most common
            cause of delay, after a bad declaration.
          </p>
          <p>
            How much is owed depends on the classification of the goods, their declared value,
            sometimes the freight cost, and the destination&apos;s own thresholds and exemptions
            — which differ by country and change from time to time. We do not publish rates
            here, because a number that is wrong is worse than no number at all.{" "}
            <ToConfirm>duty-free or de minimis thresholds per destination corridor, if the company wants them published</ToConfirm>
          </p>
          <p>
            Some corridors allow the sender to pay duty instead of the recipient.{" "}
            <ToConfirm>whether delivered-duty-paid billing is offered, on which corridors, and what it costs</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="held"
        title="Why shipments get held — and what to do"
        lede="A hold is usually administrative. It is fixed with information, not with pressure."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "The description is too vague",
              body: "Customs asks for a better one. Reply with specifics — the item, the material, the purpose — and the hold normally clears.",
            },
            {
              title: "The value looks wrong",
              body: "An officer who does not believe a declared value will ask for proof. A receipt, an order confirmation or an invoice settles it.",
            },
            {
              title: "Duty is unpaid",
              body: "The parcel sits until the recipient pays. Make sure the phone number and email on the shipment reach them.",
            },
            {
              title: "A document is missing",
              body: "An identity or tax number, a licence, a certificate of origin. The recipient usually has to provide these themselves.",
            },
            {
              title: "The goods are restricted at that destination",
              body: "Rules differ by country. This is the hold that may not clear, which is why the question belongs before you ship.",
            },
            {
              title: "Random inspection",
              body: "A proportion of parcels are opened for no reason other than selection. Nothing is wrong; it costs time.",
            },
          ].map((item) => (
            <Card key={item.title} padding="sm" className="h-full">
              <h3 className="text-base font-bold text-[color:var(--brand-navy)]">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-700">{item.body}</p>
            </Card>
          ))}
        </div>
        <Prose>
          <p>
            Storage charges can accrue while a shipment is held at the destination, and a
            shipment that is never cleared is eventually returned or disposed of under the
            destination&apos;s rules.{" "}
            <ToConfirm>how destination storage, return freight and abandonment are billed back to the sender</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="exporting"
        title="If you are exporting commercially from Nepal"
        lede="A business shipment has obligations a personal parcel does not."
      >
        <Steps
          items={[
            "Make sure the business is registered for export and has the registrations the Department of Customs requires before the first shipment, not on the day of it.",
            "Invoice properly: buyer, seller, incoterm, currency, unit values, HS codes, and a total that matches what the buyer is paying.",
            "Check the destination's import rules for your product category before you produce for it — labelling, certification and testing requirements catch out first-time exporters more often than duty does.",
            <>
              Talk to us about the route. What is quickest for one shipment is not what is
              cheapest for twenty, and our{" "}
              <Link className="font-semibold text-[color:var(--brand-navy)] underline" href="/shipping">
                shipping options
              </Link>{" "}
              differ in how they handle clearance.
            </>,
          ]}
        />
        <Prose>
          <p>
            <ToConfirm>what export documentation assistance we provide to commercial shippers, and whether it is chargeable</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section id="help" title="Talk to someone who does this daily">
        <Prose>
          <p>
            Customs questions are specific: this item, this value, this country, this month.
            A general page cannot answer them, and we would rather you asked than guessed.
          </p>
        </Prose>
        <ContactLine />
      </Section>

      <CallToAction
        title="Sending something abroad?"
        body="Tell us the destination and what is inside, and we will tell you which documents the shipment needs, what the recipient should expect to be asked for, and which service suits it."
        primary={{ href: "/contact", label: "Get customs advice" }}
        secondary={{ href: "/prohibited-items", label: "Check restricted items" }}
      />
    </PageShell>
  );
}
