"use client";

/**
 * Status change control for one shipment.
 *
 * The picker only offers moves the state machine allows, but the API remains
 * the authority: an illegal move comes back as 409 and that message is shown
 * as-is, because it names both ends of the transition and is more useful than
 * anything this component could invent.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  ConfirmDialog,
  Field,
  Input,
  STATUS_LABELS,
  Select,
  StatusBadge,
  Textarea,
  useToast,
} from "@/components/kit";
import { shipments } from "@/lib/resources/operations";
import { queryKeys } from "@/lib/queryKeys";
import type { Shipment, ShipmentStatus } from "@/types/logistics";
import { failureNotice } from "./errors";
import { isTerminalStatus, nextStatuses } from "./statusTransitions";

export interface ShipmentStatusCardProps {
  shipment: Shipment;
}

export function ShipmentStatusCard({ shipment }: ShipmentStatusCardProps) {
  const toast = useToast();
  const cache = useQueryClient();

  const [status, setStatus] = useState<ShipmentStatus | "">("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [confirming, setConfirming] = useState(false);

  const allowed = nextStatuses(shipment.status);
  const terminal = isTerminalStatus(shipment.status);

  const change = useMutation({
    mutationFn: (next: ShipmentStatus) =>
      shipments.update(shipment.id, {
        status: next,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      }),
    onSuccess: async (_result, next) => {
      toast.success("Status updated", {
        description: `${shipment.tracking_no} is now "${STATUS_LABELS[next]}". A tracking event was added.`,
      });
      setStatus("");
      setLocation("");
      setDescription("");
      await Promise.all([
        cache.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipment.id) }),
        cache.invalidateQueries({ queryKey: queryKeys.shipments.all }),
      ]);
    },
    onError: (error) => {
      const notice = failureNotice(
        error,
        "update the status",
        "That status change is not allowed",
      );
      toast.error(notice.title, { description: notice.description });
    },
  });

  const submit = () => {
    if (!status) return;
    if (isTerminalStatus(status)) {
      setConfirming(true);
      return;
    }
    change.mutate(status);
  };

  return (
    <section aria-labelledby="status-change" className="panel space-y-4">
      <div>
        <h2 id="status-change" className="text-base font-bold text-[color:var(--brand-navy)]">
          Change status
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Currently{" "}
          <StatusBadge
            status={shipment.status}
            label={shipment.status_label}
            group={shipment.status_group}
            size="sm"
          />
          . Saving also appends a tracking event the customer can see.
        </p>
      </div>

      {terminal || allowed.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          This shipment has reached a terminal state and cannot be moved again. Raise a claim
          instead if the outcome was wrong.
        </p>
      ) : (
        <div className="space-y-4">
          <Field
            label="New status"
            hint="Only the moves the lifecycle allows from the current state are listed."
          >
            <Select
              value={status}
              disabled={change.isPending}
              onChange={(event) => setStatus(event.target.value as ShipmentStatus | "")}
            >
              <option value="">Choose a status</option>
              {allowed.map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABELS[option]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Location" showOptional hint="Where the parcel is as of this event.">
            <Input
              value={location}
              disabled={change.isPending}
              placeholder="e.g. Kathmandu sorting hub"
              onChange={(event) => setLocation(event.target.value)}
            />
          </Field>

          <Field label="Description" showOptional>
            <Textarea
              value={description}
              rows={3}
              disabled={change.isPending}
              placeholder="What happened, in the words the customer should read."
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>

          <Button onClick={submit} loading={change.isPending} disabled={!status}>
            Save status change
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={async () => {
          if (status) await change.mutateAsync(status).catch(() => undefined);
        }}
        tone="danger"
        title="Close this shipment?"
        confirmLabel="Set final status"
        description={
          status
            ? `"${STATUS_LABELS[status]}" is a terminal state. ${shipment.tracking_no} cannot be moved again afterwards.`
            : undefined
        }
      />
    </section>
  );
}

export default ShipmentStatusCard;
