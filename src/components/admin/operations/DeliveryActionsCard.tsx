"use client";

/**
 * Last-mile actions for one shipment: record an attempt, issue a delivery
 * code, record proof of delivery, and start a return to sender.
 *
 * Each of these can move the shipment's status server-side, so every one of
 * them refreshes the detail query and the attempts list on success. The
 * delivery code is never echoed back by the API, and this component does not
 * pretend otherwise — it confirms that a code went out and when it expires.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  ConfirmDialog,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from "@/components/kit";
import { deliveries } from "@/lib/resources/operations";
import { queryKeys } from "@/lib/queryKeys";
import type { AttemptOutcome, AttemptReason, Shipment } from "@/types/logistics";
import { failureNotice } from "./errors";
import { dateTime } from "./format";

const ATTEMPT_REASONS: { value: AttemptReason; label: string }[] = [
  { value: "recipient_unavailable", label: "Recipient unavailable" },
  { value: "address_incorrect", label: "Address incorrect" },
  { value: "address_not_found", label: "Address not found" },
  { value: "recipient_refused", label: "Recipient refused the parcel" },
  { value: "payment_not_ready", label: "COD payment not ready" },
  { value: "business_closed", label: "Business closed" },
  { value: "rescheduled_by_recipient", label: "Rescheduled by recipient" },
  { value: "weather_or_road", label: "Weather or road conditions" },
  { value: "security_situation", label: "Security situation" },
  { value: "damaged_in_transit", label: "Damaged in transit" },
  { value: "other", label: "Other" },
];

/** The relations the proof-of-delivery endpoint accepts. */
const POD_RELATIONS = [
  "self",
  "family",
  "neighbour",
  "reception",
  "colleague",
  "security",
] as const;

export interface DeliveryActionsCardProps {
  shipment: Shipment;
}

export function DeliveryActionsCard({ shipment }: DeliveryActionsCardProps) {
  const toast = useToast();
  const cache = useQueryClient();

  const [attemptOpen, setAttemptOpen] = useState(false);
  const [podOpen, setPodOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const [outcome, setOutcome] = useState<AttemptOutcome>("failed");
  const [reasonCode, setReasonCode] = useState<AttemptReason>("recipient_unavailable");
  const [reasonNote, setReasonNote] = useState("");
  const [nextDate, setNextDate] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [recipientRelation, setRecipientRelation] = useState<string>("self");
  const [recipientIdRef, setRecipientIdRef] = useState("");
  const [podNotes, setPodNotes] = useState("");
  const [otp, setOtp] = useState("");
  const [podError, setPodError] = useState("");

  const [rtoReason, setRtoReason] = useState("");
  const [rtoError, setRtoError] = useState("");

  /** True once a code has been issued, locally or in an earlier session. */
  const [otpIssued, setOtpIssued] = useState(Boolean(shipment.proof?.otp_required));

  const refresh = () =>
    Promise.all([
      cache.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipment.id) }),
      cache.invalidateQueries({ queryKey: queryKeys.shipments.attempts(shipment.id) }),
      cache.invalidateQueries({ queryKey: queryKeys.shipments.all }),
    ]);

  const attempt = useMutation({
    mutationFn: () =>
      deliveries.recordAttempt(shipment.id, {
        outcome,
        reason_code: outcome === "delivered" ? undefined : reasonCode,
        reason_note: reasonNote.trim() || undefined,
        next_attempt_date: outcome === "rescheduled" && nextDate ? nextDate : undefined,
      }),
    onSuccess: async (result) => {
      toast.success("Attempt recorded", {
        description: `Attempt ${result.attempt.attempt_no} saved as "${outcome}".`,
      });
      setAttemptOpen(false);
      setReasonNote("");
      setNextDate("");
      await refresh();
    },
    onError: (error) => {
      const notice = failureNotice(error, "record the attempt", "The server refused this attempt");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const issueOtp = useMutation({
    mutationFn: () => deliveries.issueOtp(shipment.id),
    onSuccess: async (result) => {
      setOtpIssued(true);
      toast.success("Delivery code issued", {
        description: result.expires_at
          ? `The code was sent to the recipient and expires ${dateTime(result.expires_at)}. It is never shown here — ask the recipient for it at the door.`
          : "The code was sent to the recipient. It is never shown here — ask the recipient for it at the door.",
        duration: 9000,
      });
      setOtpOpen(false);
      await refresh();
    },
    onError: (error) => {
      const notice = failureNotice(error, "issue a delivery code");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const pod = useMutation({
    mutationFn: () =>
      deliveries.recordPod(shipment.id, {
        recipient_name: recipientName.trim(),
        recipient_relation: recipientRelation || undefined,
        recipient_id_ref: recipientIdRef.trim() || undefined,
        notes: podNotes.trim() || undefined,
        otp: otp.trim() || undefined,
      }),
    onSuccess: async () => {
      toast.success("Proof of delivery saved", {
        description: `${shipment.tracking_no} is recorded as delivered to ${recipientName.trim()}.`,
      });
      setPodOpen(false);
      setRecipientName("");
      setRecipientIdRef("");
      setPodNotes("");
      setOtp("");
      await refresh();
    },
    onError: (error) => {
      const notice = failureNotice(error, "record the delivery", "The server refused this delivery");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const startReturn = useMutation({
    mutationFn: () => deliveries.startReturn(shipment.id, rtoReason.trim()),
    onSuccess: async () => {
      toast.success("Return started", {
        description: `${shipment.tracking_no} is on its way back to the sender.`,
      });
      setReturnOpen(false);
      setRtoReason("");
      await refresh();
    },
    onError: (error) => {
      const notice = failureNotice(error, "start the return", "The server refused this return");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const submitPod = () => {
    if (!recipientName.trim()) {
      setPodError("Who took delivery? A recipient name is required.");
      return;
    }
    if (otpIssued && !otp.trim()) {
      setPodError("A delivery code was issued for this shipment, so it has to be entered here.");
      return;
    }
    setPodError("");
    pod.mutate();
  };

  return (
    <section aria-labelledby="delivery-actions" className="panel space-y-4">
      <div>
        <h2
          id="delivery-actions"
          className="text-base font-bold text-[color:var(--brand-navy)]"
        >
          Delivery actions
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          These record what happened at the door. Each one can move the shipment on its own,
          so there is no need to also change the status by hand.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={() => setAttemptOpen(true)}>
          Record an attempt
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOtpOpen(true)}>
          Issue delivery code
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPodOpen(true)}>
          Record proof of delivery
        </Button>
        <Button variant="danger" size="sm" onClick={() => setReturnOpen(true)}>
          Start return to sender
        </Button>
      </div>

      {otpIssued && (
        <p className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
          A delivery code is active on this shipment. Proof of delivery will not be accepted
          without it.
        </p>
      )}

      {/* ── Record an attempt ─────────────────────────────────────────── */}
      <Modal
        open={attemptOpen}
        onClose={() => setAttemptOpen(false)}
        title="Record a delivery attempt"
        description="Logs what happened at the door and, where the lifecycle allows it, moves the shipment."
        footer={
          <>
            <Button variant="outline" onClick={() => setAttemptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => attempt.mutate()} loading={attempt.isPending}>
              Save attempt
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Outcome" required>
            <Select
              value={outcome}
              onChange={(event) => setOutcome(event.target.value as AttemptOutcome)}
              options={[
                { value: "delivered", label: "Delivered" },
                { value: "failed", label: "Failed" },
                { value: "rescheduled", label: "Rescheduled" },
              ]}
            />
          </Field>

          {outcome !== "delivered" && (
            <Field label="Reason code" required hint="The API rejects a non-delivery without one.">
              <Select
                value={reasonCode}
                onChange={(event) => setReasonCode(event.target.value as AttemptReason)}
                options={ATTEMPT_REASONS}
              />
            </Field>
          )}

          {outcome === "rescheduled" && (
            <Field label="Next attempt date" showOptional>
              <Input
                type="date"
                value={nextDate}
                onChange={(event) => setNextDate(event.target.value)}
              />
            </Field>
          )}

          <Field label="Note" showOptional>
            <Textarea
              rows={3}
              value={reasonNote}
              placeholder="Anything the next rider should know."
              onChange={(event) => setReasonNote(event.target.value)}
            />
          </Field>
        </div>
      </Modal>

      {/* ── Issue a delivery code ─────────────────────────────────────── */}
      <ConfirmDialog
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onConfirm={async () => {
          await issueOtp.mutateAsync().catch(() => undefined);
        }}
        title="Issue a delivery code?"
        confirmLabel="Issue code"
        description={`A one-time code is sent to the recipient of ${shipment.tracking_no}. The code is never returned to this console, so proof of delivery will have to be entered with the code the recipient reads out.`}
      />

      {/* ── Proof of delivery ─────────────────────────────────────────── */}
      <Modal
        open={podOpen}
        onClose={() => setPodOpen(false)}
        title="Record proof of delivery"
        description="Who took the parcel, and under what evidence."
        footer={
          <>
            <Button variant="outline" onClick={() => setPodOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitPod} loading={pod.isPending}>
              Save proof
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Recipient name" required error={podError && !recipientName.trim() ? podError : undefined}>
            <Input
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Name as given at the door"
            />
          </Field>

          <Field label="Relation to the addressee">
            <Select
              value={recipientRelation}
              onChange={(event) => setRecipientRelation(event.target.value)}
              options={POD_RELATIONS.map((relation) => ({
                value: relation,
                label: relation[0].toUpperCase() + relation.slice(1),
              }))}
            />
          </Field>

          <Field label="ID reference" showOptional hint="Citizenship or licence number, if one was shown.">
            <Input
              value={recipientIdRef}
              onChange={(event) => setRecipientIdRef(event.target.value)}
            />
          </Field>

          <Field
            label="Delivery code"
            required={otpIssued}
            showOptional={!otpIssued}
            hint="Read out by the recipient. Required when a code was issued for this shipment."
            error={podError && recipientName.trim() ? podError : undefined}
          >
            <Input
              value={otp}
              inputMode="numeric"
              autoComplete="off"
              onChange={(event) => setOtp(event.target.value)}
            />
          </Field>

          <Field label="Notes" showOptional>
            <Textarea
              rows={3}
              value={podNotes}
              onChange={(event) => setPodNotes(event.target.value)}
            />
          </Field>
        </div>
      </Modal>

      {/* ── Return to sender ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={returnOpen}
        onClose={() => {
          setReturnOpen(false);
          setRtoError("");
        }}
        keepOpenOnConfirm
        tone="danger"
        title="Start a return to sender?"
        confirmLabel="Start return"
        size="md"
        description={`${shipment.tracking_no} stops being a delivery and starts travelling back. This cannot be undone from the console.`}
        onConfirm={async () => {
          if (!rtoReason.trim()) {
            setRtoError("A reason is required before a return can start.");
            return;
          }
          setRtoError("");
          await startReturn.mutateAsync().catch(() => undefined);
        }}
      >
        <Field label="Reason for the return" required error={rtoError || undefined}>
          <Textarea
            rows={3}
            value={rtoReason}
            placeholder="e.g. Three failed attempts, recipient unreachable."
            onChange={(event) => setRtoReason(event.target.value)}
          />
        </Field>
      </ConfirmDialog>
    </section>
  );
}

export default DeliveryActionsCard;
