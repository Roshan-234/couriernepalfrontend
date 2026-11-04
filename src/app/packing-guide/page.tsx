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
import { buildMetadata } from "@/lib/content";

const PATH = "/packing-guide";

const TITLE = "How to pack a parcel properly | Moonlight Freight";
const DESCRIPTION =
  "A practical packing guide for parcels sent from Nepal: choosing a box, cushioning, sealing, labelling, and how to handle fragile goods, liquids, electronics and documents.";

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

const SPECIAL_CASES = [
  {
    title: "Fragile items",
    body: "Wrap each piece separately, then suspend it in cushioning so no part of it touches a wall of the box. Plates and glass travel on edge, not flat. The test is simple: shake the box gently and nothing should move inside it.",
  },
  {
    title: "Liquids and powders",
    body: "Seal the cap with tape, put the container in a sealed plastic bag, and pack it upright with absorbent material around it. Pressure changes in an aircraft hold push liquid past caps that seem tight on the ground.",
  },
  {
    title: "Electronics",
    body: "Use the original box inside a larger outer box where you still have it. Add anti-static wrap for bare components, remove anything loose, and declare batteries honestly — they change how the shipment must be routed.",
  },
  {
    title: "Documents and certificates",
    body: "A stiffened envelope or a document sleeve inside a box, so nothing creases. For anything irreplaceable — academic transcripts, legal originals — keep a scan before it travels.",
  },
  {
    title: "Clothing and textiles",
    body: "Compress into a sealed plastic bag first, which keeps monsoon damp off the fabric, then box it. Pashmina and hand-woven goods crush badly in a soft bag under other freight.",
  },
  {
    title: "Food and gifts",
    body: "Factory-sealed and shelf-stable only, with ingredients visible on the packaging for customs. Anything that needs refrigeration is a different conversation before you pack it.",
  },
  {
    title: "Artwork, thangkas and statues",
    body: "Roll a canvas or a thangka rather than folding it, in a rigid tube. Crate a statue or anything with a projecting part. Cultural property also needs clearance before it leaves the country.",
  },
  {
    title: "Multiple items in one box",
    body: "Keep heavy things at the bottom, pad between every layer, and make sure nothing hard presses against anything fragile. One parcel of mixed goods still travels as a single unit, and it is handled at the weight of the whole.",
  },
];

export default function Page() {
  return (
    <PageShell
      trail={[
        { name: "Home", path: "/" },
        { name: "Packing guide", path: PATH },
      ]}
      eyebrow="Before you ship"
      title="How to pack so it arrives in one piece"
      intro="A parcel leaving Kathmandu is loaded and unloaded several times, shares space with heavier freight, travels on roads that are not always kind, and may spend a day in monsoon humidity. Good packing is what absorbs all of that. It is also the cheapest insurance there is."
    >
      <Section
        id="principle"
        title="The one principle"
        lede="Pack for the journey the parcel actually takes, not for the trip from your house to our counter."
      >
        <Prose>
          <p>
            Assume your box will sit at the bottom of a stack, be slid across a floor, and be
            picked up by a corner. Nothing about that is careless handling; it is what moving
            thousands of parcels looks like. A box that survives those three things survives the
            journey.
          </p>
        </Prose>
      </Section>

      <Section
        id="steps"
        title="Packing, step by step"
        lede="Five steps, in this order. Most damaged parcels skipped one of them."
      >
        <Steps
          items={[
            <>
              <strong>Pick the right box.</strong> New or near-new corrugated cardboard, strong
              enough for the weight, and only slightly larger than the contents once cushioned.
              A reused box that has already been shipped twice has lost much of its strength,
              and an oversized box costs you money because pricing uses volumetric weight.
            </>,
            <>
              <strong>Wrap each item individually.</strong> Bubble wrap, foam, or clean paper.
              Items that touch each other in transit rub, scratch and chip.
            </>,
            <>
              <strong>Cushion every gap.</strong> Fill the space between the contents and all
              six walls, including the top. The contents should not shift at all when you move
              the box.
            </>,
            <>
              <strong>Seal it properly.</strong> Strong packing tape in an H pattern: along the
              centre seam, then across both edge seams, on the top and the bottom. Not masking
              tape, not string, not staples.
            </>,
            <>
              <strong>Label it clearly.</strong> Full address and a working phone number for the
              recipient, your own details as sender, both written legibly on the box itself as
              well as on the label. Remove every old label and barcode from a reused box.
            </>,
          ]}
        />
      </Section>

      <Section
        id="avoid"
        title="What not to do"
        lede="These are the failures we see at the counter and in the sorting hall."
      >
        <Bullets
          items={[
            "Soft bags, suitcases and bin liners for anything that is not clothing. They tear, and they offer nothing to stack against.",
            "Newspaper as the only cushioning. It compresses to nothing under weight.",
            "Overfilling a box so the flaps bulge. A bulged box cannot be stacked and splits at the seam.",
            "Writing the address on one face only, in pen, on a box that will get wet.",
            "Leaving old barcodes on a reused box, which is how a parcel ends up scanned onto the wrong route.",
            "Sealing before you are certain nothing prohibited went in. Opening a taped box at the counter wastes your time and ours.",
          ]}
        />
      </Section>

      <Section
        id="special"
        title="Specific kinds of contents"
        lede="The general rules hold; these add to them."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {SPECIAL_CASES.map((item) => (
            <Card key={item.title} padding="sm" className="h-full">
              <h3 className="text-base font-bold text-[color:var(--brand-navy)]">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-700">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        id="weight"
        title="Size, weight and what it costs you"
        lede="Packing decisions change the price, not just the safety."
      >
        <Prose>
          <p>
            Shipments are charged on whichever is greater: the weight on the scale, or the
            volumetric weight worked out from the box&apos;s dimensions. A big box of light
            cushioning is therefore an expensive box. Pack protectively, but do not add
            dead space you are paying to fly.
          </p>
          <p>
            There are limits on what a single piece may weigh and measure, set partly by us and
            partly by the airline or road carrier on the route.{" "}
            <ToConfirm>maximum weight and dimensions accepted per piece, for domestic and for international shipments</ToConfirm>
          </p>
          <p>
            Splitting an awkward shipment into several well-packed pieces is often cheaper and
            always safer than forcing it into one. The{" "}
            <Link className="font-semibold text-[color:var(--brand-navy)] underline" href="/pricing">
              pricing page
            </Link>{" "}
            will show you the difference before you commit.
          </p>
        </Prose>
      </Section>

      <Section
        id="at-the-counter"
        title="What happens at our counter"
        lede="We check a few things before a parcel is accepted."
      >
        <Bullets
          items={[
            "We confirm the contents match what you have declared, because the declaration is what the shipment travels on.",
            "We check the box closes flat, is sealed, and is strong enough for its weight.",
            "We weigh and measure it, which is what sets the price.",
            "We check the address and the recipient's phone number with you, since a wrong number is the most common cause of a failed delivery.",
          ]}
        />
        <Prose>
          <p>
            If a parcel needs repacking we will tell you before it is booked rather than after.{" "}
            <ToConfirm>whether boxes, tape and cushioning are sold at the counter, whether a packing service is offered, and the charges for each</ToConfirm>
          </p>
        </Prose>
        <ContactLine />
      </Section>

      <CallToAction
        title="Check the contents before you tape the box"
        body="Dangerous goods, batteries, cultural property and perishables all have rules that are easier to follow before packing than after. Two minutes on the prohibited items page saves a wasted trip."
        primary={{ href: "/prohibited-items", label: "Check what you can send" }}
        secondary={{ href: "/faq", label: "Read the FAQ" }}
      />
    </PageShell>
  );
}
