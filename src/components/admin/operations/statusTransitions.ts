/**
 * The shipment state machine, mirroring `TRANSITIONS` in the backend's
 * `app/shipment_status.py`.
 *
 * The API is the authority: it answers an illegal move with 409 and the
 * console surfaces that message. This table exists so the status picker only
 * offers moves that stand a chance, rather than listing all eighteen states
 * and letting the operator discover the rule by being rejected.
 *
 * When the backend table changes, change this one in the same commit.
 */

import type { ShipmentStatus } from "@/types/logistics";

export const SHIPMENT_TRANSITIONS: Record<ShipmentStatus, readonly ShipmentStatus[]> = {
  draft: ["pending", "cancelled"],
  pending: ["pickup_assigned", "picked_up", "on_hold", "cancelled"],
  pickup_assigned: ["picked_up", "pending", "on_hold", "cancelled"],
  picked_up: ["at_origin_branch", "in_transit", "on_hold", "damaged", "lost"],
  at_origin_branch: ["in_transit", "on_hold", "damaged", "lost"],
  in_transit: [
    "at_destination_branch",
    "customs_hold",
    "out_for_delivery",
    "on_hold",
    "damaged",
    "lost",
  ],
  customs_hold: ["in_transit", "at_destination_branch", "rto_initiated", "on_hold"],
  at_destination_branch: ["out_for_delivery", "on_hold", "rto_initiated", "damaged", "lost"],
  out_for_delivery: ["delivered", "delivery_attempted", "on_hold", "damaged", "lost"],
  delivery_attempted: [
    "out_for_delivery",
    "at_destination_branch",
    "rto_initiated",
    "on_hold",
  ],
  rto_initiated: ["rto_in_transit", "on_hold"],
  rto_in_transit: ["returned", "on_hold", "lost", "damaged"],
  on_hold: [
    "pending",
    "picked_up",
    "at_origin_branch",
    "in_transit",
    "at_destination_branch",
    "out_for_delivery",
    "rto_initiated",
    "cancelled",
  ],
  damaged: ["rto_initiated", "delivered", "lost"],
  // Terminal: a shipment in one of these never moves again.
  delivered: [],
  returned: [],
  cancelled: [],
  lost: [],
};

/** States a shipment never leaves. */
export const TERMINAL_STATUSES: readonly ShipmentStatus[] = [
  "delivered",
  "returned",
  "cancelled",
  "lost",
];

export const ALL_STATUSES = Object.keys(SHIPMENT_TRANSITIONS) as ShipmentStatus[];

/**
 * Progress along the normal delivery line, mirroring `PROGRESS` in the
 * backend.
 *
 * Operations routinely skip a scan — a parcel booked in the morning can be on
 * a truck by noon with nobody recording "picked up" — so the server allows a
 * jump forward along this line. What it refuses is moving backwards or
 * leaving a terminal state. Statuses absent here (holds, returns,
 * write-offs) are reachable only through the explicit table above.
 */
const PROGRESS: Partial<Record<ShipmentStatus, number>> = {
  draft: 0,
  pending: 1,
  pickup_assigned: 2,
  picked_up: 3,
  at_origin_branch: 4,
  in_transit: 5,
  at_destination_branch: 6,
  out_for_delivery: 7,
  delivery_attempted: 7,
  delivered: 8,
};

export function isTerminalStatus(status: ShipmentStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/** Mirrors `can_transition` in `app/shipment_status.py`. */
export function canTransition(
  current: ShipmentStatus,
  target: ShipmentStatus,
): boolean {
  if (current === target) return true;
  if (!SHIPMENT_TRANSITIONS[current]) return true; // unknown legacy value
  if (isTerminalStatus(current)) return false;
  if (SHIPMENT_TRANSITIONS[current].includes(target)) return true;
  const here = PROGRESS[current];
  const there = PROGRESS[target];
  return here !== undefined && there !== undefined && there > here;
}

/**
 * Moves an operator may choose from the given state.
 *
 * A status this build does not know about falls back to the full list, which
 * is what the backend does for rows written before the state machine existed.
 */
export function nextStatuses(current: ShipmentStatus): ShipmentStatus[] {
  if (!SHIPMENT_TRANSITIONS[current]) return [...ALL_STATUSES].sort();
  return ALL_STATUSES.filter(
    (target) => target !== current && canTransition(current, target),
  ).sort();
}
