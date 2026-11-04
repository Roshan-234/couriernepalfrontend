import Link from "next/link";

import { Badge, Card, Table, TBody, TD, TH, THead, TR } from "@/components/kit";
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

const PATH = "/prohibited-items";

const TITLE = "Prohibited and restricted items | Moonlight Freight";
const DESCRIPTION =
  "What a courier cannot carry out of Nepal, and what needs clearance first: dangerous goods, currency, antiquities, wildlife products, lithium batteries and perishables.";

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

/** Categories that are refused at the counter, with no exception process. */
const REFUSED = [
  {
    category: "Explosives and ammunition",
    examples: "Fireworks, flares, detonators, cartridges, blasting caps, airbag inflators.",
  },
  {
    category: "Flammable liquids and solids",
    examples:
      "Petrol, kerosene, thinners, solvent-based paints and adhesives, nail-polish remover, lighter fluid, matches.",
  },
  {
    category: "Compressed and liquefied gases",
    examples:
      "Gas cylinders and cartridges, aerosols under pressure, camping stove canisters, fire extinguishers, portable oxygen.",
  },
  {
    category: "Corrosives, oxidisers and toxics",
    examples:
      "Drain and battery acid, bleach in bulk, mercury, pesticides, industrial chemicals, pool chemicals.",
  },
  {
    category: "Narcotics and controlled substances",
    examples:
      "Illegal drugs of any kind, and prescription medicines sent without the paperwork the destination country requires.",
  },
  {
    category: "Weapons and their parts",
    examples: "Firearms, firearm components, replica weapons, knives sent as weapons, stun devices.",
  },
  {
    category: "Wildlife products",
    examples:
      "Ivory, fur, horn, bone, shell, skins, protected plant material, and anything covered by CITES.",
  },
  {
    category: "Counterfeit and illegal goods",
    examples: "Fake branded goods, pirated media, obscene material, anything illegal to possess.",
  },
  {
    category: "Human remains and biological material",
    examples: "Ashes, tissue, blood and diagnostic specimens, unless carried under a specialist service.",
  },
];

/**
 * Categories we may be able to carry, but only once the paperwork exists.
 * Each one is a conversation before booking, never a surprise at the counter.
 */
const RESTRICTED = [
  {
    category: "Lithium batteries",
    note: (
      <>
        Loose cells and power banks are the problem; batteries installed in the device they
        power are usually easier. The ceiling and the packing rules depend on the airline and
        the route — <ToConfirm>our lithium battery policy: spare cells vs installed, and the watt-hour ceiling accepted per route</ToConfirm>.
      </>
    ),
  },
  {
    category: "Currency and negotiable instruments",
    note: (
      <>
        Cash, bearer cheques and similar instruments are tightly controlled in both directions
        and are not something a parcel service is built to carry.{" "}
        <ToConfirm>whether we accept currency at all, and any declaration threshold that applies</ToConfirm>
      </>
    ),
  },
  {
    category: "Gold, silver, gems and jewellery",
    note: (
      <>
        Precious metals and stones attract customs attention and are rarely covered by ordinary
        carriage. <ToConfirm>whether precious metals and jewellery are accepted, under what declared value, and with what cover</ToConfirm>
      </>
    ),
  },
  {
    category: "Antiquities and religious artefacts",
    note: (
      <>
        Nepal controls the export of cultural property. Statues, thangkas, manuscripts, ritual
        objects and architectural fragments above a certain age need clearance from the
        Department of Archaeology before they may leave the country, and an item without that
        certificate will be stopped.{" "}
        <ToConfirm>the age threshold that triggers Department of Archaeology clearance, and our own acceptance rule for artefacts below it</ToConfirm>
      </>
    ),
  },
  {
    category: "Perishables and anything needing cold chain",
    note: (
      <>
        Food, dairy, meat, fresh produce, medicines that must stay cold: without an unbroken
        cold chain these spoil in transit, and many destinations refuse them at the border
        regardless. <ToConfirm>which perishable goods we accept, on which routes, and with what packaging</ToConfirm>
      </>
    ),
  },
  {
    category: "Live animals, plants and seeds",
    note: (
      <>
        Live animals are not carried as general cargo. Plants, seeds and soil are subject to
        quarantine rules set by the destination and almost always need a phytosanitary
        certificate.
      </>
    ),
  },
  {
    category: "Alcohol and tobacco",
    note: (
      <>
        Both are restricted or prohibited by many destinations and by many airlines, and both
        attract excise duty where they are allowed.{" "}
        <ToConfirm>whether alcohol or tobacco is accepted on any corridor we serve</ToConfirm>
      </>
    ),
  },
  {
    category: "Medicines, supplements and medical devices",
    note: (
      <>
        Personal quantities with a prescription are treated differently from commercial
        quantities, and several destinations ban ingredients that are ordinary here. Tell us
        what is inside before you pack it.
      </>
    ),
  },
  {
    category: "Electronics with batteries, drones and radio equipment",
    note: (
      <>
        Some destinations license or ban drones and transmitting equipment outright, and the
        battery rules above apply on top.
      </>
    ),
  },
  {
    category: "High-value, fragile and irreplaceable items",
    note: (
      <>
        Original documents, artwork, antiques and one-off items can often be carried, but what
        we can be responsible for is limited. Ask before you send something that cannot be
        replaced.
      </>
    ),
  },
];

export default function Page() {
  return (
    <PageShell
      trail={[
        { name: "Home", path: "/" },
        { name: "Prohibited and restricted items", path: PATH },
      ]}
      eyebrow="Before you pack"
      title="Prohibited and restricted items"
      intro="Some things cannot travel in a parcel, and some can travel only once the right paperwork exists. Knowing which is which before you reach the counter saves a wasted trip, and saves a shipment being stopped in a customs shed where nobody can help you."
    >
      <Section
        id="how-to-read"
        title="How to read this page"
        lede="Two lists, and a rule for everything that falls between them."
      >
        <Prose>
          <p>
            The first list is refused outright: dangerous goods and illegal goods that no
            general courier carries, whatever the paperwork. The second list is restricted —
            we may be able to carry it, but only after we have seen what it is and confirmed
            the rules for your destination.
          </p>
          <p className="font-semibold text-slate-900">
            This is not an exhaustive legal list, and it cannot be. Every destination country
            maintains its own prohibitions, airlines add their own, and the rules change.
            Treat it as a guide to the categories, and call us about anything that is not
            obviously ordinary.
          </p>
        </Prose>
      </Section>

      <Section
        id="refused"
        title="Refused outright"
        lede="We will not accept these, and asking us to mis-declare them is not a route around it."
      >
        <Card padding="none">
          <Table
            caption="Categories refused by Moonlight Freight"
            captionVisible={false}
            className="text-[15px]"
          >
            <THead>
              <TR>
                <TH className="w-[34%]">Category</TH>
                <TH>Typical examples</TH>
                <TH className="w-[7rem]">Status</TH>
              </TR>
            </THead>
            <TBody>
              {REFUSED.map((row) => (
                <TR key={row.category}>
                  <TD className="font-semibold text-[color:var(--brand-navy)]">{row.category}</TD>
                  <TD className="text-slate-700">{row.examples}</TD>
                  <TD>
                    <Badge tone="red">Refused</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
        <Prose>
          <p>
            Dangerous goods are the category people get wrong most often, usually without
            meaning to: an aerosol deodorant in a suitcase of clothes, a spare power bank in a
            box of gifts, a half-used tin of thinner. If something in your parcel is pressurised,
            burns, leaks, or warns you on its own label, leave it out.
          </p>
        </Prose>
      </Section>

      <Section
        id="restricted"
        title="Restricted — clearance or paperwork first"
        lede="These need a conversation before booking. Several also need a certificate that only a government office can issue, and that takes time."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {RESTRICTED.map((item) => (
            <li key={item.category}>
              <Card padding="sm" className="h-full">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-[color:var(--brand-navy)]">
                    {item.category}
                  </h3>
                  <Badge tone="amber">Needs clearance</Badge>
                </div>
                <p className="mt-2 text-[15px] leading-7 text-slate-700">{item.note}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="nepal"
        title="The Nepal-specific ones to watch"
        lede="Three categories stop more shipments out of Kathmandu than anything else on this page."
      >
        <Bullets
          items={[
            <>
              <strong>Cultural property.</strong> An old statue, mask, thangka or manuscript
              bought in good faith in Thamel is still cultural property in the eyes of the
              export rules. Clearance is granted by the Department of Archaeology, on the
              object, before it travels — not retrospectively once it is in a sorting hub.
            </>,
            <>
              <strong>Wildlife products.</strong> Shahtoosh, musk, rhino horn, tiger parts,
              pangolin scales and many bone and shell ornaments are prohibited under Nepali law
              and under CITES. The penalties are criminal, not commercial.
            </>,
            <>
              <strong>Gold and silver.</strong> Carrying precious metal across a border is
              regulated separately from ordinary goods, and a parcel is the wrong vehicle for
              it. Talk to us first.
            </>,
          ]}
        />
      </Section>

      <Section
        id="checking"
        title="If you are not sure, check it this way"
        lede="Four minutes on the phone is cheaper than a seized parcel."
      >
        <Steps
          items={[
            "Write down exactly what is inside, including the small things: the charger, the battery, the sample bottle, the gift someone asked you to add.",
            "Check the list above for the category rather than the exact product. If an item is near any category here, treat it as restricted.",
            <>
              Call us with the destination country, because the answer depends on it. Our{" "}
              <Link className="font-semibold text-[color:var(--brand-navy)] underline" href="/customs-guide">
                customs guide
              </Link>{" "}
              explains what the destination will ask for.
            </>,
            "Pack it only once you have the answer. An item removed at the counter is an inconvenience; an item found in transit is a delay, a fine, or a loss.",
          ]}
        />
        <ContactLine />
      </Section>

      <Section id="consequences" title="What happens if a prohibited item is found">
        <Prose>
          <p>
            A parcel found to contain something it should not is stopped where it is found. In
            Nepal that normally means it comes back to us and we call you. Beyond the border it
            means the destination&apos;s customs or security authority takes charge of it, and
            what happens next is their decision, not ours: inspection, confiscation, destruction
            or, in serious cases, referral to law enforcement.
          </p>
          <p>
            Carriage charges already incurred are not recoverable from the carrier in that
            situation, and costs passed on to us — storage, return freight, penalties — are
            passed on to the sender.{" "}
            <ToConfirm>the charges applied when a shipment is stopped for a prohibited item: return freight, storage, administrative fee</ToConfirm>
          </p>
          <p>
            None of this is us being difficult. A mis-declared parcel puts an aircraft, a
            warehouse and other people&apos;s shipments at risk, and the only defence anyone has
            is an honest declaration.
          </p>
        </Prose>
      </Section>

      <CallToAction
        title="Not sure about your item? Ask before you pack."
        body="Tell us what it is and where it is going. We will tell you straight away whether it can travel, what clearance it needs, and how long that clearance usually takes."
        primary={{ href: "/contact", label: "Ask about an item" }}
        secondary={{ href: "/packing-guide", label: "Read the packing guide" }}
      />
    </PageShell>
  );
}
