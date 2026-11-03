import {
  Bullets,
  CallToAction,
  PageShell,
  Prose,
  Section,
  Steps,
  ToConfirm,
} from "@/components/seo/pages";
import { buildMetadata } from "@/lib/content";
import { BUSINESS, OPENING_HOURS_TEXT } from "@/lib/seo/business";

const PATH = "/careers";

// The layout template appends the brand, so naming it here too would
// print "Moonlight Freight" twice in one title.
const TITLE = "Careers | Jobs in courier and logistics, Kathmandu";
const DESCRIPTION =
  "There are no vacancies advertised at Moonlight Freight right now. Speculative applications are welcome — here is what we look for and how to apply.";

export const generateMetadata = () =>
  buildMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Page() {
  return (
    <PageShell
      trail={[
        { name: "Home", path: "/" },
        { name: "Careers", path: PATH },
      ]}
      eyebrow="Working here"
      title="Careers"
      intro="A short, honest page. We are a working courier business in Kathmandu, not a large employer, and we would rather tell you exactly where things stand than keep a list of imaginary openings."
    >
      <Section
        id="openings"
        title="Current openings"
        lede="We are not advertising any vacancies at the moment."
      >
        <Prose>
          <p>
            When a role opens it will be listed on this page, with what the job involves, where
            it is based and how to apply. Until then, there is nothing to apply to — and we will
            not pretend otherwise to collect applications.
          </p>
          <p>
            <ToConfirm>list any current vacancies here, or leave this page stating that there are none</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="speculative"
        title="Applying anyway"
        lede="Speculative applications are genuinely read, and kept on file."
      >
        <Prose>
          <p>
            Courier work is seasonal, and roles open with little notice — particularly around
            Dashain and Tihar, when volumes rise sharply. A CV already on file is the fastest
            way to hear about one of those.
          </p>
        </Prose>
        <Steps
          items={[
            <>
              Email your CV to{" "}
              <a
                className="font-semibold text-[color:var(--brand-navy)] underline"
                href={`mailto:${BUSINESS.email}?subject=Speculative%20application`}
              >
                {BUSINESS.email}
              </a>
              , with &quot;Speculative application&quot; in the subject line.
            </>,
            "Say in two or three sentences what kind of work you are looking for — counter and customer service, riding and delivery, warehouse and sorting, operations, or office and accounts.",
            "Tell us which part of the valley you can work in, and whether you have a licence and your own vehicle if you are applying to ride.",
          ]}
        />
        <Prose>
          <p>
            We reply when there is something to say. If you do not hear back immediately it is
            because nothing has opened yet, not because the application was discarded.{" "}
            <ToConfirm>how long applications are retained, and whether a separate recruitment address should be used</ToConfirm>
          </p>
        </Prose>
      </Section>

      <Section
        id="what-we-look-for"
        title="What the work asks of people"
        lede="True of nearly every role here, whatever the title."
      >
        <Bullets
          items={[
            "Care with other people's property. Every box belongs to someone who is waiting for it.",
            "Straight communication, especially when something has gone wrong. A delay explained early is a manageable problem; a delay discovered late is not.",
            "Reliability on a schedule. Pickups and dispatch cut-offs hold the whole day together.",
            "Enough written Nepali and English to record a delivery clearly and talk to a customer in either.",
            "Honesty with cash and with paperwork, which in a business that collects money at the door is not negotiable.",
          ]}
        />
      </Section>

      <Section id="where" title="Where you would be working">
        <Prose>
          <p>
            We are based at {BUSINESS.streetAddress}, {BUSINESS.addressLocality}, and most roles
            are on site or on the road across the Kathmandu Valley. {OPENING_HOURS_TEXT}
          </p>
          <p>
            <ToConfirm>employment terms the company wants stated: hours, probation, benefits, and whether any role is remote or shift-based</ToConfirm>
          </p>
        </Prose>
      </Section>

      <CallToAction
        title="Send us a CV"
        body={`Email ${BUSINESS.email} and tell us what you are good at. If it matches something we need now or soon, we will call you.`}
        primary={{ href: "/contact", label: "Contact us" }}
        secondary={{ href: "/business", label: "Work with us as a merchant" }}
      />
    </PageShell>
  );
}
