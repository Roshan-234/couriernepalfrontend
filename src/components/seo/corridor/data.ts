import { CORRIDORS, type Corridor } from "@/lib/seo/business";
import { ASIA_CORRIDORS } from "./content/asia";
import { GULF_CORRIDORS } from "./content/gulf";
import { LONG_HAUL_CORRIDORS } from "./content/long-haul";
import { NEIGHBOUR_CORRIDORS } from "./content/neighbours";
import type { CorridorContent, Direction, DirectionContent, RegionId } from "./types";

const ALL: CorridorContent[] = [
  ...NEIGHBOUR_CORRIDORS,
  ...GULF_CORRIDORS,
  ...ASIA_CORRIDORS,
  ...LONG_HAUL_CORRIDORS,
];

const BY_SLUG = new Map(ALL.map((entry) => [entry.slug, entry]));

export const corridorContent = (slug: string): CorridorContent | undefined => BY_SLUG.get(slug);

export const directionContent = (
  content: CorridorContent,
  direction: Direction,
): DirectionContent => (direction === "outbound" ? content.outbound : content.inbound);

export interface RegionGroup {
  id: RegionId;
  /** Heading on `/shipping`. */
  label: string;
  /** Why these destinations belong together, and how freight actually moves. */
  blurb: string;
  corridors: { corridor: Corridor; content: CorridorContent }[];
}

const REGION_META: { id: RegionId; label: string; blurb: string }[] = [
  {
    id: "neighbours",
    label: "Nepal's land neighbours",
    blurb:
      "India and China are the only destinations we reach by road. Consignments cross at a land customs office and continue on the other side, which makes these the quickest and most trade-heavy lanes we run — and the two where a closed border, not a long flight, is what puts a shipment behind schedule.",
  },
  {
    id: "gulf",
    label: "The Gulf",
    blurb:
      "Short air sectors from Kathmandu with regular capacity, serving the countries where most Nepalis working abroad actually are. Outbound is usually a family sending to a worker; inbound is that worker sending home. Restricted medicines and addressing are what go wrong here, not transport.",
  },
  {
    id: "asia",
    label: "East and Southeast Asia",
    blurb:
      "Mid-haul air lanes with established routings through regional hubs, and sea freight through Busan, Port Klang or the Japanese ports when the volume justifies weeks instead of days. Each of these borders has one specific requirement worth knowing before you pack.",
  },
  {
    id: "long-haul",
    label: "North America, the UK and Australia",
    blurb:
      "The settled-diaspora lanes. No direct flights, so air connects through a hub; sea routes overland to Kolkata or Haldia and then sails, which is a multi-week commitment that only makes sense for a pallet or a household move. The receiving border is what differs most between them.",
  },
];

export const regionLabel = (id: RegionId) =>
  REGION_META.find((region) => region.id === id)?.label ?? "International";

/** Corridors grouped for the `/shipping` index, in a deliberate reading order. */
export function regionGroups(): RegionGroup[] {
  return REGION_META.map((region) => ({
    ...region,
    corridors: ALL.filter((entry) => entry.region === region.id).flatMap((entry) => {
      const corridor = CORRIDORS.find((item) => item.slug === entry.slug);
      return corridor ? [{ corridor, content: entry }] : [];
    }),
  })).filter((group) => group.corridors.length > 0);
}

/**
 * Corridors that have no editorial content yet.
 *
 * `CORRIDORS` is the source of truth for which destinations exist. If one is
 * added there and nobody writes the page content, it should be visible here
 * rather than silently missing from the index.
 */
export const corridorsWithoutContent = () =>
  CORRIDORS.filter((entry) => !BY_SLUG.has(entry.slug)).map((entry) => entry.slug);

export type { CorridorContent, Direction, DirectionContent, RegionId };
