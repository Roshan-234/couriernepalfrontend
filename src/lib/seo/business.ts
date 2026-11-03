/**
 * The company's name, address and phone, in one place.
 *
 * Search engines weigh consistency of these details across a site and across
 * the wider web, so they must not drift between the footer, the contact page
 * and the structured data. Everything that renders them reads from here.
 */

export const BUSINESS = {
  legalName: "Moonlight Freight Pvt. Ltd.",
  name: "Moonlight Freight",
  /** What people actually search for. */
  alternateName: ["Courier Nepal", "Moonlight Cargo", "Moonlight Freight Nepal"],
  telephone: "+977-1-5922458",
  /** Same number, digits only, for `tel:` links. */
  telephoneHref: "tel:+97715922458",
  email: "moonlightfreight@gmail.com",
  streetAddress: "Nayabazar",
  addressLocality: "Kathmandu",
  addressRegion: "Bagmati",
  postalCode: "44600",
  addressCountry: "NP",
  /** Kathmandu, Nayabazar. Approximate: refine from the Google Business listing. */
  latitude: 27.7306,
  longitude: 85.3103,
  priceRange: "$$",
  foundingDate: "2015",
  currenciesAccepted: "NPR",
  paymentAccepted: "Cash, Bank transfer, eSewa, Khalti, Fonepay",
} as const;

/** Sunday to Friday is the Nepali working week; Saturday is the weekend. */
export const OPENING_HOURS = [
  { days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], opens: "09:00", closes: "18:00" },
  { days: ["Friday"], opens: "09:00", closes: "15:00" },
] as const;

/** Rendered as "Sun–Thu 9:00–18:00" style copy next to the address. */
export const OPENING_HOURS_TEXT = "Sunday to Thursday 9am–6pm, Friday 9am–3pm. Closed Saturday.";

/**
 * Destinations the company advertises, used for the corridor landing pages
 * and for `areaServed`. The slug is the URL segment.
 */
export const CORRIDORS = [
  { slug: "usa", country: "United States", code: "US", demonym: "American" },
  { slug: "uk", country: "United Kingdom", code: "GB", demonym: "British" },
  { slug: "australia", country: "Australia", code: "AU", demonym: "Australian" },
  { slug: "canada", country: "Canada", code: "CA", demonym: "Canadian" },
  { slug: "japan", country: "Japan", code: "JP", demonym: "Japanese" },
  { slug: "south-korea", country: "South Korea", code: "KR", demonym: "Korean" },
  { slug: "uae", country: "United Arab Emirates", code: "AE", demonym: "Emirati" },
  { slug: "qatar", country: "Qatar", code: "QA", demonym: "Qatari" },
  { slug: "saudi-arabia", country: "Saudi Arabia", code: "SA", demonym: "Saudi" },
  { slug: "malaysia", country: "Malaysia", code: "MY", demonym: "Malaysian" },
  { slug: "india", country: "India", code: "IN", demonym: "Indian" },
  { slug: "china", country: "China", code: "CN", demonym: "Chinese" },
] as const;

export type Corridor = (typeof CORRIDORS)[number];

export function corridorBySlug(slug: string): Corridor | undefined {
  return CORRIDORS.find((entry) => entry.slug === slug);
}

/** Social and directory profiles, for `sameAs`. Add real URLs as they exist. */
export const PROFILES: string[] = [
  // "https://www.facebook.com/...",
  // "https://www.linkedin.com/company/...",
];
