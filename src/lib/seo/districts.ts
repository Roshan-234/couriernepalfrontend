/**
 * Nepal's 7 provinces and 77 districts, with the courier delivery zone each
 * one falls in.
 *
 * This mirrors `app/data/nepal_geo.py` in the backend. It is duplicated here
 * rather than fetched because `generateStaticParams` runs during `next
 * build`, which happens in CI where the Flask API is not reachable — a build
 * that depended on the backend would simply fail there.
 *
 * `tests/test_geo_parity.py` in the backend asserts the two lists agree, so
 * the duplication cannot drift silently.
 */

export type DeliveryZone = "valley" | "cities" | "hills" | "remote";

export interface DistrictRecord {
  name: string;
  slug: string;
  headquarters: string;
  province: string;
  provinceCode: string;
  zone: DeliveryZone;
}

export const ZONE_LABELS: Record<DeliveryZone, { label: string; eta: string }> = {
  valley: { label: "Kathmandu Valley", eta: "Same-day and next-day delivery" },
  cities: { label: "Major cities", eta: "Next-day delivery on highway routes" },
  hills: { label: "District headquarters", eta: "2-4 working days" },
  remote: { label: "Remote districts", eta: "4-10 working days, air or seasonal road" },
};

export interface ProvinceRecord {
  name: string;
  code: string;
  capital: string;
  districtCount: number;
}

export const PROVINCES: ProvinceRecord[] = [
  { name: "Koshi", code: "P1", capital: "Biratnagar", districtCount: 14 },
  { name: "Madhesh", code: "P2", capital: "Janakpur", districtCount: 8 },
  { name: "Bagmati", code: "P3", capital: "Hetauda", districtCount: 13 },
  { name: "Gandaki", code: "P4", capital: "Pokhara", districtCount: 11 },
  { name: "Lumbini", code: "P5", capital: "Deukhuri", districtCount: 12 },
  { name: "Karnali", code: "P6", capital: "Birendranagar", districtCount: 10 },
  { name: "Sudurpashchim", code: "P7", capital: "Godawari", districtCount: 9 },
];

export const DISTRICTS: DistrictRecord[] = [
  { name: "Bhojpur", slug: "bhojpur", headquarters: "Bhojpur", province: "Koshi", provinceCode: "P1", zone: "hills" },
  { name: "Dhankuta", slug: "dhankuta", headquarters: "Dhankuta", province: "Koshi", provinceCode: "P1", zone: "hills" },
  { name: "Ilam", slug: "ilam", headquarters: "Ilam", province: "Koshi", provinceCode: "P1", zone: "hills" },
  { name: "Jhapa", slug: "jhapa", headquarters: "Bhadrapur", province: "Koshi", provinceCode: "P1", zone: "cities" },
  { name: "Khotang", slug: "khotang", headquarters: "Diktel", province: "Koshi", provinceCode: "P1", zone: "hills" },
  { name: "Morang", slug: "morang", headquarters: "Biratnagar", province: "Koshi", provinceCode: "P1", zone: "cities" },
  { name: "Okhaldhunga", slug: "okhaldhunga", headquarters: "Okhaldhunga", province: "Koshi", provinceCode: "P1", zone: "hills" },
  { name: "Panchthar", slug: "panchthar", headquarters: "Phidim", province: "Koshi", provinceCode: "P1", zone: "hills" },
  { name: "Sankhuwasabha", slug: "sankhuwasabha", headquarters: "Khandbari", province: "Koshi", provinceCode: "P1", zone: "hills" },
  { name: "Solukhumbu", slug: "solukhumbu", headquarters: "Salleri", province: "Koshi", provinceCode: "P1", zone: "remote" },
  { name: "Sunsari", slug: "sunsari", headquarters: "Inaruwa", province: "Koshi", provinceCode: "P1", zone: "cities" },
  { name: "Taplejung", slug: "taplejung", headquarters: "Taplejung", province: "Koshi", provinceCode: "P1", zone: "remote" },
  { name: "Terhathum", slug: "terhathum", headquarters: "Myanglung", province: "Koshi", provinceCode: "P1", zone: "hills" },
  { name: "Udayapur", slug: "udayapur", headquarters: "Gaighat", province: "Koshi", provinceCode: "P1", zone: "hills" },
  { name: "Bara", slug: "bara", headquarters: "Kalaiya", province: "Madhesh", provinceCode: "P2", zone: "cities" },
  { name: "Dhanusha", slug: "dhanusha", headquarters: "Janakpur", province: "Madhesh", provinceCode: "P2", zone: "cities" },
  { name: "Mahottari", slug: "mahottari", headquarters: "Jaleshwar", province: "Madhesh", provinceCode: "P2", zone: "hills" },
  { name: "Parsa", slug: "parsa", headquarters: "Birgunj", province: "Madhesh", provinceCode: "P2", zone: "cities" },
  { name: "Rautahat", slug: "rautahat", headquarters: "Gaur", province: "Madhesh", provinceCode: "P2", zone: "hills" },
  { name: "Saptari", slug: "saptari", headquarters: "Rajbiraj", province: "Madhesh", provinceCode: "P2", zone: "hills" },
  { name: "Sarlahi", slug: "sarlahi", headquarters: "Malangwa", province: "Madhesh", provinceCode: "P2", zone: "hills" },
  { name: "Siraha", slug: "siraha", headquarters: "Siraha", province: "Madhesh", provinceCode: "P2", zone: "hills" },
  { name: "Bhaktapur", slug: "bhaktapur", headquarters: "Bhaktapur", province: "Bagmati", provinceCode: "P3", zone: "valley" },
  { name: "Chitwan", slug: "chitwan", headquarters: "Bharatpur", province: "Bagmati", provinceCode: "P3", zone: "cities" },
  { name: "Dhading", slug: "dhading", headquarters: "Dhading Besi", province: "Bagmati", provinceCode: "P3", zone: "hills" },
  { name: "Dolakha", slug: "dolakha", headquarters: "Charikot", province: "Bagmati", provinceCode: "P3", zone: "hills" },
  { name: "Kathmandu", slug: "kathmandu", headquarters: "Kathmandu", province: "Bagmati", provinceCode: "P3", zone: "valley" },
  { name: "Kavrepalanchok", slug: "kavrepalanchok", headquarters: "Dhulikhel", province: "Bagmati", provinceCode: "P3", zone: "hills" },
  { name: "Lalitpur", slug: "lalitpur", headquarters: "Lalitpur", province: "Bagmati", provinceCode: "P3", zone: "valley" },
  { name: "Makwanpur", slug: "makwanpur", headquarters: "Hetauda", province: "Bagmati", provinceCode: "P3", zone: "cities" },
  { name: "Nuwakot", slug: "nuwakot", headquarters: "Bidur", province: "Bagmati", provinceCode: "P3", zone: "hills" },
  { name: "Ramechhap", slug: "ramechhap", headquarters: "Manthali", province: "Bagmati", provinceCode: "P3", zone: "hills" },
  { name: "Rasuwa", slug: "rasuwa", headquarters: "Dhunche", province: "Bagmati", provinceCode: "P3", zone: "remote" },
  { name: "Sindhuli", slug: "sindhuli", headquarters: "Kamalamai", province: "Bagmati", provinceCode: "P3", zone: "hills" },
  { name: "Sindhupalchok", slug: "sindhupalchok", headquarters: "Chautara", province: "Bagmati", provinceCode: "P3", zone: "hills" },
  { name: "Baglung", slug: "baglung", headquarters: "Baglung", province: "Gandaki", provinceCode: "P4", zone: "hills" },
  { name: "Gorkha", slug: "gorkha", headquarters: "Gorkha", province: "Gandaki", provinceCode: "P4", zone: "hills" },
  { name: "Kaski", slug: "kaski", headquarters: "Pokhara", province: "Gandaki", provinceCode: "P4", zone: "cities" },
  { name: "Lamjung", slug: "lamjung", headquarters: "Besisahar", province: "Gandaki", provinceCode: "P4", zone: "hills" },
  { name: "Manang", slug: "manang", headquarters: "Chame", province: "Gandaki", provinceCode: "P4", zone: "remote" },
  { name: "Mustang", slug: "mustang", headquarters: "Jomsom", province: "Gandaki", provinceCode: "P4", zone: "remote" },
  { name: "Myagdi", slug: "myagdi", headquarters: "Beni", province: "Gandaki", provinceCode: "P4", zone: "hills" },
  { name: "Nawalpur", slug: "nawalpur", headquarters: "Kawasoti", province: "Gandaki", provinceCode: "P4", zone: "hills" },
  { name: "Parbat", slug: "parbat", headquarters: "Kusma", province: "Gandaki", provinceCode: "P4", zone: "hills" },
  { name: "Syangja", slug: "syangja", headquarters: "Putalibazar", province: "Gandaki", provinceCode: "P4", zone: "hills" },
  { name: "Tanahun", slug: "tanahun", headquarters: "Damauli", province: "Gandaki", provinceCode: "P4", zone: "hills" },
  { name: "Arghakhanchi", slug: "arghakhanchi", headquarters: "Sandhikharka", province: "Lumbini", provinceCode: "P5", zone: "hills" },
  { name: "Banke", slug: "banke", headquarters: "Nepalgunj", province: "Lumbini", provinceCode: "P5", zone: "cities" },
  { name: "Bardiya", slug: "bardiya", headquarters: "Gulariya", province: "Lumbini", provinceCode: "P5", zone: "hills" },
  { name: "Dang", slug: "dang", headquarters: "Ghorahi", province: "Lumbini", provinceCode: "P5", zone: "cities" },
  { name: "Eastern Rukum", slug: "eastern-rukum", headquarters: "Rukumkot", province: "Lumbini", provinceCode: "P5", zone: "remote" },
  { name: "Gulmi", slug: "gulmi", headquarters: "Tamghas", province: "Lumbini", provinceCode: "P5", zone: "hills" },
  { name: "Kapilvastu", slug: "kapilvastu", headquarters: "Taulihawa", province: "Lumbini", provinceCode: "P5", zone: "hills" },
  { name: "Palpa", slug: "palpa", headquarters: "Tansen", province: "Lumbini", provinceCode: "P5", zone: "hills" },
  { name: "Parasi", slug: "parasi", headquarters: "Ramgram", province: "Lumbini", provinceCode: "P5", zone: "hills" },
  { name: "Pyuthan", slug: "pyuthan", headquarters: "Pyuthan", province: "Lumbini", provinceCode: "P5", zone: "hills" },
  { name: "Rolpa", slug: "rolpa", headquarters: "Liwang", province: "Lumbini", provinceCode: "P5", zone: "hills" },
  { name: "Rupandehi", slug: "rupandehi", headquarters: "Butwal", province: "Lumbini", provinceCode: "P5", zone: "cities" },
  { name: "Dailekh", slug: "dailekh", headquarters: "Narayan", province: "Karnali", provinceCode: "P6", zone: "hills" },
  { name: "Dolpa", slug: "dolpa", headquarters: "Dunai", province: "Karnali", provinceCode: "P6", zone: "remote" },
  { name: "Humla", slug: "humla", headquarters: "Simikot", province: "Karnali", provinceCode: "P6", zone: "remote" },
  { name: "Jajarkot", slug: "jajarkot", headquarters: "Khalanga", province: "Karnali", provinceCode: "P6", zone: "hills" },
  { name: "Jumla", slug: "jumla", headquarters: "Chandannath", province: "Karnali", provinceCode: "P6", zone: "remote" },
  { name: "Kalikot", slug: "kalikot", headquarters: "Manma", province: "Karnali", provinceCode: "P6", zone: "remote" },
  { name: "Mugu", slug: "mugu", headquarters: "Gamgadhi", province: "Karnali", provinceCode: "P6", zone: "remote" },
  { name: "Salyan", slug: "salyan", headquarters: "Salyan", province: "Karnali", provinceCode: "P6", zone: "hills" },
  { name: "Surkhet", slug: "surkhet", headquarters: "Birendranagar", province: "Karnali", provinceCode: "P6", zone: "cities" },
  { name: "Western Rukum", slug: "western-rukum", headquarters: "Musikot", province: "Karnali", provinceCode: "P6", zone: "hills" },
  { name: "Achham", slug: "achham", headquarters: "Mangalsen", province: "Sudurpashchim", provinceCode: "P7", zone: "hills" },
  { name: "Baitadi", slug: "baitadi", headquarters: "Dasharathchand", province: "Sudurpashchim", provinceCode: "P7", zone: "hills" },
  { name: "Bajhang", slug: "bajhang", headquarters: "Jayaprithvi", province: "Sudurpashchim", provinceCode: "P7", zone: "remote" },
  { name: "Bajura", slug: "bajura", headquarters: "Martadi", province: "Sudurpashchim", provinceCode: "P7", zone: "remote" },
  { name: "Dadeldhura", slug: "dadeldhura", headquarters: "Amargadhi", province: "Sudurpashchim", provinceCode: "P7", zone: "hills" },
  { name: "Darchula", slug: "darchula", headquarters: "Khalanga", province: "Sudurpashchim", provinceCode: "P7", zone: "remote" },
  { name: "Doti", slug: "doti", headquarters: "Dipayal Silgadhi", province: "Sudurpashchim", provinceCode: "P7", zone: "hills" },
  { name: "Kailali", slug: "kailali", headquarters: "Dhangadhi", province: "Sudurpashchim", provinceCode: "P7", zone: "cities" },
  { name: "Kanchanpur", slug: "kanchanpur", headquarters: "Bhimdatta", province: "Sudurpashchim", provinceCode: "P7", zone: "cities" },
];

export const DISTRICTS_BY_SLUG: Record<string, DistrictRecord> = Object.fromEntries(
  DISTRICTS.map((district) => [district.slug, district]),
);

export function districtBySlug(slug: string): DistrictRecord | undefined {
  return DISTRICTS_BY_SLUG[slug.toLowerCase()];
}

export function districtsInProvince(province: string): DistrictRecord[] {
  return DISTRICTS.filter((district) => district.province === province);
}
