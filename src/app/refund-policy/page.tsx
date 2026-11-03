import Link from "next/link";

import {
  Bullets,
  CallToAction,
  ContactLine,
  DraftNotice,
  PageShell,
  Prose,
  Section,
  Steps,
  ToConfirm,
} from "@/components/seo/pages";
import { buildMetadata } from "@/lib/content";
import { BUSINESS } from "@/lib/seo/business";

const PATH = "/refund-policy";

const TITLE = "Refund and cancellation policy (draft) | Moonlight Freight";
const DESCRIPTION =
  "Draft refund, cancellation and claims policy for Moonlight Freight, pending the company's own legal review.";

/**
 * `noindex`, for the same reason as `/terms`.
 *
 * Every window, fee and timescale below is still an open question. A refund
 * policy that a customer could find in search and rely on before the company
 * has agreed its own numbers would be worse than no page at all.
 */
export const generateMetadata = () =>
  buildMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, noindex: true });

export default function Page() {
  return (
    <PageShell
      trail={[
        { name: "Home", path: "/" },
        { name: "Refund policy", path: PATH },
      ]}
      eyebrow="Legal"
      title="Refunds, cancellations and claims"
      intro="When money comes back to you, how to ask for it, and what we cannot refund. Read this with our terms of carriage, which govern what we are responsible for in the first place."
      notice={
        <DraftNotice document="policy">
          <p>
            Every window, fee and processing time below is still unset. Nothing on this page
            states a commitment the company has agreed to, and no customer should rely on it.
          </p>
        </DraftNotice>
      }
    >
      <Section
        id="scope"
        title="What this policy covers"
        lede="Three different things get called a refund, and they work differently."
      >
        <Bullets
          items={[
            <>
              <strong>A cancellation</strong> — you booked a shipment and no longer want it
              carried.
            </>,
            <>
              <strong>A billing correction</strong> — you were charged for something that was
              not provided, or charged incorrectly.
            </>,
            <>
              <strong>A claim</strong> — the shipment was lost, damaged or failed in a way that
              is covered by our{" "}
              <Link className="font-semibold underline" href="/terms">
                terms of carriage
              </Link>
              . A claim is compensation, not a refund, and it is assessed against those terms.
            </>,
          ]}
        />
        <Prose>
          <p>
            Cash collected on delivery for a merchant is none of these. It is money we hold on
            your behalf and remit on an agreed cycle, covered separately below.
          </p>
        </Prose>
      </Section>

      <Section
        id="cancellations"
        title="Cancelling a booking"
        lede="What you get back depends on how far the shipment has travelled through our process."
      >
        <Prose>
          <p>
            A booking cancelled before we have collected or accepted the shipment is the simple
            case: nothing has been carried, and the carriage charge is returned.{" "}
            <ToConfirm>the cut-off before collection after which a cancellation is no longer free, and any cancellation fee</ToConfirm>
          </p>
          <p>
            Once a shipment is in our custody, work has been done and third parties may already
            have been paid. A cancellation at that point is a request to return the goods to
            you, and the charge for that return, together with any charge already incurred, is
            deducted.{" "}
            <ToConfirm>what proportion of the carriage charge is refundable after collection, after departure from origin, and after arrival at destination</ToConfirm>
          </p>
          <p>
            A pickup that we fail to make, or a service we are unable to provide at all, is
            refunded in full.
          </p>
        </Prose>
      </Section>

      <Section
        id="what-is-not-refundable"
        title="What cannot be refunded"
        lede="Not because we are unwilling, but because the money is no longer ours to return."
      >
        <Bullets
          items={[
            "Duties, taxes and charges paid to a customs authority or any other government body. These are recovered, if at all, from that authority by the person who paid them.",
            "Charges for a service that was performed as agreed, including carriage that reached the destination.",
            "Costs caused by an incorrect or incomplete address, an unreachable recipient, or a declaration that proved inaccurate.",
            "Shipments stopped, seized or destroyed because they contained prohibited or restricted goods.",
            "Loss of value that is not the carriage charge — missed sales, missed deadlines, replacement costs — which are consequential losses and are excluded by the terms of carriage.",
          ]}
        />
        <Prose>
          <p>
            Where only part of a service failed, we look at the part that failed rather than
            refusing the whole request.{" "}
            <ToConfirm>which charge components are refundable on a partial failure: base carriage, surcharges, pickup, packing, documentation</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="delays"
        title="Delays"
        lede="A delay is not automatically refundable, and we would rather say so plainly."
      >
        <Prose>
          <p>
            Transit times quoted at booking are estimates. Weather, road closures, customs
            inspection and airline capacity all move them, and none of those is within our
            control. We do not refund a shipment for arriving later than an estimate.
          </p>
          <p>
            A guaranteed or time-definite service, where one has been agreed in writing, is a
            different matter: there the commitment is the product.{" "}
            <ToConfirm>whether a guaranteed service is offered, and what is refunded when the guarantee is missed</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="claims"
        title="Loss and damage claims"
        lede="Compensation is assessed under the terms of carriage, against evidence."
      >
        <Steps
          items={[
            "Tell us as soon as you notice, quoting the tracking number. Do not discard the packaging.",
            "Photograph the outer packaging, the inner packing and the damaged contents, as they arrived.",
            "Send us proof of the value — an invoice, receipt or order confirmation. A claim cannot be assessed against a declared value nobody can evidence.",
            "We investigate, including with any partner carrier involved, and tell you the outcome in writing.",
          ]}
        />
        <Prose>
          <p>
            <ToConfirm>the deadline for notifying a claim, measured from delivery or from the expected delivery date</ToConfirm>{" "}
            <ToConfirm>the maximum amount payable on a claim, and how it is calculated against declared value and weight</ToConfirm>{" "}
            <ToConfirm>how long we take to decide a claim and to pay an approved one</ToConfirm>
          </p>
          <p>
            Claims are paid to the person who contracted with us — normally the sender — unless
            we agree otherwise in writing.
          </p>
        </Prose>
      </Section>

      <Section
        id="cod"
        title="Cash on delivery remittance"
        lede="This is your money, held briefly, not a refund."
      >
        <Prose>
          <p>
            Where we collect cash from a recipient on a merchant&apos;s behalf, that cash is
            remitted to the merchant on the cycle set out in the account agreement, less the
            agreed service charges. A remittance that is late or short should be raised with
            your account contact immediately, with the shipment references attached.
          </p>
          <p>
            <ToConfirm>the COD remittance cycle, the cut-off for each payout, and the COD handling charge</ToConfirm>{" "}
            <ToConfirm>what happens to collected cash when a shipment is later disputed or returned</ToConfirm>
          </p>
          <p>
            How the service works day to day is described on the{" "}
            <Link className="font-semibold underline" href="/business">
              business page
            </Link>
            .
          </p>
        </Prose>
      </Section>

      <Section
        id="how-to-request"
        title="How to request a refund"
        lede="In writing, with the reference, so there is a record on both sides."
      >
        <Steps
          items={[
            <>
              Email{" "}
              <a className="font-semibold underline" href={`mailto:${BUSINESS.email}`}>
                {BUSINESS.email}
              </a>{" "}
              with the tracking number or booking reference in the subject line.
            </>,
            "Say what you are asking for — cancellation, billing correction or claim — and why, in a sentence or two.",
            "Attach the evidence: the receipt, the invoice, the photographs, whatever supports it.",
            "Give us a payment destination: the method you originally paid with, or bank details if a transfer is required.",
          ]}
        />
        <Prose>
          <p>
            We acknowledge requests in writing and tell you what happens next.{" "}
            <ToConfirm>our acknowledgement and decision timescales for refund requests</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="how-paid"
        title="How an approved refund is paid"
        lede="Back the way it came, wherever that is possible."
      >
        <Prose>
          <p>
            Refunds are normally returned to the original payment method. We accept{" "}
            {BUSINESS.paymentAccepted}, and a digital wallet or bank transfer is returned to the
            same account it came from. Cash paid at a counter is refunded by an agreed method
            rather than by post.
          </p>
          <p>
            <ToConfirm>how long each payment method takes to show a refund, and any transaction charge deducted</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="disagreement"
        title="If you disagree with our decision"
        lede="There should be a route past the first answer."
      >
        <Prose>
          <p>
            Reply to the decision in writing and ask for it to be reviewed, adding anything new
            you want considered. A review is carried out by someone other than the person who
            made the original decision.
          </p>
          <p>
            <ToConfirm>who reviews a disputed decision, the escalation contact, and the external route available to a customer afterwards</ToConfirm>
          </p>
        </Prose>
        <ContactLine />
      </Section>

      <CallToAction
        title="Have an open problem with a shipment?"
        body="Do not wait for this page to be finalised. Call us with the tracking number and we will deal with it under the terms confirmed to you at booking."
        primary={{ href: "/contact", label: "Contact us" }}
        secondary={{ href: "/terms", label: "Read the terms of carriage" }}
      />
    </PageShell>
  );
}
