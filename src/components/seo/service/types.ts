/**
 * Shape of the static copy a service page supplies.
 *
 * The six service routes render from the same database rows — identical
 * eyebrow, identical two sections — so the managed copy alone makes them
 * near-duplicates of each other. Each route therefore declares its own
 * `ServiceDetail` with the substance: scope, audience, process, checklist
 * and questions. Nothing here is generated from a template; if two pages
 * end up saying the same thing, the content is wrong, not the type.
 */

export interface Titled {
  title: string;
  body: string;
}

export interface ServiceFaq {
  question: string;
  /** Plain text. It is both rendered and marked up, so keep it answerable. */
  answer: string;
}

export interface ServiceLink {
  href: string;
  label: string;
  description: string;
}

export interface ServiceDetail {
  /** Managed page path, e.g. `/services/domestic`. */
  path: string;
  /** Short human name, used in the trail, headings and the Service node. */
  name: string;
  /** schema.org `serviceType`. Accurate per service, never the generic one. */
  serviceType: string;
  /** Countries covered, for `areaServed`. */
  areaServed: string[];
  /** One sentence describing the service, for structured data. */
  summary: string;
  /** What the service actually includes. */
  covers: Titled[];
  /** Who it is the right fit for. */
  suitedTo: string[];
  /** The process, in order. */
  steps: Titled[];
  /** What the customer should have ready before booking. */
  prepare: Titled[];
  /** Questions genuinely specific to this service. Rendered and marked up. */
  faqs: ServiceFaq[];
  /** Where to go next. */
  related: ServiceLink[];
}
