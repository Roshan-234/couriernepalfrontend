export { default as OutboundCorridorPage } from "./OutboundCorridorPage";
export { default as InboundCorridorPage } from "./InboundCorridorPage";
export {
  corridorContent,
  corridorsWithoutContent,
  directionContent,
  regionGroups,
  regionLabel,
} from "./data";
export type { RegionGroup } from "./data";
export {
  INBOUND_PREFIX,
  OUTBOUND_PREFIX,
  corridorLabel,
  corridorPath,
  corridorRouteParams,
  inboundPath,
  outboundPath,
  resolveCorridorRoute,
  theCountry,
} from "./routes";
export type { ResolvedRoute } from "./routes";
export type {
  Callout,
  CorridorContent,
  Direction,
  DirectionContent,
  ModeProfile,
  QA,
  RegionId,
} from "./types";
