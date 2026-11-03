import type { ShipmentStatus, StatusGroup } from '@/types/logistics';
import { Badge, type BadgeSize, type BadgeTone, type BadgeVariant } from './Badge';

/**
 * Which lifecycle group each status belongs to. Mirrors `GROUPS` in the
 * backend's `app/shipment_status.py`; the API also sends `status_group` on
 * every shipment, so prefer passing that through when you have it.
 */
export const STATUS_GROUPS: Record<ShipmentStatus, StatusGroup> = {
  draft: 'booking',
  pending: 'booking',
  pickup_assigned: 'collection',
  picked_up: 'collection',
  at_origin_branch: 'line_haul',
  in_transit: 'line_haul',
  at_destination_branch: 'line_haul',
  customs_hold: 'line_haul',
  out_for_delivery: 'last_mile',
  delivery_attempted: 'last_mile',
  delivered: 'last_mile',
  rto_initiated: 'return',
  rto_in_transit: 'return',
  returned: 'return',
  on_hold: 'exception',
  lost: 'exception',
  damaged: 'exception',
  cancelled: 'exception',
};

/** Human labels, mirroring the backend `LABELS` map. Used when the API's
 *  `status_label` is not available at the call site. */
export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  draft: 'Draft',
  pending: 'Booked, awaiting pickup',
  pickup_assigned: 'Pickup assigned',
  picked_up: 'Picked up',
  at_origin_branch: 'At origin branch',
  in_transit: 'In transit',
  at_destination_branch: 'At destination branch',
  customs_hold: 'Held at customs',
  out_for_delivery: 'Out for delivery',
  delivery_attempted: 'Delivery attempted',
  delivered: 'Delivered',
  rto_initiated: 'Return to sender started',
  rto_in_transit: 'Returning to sender',
  returned: 'Returned to sender',
  on_hold: 'On hold',
  lost: 'Lost in transit',
  damaged: 'Damaged',
  cancelled: 'Cancelled',
};

/** Colour is assigned per group, not per status. */
const GROUP_TONES: Record<StatusGroup, BadgeTone> = {
  booking: 'neutral',
  collection: 'blue',
  line_haul: 'indigo',
  last_mile: 'amber',
  return: 'orange',
  exception: 'red',
};

/** `delivered` sits in the `last_mile` group but is a success state, so it is
 *  the one status that overrides its group's colour. */
const STATUS_TONE_OVERRIDES: Partial<Record<ShipmentStatus, BadgeTone>> = {
  delivered: 'green',
};

function titleCase(value: string): string {
  const spaced = value.replace(/_/g, ' ').trim();
  return spaced ? spaced[0].toUpperCase() + spaced.slice(1) : value;
}

/** Group for a status, falling back to `exception` for values this build
 *  does not know about (the backend does the same). */
export function statusGroup(status: ShipmentStatus): StatusGroup {
  return STATUS_GROUPS[status] ?? 'exception';
}

/** Display text for a status when the API has not supplied `status_label`. */
export function statusLabel(status: ShipmentStatus): string {
  return STATUS_LABELS[status] ?? titleCase(status);
}

/** Badge tone for a status. Pass the API's `status_group` when you have it so
 *  a status added server-side still gets the right colour family. */
export function statusTone(status: ShipmentStatus, group?: StatusGroup): BadgeTone {
  const override = STATUS_TONE_OVERRIDES[status];
  if (override) return override;
  return GROUP_TONES[group ?? statusGroup(status)] ?? 'neutral';
}

export interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Raw status value from the API (`shipment.status`). */
  status: ShipmentStatus;
  /** The API's human `status_label`. Falls back to the local label map. */
  label?: string | null;
  /** The API's `status_group`. Falls back to the local group map. */
  group?: StatusGroup;
  size?: BadgeSize;
  variant?: BadgeVariant;
  /** Leading dot. Purely decorative — the label is always rendered. */
  dot?: boolean;
}

/**
 * Shipment status pill. Colour comes from the lifecycle group, never from the
 * individual status, and the label is always shown so colour is not the only
 * signal.
 */
export function StatusBadge({
  status,
  label,
  group,
  size = 'md',
  variant = 'soft',
  dot = true,
  ...rest
}: StatusBadgeProps) {
  return (
    <Badge tone={statusTone(status, group)} variant={variant} size={size} dot={dot} {...rest}>
      {label || statusLabel(status)}
    </Badge>
  );
}

export default StatusBadge;
