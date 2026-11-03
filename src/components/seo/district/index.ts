/**
 * Everything shared between the district cluster pages: `/courier`,
 * `/courier/[district]` and `/branches`.
 */

export { default as PageBreadcrumbs } from "./PageBreadcrumbs";
export { ZoneGuide } from "./ZoneGuide";
export { DistrictLinks } from "./DistrictLinks";
export { FaqList } from "./FaqList";
export { Prose, SectionHeading } from "./Prose";
export {
  ALL_DISTRICTS,
  DISTRICT_NOTES,
  PROVINCE_PROFILES,
  ZONE_ORDER,
  ZONE_PLANNING,
  ZONE_SUMMARY,
  ZONE_TONE,
  districtByName,
  districtCopy,
  districtMetaDescription,
  listNames,
  provinceAnchor,
  provinceIntro,
  provinceProfile,
  sameProvinceDistricts,
} from "./copy";
export type { DistrictCopy, DistrictFaq, ProvinceProfile } from "./copy";
