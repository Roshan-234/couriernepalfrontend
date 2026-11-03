/**
 * Copy generation for the 77 district landing pages.
 *
 * Seventy-seven pages that differ only by a place name are doorway pages.
 * Everything here exists to make each page carry something a shipper in that
 * district would actually act on, and every sentence is derived from a fact
 * that is already in `src/lib/seo/districts.ts` — the delivery zone, the
 * headquarters, the province, and the shape of the province's own network —
 * rather than spun from a template.
 *
 * Four independent axes drive the variation:
 *
 *   1. the delivery zone (four groups, four genuinely different operations);
 *   2. the province, and the zone mix inside it, which is computed here so it
 *      cannot drift from the district table;
 *   3. whether the headquarters shares its name with the district, and
 *      whether it is also the provincial capital;
 *   4. a short curated note for the districts where a real, checkable fact
 *      (an airstrip, a border crossing, a seasonal road) changes what a
 *      sender should expect.
 *
 * No price is stated anywhere. The tariff lives in the database and the
 * public calculator is at /pricing; pages link to it instead.
 */

import {
  DISTRICTS,
  PROVINCES,
  ZONE_LABELS,
  districtsInProvince,
  type DeliveryZone,
  type DistrictRecord,
} from "@/lib/seo/districts";

export const ZONE_ORDER: readonly DeliveryZone[] = ["valley", "cities", "hills", "remote"];

/** Badge tones, one per zone, so the colour reads the same on every page. */
export const ZONE_TONE: Record<DeliveryZone, "navy" | "teal" | "amber" | "orange"> = {
  valley: "navy",
  cities: "teal",
  hills: "amber",
  remote: "orange",
};

/** What the zone means in the warehouse, not in the marketing copy. */
export const ZONE_SUMMARY: Record<DeliveryZone, string> = {
  valley:
    "Our own riders collect and deliver inside the Kathmandu Valley, so nothing is handed to a partner and nothing waits for a trunk vehicle. Bookings that reach the counter before the afternoon cut-off usually go out the same day.",
  cities:
    "District headquarters that sit on a highway lane running overnight. A parcel loaded in the evening is normally sorted at the destination branch the next morning and delivered that day.",
  hills:
    "Reached by road from the nearest highway town. The trunk leg is scheduled; the last leg is a hill road, so the headquarters is quick and the outlying wards add a day.",
  remote:
    "An air leg, a seasonal road, or both. Schedules here follow weather and the flight manifest rather than a timetable, so the honest answer to a delivery date is a range.",
};

/** The planning advice that follows from the zone. */
export const ZONE_PLANNING: Record<DeliveryZone, string> = {
  valley: "Plan on same-day or next-day, and treat anything slower as an exception worth calling us about.",
  cities: "Plan on next-day for the headquarters and add a day for addresses off the highway.",
  hills: "Plan in working days, not hours, and give the recipient a phone number that will be answered.",
  remote: "Plan in weeks during monsoon and winter, and send anything time-critical by prepaid rather than cash on delivery.",
};

export interface ProvinceProfile {
  name: string;
  code: string;
  capital: string;
  districts: DistrictRecord[];
  /** How many districts of each zone the province holds. */
  zoneCounts: Record<DeliveryZone, number>;
  /** Valley and city-tier districts: the places volume is consolidated. */
  hubs: DistrictRecord[];
  remote: DistrictRecord[];
  /** Anchor used on the /courier index page. */
  anchor: string;
}

const emptyZoneCounts = (): Record<DeliveryZone, number> => ({
  valley: 0,
  cities: 0,
  hills: 0,
  remote: 0,
});

export function provinceAnchor(province: string): string {
  return province.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function provinceProfile(province: string): ProvinceProfile {
  const meta = PROVINCES.find((entry) => entry.name === province);
  const districts = districtsInProvince(province);
  const zoneCounts = emptyZoneCounts();
  for (const district of districts) zoneCounts[district.zone] += 1;

  return {
    name: province,
    code: meta?.code ?? "",
    capital: meta?.capital ?? "",
    districts,
    zoneCounts,
    hubs: districts.filter((d) => d.zone === "valley" || d.zone === "cities"),
    remote: districts.filter((d) => d.zone === "remote"),
    anchor: provinceAnchor(province),
  };
}

export const PROVINCE_PROFILES: ProvinceProfile[] = PROVINCES.map((province) =>
  provinceProfile(province.name),
);

/** "A", "A and B", "A, B and C". */
export function listNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

/**
 * The character of each province's network, in one sentence a reader can use.
 * The counts are interpolated from the district table so they stay correct.
 */
export function provinceIntro(profile: ProvinceProfile): string {
  const { name, capital, zoneCounts, districts, hubs } = profile;
  const hubNames = listNames(hubs.map((d) => d.headquarters));

  switch (name) {
    case "Koshi":
      return `Koshi runs east from the Koshi river to the Indian and Tibetan borders. Three of its ${districts.length} districts — ${hubNames} — sit on the East–West Highway and take overnight freight; the ${zoneCounts.hills} hill districts behind them are reached by road from that corridor, and Solukhumbu and Taplejung sit beyond it again. The provincial capital is ${capital}.`;
    case "Madhesh":
      return `Madhesh is the flattest and most densely populated province, and it is the easiest of the seven to serve: every one of its ${districts.length} districts is on or within an hour of the East–West Highway. ${hubNames} carry the volume, Birgunj doubles as the country's biggest land trade gateway, and no district here is classified remote. The provincial capital is ${capital}.`;
    case "Bagmati":
      return `Bagmati holds the Kathmandu Valley, so it is both the origin of most domestic volume and its largest destination. Alongside the ${zoneCounts.valley} valley districts sit Bharatpur and Hetauda on the highway, ${zoneCounts.hills} hill districts within a day's drive of the capital, and Rasuwa on the Kerung border road. The provincial capital is ${capital}.`;
    case "Gandaki":
      return `Gandaki runs from the Terai edge at Nawalpur up to the trans-Himalayan valleys. ${capital} in Kaski is the only city-tier point and the sorting centre for everything behind it; ${zoneCounts.hills} hill districts feed off the Prithvi and Siddhartha highways, and Manang and Mustang sit over passes that close.`;
    case "Lumbini":
      return `Lumbini spans the western Terai and the hills above it. ${hubNames} are the city-tier points, with airports at Bhairahawa and Nepalgunj, and ${zoneCounts.hills} hill districts — Palpa, Gulmi, Arghakhanchi and the rest — are served from that corridor. Eastern Rukum, up past Rolpa, is the one remote district. The provincial capital is ${capital}.`;
    case "Karnali":
      return `Karnali is the hardest province in the country to serve and the most honest test of a courier network. ${capital} in Surkhet is its single city-tier point, ${zoneCounts.hills} districts are hill-road served, and ${zoneCounts.remote} — ${listNames(profile.remote.map((d) => d.name))} — depend on air links and roads that are seasonal at best.`;
    case "Sudurpashchim":
      return `Sudurpashchim runs up the Mahakali corridor to the Indian border in the far west. ${hubNames} on the Terai take highway freight, with the regional airport at Dhangadhi; ${zoneCounts.hills} hill districts sit behind them, and ${zoneCounts.remote} — ${listNames(profile.remote.map((d) => d.name))} — are mountain districts where the road ends before the headquarters does. The provincial capital is ${capital}.`;
    default:
      return `${name} has ${districts.length} districts, with its capital at ${capital}.`;
  }
}

/**
 * Checkable, courier-relevant local facts.
 *
 * Only districts where something concrete changes what a sender should expect
 * — an airstrip doing the work of a road, a border crossing, a pass that
 * closes — get an entry. Everything else is left to the derived copy rather
 * than padded. Review these with operations before they change.
 */
export const DISTRICT_NOTES: Record<string, string> = {
  humla:
    "Simikot has no through highway. Everything arrives by air from Nepalgunj or walks in, which is why Humla is the longest lane on the network and why weather, not distance, sets the delivery date.",
  dolpa:
    "Dunai is served through the Juphal airstrip, with road links that are seasonal and rough. Parcels routed by air are subject to the flight's weight allowance, so bulky consignments can wait for space.",
  mugu:
    "Gamgadhi is reached by the Talcha airstrip or by a road that is usable only part of the year. Plan Mugu deliveries well ahead of any deadline.",
  jumla:
    "Chandannath sits at the end of the Karnali Highway and also has an airstrip. The road is open most of the year but slow and weather-dependent, so transit varies more than the distance suggests.",
  kalikot:
    "Manma is on the Karnali Highway between Surkhet and Jumla. It is road-served rather than air-served, but landslide closures through monsoon are routine.",
  mustang:
    "Jomsom is served by the Beni–Jomsom road and by air from Pokhara. Both are weather-exposed, and the road through the gorge is the first thing to go in heavy rain.",
  manang:
    "Chame is reached by the road up from Besisahar in Lamjung. The upper section is snow-affected in winter, so the honest transit window widens considerably between December and March.",
  solukhumbu:
    "Salleri is road-reachable from the Sunkoshi corridor, while the Khumbu addresses above it depend on the Lukla air link. Say which it is when you book — the two are very different lanes.",
  rasuwa:
    "Dhunche is on the road to the Rasuwagadhi border crossing with Tibet. It is the one remote district in Bagmati, and its difficulty is monsoon landslides rather than distance from Kathmandu.",
  taplejung:
    "Phungling is the furthest headquarters in the east, up past Ilam on hill road. There is an airstrip at Suketar, but most parcels go by road and the last leg is the slow part.",
  darchula:
    "Khalanga sits at the top of the Mahakali corridor against the Indian border. The road in is long and monsoon-exposed; build that into any deadline.",
  bajhang:
    "Jayaprithvi is reached on hill road up from the Seti corridor. Road condition, not the schedule, decides the transit time here.",
  bajura:
    "Martadi is one of the harder headquarters in the far west to reach by road, and the surrounding wards add days on top of whatever the headquarters takes.",
  jhapa:
    "Bhadrapur is at the eastern end of the East–West Highway, next to the Kakarbhitta border crossing, and has its own airport. It is one of the quickest districts in the country to serve from Kathmandu.",
  morang:
    "Biratnagar is the provincial capital, an industrial centre and an airport city. Volume here is heavy enough that the lane runs nightly in both directions.",
  sunsari:
    "Inaruwa is the headquarters, but Itahari — where the East–West Highway meets the road north — is the traffic. Both are on the overnight lane.",
  parsa:
    "Birgunj is the largest land trade gateway into Nepal and the district is geared to freight. For commercial consignments arriving through the dry port, book the onward leg before the goods clear.",
  dhanusha:
    "Janakpur is the provincial capital, has an airport and a rail link to the Indian border. It is the obvious consolidation point for the surrounding Madhesh districts.",
  bara:
    "Kalaiya is the headquarters, with the industrial corridor around Simara and Nijgadh in the same district. Industrial pickups there are routine rather than exceptional.",
  chitwan:
    "Bharatpur sits where the Prithvi Highway meets the East–West Highway and has a busy domestic airport. It is the natural interchange between the valley lane and the western lanes.",
  makwanpur:
    "Hetauda is the provincial capital of Bagmati and the closest highway town to Kathmandu. Parcels between the two move on a short, frequent leg.",
  kaski:
    "Pokhara is the sorting centre for the whole of Gandaki and the point everything bound for Manang, Mustang and the Gandaki hills passes through. Address parcels to Pokhara, not to Kaski.",
  rupandehi:
    "Butwal is the headquarters and the crossroads of the western lanes, with Bhairahawa, the Sunauli border and Gautam Buddha International Airport in the same district.",
  banke:
    "Nepalgunj is the air hub for Karnali — the flights into Simikot, Juphal and Talcha start here — as well as a border town on the Jamunaha crossing.",
  dang:
    "Ghorahi is the headquarters and Tulsipur the second town, with the provincial capital at Deukhuri in the same district. All three are on the highway network.",
  surkhet:
    "Birendranagar is the provincial capital and Karnali's only city-tier point. Every parcel for the Karnali hills and mountains is sorted somewhere along this corridor.",
  kailali:
    "Dhangadhi is the far west's main city, with an airport and the Gauriphanta border crossing. It carries most of the region's inbound volume.",
  kanchanpur:
    "Bhimdatta — Mahendranagar — sits at the Gaddachauki crossing at the western end of the East–West Highway, so it is both a destination and a gateway.",
  ilam:
    "Ilam is tea country on the Mechi Highway, and outbound consignments of packed tea are a regular enough shipment here that the lane is tuned for them.",
  palpa:
    "Tansen sits on the Siddhartha Highway between Butwal and Pokhara, which makes it one of the better-connected hill headquarters in the country.",
  kathmandu:
    "Kathmandu is where the network starts. Nearly every domestic lane is sorted here, and it is the only district where a late booking can still go out the same day.",
  lalitpur:
    "Lalitpur is inside the valley ring, but the southern wards past Lubhu and Godawari climb out of it, and those addresses behave like a hill lane rather than a valley one.",
  bhaktapur:
    "Bhaktapur is the smallest of the three valley districts and the densest to deliver in. Narrow lanes in the old town mean a phone number on the consignment matters more than the address does.",
};

export interface DistrictFaq {
  question: string;
  answer: string;
}

export interface DistrictCopy {
  /** Plain-language summary used for the meta description and the lead. */
  summary: string;
  lead: string;
  transit: string;
  coverage: string;
  sending: string;
  cod: string;
  booking: string;
  note?: string;
  faqs: DistrictFaq[];
}

/** Reads correctly whether or not the headquarters shares the district name. */
function hqLabel(district: DistrictRecord): string {
  return district.headquarters.toLowerCase() === district.name.toLowerCase()
    ? `the district headquarters, which carries the same name as the district`
    : `${district.headquarters}, the district headquarters`;
}

/**
 * Half the districts are not named after the town parcels are addressed to —
 * Kaski is served through Pokhara, Gulmi through Tamghas — and a consignment
 * addressed to the district rather than the town is the commonest avoidable
 * delay on the network. Say so on exactly those pages.
 */
function addressingTip(district: DistrictRecord): string {
  if (district.headquarters.toLowerCase() === district.name.toLowerCase()) return "";
  return ` Address consignments to ${district.headquarters} rather than to ${district.name}: the district is the region, the headquarters is the delivery town.`;
}

/**
 * The places a consignment is consolidated before its last leg, named the way
 * a dispatcher would name them. The three valley districts collapse into one
 * phrase, because listing Kathmandu, Lalitpur and Bhaktapur separately tells
 * a reader nothing, and at most three points are named.
 */
function consolidationPoints(profile: ProvinceProfile): string[] {
  const valley = profile.hubs.filter((d) => d.zone === "valley");
  const cities = profile.hubs.filter((d) => d.zone === "cities");
  const named = cities
    .slice(0, valley.length > 0 ? 2 : 3)
    .map((d) => (d.headquarters === d.name ? d.headquarters : `${d.headquarters} (${d.name})`));
  const valleyPoint = valley.length > 1 ? ["Kathmandu"] : valley.map((d) => d.headquarters);
  return [...valleyPoint, ...named];
}

export function districtCopy(district: DistrictRecord): DistrictCopy {
  const profile = provinceProfile(district.province);
  const peers = profile.districts.filter((d) => d.slug !== district.slug);
  const sameZonePeers = peers.filter((d) => d.zone === district.zone);
  const hubNames = listNames(consolidationPoints(profile));
  const eta = ZONE_LABELS[district.zone].eta;
  /** The duration on its own, for sentences that continue past it. */
  const etaWindow: Record<DeliveryZone, string> = {
    valley: "same-day or next-day",
    cities: "next-day",
    hills: "2-4 working days",
    remote: "4-10 working days",
  };
  const etaDays = etaWindow[district.zone];
  const isCapital = profile.capital === district.headquarters;
  const note = DISTRICT_NOTES[district.slug];

  let summary: string;
  let lead: string;
  let transit: string;
  let coverage: string;
  let sending: string;
  let cod: string;
  let faqs: DistrictFaq[];

  const booking =
    district.zone === "valley"
      ? `Book online and a rider is assigned from the nearest point in the valley; walk-in drop-off at the Nayabazar counter works just as well for one or two parcels. Regular senders get a standing pickup slot instead of booking each consignment.`
      : `Book the consignment online before you hand it over — the tracking number is generated at that point, and ${district.headquarters} sees the parcel on the manifest before the vehicle arrives. If you are sending from ${district.name} rather than to it, request a pickup or drop at the nearest branch or pickup point.`;

  switch (district.zone) {
    case "valley": {
      summary = `Same-day and next-day courier delivery in ${district.name}, inside the Kathmandu Valley, with cash on delivery, online booking and live tracking.`;
      lead = `${district.name} is one of the three Kathmandu Valley districts, which means it sits inside our own delivery ring rather than at the end of a trunk route. That is the whole difference: a parcel for ${district.name} is never handed to a partner network, so the time it takes is the time our riders take.`;
      transit = `${eta.replace(/\.$/, "")} is the normal outcome for ${district.name}, not the best case. Bookings confirmed before the afternoon cut-off generally go out the same working day; anything later moves on the next morning's round. Sunday to Friday is the working week, and Saturday rounds are limited.`;
      coverage = `Coverage is address-level across the whole of ${district.name}, not just the centre. Valley addresses are dense and often unsigned, so a ward number and a landmark get a parcel delivered faster than a street name, and a phone the recipient will answer matters more than either.`;
      sending = `Documents, e-commerce parcels, electronics, clothing, food that travels well, and bulk dispatches from valley warehouses all move on this lane. Fragile goods are fine if they are packed for it; we will tell you at the counter if a carton will not survive the handling.`;
      cod = `Cash on delivery works well in ${district.name}. The collection and the remittance both happen inside the valley, so money comes back to a seller faster here than anywhere else on the network — this is the lane where COD costs a seller almost nothing in working capital.`;
      faqs = [
        {
          question: `How fast is courier delivery in ${district.name}?`,
          answer: `${eta} for ${district.name}. A consignment booked before the afternoon cut-off usually goes out the same working day; later bookings move on the next morning's round.`,
        },
        {
          question: `Do you deliver to every ward in ${district.name}?`,
          answer: `Yes. Delivery is address-level throughout ${district.name}, not limited to ${district.headquarters}. Include the ward number and a landmark, because valley addresses are often unsigned.`,
        },
        {
          question: `Is cash on delivery available in ${district.name}?`,
          answer: `Yes, and it is at its most practical here. Collection and remittance both happen inside the Kathmandu Valley, so a seller gets the money back quickly.`,
        },
        {
          question: `What does it cost to send a parcel to ${district.name}?`,
          answer: `It depends on weight, dimensions and the service you choose. Use the rate calculator at /pricing for a quote against your actual parcel rather than an indicative figure.`,
        },
      ];
      break;
    }

    case "cities": {
      summary = `Next-day courier and parcel delivery to ${district.name}, run through ${district.headquarters} on an overnight highway lane, with cash on delivery, pickup booking and tracking.`;
      lead = `${district.headquarters} is on a highway lane we run overnight, which is what puts ${district.name} in the city tier rather than the hill tier. ${isCapital ? `It is also the provincial capital of ${profile.name}, so traffic in both directions is heavy enough to justify a nightly vehicle.` : `Volume on this corridor is steady enough for a scheduled vehicle rather than a consolidation wait.`}${addressingTip(district)}`;
      transit = `${eta.replace(/\.$/, "")}: a parcel loaded in the evening is normally sorted at ${district.headquarters} the following morning and delivered the same day. Addresses off the highway inside ${district.name} add a day. The lane runs Sunday to Friday, so a Friday evening booking lands at the start of the next week.`;
      coverage = `${district.headquarters} and the built-up area around it are next-day. The rest of ${district.name} is covered, but as a road leg off the main corridor rather than part of the overnight run, so quote the recipient a day's margin.`;
      sending = `This lane carries most of what a business sends: e-commerce orders, documents and contracts, spare parts, stock replenishment between branches, and return consignments back to Kathmandu. Bulk dispatches are better booked as a scheduled pickup than parcel by parcel.`;
      cod = `Cash on delivery is practical in ${district.name}. The collection happens on a next-day lane, so the gap between a buyer paying and a seller being remitted stays short — short enough that COD is a reasonable default for an online seller shipping here regularly.`;
      faqs = [
        {
          question: `How long does delivery to ${district.name} take?`,
          answer: `${eta}. Parcels loaded in the evening are normally sorted at ${district.headquarters} the next morning and delivered that day; addresses away from the highway add a day.`,
        },
        {
          question: `Do you deliver beyond ${district.headquarters} in ${district.name}?`,
          answer: `Yes. The whole district is covered. ${district.headquarters} is on the overnight lane and the outlying areas are served as a road leg from it, which typically adds a day.`,
        },
        {
          question: `Can I collect cash on delivery for orders sent to ${district.name}?`,
          answer: `Yes. COD is offered across the network and it works well on this lane, because the next-day transit keeps the gap between collection and remittance short.`,
        },
        {
          question: `How is the charge to ${district.name} calculated?`,
          answer: `By weight, by the volumetric size of the parcel and by the zone it is going to. The calculator at /pricing prices your actual consignment; we do not quote a flat figure that may not match it.`,
        },
      ];
      break;
    }

    case "hills": {
      summary = `Courier and parcel delivery to ${district.name}, delivered through ${district.headquarters} in 2-4 working days, with cash on delivery, pickup booking and tracking.`;
      lead = `Delivery in ${district.name} is centred on ${hqLabel(district)}. The trunk leg into the province is scheduled and predictable; the hill road at the end of it is the part that decides when a parcel actually arrives.${addressingTip(district)}${sameZonePeers.length > 0 ? ` ${district.name} is one of ${profile.zoneCounts.hills} ${plural(profile.zoneCounts.hills, "district", "districts")} in ${profile.name} served this way.` : ""}`;
      transit = `${eta.replace(/\.$/, "")} to ${district.headquarters}. Consignments are consolidated at the province's city-tier points — ${hubNames} — before the road leg, so a parcel that misses a vehicle waits for the next one rather than travelling half-loaded. Wards away from ${district.headquarters} add a day or two on top.`;
      coverage = `${district.headquarters} is the reliable part. Beyond it, delivery follows the local road, and in monsoon a closure can hold a vehicle for a day without anything being wrong with the parcel. A working phone number for the recipient is the single most useful thing on a consignment to ${district.name}.`;
      sending = `Documents, retail orders, medicines, spare parts and agricultural supplies are the usual traffic into ${district.name}, with produce and finished goods coming back the other way. Pack for a road that is not smooth: a carton that survives a highway will not necessarily survive the last two hours.`;
      cod = `Cash on delivery is available in ${district.name} and is widely used. Worth knowing as a seller: with ${etaDays} each way, the money from a COD order sits with the parcel for the best part of a week before it is remitted. For a high-value order, prepaid is kinder to your cash flow.`;
      faqs = [
        {
          question: `How many days does a parcel take to reach ${district.name}?`,
          answer: `${eta} to ${district.headquarters}. Addresses in wards away from the headquarters usually add a day or two beyond that.`,
        },
        {
          question: `Where is a parcel for ${district.name} delivered from?`,
          answer: `From ${district.headquarters}, the district headquarters. Consignments are consolidated at the city-tier points in ${profile.name} — ${hubNames} — before the road leg into the district.`,
        },
        {
          question: `Does cash on delivery work in ${district.name}?`,
          answer: `Yes. The practical caveat is time rather than availability: with ${etaDays} in each direction, a seller waits roughly a week between dispatch and remittance.`,
        },
        {
          question: `What affects the cost of sending to ${district.name}?`,
          answer: `Weight, volumetric size and the delivery zone — ${district.name} is a hill-tier district, which prices differently from a highway town. Check your own parcel on the calculator at /pricing.`,
        },
      ];
      break;
    }

    case "remote":
    default: {
      summary = `Courier delivery to ${district.name}, reaching ${district.headquarters} in 4-10 working days. Transit follows the weather and seasonal access, so plan around the season.`;
      lead = `${district.name} is one of the hardest lanes in the country, and it is worth being plain about why: ${hqLabel(district)}, sits at the end of a lane where the road is seasonal, the weather sets the schedule, and no amount of planning makes a closed pass open.${addressingTip(district)} ${profile.remote.length > 1 ? `It is one of ${profile.remote.length} remote districts in ${profile.name}.` : `It is the only district in ${profile.name} classified this way.`}`;
      transit = `Expect ${etaDays} to ${district.headquarters}. That range is not hedging — it is the difference between a week when the flights go or the road is clear and a week when neither happens. Parcels are consolidated at ${hubNames} and wait there for a usable leg rather than being pushed onto one that will strand them.`;
      coverage = `We deliver to ${district.headquarters}. Addresses beyond it depend on local onward transport and can add several days, so if the recipient is outside the headquarters, say so when you book and we will tell you what is realistic rather than quote you the headquarters figure.`;
      sending = `Documents, medicines, spare parts, school and office supplies and retail orders all move to ${district.name}. Where the last leg flies, the aviation restrictions apply and they are not negotiable: no loose lithium batteries, no pressurised cans, no flammable liquids. Weight matters more here than anywhere else, because space on the leg is finite.`;
      cod = `Cash on delivery is offered in ${district.name}, but think about it before you choose it. With ${etaDays} outbound and a similar wait for the remittance to come back, a seller can be two to three weeks out of pocket on a single order. For anything of value on this lane, take payment up front.`;
      faqs = [
        {
          question: `How long does a parcel take to reach ${district.name}?`,
          answer: `Usually ${etaDays} to ${district.headquarters}. The range is real: it depends on whether the flights operate or the road is open, and in monsoon or deep winter it is at the longer end.`,
        },
        {
          question: `Can you deliver to ${district.name} all year round?`,
          answer: `We accept consignments for ${district.name} year round, but transit widens when weather closes the road or grounds the air leg. Parcels wait at ${hubNames} for a usable leg rather than being sent on one that would strand them.`,
        },
        {
          question: `What cannot be sent to ${district.name}?`,
          answer: `Where the final leg is by air, aviation rules apply: no loose lithium batteries, no pressurised or aerosol cans and no flammable liquids. Heavy or bulky consignments may also wait for space on a flight.`,
        },
        {
          question: `Is cash on delivery sensible for ${district.name}?`,
          answer: `It is available, but on a lane of ${etaDays} a seller can be two to three weeks between dispatch and remittance. Prepaid is the better choice for a high-value order here.`,
        },
      ];
      break;
    }
  }

  return {
    summary,
    lead: `${lead}${capitalSentence(district, profile, isCapital)}`,
    transit,
    coverage,
    sending,
    cod,
    booking,
    note,
    faqs,
  };
}

function capitalSentence(
  district: DistrictRecord,
  profile: ProvinceProfile,
  isCapital: boolean,
): string {
  if (!isCapital || district.zone === "cities") return "";
  return ` ${district.headquarters} is also the provincial capital of ${profile.name}.`;
}

/** The sentence used under the H1 and in the metadata description. */
export function districtMetaDescription(district: DistrictRecord): string {
  return districtCopy(district).summary;
}

/** Districts in the same province, excluding the one being viewed. */
export function sameProvinceDistricts(district: DistrictRecord): DistrictRecord[] {
  return districtsInProvince(district.province).filter((d) => d.slug !== district.slug);
}

/** Every district, for the index page and for generateStaticParams. */
export const ALL_DISTRICTS = DISTRICTS;

const BY_NAME: Record<string, DistrictRecord> = Object.fromEntries(
  DISTRICTS.map((district) => [district.name.toLowerCase(), district]),
);

/**
 * Resolve a district by the name the backend stores.
 *
 * Branch records carry the district *name* ("Eastern Rukum"), not the slug,
 * and lowercasing a name is not the same transformation as slugifying it —
 * so the lookup goes through its own index rather than `districtBySlug`.
 */
export function districtByName(name: string | null | undefined): DistrictRecord | undefined {
  if (!name) return undefined;
  return BY_NAME[name.trim().toLowerCase()];
}
