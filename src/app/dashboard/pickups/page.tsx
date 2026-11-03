"use client";

/**
 * Customer pickups: book one, watch it move, cancel it while that is still
 * allowed.
 *
 * The customer layout already wraps this in `<Workspace>` with its
 * `ProtectedRoute`, so nothing here re-checks the session.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaBoxOpen, FaTruckLoading } from "react-icons/fa";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Select,
  Textarea,
  useToast,
  type BadgeTone,
} from "@/components/kit";
import { errorMessage } from "@/lib/resources/client";
import { geo, pickups } from "@/lib/resources/operations";
import { queryKeys } from "@/lib/queryKeys";
import { formatDate } from "@/lib/utils";
import type { Pickup, PickupSlot, PickupStatus } from "@/types/logistics";

/**
 * `GET /pickups/my` answers with a `{items, total, …}` page even though the
 * typed wrapper declares a bare array. Normalising here keeps the fix local:
 * `src/lib/resources/` is shared with other screens and not ours to change.
 */
function toItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const items = (payload as { items?: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  return [];
}

const SLOTS: Array<{ value: PickupSlot; label: string }> = [
  { value: "morning", label: "Morning (8am – 11am)" },
  { value: "midday", label: "Midday (11am – 2pm)" },
  { value: "afternoon", label: "Afternoon (2pm – 5pm)" },
  { value: "evening", label: "Evening (5pm – 8pm)" },
];

const STATUS_TONES: Record<PickupStatus, BadgeTone> = {
  requested: "amber",
  scheduled: "blue",
  assigned: "indigo",
  in_progress: "teal",
  completed: "green",
  failed: "red",
  cancelled: "neutral",
};

const STATUS_LABELS: Record<PickupStatus, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  assigned: "Rider assigned",
  in_progress: "Rider on the way",
  completed: "Collected",
  failed: "Collection failed",
  cancelled: "Cancelled",
};

/** A pickup stops being cancellable once it has reached an end state. */
const CLOSED: PickupStatus[] = ["completed", "cancelled", "failed"];

interface FormState {
  contact_name: string;
  contact_phone: string;
  address: string;
  district: string;
  scheduled_date: string;
  time_slot: PickupSlot;
  package_count: string;
  estimated_weight_kg: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  contact_name: "",
  contact_phone: "",
  address: "",
  district: "",
  scheduled_date: "",
  time_slot: "morning",
  package_count: "1",
  estimated_weight_kg: "",
  notes: "",
};

function todayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function CustomerPickupsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [toCancel, setToCancel] = useState<Pickup | null>(null);

  const districtsQuery = useQuery({
    queryKey: queryKeys.geo.districts(),
    queryFn: () => geo.districts(),
    // The 77 districts of Nepal do not change between sessions.
    staleTime: Infinity,
  });

  const myPickups = useQuery({
    queryKey: queryKeys.pickups.list({ scope: "mine" }),
    queryFn: async () => toItems<Pickup>(await pickups.mine()),
  });

  const districtNames = useMemo(
    () => (districtsQuery.data ?? []).map((district) => district.name),
    [districtsQuery.data],
  );

  const createPickup = useMutation({
    mutationFn: (body: Partial<Pickup>) => pickups.create(body),
    onSuccess: (pickup) => {
      toast.success(`Pickup ${pickup.pickup_no} requested`, {
        description: "A branch will schedule a rider and the status will update here.",
      });
      setForm(EMPTY_FORM);
      setErrors({});
      queryClient.invalidateQueries({ queryKey: queryKeys.pickups.all });
    },
    onError: (error) => {
      toast.error("Could not book the pickup", { description: errorMessage(error) });
    },
  });

  const cancelPickup = useMutation({
    mutationFn: (id: number) => pickups.cancel(id),
    onSuccess: (pickup) => {
      toast.success(`Pickup ${pickup.pickup_no} cancelled`);
      queryClient.invalidateQueries({ queryKey: queryKeys.pickups.all });
    },
    onError: (error) => {
      toast.error("Could not cancel the pickup", { description: errorMessage(error) });
    },
    onSettled: () => setToCancel(null),
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /** Catches what the API would reject, before a round trip. */
  function validate(): Partial<Record<keyof FormState, string>> {
    const found: Partial<Record<keyof FormState, string>> = {};

    if (!form.contact_name.trim()) found.contact_name = "Tell the rider who to ask for.";
    if (!form.contact_phone.trim()) found.contact_phone = "A phone number is required.";
    if (!form.address.trim()) found.address = "A collection address is required.";

    const district = form.district.trim();
    if (!district) {
      found.district = "Choose a district.";
    } else if (
      districtNames.length > 0 &&
      !districtNames.some((name) => name.toLowerCase() === district.toLowerCase())
    ) {
      found.district = "Pick one of the 77 districts from the list.";
    }

    if (form.scheduled_date && form.scheduled_date < todayIso()) {
      found.scheduled_date = "Choose today or a later date.";
    }

    const count = Number(form.package_count);
    if (!Number.isInteger(count) || count < 1) {
      found.package_count = "At least one parcel.";
    }

    if (form.estimated_weight_kg) {
      const weight = Number(form.estimated_weight_kg);
      if (Number.isNaN(weight) || weight < 0) {
        found.estimated_weight_kg = "Enter a weight in kilograms.";
      }
    }

    return found;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Check the form", { description: "Some details still need fixing." });
      return;
    }

    const body: Partial<Pickup> = {
      contact_name: form.contact_name.trim(),
      contact_phone: form.contact_phone.trim(),
      address: form.address.trim(),
      district: form.district.trim(),
      time_slot: form.time_slot,
      package_count: Number(form.package_count),
    };
    if (form.scheduled_date) body.scheduled_date = form.scheduled_date;
    if (form.estimated_weight_kg) {
      body.estimated_weight_kg = Number(form.estimated_weight_kg);
    }
    if (form.notes.trim()) body.notes = form.notes.trim();

    createPickup.mutate(body);
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2 text-teal-700">Pickups</p>
        <h1 className="text-3xl font-bold text-[color:var(--brand-navy)]">
          Book a collection
        </h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600">
          Tell us where the parcels are and when they will be ready. A branch assigns a
          rider and the status updates below.
        </p>
      </header>

      <Card as="section" aria-labelledby="book-heading">
        <CardHeader>
          <CardTitle id="book-heading">New pickup request</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Contact name" required error={errors.contact_name}>
                <Input
                  value={form.contact_name}
                  onChange={(event) => set("contact_name", event.target.value)}
                  autoComplete="name"
                  placeholder="Who the rider should ask for"
                />
              </Field>

              <Field label="Contact phone" required error={errors.contact_phone}>
                <Input
                  type="tel"
                  value={form.contact_phone}
                  onChange={(event) => set("contact_phone", event.target.value)}
                  autoComplete="tel"
                  placeholder="98XXXXXXXX"
                />
              </Field>
            </div>

            <Field label="Collection address" required error={errors.address}>
              <Textarea
                rows={2}
                value={form.address}
                onChange={(event) => set("address", event.target.value)}
                placeholder="Street, tole and any landmark that helps the rider find you"
              />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="District"
                required
                error={errors.district}
                hint={
                  districtsQuery.isError
                    ? "The district list could not be loaded — type the name in full."
                    : "Start typing to filter all 77 districts."
                }
              >
                <Input
                  list="pickup-districts"
                  value={form.district}
                  onChange={(event) => set("district", event.target.value)}
                  placeholder="Kathmandu"
                  autoComplete="off"
                />
              </Field>
              {/* A datalist keeps the native type-ahead on a 77-item list. */}
              <datalist id="pickup-districts">
                {districtNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>

              <Field
                label="Preferred date"
                error={errors.scheduled_date}
                showOptional
                hint="Leave blank and we will collect at the next opportunity."
              >
                <Input
                  type="date"
                  min={todayIso()}
                  value={form.scheduled_date}
                  onChange={(event) => set("scheduled_date", event.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Time slot">
                <Select
                  value={form.time_slot}
                  onChange={(event) => set("time_slot", event.target.value as PickupSlot)}
                  options={SLOTS}
                />
              </Field>

              <Field label="Parcels" required error={errors.package_count}>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={form.package_count}
                  onChange={(event) => set("package_count", event.target.value)}
                />
              </Field>

              <Field label="Estimated weight (kg)" showOptional error={errors.estimated_weight_kg}>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  inputMode="decimal"
                  value={form.estimated_weight_kg}
                  onChange={(event) => set("estimated_weight_kg", event.target.value)}
                  placeholder="2.5"
                />
              </Field>
            </div>

            <Field label="Notes for the rider" showOptional>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(event) => set("notes", event.target.value)}
                placeholder="Gate code, floor, best time to call"
              />
            </Field>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                loading={createPickup.isPending}
                loadingLabel="Booking the pickup"
                leftIcon={<FaTruckLoading aria-hidden="true" />}
              >
                Request pickup
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setErrors({});
                }}
                disabled={createPickup.isPending}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card as="section" aria-labelledby="my-pickups-heading">
        <CardHeader>
          <CardTitle id="my-pickups-heading">Your pickups</CardTitle>
        </CardHeader>
        <CardBody>
          {myPickups.isError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
            >
              <p className="font-semibold">Could not load your pickups.</p>
              <p className="mt-1 text-red-800">{errorMessage(myPickups.error)}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => myPickups.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : (
            <DataTable<Pickup>
              caption="Pickup requests you have made"
              rows={myPickups.data ?? []}
              rowKey={(row) => row.id}
              loading={myPickups.isPending}
              emptyTitle="No pickups booked yet"
              emptyDescription="Your first request will appear here as soon as you book it."
              emptyIcon={<FaBoxOpen aria-hidden="true" />}
              columns={[
                {
                  id: "pickup_no",
                  header: "Reference",
                  primary: true,
                  cell: (row) => (
                    <span className="font-semibold text-[color:var(--brand-navy)]">
                      {row.pickup_no}
                    </span>
                  ),
                },
                {
                  id: "when",
                  header: "Scheduled",
                  cell: (row) => (
                    <span className="text-slate-800">
                      {row.scheduled_date ? formatDate(row.scheduled_date) : "Next opportunity"}
                      <span className="block text-xs text-slate-600">
                        {SLOTS.find((slot) => slot.value === row.time_slot)?.label ??
                          row.time_slot}
                      </span>
                    </span>
                  ),
                },
                {
                  id: "where",
                  header: "Address",
                  cell: (row) => (
                    <span className="text-slate-800">
                      {row.address || "—"}
                      <span className="block text-xs text-slate-600">{row.district}</span>
                    </span>
                  ),
                },
                {
                  id: "parcels",
                  header: "Parcels",
                  align: "right",
                  hideOnMobile: true,
                  cell: (row) => row.package_count,
                },
                {
                  id: "status",
                  header: "Status",
                  cell: (row) => (
                    <>
                      <Badge tone={STATUS_TONES[row.status] ?? "neutral"}>
                        {STATUS_LABELS[row.status] ?? row.status}
                      </Badge>
                      {row.status === "failed" && row.failure_reason && (
                        <span className="mt-1 block text-xs text-slate-600">
                          {row.failure_reason}
                        </span>
                      )}
                    </>
                  ),
                },
                {
                  id: "actions",
                  header: "Actions",
                  srOnlyHeader: true,
                  align: "right",
                  cell: (row) =>
                    CLOSED.includes(row.status) ? (
                      <span className="text-xs text-slate-600">No actions</span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setToCancel(row)}
                        disabled={cancelPickup.isPending}
                      >
                        Cancel
                        <span className="sr-only"> pickup {row.pickup_no}</span>
                      </Button>
                    ),
                },
              ]}
            />
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={toCancel !== null}
        onClose={() => setToCancel(null)}
        onConfirm={() => {
          if (toCancel) cancelPickup.mutate(toCancel.id);
        }}
        title="Cancel this pickup?"
        description={
          toCancel
            ? `Pickup ${toCancel.pickup_no} will be withdrawn. You can always book another.`
            : undefined
        }
        confirmLabel="Cancel pickup"
        cancelLabel="Keep it"
        tone="danger"
      />
    </div>
  );
}
