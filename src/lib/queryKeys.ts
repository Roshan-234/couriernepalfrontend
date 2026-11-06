/**
 * Every React Query cache key in one place.
 *
 * Keys used to be inline string literals, which is how `["shipment", id]` and
 * `["shipment", String(id)]` ended up in two files and quietly stopped
 * invalidating each other. Building them here keeps a mutation and the query
 * it should refresh on the same key.
 *
 * Ids are normalised to strings so a numeric id and its string form hit the
 * same cache entry.
 */

const id = (value: string | number) => String(value);

export const queryKeys = {
  shipments: {
    all: ["shipments"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["shipments", "list", filters] as const,
    detail: (shipmentId: string | number) =>
      ["shipments", "detail", id(shipmentId)] as const,
    attempts: (shipmentId: string | number) =>
      ["shipments", "detail", id(shipmentId), "attempts"] as const,
  },

  tracking: {
    byNumber: (trackingNo: string) => ["tracking", trackingNo] as const,
  },

  pickups: {
    all: ["pickups"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["pickups", "list", filters] as const,
    detail: (pickupId: string | number) =>
      ["pickups", "detail", id(pickupId)] as const,
    assigned: ["pickups", "assigned"] as const,
  },

  branches: {
    all: ["branches"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["branches", "list", filters] as const,
    detail: (branchId: string | number) =>
      ["branches", "detail", id(branchId)] as const,
    serving: (district: string) => ["branches", "serving", district] as const,
  },

  riders: {
    all: ["riders"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["riders", "list", filters] as const,
    detail: (riderId: string | number) =>
      ["riders", "detail", id(riderId)] as const,
    me: ["riders", "me"] as const,
    myShipments: ["riders", "me", "shipments"] as const,
  },

  cod: {
    all: ["cod"] as const,
    collections: (filters: Record<string, unknown> = {}) =>
      ["cod", "collections", filters] as const,
    remittances: (filters: Record<string, unknown> = {}) =>
      ["cod", "remittances", filters] as const,
    remittance: (remittanceId: string | number) =>
      ["cod", "remittances", id(remittanceId)] as const,
    summary: ["cod", "summary"] as const,
  },

  payments: {
    all: ["payments"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["payments", "list", filters] as const,
    detail: (paymentId: string | number) =>
      ["payments", "detail", id(paymentId)] as const,
    gateways: ["payments", "gateways"] as const,
    gatewaysAll: ["payments", "gateways", "all"] as const,
  },

  rates: {
    all: ["rates"] as const,
    cards: (filters: Record<string, unknown> = {}) =>
      ["rates", "cards", filters] as const,
    card: (cardId: string | number) => ["rates", "cards", id(cardId)] as const,
    surcharges: ["rates", "surcharges"] as const,
    quote: (criteria: Record<string, unknown>) =>
      ["rates", "quote", criteria] as const,
  },

  carriers: {
    all: ["carriers"] as const,
    list: ["carriers", "list"] as const,
    admin: ["carriers", "admin"] as const,
    detail: (code: string) => ["carriers", "detail", code] as const,
  },

  merchant: {
    keys: ["merchant", "keys"] as const,
  },

  webhooks: {
    all: ["webhooks"] as const,
    list: ["webhooks", "list"] as const,
    deliveries: (endpointId: string | number) =>
      ["webhooks", id(endpointId), "deliveries"] as const,
  },

  notifications: {
    templates: ["notifications", "templates"] as const,
    template: (code: string) => ["notifications", "templates", code] as const,
    logs: (filters: Record<string, unknown> = {}) =>
      ["notifications", "logs", filters] as const,
    smsProviders: ["notifications", "sms-providers"] as const,
  },

  claims: {
    all: ["claims"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["claims", "list", filters] as const,
    detail: (claimId: string | number) =>
      ["claims", "detail", id(claimId)] as const,
  },

  /**
   * The two export documents. Kept apart from `shipments` even though both
   * can hang off one: finalising a packing list must not blow away the
   * shipment caches, and the two answer different questions.
   */
  packingLists: {
    all: ["packing-lists"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["packing-lists", "list", filters] as const,
    detail: (packingListId: string | number) =>
      ["packing-lists", "detail", id(packingListId)] as const,
  },

  /** `/api/invoices` on the wire; a freight bill on paper. */
  freightBills: {
    all: ["freight-bills"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["freight-bills", "list", filters] as const,
    detail: (billId: string | number) =>
      ["freight-bills", "detail", id(billId)] as const,
  },

  geo: {
    provinces: ["geo", "provinces"] as const,
    districts: (filters: Record<string, unknown> = {}) =>
      ["geo", "districts", filters] as const,
    zones: ["geo", "zones"] as const,
  },

  admin: {
    dashboard: ["admin", "dashboard"] as const,
    stats: (range: string) => ["admin", "dashboard", "stats", range] as const,
    users: (filters: Record<string, unknown> = {}) =>
      ["admin", "users", filters] as const,
    auditLogs: (filters: Record<string, unknown> = {}) =>
      ["admin", "audit-logs", filters] as const,
  },

  content: {
    pages: ["site-content"] as const,
  },

  ads: {
    all: ["ads"] as const,
    /**
     * One entry per slot per page per language. Path is part of the key
     * because `/serve` decides on it, so the same placement legitimately
     * answers differently on `/` and on `/pricing`.
     */
    slot: (placement: string, path: string, language: string) =>
      ["ads", "slot", placement, path, language] as const,
    /**
     * The dismissed codes are in the key on purpose: dismissing a notice
     * changes what the feed should return, and a key that ignored the
     * exclusions would serve the dismissed notice back from cache.
     */
    notices: (path: string, language: string, exclude: readonly string[]) =>
      ["ads", "notices", path, language, [...exclude].sort().join(",")] as const,
  },

  /**
   * The admin side of advertising. Kept apart from `ads` above, which is
   * the visitor-facing feed: invalidating a campaign edit must not blow
   * away a public slot's cache, and the two answer different questions.
   */
  adsAdmin: {
    all: ["ads-admin"] as const,
    campaigns: (filters: Record<string, unknown> = {}) =>
      ["ads-admin", "campaigns", filters] as const,
    campaign: (campaignId: string | number) =>
      ["ads-admin", "campaigns", id(campaignId)] as const,
    creatives: (campaignId: string | number) =>
      ["ads-admin", "campaigns", id(campaignId), "creatives"] as const,
    placements: ["ads-admin", "placements"] as const,
    notices: (filters: Record<string, unknown> = {}) =>
      ["ads-admin", "notices", filters] as const,
    /** The range is in the key: it selects which campaigns appear. */
    report: (range: Record<string, unknown> = {}) =>
      ["ads-admin", "report", range] as const,
  },

  marketing: {
    all: ["marketing"] as const,
    contacts: (filters: Record<string, unknown> = {}) =>
      ["marketing", "contacts", filters] as const,
    contact: (contactId: string | number) =>
      ["marketing", "contacts", id(contactId)] as const,
    campaigns: (filters: Record<string, unknown> = {}) =>
      ["marketing", "campaigns", filters] as const,
    campaign: (campaignId: string | number) =>
      ["marketing", "campaigns", id(campaignId)] as const,
    campaignReport: (campaignId: string | number) =>
      ["marketing", "campaigns", id(campaignId), "report"] as const,
    campaignSends: (campaignId: string | number, filters: Record<string, unknown> = {}) =>
      ["marketing", "campaigns", id(campaignId), "sends", filters] as const,
  },

  consent: {
    all: ["consent"] as const,
    /** The decision in force, as the server sees it. Asked once per load. */
    status: ["consent", "status"] as const,
    /** Categories and wording for the version being submitted against. */
    policy: ["consent", "policy"] as const,
    me: ["consent", "me"] as const,
  },

  sessions: (userId?: string | number) =>
    userId === undefined ? (["sessions"] as const) : (["sessions", id(userId)] as const),

  /**
   * Admin analytics reporting. Kept apart from the `consent` block above,
   * which is the visitor's own state; nothing here is per-visitor.
   */
  analytics: {
    all: ["analytics"] as const,
    overview: (range: Record<string, unknown> = {}) =>
      ["analytics", "overview", range] as const,
    events: (filters: Record<string, unknown> = {}) =>
      ["analytics", "events", filters] as const,
    daily: (filters: Record<string, unknown> = {}) =>
      ["analytics", "daily", filters] as const,
    realtime: ["analytics", "realtime"] as const,
  },

  /** The consent register, as an administrator reads it. */
  consentRegister: {
    all: ["consent-register"] as const,
    records: (filters: Record<string, unknown> = {}) =>
      ["consent-register", "records", filters] as const,
    summary: ["consent-register", "summary"] as const,
  },

  privacy: {
    all: ["privacy"] as const,
    queue: (filters: Record<string, unknown> = {}) =>
      ["privacy", "queue", filters] as const,
    /**
     * Its own key rather than part of the queue's: the overdue count is
     * shown whatever the filters are, and must not disappear because
     * somebody narrowed the list.
     */
    overdue: ["privacy", "overdue"] as const,
    retention: ["privacy", "retention"] as const,
  },

  /**
   * Reviews. Our own and Google's are separate keys because they are
   * separate bodies of content with separate ratings — a single key would
   * make it one careless refetch away from showing one as the other.
   */
  reviews: {
    all: ["reviews"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      ["reviews", "list", filters] as const,
    /** Its own key: the star distribution is shown whatever the filters are. */
    summary: ["reviews", "summary"] as const,
    google: ["reviews", "google"] as const,
    admin: (filters: Record<string, unknown> = {}) =>
      ["reviews", "admin", filters] as const,
  },
} as const;
