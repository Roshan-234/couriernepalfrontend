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

  sessions: (userId?: string | number) =>
    userId === undefined ? (["sessions"] as const) : (["sessions", id(userId)] as const),
} as const;
