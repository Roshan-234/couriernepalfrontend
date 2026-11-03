/**
 * Shapes for the shipping-corridor landing pages.
 *
 * Twenty-four pages that differ only by a country name are doorway pages.
 * The structure below exists to force the opposite: every corridor has to
 * state who actually ships it, how the goods physically move, what the
 * paperwork is, and the one thing that goes wrong on that lane. If a field
 * reads the same for two countries, the content is wrong, not the type.
 *
 * Nothing here holds a price, a transit time in days, a duty percentage or a
 * weight limit. Those live in the tariff behind `/pricing`, which is the only
 * place they can be kept correct.
 */

export type RegionId = "neighbours" | "gulf" | "asia" | "long-haul";

export type Direction = "outbound" | "inbound";

export interface QA {
  question: string;
  answer: string;
}

/** A titled block of prose, rendered as a callout or a sub-section. */
export interface Callout {
  title: string;
  body: string;
}

export interface ModeProfile {
  /** How air cargo actually routes on this lane — hubs, not guesses. */
  air: string;
  /** The non-air option: sea, road, or both. */
  surface: string;
  /** Column label, because road is the real alternative on some lanes. */
  surfaceLabel: string;
  /** Qualitative speed only. Never a number of days. */
  speed: string;
}

export interface DirectionContent {
  /** Document title. */
  title: string;
  /** Meta description. */
  description: string;
  eyebrow: string;
  heading: string;
  /** Opening paragraph, written for the reader described in `audience`. */
  lede: string;
  /** `serviceType` for the schema.org Service node. */
  serviceType: string;
  /** Who ships this lane and why. */
  audience: Callout;
  /** What usually goes in the box on this lane. */
  goods: string[];
  modes: ModeProfile;
  /** Documents that travel with the shipment. */
  paperwork: string[];
  /** The corridor-specific thing that catches people out. */
  watchOut: Callout;
  /** What happens once it reaches the receiving country. */
  arrival: Callout;
  /** Three or four questions, all of them rendered visibly on the page. */
  faqs: QA[];
}

export interface CorridorContent {
  /** Matches a slug in `CORRIDORS` from `@/lib/seo/business`. */
  slug: string;
  region: RegionId;
  /** One line for the corridor's card on `/shipping`. */
  summary: string;
  outbound: DirectionContent;
  inbound: DirectionContent;
}
