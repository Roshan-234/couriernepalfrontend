import "server-only";

import { backendHeaders, backendUrl } from "@/lib/content";

export interface FaqEntry {
  question: string;
  answer: string;
  category: string | null;
}

/**
 * What the page shows when the FAQ service cannot be reached.
 *
 * A courier's FAQ is one of the pages people land on from search, so it must
 * never return a 500 because a Python process happened to be restarting.
 * These answers are deliberately free of figures — no transit times, no
 * weight limits, no duty rates — because those belong to the company.
 */
const FALLBACK: FaqEntry[] = [
  {
    category: "Tracking",
    question: "How do I track my shipment?",
    answer:
      "Enter the tracking number from your receipt or booking confirmation on our tracking page. It is the same number printed on the consignment note. If the status has not moved for longer than you expect, call us with that number and we will chase the parcel for you.",
  },
  {
    category: "Booking",
    question: "What do you need from me to book a shipment?",
    answer:
      "The sender's and the recipient's full name and address, a phone number that is actually answered, an honest description of the contents, and the number of pieces. International parcels also need the contents itemised with their values for the customs declaration. Incomplete recipient details are the most common reason a delivery stalls.",
  },
  {
    category: "Pricing",
    question: "How is the price of a shipment worked out?",
    answer:
      "Price depends on the destination, the service level you choose and the chargeable weight. Chargeable weight is whichever is greater: the actual weight on the scale, or the volumetric weight worked out from the parcel's dimensions. That is why a large, light box can cost more than a small, heavy one. Use the pricing page for an estimate, or call us with the dimensions for a firm quote.",
  },
  {
    category: "Pricing",
    question: "How long will delivery take?",
    answer:
      "Transit time depends on the route, the service level and, for international shipments, how quickly customs releases the parcel at the destination. We quote the expected window when you book rather than publishing one figure here, because a road closure or a customs inspection is outside our control and we would rather not promise what we cannot hold to.",
  },
  {
    category: "Restrictions",
    question: "What am I not allowed to send?",
    answer:
      "Explosives, flammable liquids and gases, compressed gases, corrosives, narcotics and wildlife products are refused outright. Currency, precious metals, loose lithium batteries, live animals, perishables and antiquities or religious artefacts need clearance before we can accept them. Our prohibited items page sets out the categories. If your item is anywhere near the line, call us before you pack it.",
  },
  {
    category: "Customs",
    question: "Who pays customs duty and tax on an international parcel?",
    answer:
      "Duty and tax are set by the destination country's customs authority, not by us, and are normally charged to the recipient before the parcel is released. The amount depends on what is inside, its declared value and the rules of that country. Declaring the contents honestly and accurately is the single thing most likely to keep a parcel moving.",
  },
  {
    category: "Payments",
    question: "Do you collect cash on delivery?",
    answer:
      "Yes. Cash on delivery is available to merchants shipping domestically, and the cash we collect is remitted back to the seller on an agreed cycle. The business page explains how the service works, or talk to us about opening an account.",
  },
  {
    category: "Delivery",
    question: "What happens if nobody is there when the courier arrives?",
    answer:
      "The courier calls the number on the consignment note to arrange a convenient time or an alternative address. If the recipient still cannot be reached, the parcel goes back to the nearest branch and is held for collection while we keep trying to make contact. A phone number the recipient actually answers prevents nearly all of this.",
  },
  {
    category: "Problems",
    question: "My parcel is late, damaged or missing. What should I do?",
    answer:
      "Tell us as soon as you notice, with the tracking number and, for damage, photographs of the packaging and the contents as they arrived. Keep the packaging. We open a case, trace the shipment and tell you what we find. What we can compensate and how a claim is handled are covered by our terms.",
  },
  {
    category: "Coverage",
    question: "Do you deliver outside the Kathmandu Valley?",
    answer:
      "Yes. We cover destinations across Nepal through our own network and partner carriers, and some remote routes run on a schedule rather than daily. Ask us about a specific district and we will tell you honestly how that route runs and how long it usually takes.",
  },
];

function cleanString(value: unknown, limit: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > limit) return null;
  return trimmed;
}

/** Pull the rows out of whatever shape the endpoint returns. */
function rowsOf(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    for (const key of ["faqs", "items", "results", "data"]) {
      const candidate = (payload as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) return candidate;
    }
  }
  return [];
}

/**
 * Keep only the rows that are usable.
 *
 * The response is data from another service, so nothing in it is trusted:
 * a row missing a question or an answer is dropped rather than rendered as
 * an empty entry, and `order` is honoured only when it really is a number.
 */
function normalise(payload: unknown): FaqEntry[] {
  const rows: { entry: FaqEntry; order: number; index: number }[] = [];

  rowsOf(payload).forEach((row, index) => {
    if (!row || typeof row !== "object") return;
    const record = row as Record<string, unknown>;
    if (record.is_active === false) return;

    const question = cleanString(record.question, 500);
    const answer = cleanString(record.answer, 20000);
    if (!question || !answer) return;

    const order =
      typeof record.order === "number" && Number.isFinite(record.order) ? record.order : 0;

    rows.push({
      entry: { question, answer, category: cleanString(record.category, 100) },
      order,
      index,
    });
  });

  return rows.sort((a, b) => a.order - b.order || a.index - b.index).map((row) => row.entry);
}

export interface FaqResult {
  entries: FaqEntry[];
  /** `fallback` when the service could not be reached or returned nothing. */
  source: "live" | "fallback";
}

/** Fetch the published FAQs, falling back rather than failing the page. */
export async function getFaqs(): Promise<FaqResult> {
  try {
    const response = await fetch(`${backendUrl}/api/faq/`, {
      headers: backendHeaders(),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { entries: FALLBACK, source: "fallback" };
    const entries = normalise(await response.json());
    return entries.length ? { entries, source: "live" } : { entries: FALLBACK, source: "fallback" };
  } catch {
    // This page is a search landing page. It renders either way.
    return { entries: FALLBACK, source: "fallback" };
  }
}

/** Group by category, preserving the order the rows arrived in. */
export function groupByCategory(entries: FaqEntry[]): { category: string; entries: FaqEntry[] }[] {
  const groups = new Map<string, FaqEntry[]>();
  for (const entry of entries) {
    const key = entry.category?.trim() || "General";
    const bucket = groups.get(key);
    if (bucket) bucket.push(entry);
    else groups.set(key, [entry]);
  }
  return [...groups.entries()].map(([category, grouped]) => ({ category, entries: grouped }));
}

/** A stable id for a heading anchor. */
export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}
