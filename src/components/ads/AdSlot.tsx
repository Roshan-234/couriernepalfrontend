"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FaArrowRight } from "react-icons/fa";
import { queryKeys } from "@/lib/queryKeys";
import { serveAds, sendAdEvent, type AdCreative } from "@/lib/resources/ads";
import { cn } from "@/lib/utils";
import { pageLanguage } from "./language";
import { useAdImpression } from "./useAdImpression";

/**
 * A promotion slot on a public page.
 *
 * **The empty slot is the normal slot.** Every campaign ships as a draft, so
 * `/serve` answering with nothing is the resting state of this system rather
 * than a failure. An empty box, a skeleton or a "no offers" line in that
 * state is how a promotion surface makes a working site look broken, so this
 * renders `null` — no wrapper, no heading, no spacing — while loading, on
 * error, and whenever the list is empty. Each layout below therefore owns its
 * own section wrapper and margins, instead of the page leaving a hole for it.
 *
 * **Nothing is decided here.** The server has already localised, filtered by
 * page and country, ordered by priority and capped the list to what the slot
 * holds. This maps that array onto the site's own visual language.
 */

export type AdSlotVariant = "hero" | "strip" | "cards" | "banner" | "inline";

export interface AdSlotProps {
  /** Placement code, e.g. `home_hero`. */
  placement: string;
  /** The page as the API should see it. Defaults to the current route. */
  path?: string;
  /** Layout. Defaults to the one the creative's own format implies. */
  variant?: AdSlotVariant;
  /** Section heading for the `cards` layout. */
  heading?: string;
  /** Columns for the `cards` layout — 1 suits a sidebar, 3 a full row. */
  columns?: 1 | 2 | 3;
  className?: string;
}

const VARIANT_FOR_FORMAT: Record<AdCreative["format"], AdSlotVariant> = {
  banner: "banner",
  strip: "strip",
  card: "cards",
  inline: "inline",
};

/* ── Shared pieces ──────────────────────────────────────────────────────── */

/**
 * The seeded creatives carry no image and most never will, so a text-only
 * offer has to look like a decision. This short brand rule above the
 * headline is what does it — the same yellow the hero uses for emphasis.
 */
function AccentRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block h-1 w-10 rounded-full bg-[var(--brand-yellow)]", className)}
    />
  );
}

/**
 * The creative's image, or nothing.
 *
 * `image_alt` is guaranteed by the API whenever `image_path` is set — a
 * creative with an image and no alt text cannot be activated — so the alt is
 * taken straight from it rather than invented or left empty.
 */
function CreativeImage({ creative, className }: { creative: AdCreative; className?: string }) {
  if (!creative.image_path) return null;
  // `image_path` is free-form and may point at another origin. `next/image`
  // would need every such origin declared in next.config.ts ahead of time,
  // which would turn marketing's choice of image into a deployment.
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={creative.image_path}
      alt={creative.image_alt ?? ""}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

/** A click is counted on the way past; it never delays the navigation. */
function useClickBeacon(creative: AdCreative, path: string) {
  return () => sendAdEvent("click", creative.id, path);
}

/* ── Layouts ────────────────────────────────────────────────────────────── */

function HeroCreative({ creative, path }: { creative: AdCreative; path: string }) {
  const ref = useAdImpression<HTMLElement>(creative.id, path);
  const onClick = useClickBeacon(creative, path);
  const href = creative.target_path;
  const withImage = Boolean(creative.image_path);

  return (
    <section
      ref={ref}
      aria-label="Featured offer"
      className="brand-hero border-t-4 border-t-[var(--brand-yellow)]"
    >
      <div
        className={cn(
          "container grid items-center gap-8 py-10 sm:py-12 lg:py-14",
          withImage && "lg:grid-cols-[1.05fr_0.95fr]",
        )}
      >
        <div className={cn(!withImage && "max-w-3xl")}>
          <AccentRule className="mb-5" />
          <h2 className="display-sm text-[color:var(--brand-navy)]">{creative.headline}</h2>
          {creative.body && (
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">{creative.body}</p>
          )}
          {href && (
            <Link href={href} onClick={onClick} className="action action-accent mt-7">
              {creative.call_to_action || "See the offer"}
              <FaArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>

        {withImage &&
          (href ? (
            <Link href={href} onClick={onClick} className="block">
              <CreativeImage
                creative={creative}
                className="aspect-[8/3] w-full rounded-2xl object-cover shadow-xl"
              />
            </Link>
          ) : (
            <CreativeImage
              creative={creative}
              className="aspect-[8/3] w-full rounded-2xl object-cover shadow-xl"
            />
          ))}
      </div>
    </section>
  );
}

function StripCreative({ creative, path }: { creative: AdCreative; path: string }) {
  const ref = useAdImpression<HTMLElement>(creative.id, path);
  const onClick = useClickBeacon(creative, path);
  const href = creative.target_path;

  return (
    <aside ref={ref} aria-label="Offer" className="border-y border-teal-200 bg-teal-50">
      <div className="container flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3.5">
        <p className="text-sm leading-6 text-teal-900">
          <span className="font-bold">{creative.headline}</span>
          {creative.body && <span className="text-teal-800"> — {creative.body}</span>}
        </p>
        {href && (
          <Link
            href={href}
            onClick={onClick}
            className="shrink-0 text-sm font-bold text-teal-800 underline-offset-4 hover:underline"
          >
            {creative.call_to_action || "Read more"} →
          </Link>
        )}
      </div>
    </aside>
  );
}

function CardCreative({ creative, path }: { creative: AdCreative; path: string }) {
  const ref = useAdImpression<HTMLLIElement>(creative.id, path);
  const onClick = useClickBeacon(creative, path);
  const href = creative.target_path;

  const inner = (
    <>
      <CreativeImage creative={creative} className="aspect-[3/2] w-full object-cover" />
      <div className="p-6">
        {!creative.image_path && <AccentRule className="mb-4" />}
        <h3 className="text-lg font-bold text-[color:var(--brand-navy)]">{creative.headline}</h3>
        {creative.body && (
          <p className="mt-2 text-sm leading-6 text-slate-600">{creative.body}</p>
        )}
        {creative.call_to_action && (
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-700">
            {creative.call_to_action}
            <FaArrowRight aria-hidden="true" className="text-xs" />
          </span>
        )}
      </div>
    </>
  );

  // The observed node has to be the one with a box: a `display: contents`
  // wrapper reports a zero-sized rectangle and never intersects anything.
  return (
    <li ref={ref} className="flex">
      {href ? (
        <Link
          href={href}
          onClick={onClick}
          className="card-lift flex w-full flex-col overflow-hidden"
        >
          {inner}
        </Link>
      ) : (
        <div className="card-lift flex w-full flex-col overflow-hidden">{inner}</div>
      )}
    </li>
  );
}

function BannerCreative({ creative, path }: { creative: AdCreative; path: string }) {
  const ref = useAdImpression<HTMLElement>(creative.id, path);
  const onClick = useClickBeacon(creative, path);
  const href = creative.target_path;

  return (
    <aside ref={ref} aria-label="Offer" className="surface-deep overflow-hidden rounded-2xl">
      <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <AccentRule className="mb-4" />
          <h2 className="text-xl font-extrabold leading-tight text-white sm:text-2xl">
            {creative.headline}
          </h2>
          {creative.body && (
            <p className="mt-3 text-sm leading-7 text-slate-200">{creative.body}</p>
          )}
          {href && (
            <Link href={href} onClick={onClick} className="action action-accent mt-6">
              {creative.call_to_action || "See the offer"}
              <FaArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>
        {creative.image_path && (
          <CreativeImage
            creative={creative}
            className="hidden aspect-[2/1] w-full rounded-xl object-cover md:block"
          />
        )}
      </div>
    </aside>
  );
}

function InlineCreative({ creative, path }: { creative: AdCreative; path: string }) {
  const ref = useAdImpression<HTMLElement>(creative.id, path);
  const onClick = useClickBeacon(creative, path);
  const href = creative.target_path;

  return (
    <aside
      ref={ref}
      aria-label="Offer"
      className="my-10 rounded-2xl border border-slate-200 border-l-4 border-l-[var(--brand-yellow)] bg-white p-6"
    >
      <h3 className="text-base font-bold text-[color:var(--brand-navy)]">{creative.headline}</h3>
      {creative.body && <p className="mt-2 text-sm leading-6 text-slate-600">{creative.body}</p>}
      {href && (
        <Link
          href={href}
          onClick={onClick}
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-700 underline-offset-4 hover:underline"
        >
          {creative.call_to_action || "Read more"}
          <FaArrowRight aria-hidden="true" className="text-xs" />
        </Link>
      )}
    </aside>
  );
}

const CARD_COLUMNS: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

function CardsSection({
  creatives,
  path,
  heading,
  columns,
  className,
}: {
  creatives: AdCreative[];
  path: string;
  heading?: string;
  columns: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <section className={cn("section container", className)} aria-labelledby="ad-offers-heading">
      <p className="kicker mb-4">Offers</p>
      <h2 id="ad-offers-heading" className="display-sm max-w-xl">
        {heading ?? "On offer right now."}
      </h2>
      <ul className={cn("mt-9 grid gap-5", CARD_COLUMNS[columns])}>
        {creatives.map((creative) => (
          <CardCreative key={creative.id} creative={creative} path={path} />
        ))}
      </ul>
    </section>
  );
}

/* ── The slot ───────────────────────────────────────────────────────────── */

export default function AdSlot({
  placement,
  path,
  variant,
  heading,
  columns = 3,
  className,
}: AdSlotProps) {
  const route = usePathname();
  const servePath = path ?? route ?? "/";
  const language = pageLanguage();

  const { data } = useQuery({
    queryKey: queryKeys.ads.slot(placement, servePath, language),
    queryFn: () => serveAds({ path: servePath, placement, language }),
    // A slot that cannot be filled is a slot that renders nothing, so there
    // is no visitor-visible reason to retry or to re-fetch on every focus.
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const creatives = data?.items ?? [];
  if (creatives.length === 0) return null;

  const layout = variant ?? VARIANT_FOR_FORMAT[creatives[0].format] ?? "banner";

  if (layout === "cards") {
    return (
      <CardsSection
        creatives={creatives}
        path={servePath}
        heading={heading}
        columns={columns}
        className={className}
      />
    );
  }

  // Every other layout occupies the slot alone; the API has already applied
  // the placement's cap, so a second creative here would be a server-side
  // misconfiguration rather than something to lay out.
  const creative = creatives[0];
  const body =
    layout === "hero" ? (
      <HeroCreative creative={creative} path={servePath} />
    ) : layout === "strip" ? (
      <StripCreative creative={creative} path={servePath} />
    ) : layout === "inline" ? (
      <InlineCreative creative={creative} path={servePath} />
    ) : (
      <BannerCreative creative={creative} path={servePath} />
    );

  return className ? <div className={className}>{body}</div> : body;
}
