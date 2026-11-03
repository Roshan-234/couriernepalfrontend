import Link from "next/link";
import {
  FaArrowRight,
  FaBoxOpen,
  FaCheck,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaPlane,
  FaRegFileAlt,
  FaShip,
  FaTruck,
} from "react-icons/fa";
import { Badge, Breadcrumbs, Card } from "@/components/kit";
import type { BreadcrumbItem } from "@/components/kit";
import { cn } from "@/lib/utils";
import type { Callout, ModeProfile, QA } from "./types";

/**
 * Presentational pieces shared by the corridor pages.
 *
 * All server components: the whole point of the cluster is that the copy is
 * in the HTML a crawler receives, so nothing here may become interactive.
 * The FAQ uses `<details>`, which needs no JavaScript and keeps every answer
 * in the document even while collapsed.
 */

export function CorridorTrail({ items }: { items: BreadcrumbItem[] }) {
  return <Breadcrumbs items={items} className="mb-6" />;
}

export function CorridorHero({
  eyebrow,
  heading,
  lede,
  tags,
  children,
}: {
  eyebrow: string;
  heading: string;
  lede: string;
  tags: string[];
  children?: React.ReactNode;
}) {
  return (
    <header>
      <p className="eyebrow mb-4 flex items-center gap-2 text-teal-700">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal-700" />
        {eyebrow}
      </p>
      <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] sm:text-5xl">{heading}</h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700">{lede}</p>
      {tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge tone="navy" variant="soft">
                {tag}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
    </header>
  );
}

export function Section({
  title,
  kicker,
  children,
  className,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-14", className)}>
      {kicker && <p className="eyebrow mb-3 text-teal-700">{kicker}</p>}
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Prose block with a heading, used for the audience and arrival notes. */
export function Prose({ title, body }: Callout) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-[color:var(--brand-navy)]">{title}</h3>
      <p className="max-w-3xl text-sm leading-7 text-slate-700">{body}</p>
    </div>
  );
}

const LIST_ICONS = {
  check: FaCheck,
  file: FaRegFileAlt,
  box: FaBoxOpen,
} as const;

export function FactList({
  items,
  icon = "check",
}: {
  items: string[];
  icon?: keyof typeof LIST_ICONS;
}) {
  const Icon = LIST_ICONS[icon];
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-7 text-slate-700">
          <Icon aria-hidden="true" className="mt-1.5 shrink-0 text-teal-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Air against the surface alternative.
 *
 * The surface column is road on the Indian and Chinese lanes and sea
 * everywhere else, so the label and the icon come from the content rather
 * than being hard-coded to a ship.
 */
export function ModeComparison({ modes }: { modes: ModeProfile }) {
  const surfaceIsRoad = /road|overland/i.test(modes.surfaceLabel);
  const SurfaceIcon = surfaceIsRoad ? FaTruck : FaShip;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card padding="sm" as="article">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[color:var(--brand-navy)]">
            <FaPlane aria-hidden="true" className="text-teal-700" />
            Air freight
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-700">{modes.air}</p>
        </Card>
        <Card padding="sm" as="article">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[color:var(--brand-navy)]">
            <SurfaceIcon aria-hidden="true" className="text-teal-700" />
            {modes.surfaceLabel}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-700">{modes.surface}</p>
        </Card>
      </div>
      <p className="max-w-3xl text-sm leading-7 text-slate-700">{modes.speed}</p>
      <p className="text-sm text-slate-600">
        We quote transit in bands rather than promises because the honest answer depends on the
        service and on clearance.{" "}
        <Link href="/pricing" className="font-semibold text-teal-800 underline underline-offset-4">
          Price your actual shipment
        </Link>{" "}
        for the figure that applies to it.
      </p>
    </div>
  );
}

/** The corridor-specific warning. Deliberately loud. */
export function WatchOut({ title, body }: Callout) {
  return (
    <aside className="rounded-2xl border border-[#f0d97a] bg-[#fffdf2] p-6">
      <h2 className="flex items-start gap-3 text-xl font-bold text-[color:var(--brand-navy)]">
        <FaExclamationTriangle aria-hidden="true" className="mt-1 shrink-0 text-[#8a6d00]" />
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{body}</p>
    </aside>
  );
}

/** The arrival note, which on inbound pages is the one people scroll for. */
export function ArrivalNote({ title, body }: Callout) {
  return (
    <Card as="section" className="border-l-4 border-l-teal-700">
      <h2 className="flex items-start gap-3 text-xl font-bold">
        <FaMapMarkerAlt aria-hidden="true" className="mt-1 shrink-0 text-teal-700" />
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{body}</p>
    </Card>
  );
}

/**
 * Visible FAQ.
 *
 * Every question rendered here is the same list handed to `faqPage(...)`,
 * because marking up answers a visitor cannot read is a manual-action risk
 * rather than a shortcut.
 */
export function FaqBlock({ items }: { items: QA[] }) {
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {items.map((item) => (
        <details key={item.question} className="group p-5 open:bg-slate-50/60">
          <summary className="cursor-pointer list-none text-base font-semibold text-[color:var(--brand-navy)] marker:content-none">
            <span className="flex items-start justify-between gap-4">
              {item.question}
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-teal-700 transition-transform group-open:rotate-90"
              >
                <FaArrowRight />
              </span>
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export interface RelatedLink {
  href: string;
  title: string;
  body: string;
}

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="panel block h-full transition hover:-translate-y-0.5 hover:border-teal-700 hover:shadow-md"
          >
            <span className="flex items-center gap-2 text-base font-semibold text-[color:var(--brand-navy)]">
              {link.title}
              <FaArrowRight aria-hidden="true" className="text-xs text-teal-700" />
            </span>
            <span className="mt-2 block text-sm leading-7 text-slate-600">{link.body}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Closing call to action, identical on every corridor page by design. */
export function CorridorCta({ heading, body }: { heading: string; body: string }) {
  return (
    <section className="mt-14 rounded-3xl bg-[color:var(--brand-navy)] p-8 text-white md:p-12">
      <h2 className="text-2xl font-bold sm:text-3xl">{heading}</h2>
      <p className="mt-4 max-w-2xl leading-8 text-slate-200">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/pricing" className="action action-accent">
          Check the rate <FaArrowRight aria-hidden="true" />
        </Link>
        <Link
          href="/contact"
          className="action border border-white/40 bg-transparent hover:bg-white/10"
        >
          Ask about this corridor
        </Link>
      </div>
    </section>
  );
}
