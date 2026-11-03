import Link from "next/link";
import type { ReactNode } from "react";

import {
  CallToAction,
  ContactLine,
  DraftNotice,
  PageShell,
  Prose,
  Section,
  ToConfirm,
} from "@/components/seo/pages";
import { buildMetadata } from "@/lib/content";
import { BUSINESS } from "@/lib/seo/business";

const PATH = "/terms";

const TITLE = "Terms and conditions of carriage (draft) | Moonlight Freight";
const DESCRIPTION =
  "Draft terms and conditions of carriage for Moonlight Freight, pending the company's own legal review.";

/**
 * `noindex` is deliberate.
 *
 * This document has not been through the company's legal review and states no
 * figures that anyone has signed off. Until counsel has read it, it should not
 * be indexed, surfaced in search, or relied on by a customer; the flag comes
 * off in one line once it is approved.
 */
export const generateMetadata = () =>
  buildMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, noindex: true });

interface Clause {
  id: string;
  title: string;
  body: ReactNode;
}

const CLAUSES: Clause[] = [
  {
    id: "parties",
    title: "Who these terms are between",
    body: (
      <>
        <p>
          These terms govern the carriage of shipments by {BUSINESS.legalName} (&quot;we&quot;,
          &quot;us&quot;), whose registered office is at {BUSINESS.streetAddress},{" "}
          {BUSINESS.addressLocality}, Nepal, for the person or business that hands us a shipment
          (&quot;you&quot;, the sender).
        </p>
        <p>
          The sender contracts with us on their own behalf and on behalf of the recipient and
          anyone else with an interest in the shipment, and confirms they are entitled to do so.
        </p>
      </>
    ),
  },
  {
    id: "contract",
    title: "How a contract of carriage is formed",
    body: (
      <>
        <p>
          A contract comes into existence when we accept a shipment into our custody and issue a
          consignment note or booking reference for it. A quotation, an online estimate or a
          booking request is not by itself an acceptance.
        </p>
        <p>
          We may refuse any shipment, before or after booking, where it falls outside what we
          carry, where the declaration is incomplete or appears inaccurate, or where carriage
          would breach any law or any requirement of a carrier or authority on the route.
        </p>
      </>
    ),
  },
  {
    id: "your-obligations",
    title: "What the sender is responsible for",
    body: (
      <>
        <p>The sender is responsible for, and warrants that:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            the description of the contents, their quantity and their declared value are complete
            and accurate;
          </li>
          <li>the goods are lawful to send, to carry and to receive at the destination;</li>
          <li>
            the shipment is packed so as to withstand ordinary handling, stacking and transport
            — see our{" "}
            <Link className="font-semibold underline" href="/packing-guide">
              packing guide
            </Link>
            ;
          </li>
          <li>
            the recipient&apos;s name, address and contact number are correct and current;
          </li>
          <li>
            all documents required by customs or any other authority have been supplied and are
            accurate.
          </li>
        </ul>
        <p>
          Losses, fines, penalties and costs that arise because any of the above was not met are
          the sender&apos;s responsibility, including those we incur in dealing with them.
        </p>
      </>
    ),
  },
  {
    id: "prohibited",
    title: "Prohibited and restricted goods",
    body: (
      <>
        <p>
          The categories we refuse, and those we can carry only once clearance exists, are set
          out on our{" "}
          <Link className="font-semibold underline" href="/prohibited-items">
            prohibited and restricted items page
          </Link>
          , which forms part of these terms. That page describes categories, not every individual
          item, and does not replace the law of any country on the route.
        </p>
        <p>
          Where a prohibited item is found in a shipment, we may stop, return, surrender or
          dispose of it as the relevant authority requires, and the resulting costs fall to the
          sender. <ToConfirm>the charges applied in that situation and whether carriage already paid is forfeited</ToConfirm>
        </p>
      </>
    ),
  },
  {
    id: "charges",
    title: "Charges and payment",
    body: (
      <>
        <p>
          Charges are calculated on the chargeable weight — the greater of actual and volumetric
          weight — together with the destination, the service level and any surcharges applicable
          to the route. We may re-weigh and re-measure any shipment and adjust the charge to what
          is found.
        </p>
        <p>
          We accept {BUSINESS.paymentAccepted}. Payment terms, credit arrangements and any
          interest or fee on late payment are set out in the account agreement where one exists.{" "}
          <ToConfirm>standard payment terms, deposit requirements, and any late-payment charge</ToConfirm>
        </p>
        <p>
          Duties, taxes and charges levied by any authority are additional to our charges and are
          dealt with under the customs clause below.{" "}
          <ToConfirm>any fuel, remote-area, oversize, handling or administrative surcharges that should be disclosed here</ToConfirm>
        </p>
      </>
    ),
  },
  {
    id: "collection-delivery",
    title: "Collection, delivery and attempts",
    body: (
      <>
        <p>
          Delivery is made to the address on the consignment note, to the recipient or to any
          person at that address who appears authorised to accept it. A signature, electronic
          record or other proof of delivery we hold is evidence of delivery.
        </p>
        <p>
          Where delivery cannot be completed we attempt to contact the recipient, and may hold
          the shipment at a branch for collection or arrange a further attempt.{" "}
          <ToConfirm>number of delivery attempts included, how long a shipment is held, and any storage or redelivery charge</ToConfirm>
        </p>
        <p>
          Transit times quoted at booking are estimates based on normal conditions. They are not
          guaranteed unless we have agreed a guaranteed service in writing.{" "}
          <ToConfirm>whether any guaranteed or time-definite service is offered, and on what terms</ToConfirm>
        </p>
      </>
    ),
  },
  {
    id: "customs",
    title: "Customs, duties and taxes",
    body: (
      <>
        <p>
          Where we or our agents act in relation to customs clearance, we do so on behalf of the
          sender or the recipient. Duties, taxes and charges assessed by any authority are
          payable by the party the destination holds liable, normally the recipient, and the
          shipment is released only once they are settled.
        </p>
        <p>
          Where a charge is not paid by the party liable for it, the sender remains responsible
          for it. Our{" "}
          <Link className="font-semibold underline" href="/customs-guide">
            customs guide
          </Link>{" "}
          explains the process in plain terms.{" "}
          <ToConfirm>any documentation, brokerage or disbursement fee we charge, and whether duty can be billed to the sender</ToConfirm>
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Loss, damage and our liability",
    body: (
      <>
        <p>
          We take reasonable care of every shipment in our custody. Where a shipment is lost or
          damaged while in our care, our liability is limited in accordance with the limits
          stated below and with any international convention or national law that applies to the
          carriage in question.
        </p>
        <p>
          <ToConfirm>maximum liability per shipment, and per kilogram, for domestic carriage</ToConfirm>{" "}
          <ToConfirm>maximum liability per shipment for international carriage, and the convention relied on</ToConfirm>
        </p>
        <p>
          We are not liable for indirect or consequential loss — loss of profit, loss of a
          market, loss of opportunity — however it arises, nor for loss or damage caused by
          inadequate packing, inherent defect in the goods, inaccurate declaration, or the act of
          any authority.
        </p>
        <p>
          We do not accept liability for the categories of goods listed as excluded from
          carriage, nor for items carried under an agreed exception at the sender&apos;s risk.{" "}
          <ToConfirm>the list of goods carried entirely at the sender&rsquo;s risk</ToConfirm>
        </p>
      </>
    ),
  },
  {
    id: "claims",
    title: "Making a claim",
    body: (
      <>
        <p>
          A claim must be notified to us in writing, with the tracking number and sufficient
          detail to identify the shipment and the loss. Damage should be reported before the
          packaging is discarded, with photographs of the packaging and the contents as they were
          received.
        </p>
        <p>
          <ToConfirm>the period within which a claim must be notified, separately for visible damage, concealed damage, delay and non-delivery</ToConfirm>{" "}
          <ToConfirm>the documents required to support a claim, and the period within which we respond</ToConfirm>
        </p>
        <p>
          Charges owed to us remain payable while a claim is under consideration, and a claim may
          be set off against them on settlement.
        </p>
      </>
    ),
  },
  {
    id: "cover",
    title: "Additional cover",
    body: (
      <>
        <p>
          Our liability under these terms is not insurance of the goods. Where the value of a
          shipment exceeds the limits above, additional cover should be arranged before the
          shipment travels.
        </p>
        <p>
          <ToConfirm>whether we arrange or offer transit cover, what it costs, what it excludes, and the maximum value that can be covered</ToConfirm>
        </p>
      </>
    ),
  },
  {
    id: "undeliverable",
    title: "Shipments that cannot be delivered or returned",
    body: (
      <>
        <p>
          Where a shipment cannot be delivered and cannot be returned to the sender, we will try
          to reach both parties before taking any further step. After that we may store, return,
          sell or dispose of the goods, applying any proceeds against the charges owed.
        </p>
        <p>
          <ToConfirm>how long an undeliverable shipment is held before disposal, and how proceeds and remaining charges are handled</ToConfirm>
        </p>
      </>
    ),
  },
  {
    id: "inspection",
    title: "Our right to inspect",
    body: (
      <p>
        We, and any authority or carrier on the route, may open and inspect a shipment at any
        time without notice to the sender. Inspection is routine in international carriage and is
        not evidence that anything is wrong with a shipment.
      </p>
    ),
  },
  {
    id: "force-majeure",
    title: "Events outside our control",
    body: (
      <p>
        We are not liable for failure or delay caused by events beyond our reasonable control,
        including weather, landslide and road closure, earthquake, strike, civil disturbance,
        bandh, act of government, closure of airspace, failure of a third-party carrier, or
        interruption to communications or power.
      </p>
    ),
  },
  {
    id: "data",
    title: "Personal data",
    body: (
      <p>
        We process the personal details supplied with a shipment in order to carry it, to meet
        customs and regulatory obligations, and to contact the parties about it. How we handle
        that data is set out in our{" "}
        <Link className="font-semibold underline" href="/privacy">
          privacy policy
        </Link>
        .
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law and jurisdiction",
    body: (
      <>
        <p>
          These terms are governed by the law of Nepal, and the courts of Nepal have
          jurisdiction over any dispute arising from them, subject to any international
          convention that applies to the carriage in question.
        </p>
        <p>
          <ToConfirm>the dispute resolution route the company wants: courts at a named venue, or arbitration, and under which rules</ToConfirm>
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        The terms that apply to a shipment are those in force on the date we accept it. We may
        change these terms for future shipments by publishing a revised version on this page.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <PageShell
      trail={[
        { name: "Home", path: "/" },
        { name: "Terms and conditions", path: PATH },
      ]}
      eyebrow="Legal"
      title="Terms and conditions of carriage"
      intro="The terms on which we accept, carry and deliver a shipment. They are written to be read by the person signing the consignment note, not only by a lawyer."
      notice={
        <DraftNotice document="document">
          <p>
            In particular, every liability limit, claim window, charge and time period below is
            still blank. Nothing here states a figure the company has agreed to.
          </p>
        </DraftNotice>
      }
    >
      <Section id="contents" title="Contents">
        <ol className="grid max-w-[68ch] list-decimal gap-2 pl-5 text-[15px] leading-7 text-slate-700 sm:grid-cols-2">
          {CLAUSES.map((clause) => (
            <li key={clause.id}>
              <a className="underline hover:text-[color:var(--brand-navy)]" href={`#${clause.id}`}>
                {clause.title}
              </a>
            </li>
          ))}
        </ol>
      </Section>

      {CLAUSES.map((clause, index) => (
        <Section key={clause.id} id={clause.id} title={`${index + 1}. ${clause.title}`}>
          <Prose>{clause.body}</Prose>
        </Section>
      ))}

      <Section id="contact" title="Questions about these terms">
        <Prose>
          <p>
            If anything here is unclear, or you need the terms that apply to a shipment you have
            already sent, ask us in writing and we will answer in writing.
          </p>
        </Prose>
        <ContactLine />
      </Section>

      <CallToAction
        title="Need the terms for a specific shipment?"
        body="Because this page is a draft, the terms that govern a shipment today are the ones we confirm to you in writing at booking. Ask us and we will send them."
        primary={{ href: "/contact", label: "Contact us" }}
        secondary={{ href: "/refund-policy", label: "Read the refund policy" }}
      />
    </PageShell>
  );
}
