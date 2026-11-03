/**
 * Structured-data builders.
 *
 * The site previously carried one bare `Organization` block, which tells a
 * search engine almost nothing: no address, no hours, no services, no
 * breadcrumbs. For a courier competing on local intent ("courier in
 * Kathmandu", "cargo to Australia from Nepal") the address and service
 * markup are the part that earns the rich result.
 *
 * Every builder returns a plain object; render it with the `JsonLd`
 * component, which handles escaping and the CSP nonce.
 */

import { BUSINESS, OPENING_HOURS, PROFILES } from "./business";

type Json = Record<string, unknown>;

const abs = (siteUrl: string, path: string) =>
  path.startsWith("http") ? path : `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;

/** Stable @id so every other node can point at the same business. */
export const businessId = (siteUrl: string) => `${siteUrl}/#business`;
export const websiteId = (siteUrl: string) => `${siteUrl}/#website`;

function postalAddress(): Json {
  return {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.streetAddress,
    addressLocality: BUSINESS.addressLocality,
    addressRegion: BUSINESS.addressRegion,
    postalCode: BUSINESS.postalCode,
    addressCountry: BUSINESS.addressCountry,
  };
}

/**
 * The company as a place of business.
 *
 * Typed `MovingCompany` because schema.org has no courier type and
 * MovingCompany is its nearest LocalBusiness subtype; `Organization` is
 * listed alongside so consumers that do not know the subtype still match.
 */
export function localBusiness(siteUrl: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": ["MovingCompany", "LocalBusiness", "Organization"],
    "@id": businessId(siteUrl),
    name: BUSINESS.legalName,
    alternateName: [...BUSINESS.alternateName],
    url: siteUrl,
    logo: abs(siteUrl, "/images/moonlight-freight-logo.jpg"),
    image: abs(siteUrl, "/images/moonlight-freight-logo.jpg"),
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    foundingDate: BUSINESS.foundingDate,
    currenciesAccepted: BUSINESS.currenciesAccepted,
    paymentAccepted: BUSINESS.paymentAccepted,
    address: postalAddress(),
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    openingHoursSpecification: OPENING_HOURS.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days.map((day) => `https://schema.org/${day}`),
      opens: slot.opens,
      closes: slot.closes,
    })),
    areaServed: [
      { "@type": "Country", name: "Nepal" },
      { "@type": "AdministrativeArea", name: "Kathmandu Valley" },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BUSINESS.telephone,
        email: BUSINESS.email,
        contactType: "customer service",
        areaServed: "NP",
        availableLanguage: ["en", "ne"],
      },
    ],
    ...(PROFILES.length ? { sameAs: PROFILES } : {}),
  };
}

/**
 * The site itself, with the search action that lets a result show a
 * site-search box. It points at the tracking page, because the one thing a
 * visitor arriving from a brand query wants is to find their parcel.
 */
export function website(siteUrl: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    url: siteUrl,
    name: BUSINESS.name,
    publisher: { "@id": businessId(siteUrl) },
    inLanguage: "en-NP",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        // `id` is the parameter the tracking page actually reads
        // (TrackingResult: useSearchParams().get("id")). Getting this wrong
        // sends anyone using the search box to an empty page.
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/tracking?id={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** A trail ending at the current page. Pass the whole path, root first. */
export function breadcrumbs(siteUrl: string, trail: Crumb[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: abs(siteUrl, crumb.path),
    })),
  };
}

/**
 * A place a service covers.
 *
 * A bare string is read as a country, which is right for a corridor page but
 * wrong for a district: declaring Kaski a `Country` is a factual error in the
 * markup. Pass an object to say what the place actually is.
 */
export type Area = string | { name: string; type: 'Country' | 'AdministrativeArea' | 'City' };

export interface ServiceInput {
  name: string;
  description: string;
  path: string;
  /** e.g. "Nepal", or `{ name: 'Kaski', type: 'AdministrativeArea' }`. */
  areaServed?: Area[];
  serviceType?: string;
}

export function service(siteUrl: string, input: ServiceInput): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: abs(siteUrl, input.path),
    serviceType: input.serviceType || "Courier and freight",
    provider: { "@id": businessId(siteUrl) },
    areaServed: (input.areaServed || ["Nepal"]).map((area) =>
      typeof area === "string"
        ? { "@type": "Country", name: area }
        : { "@type": area.type, name: area.name },
    ),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: abs(siteUrl, "/dashboard/create-shipment"),
      servicePhone: BUSINESS.telephone,
    },
  };
}

export interface QA {
  question: string;
  answer: string;
}

/**
 * A page of questions and answers.
 *
 * Only mark up questions that are actually visible on the page — marking up
 * content a visitor cannot see is a manual-action risk, not a shortcut.
 */
export function faqPage(items: QA[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export interface ArticleInput {
  headline: string;
  description: string;
  path: string;
  image?: string;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authorName?: string;
}

export function article(siteUrl: string, input: ArticleInput): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline.slice(0, 110),
    description: input.description,
    url: abs(siteUrl, input.path),
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(siteUrl, input.path) },
    image: [abs(siteUrl, input.image || "/images/moonlight-freight-logo.jpg")],
    ...(input.publishedTime ? { datePublished: input.publishedTime } : {}),
    ...(input.modifiedTime ? { dateModified: input.modifiedTime } : {}),
    author: { "@type": "Organization", name: input.authorName || BUSINESS.legalName },
    publisher: { "@id": businessId(siteUrl) },
  };
}

/** A branch or pickup point, for the locator page. */
export interface BranchInput {
  name: string;
  path: string;
  district?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function branchList(siteUrl: string, branches: BranchInput[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: branches.map((branch, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        name: branch.name,
        parentOrganization: { "@id": businessId(siteUrl) },
        telephone: branch.phone || BUSINESS.telephone,
        address: {
          "@type": "PostalAddress",
          streetAddress: branch.address || undefined,
          addressLocality: branch.city || branch.district || undefined,
          addressRegion: branch.district || undefined,
          addressCountry: "NP",
        },
        ...(branch.latitude && branch.longitude
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: branch.latitude,
                longitude: branch.longitude,
              },
            }
          : {}),
      },
    })),
  };
}
