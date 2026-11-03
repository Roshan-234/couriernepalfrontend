/**
 * URL shapes for the corridor cluster.
 *
 * The public URLs are `/shipping/nepal-to-<country>` and
 * `/shipping/to-nepal-from-<country>`. Next.js has no support for a dynamic
 * segment with a literal prefix — `isDynamicRoute` only recognises a segment
 * that is entirely `[param]`, so a folder called `nepal-to-[country]` would
 * be served as a literal path and every real URL would 404. Both directions
 * therefore share one `[corridor]` segment and are told apart here.
 */

import { CORRIDORS, corridorBySlug, type Corridor } from "@/lib/seo/business";
import type { Direction } from "./types";

export const OUTBOUND_PREFIX = "nepal-to-";
export const INBOUND_PREFIX = "to-nepal-from-";

export const outboundPath = (slug: string) => `/shipping/${OUTBOUND_PREFIX}${slug}`;
export const inboundPath = (slug: string) => `/shipping/${INBOUND_PREFIX}${slug}`;

export const corridorPath = (direction: Direction, slug: string) =>
  direction === "outbound" ? outboundPath(slug) : inboundPath(slug);

export interface ResolvedRoute {
  direction: Direction;
  corridor: Corridor;
}

/**
 * Split a `[corridor]` segment into a direction and a country.
 *
 * `to-nepal-from-` is tested first: it does not start with `nepal-to-`, but
 * testing in the other order would still be a trap worth avoiding if either
 * prefix ever changes. An unrecognised country returns `undefined` so the
 * page can call `notFound()`.
 */
export function resolveCorridorRoute(segment: string): ResolvedRoute | undefined {
  if (segment.startsWith(INBOUND_PREFIX)) {
    const corridor = corridorBySlug(segment.slice(INBOUND_PREFIX.length));
    return corridor ? { direction: "inbound", corridor } : undefined;
  }
  if (segment.startsWith(OUTBOUND_PREFIX)) {
    const corridor = corridorBySlug(segment.slice(OUTBOUND_PREFIX.length));
    return corridor ? { direction: "outbound", corridor } : undefined;
  }
  return undefined;
}

/** Every corridor page, both directions, for `generateStaticParams`. */
export function corridorRouteParams(): { corridor: string }[] {
  return CORRIDORS.flatMap((entry) => [
    { corridor: `${OUTBOUND_PREFIX}${entry.slug}` },
    { corridor: `${INBOUND_PREFIX}${entry.slug}` },
  ]);
}

/** Countries whose name takes a definite article in running prose. */
const TAKES_ARTICLE = new Set(["usa", "uk", "uae"]);

export const theCountry = (corridor: Corridor) =>
  TAKES_ARTICLE.has(corridor.slug) ? `the ${corridor.country}` : corridor.country;

/** Breadcrumb and card label, e.g. "Nepal to the United States". */
export const corridorLabel = (direction: Direction, corridor: Corridor) =>
  direction === "outbound"
    ? `Nepal to ${theCountry(corridor)}`
    : `${theCountry(corridor)} to Nepal`;
