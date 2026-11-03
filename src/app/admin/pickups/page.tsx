"use client";

/**
 * Pickup worklist.
 *
 * A pickup is the one part of the network where the clock is the problem:
 * a merchant has parcels on a counter and a rider has to reach them inside a
 * slot. So the table leads with the slot and the address, and every action
 * that closes a pickup — completing it, failing it — asks first, because the
 * backend has no way to reopen one.
 */

import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaTruckPickup } from "react-icons/fa";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Modal,
  Pagination,
  Select,
  Textarea,
  useToast,
  type BadgeTone,
  type DataTableColumn,
} from "@/components/kit";
import { errorMessage } from "@/lib/resources/client";
import { branches, pickups, riders } from "@/lib/resources/operations";
import { queryKeys } from "@/lib/queryKeys";
import type { Pickup, PickupSlot, PickupStatus } from "@/types/logistics";
import { failureNotice } from "@/components/admin/operations/errors";
import {
  count,
  dateOnly,
  isoDate,
  text,
  titleCase,
} from "@/components/admin/operations/format";
import { FilterPanel, LoadError, PageHeader } from "@/components/admin/operations/Layout";

const PER_PAGE = 20;

const PICKUP_STATUSES: PickupStatus[] = [
  "requested",
  "scheduled",
  "assigned",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
];

const SLOTS: PickupSlot[] = ["morning", "midday", "afternoon", "evening"];

const STATUS_TONES: Record<PickupStatus, BadgeTone> = {
  requested: "neutral",
  scheduled: "blue",
  assigned: "indigo",
  in_progress: "amber",
  completed: "green",
  failed: "red",
  cancelled: "neutral",
};

/** Statuses from which the backend still accepts each action. */
const OPEN_STATUSES: PickupStatus[] = ["requested", "scheduled", "assigned", "in_progress"];
const CLOSEABLE: PickupStatus[] = ["assigned", "in_progress", "scheduled"];

type ActionKind = "assign" | "reschedule" | "complete" | "fail";

interface ActionTarget {
  kind: ActionKind;
  pickup: Pickup;
}

export default function Page() {
  const toast = useToast();
  const cache = useQueryClient();

  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [branchId, setBranchId] = useState("");
  const [riderId, setRiderId] = useState("");
  const [page, setPage] = useState(1);

  const [target, setTarget] = useState<ActionTarget | null>(null);
  const [assignRider, setAssignRider] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState<PickupSlot | "">("");
  const [collected, setCollected] = useState("");
  const [failReason, setFailReason] = useState("");
  const [formError, setFormError] = useState("");

  const query = useMemo(
    () => ({
      page,
      per_page: PER_PAGE,
      status: status || undefined,
      date: date || undefined,
      branch_id: branchId ? Number(branchId) : undefined,
      rider_id: riderId ? Number(riderId) : undefined,
    }),
    [branchId, date, page, riderId, status],
  );

  const list = useQuery({
    queryKey: queryKeys.pickups.list(query),
    queryFn: () => pickups.list(query),
    placeholderData: keepPreviousData,
  });

  const branchList = useQuery({
    queryKey: queryKeys.branches.list(),
    queryFn: () => branches.list(),
    staleTime: 10 * 60 * 1000,
  });

  const riderList = useQuery({
    queryKey: queryKeys.riders.list({ per_page: 200 }),
    queryFn: () => riders.list({ per_page: 200 }),
    staleTime: 10 * 60 * 1000,
  });

  // Only riders who can take work are offered for an assignment.
  const availableRiders = useQuery({
    queryKey: queryKeys.riders.list({ status: "available" }),
    queryFn: () => riders.list({ status: "available" }),
    enabled: target?.kind === "assign",
  });

  const refresh = () => cache.invalidateQueries({ queryKey: queryKeys.pickups.all });

  const closeAction = () => {
    setTarget(null);
    setFormError("");
  };

  const onFailure = (action: string) => (error: unknown) => {
    const notice = failureNotice(error, action, "The server refused this change");
    toast.error(notice.title, { description: notice.description });
  };

  const assign = useMutation({
    mutationFn: ({ id, rider }: { id: number; rider: number }) => pickups.assign(id, rider),
    onSuccess: async (pickup) => {
      toast.success("Rider assigned", {
        description: `${pickup.pickup_no} is with ${pickup.rider?.name ?? "the selected rider"}.`,
      });
      closeAction();
      setAssignRider("");
      await refresh();
    },
    onError: onFailure("assign a rider"),
  });

  const reschedule = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: { scheduled_date?: string; time_slot?: string };
    }) => pickups.reschedule(id, body),
    onSuccess: async (pickup) => {
      toast.success("Pickup rescheduled", {
        description: `${pickup.pickup_no} is now set for ${dateOnly(pickup.scheduled_date)}, ${titleCase(pickup.time_slot)}.`,
      });
      closeAction();
      await refresh();
    },
    onError: onFailure("reschedule the pickup"),
  });

  const complete = useMutation({
    mutationFn: ({ id, parcels }: { id: number; parcels: number }) =>
      pickups.complete(id, parcels),
    onSuccess: async (pickup) => {
      toast.success("Pickup completed", {
        description: `${pickup.collected_count} parcel(s) collected on ${pickup.pickup_no}.`,
      });
      closeAction();
      setCollected("");
      await refresh();
    },
    onError: onFailure("complete the pickup"),
  });

  const fail = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => pickups.fail(id, reason),
    onSuccess: async (pickup) => {
      toast.success("Pickup marked failed", {
        description: `${pickup.pickup_no} was closed without a collection.`,
      });
      closeAction();
      setFailReason("");
      await refresh();
    },
    onError: onFailure("fail the pickup"),
  });

  const openAction = (kind: ActionKind, pickup: Pickup) => {
    setFormError("");
    setTarget({ kind, pickup });
    if (kind === "assign") setAssignRider(pickup.rider_id ? String(pickup.rider_id) : "");
    if (kind === "reschedule") {
      setNewDate(isoDate(pickup.scheduled_date));
      setNewSlot(pickup.time_slot);
    }
    if (kind === "complete") setCollected(String(pickup.package_count || 1));
    if (kind === "fail") setFailReason("");
  };

  const activeCount = [status, date, branchId, riderId].filter(Boolean).length;

  const clear = () => {
    setStatus("");
    setDate("");
    setBranchId("");
    setRiderId("");
    setPage(1);
  };

  const columns: DataTableColumn<Pickup>[] = [
    {
      id: "pickup_no",
      header: "Pickup",
      primary: true,
      sortable: true,
      sortValue: (row) => row.pickup_no,
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-[color:var(--brand-navy)]">{row.pickup_no}</p>
          <p className="text-xs text-slate-600">{count(row.package_count)} parcel(s)</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortValue: (row) => row.status,
      cell: (row) => (
        <Badge tone={STATUS_TONES[row.status] ?? "neutral"} size="sm" dot>
          {titleCase(row.status)}
        </Badge>
      ),
    },
    {
      id: "requester",
      header: "Requester",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-800">{text(row.contact_name)}</p>
          <p className="truncate text-xs text-slate-600">
            {text(row.contact_phone)} &middot; user #{row.requested_by}
          </p>
        </div>
      ),
    },
    {
      id: "address",
      header: "Address",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-800">{text(row.address)}</p>
          <p className="truncate text-xs text-slate-600">
            {text(row.district)}
            {row.city ? ` · ${row.city}` : ""}
          </p>
        </div>
      ),
    },
    {
      id: "slot",
      header: "Slot",
      sortable: true,
      sortValue: (row) => `${row.scheduled_date ?? ""}-${row.time_slot}`,
      cell: (row) => (
        <div className="min-w-0">
          <p className="text-sm text-slate-800">{dateOnly(row.scheduled_date)}</p>
          <p className="text-xs text-slate-600">{titleCase(row.time_slot)}</p>
        </div>
      ),
    },
    {
      id: "rider",
      header: "Rider",
      sortable: true,
      sortValue: (row) => row.rider?.name ?? "",
      cell: (row) =>
        row.rider ? (
          <span className="text-sm text-slate-800">{row.rider.name}</span>
        ) : (
          <span className="text-sm text-slate-600">Unassigned</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      srOnlyHeader: true,
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          {OPEN_STATUSES.includes(row.status) && (
            <Button variant="outline" size="sm" onClick={() => openAction("assign", row)}>
              Assign<span className="sr-only"> a rider to {row.pickup_no}</span>
            </Button>
          )}
          {OPEN_STATUSES.includes(row.status) && (
            <Button variant="ghost" size="sm" onClick={() => openAction("reschedule", row)}>
              Reschedule<span className="sr-only"> {row.pickup_no}</span>
            </Button>
          )}
          {CLOSEABLE.includes(row.status) && (
            <Button variant="ghost" size="sm" onClick={() => openAction("complete", row)}>
              Complete<span className="sr-only"> {row.pickup_no}</span>
            </Button>
          )}
          {CLOSEABLE.includes(row.status) && (
            <Button variant="ghost" size="sm" onClick={() => openAction("fail", row)}>
              Fail<span className="sr-only"> {row.pickup_no}</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (list.isError) {
    return (
      <>
        <PageHeader title="Pickups" />
        <LoadError message={errorMessage(list.error)} onRetry={() => void list.refetch()} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Pickups"
        description="Collection requests waiting on a rider. Assign, reschedule, or close one out with what was actually collected."
      />

      <FilterPanel label="Pickup filters" activeCount={activeCount} onClear={clear}>
        <Field label="Status">
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Any status</option>
            {PICKUP_STATUSES.map((option) => (
              <option key={option} value={option}>
                {titleCase(option)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Scheduled date">
          <Input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setPage(1);
            }}
          />
        </Field>

        <Field label="Branch">
          <Select
            value={branchId}
            onChange={(event) => {
              setBranchId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Any branch</option>
            {(branchList.data ?? []).map((branch) => (
              <option key={branch.id} value={String(branch.id)}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Rider">
          <Select
            value={riderId}
            onChange={(event) => {
              setRiderId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Any rider</option>
            {(riderList.data?.items ?? []).map((rider) => (
              <option key={rider.id} value={String(rider.id)}>
                {rider.name} ({rider.rider_code})
              </option>
            ))}
          </Select>
        </Field>
      </FilterPanel>

      <div className="panel p-0! overflow-hidden">
        <DataTable
          caption="Pickup requests matching the current filters"
          columns={columns}
          rows={list.data?.items ?? []}
          rowKey={(row) => row.id}
          loading={list.isLoading}
          skeletonRows={8}
          emptyTitle={activeCount > 0 ? "No pickups match these filters" : "No pickups yet"}
          emptyDescription={
            activeCount > 0
              ? "Widen the filters, or clear them to see every request."
              : "Collection requests appear here as merchants book them."
          }
          emptyIcon={<FaTruckPickup aria-hidden="true" />}
        />
      </div>

      <Pagination
        className="mt-6"
        page={list.data?.page ?? page}
        pageCount={list.data?.pages ?? 1}
        totalItems={list.data?.total ?? 0}
        pageSize={list.data?.per_page ?? PER_PAGE}
        onPageChange={setPage}
        label="Pickup pages"
      />

      {/* ── Assign a rider ────────────────────────────────────────────── */}
      <Modal
        open={target?.kind === "assign"}
        onClose={closeAction}
        title="Assign a rider"
        description={
          target ? `${target.pickup.pickup_no} · ${text(target.pickup.district)}` : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={closeAction}>
              Cancel
            </Button>
            <Button
              loading={assign.isPending}
              onClick={() => {
                if (!assignRider) {
                  setFormError("Choose a rider first.");
                  return;
                }
                if (!target) return;
                setFormError("");
                assign.mutate({ id: target.pickup.id, rider: Number(assignRider) });
              }}
            >
              Assign rider
            </Button>
          </>
        }
      >
        <Field
          label="Available riders"
          required
          error={formError || undefined}
          hint="Only riders currently marked available are listed."
        >
          <Select
            value={assignRider}
            disabled={availableRiders.isLoading}
            onChange={(event) => setAssignRider(event.target.value)}
          >
            <option value="">
              {availableRiders.isLoading ? "Loading riders…" : "Choose a rider"}
            </option>
            {(availableRiders.data?.items ?? []).map((rider) => (
              <option key={rider.id} value={String(rider.id)}>
                {rider.name} ({rider.rider_code}) &middot; {titleCase(rider.vehicle_type)}
              </option>
            ))}
          </Select>
        </Field>
        {availableRiders.isError && (
          <p role="alert" className="mt-2 text-sm text-red-800">
            {errorMessage(availableRiders.error)}
          </p>
        )}
        {!availableRiders.isLoading && (availableRiders.data?.items.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-slate-700">
            No rider is marked available right now. A rider sets their own duty status, so this
            list fills up as they come on shift.
          </p>
        )}
      </Modal>

      {/* ── Reschedule ────────────────────────────────────────────────── */}
      <Modal
        open={target?.kind === "reschedule"}
        onClose={closeAction}
        title="Reschedule this pickup"
        description={target ? target.pickup.pickup_no : undefined}
        footer={
          <>
            <Button variant="outline" onClick={closeAction}>
              Cancel
            </Button>
            <Button
              loading={reschedule.isPending}
              onClick={() => {
                if (!target) return;
                if (!newDate && !newSlot) {
                  setFormError("Change the date, the slot, or both.");
                  return;
                }
                setFormError("");
                reschedule.mutate({
                  id: target.pickup.id,
                  body: {
                    scheduled_date: newDate || undefined,
                    time_slot: newSlot || undefined,
                  },
                });
              }}
            >
              Save new slot
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Date" error={formError || undefined}>
            <Input
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
            />
          </Field>
          <Field label="Time slot">
            <Select
              value={newSlot}
              onChange={(event) => setNewSlot(event.target.value as PickupSlot | "")}
            >
              <option value="">Leave unchanged</option>
              {SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {titleCase(slot)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>

      {/* ── Complete ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={target?.kind === "complete"}
        onClose={closeAction}
        keepOpenOnConfirm
        size="md"
        title="Close this pickup as collected?"
        confirmLabel="Mark collected"
        description={
          target
            ? `${target.pickup.pickup_no} was booked for ${count(target.pickup.package_count)} parcel(s). A completed pickup cannot be reopened.`
            : undefined
        }
        onConfirm={async () => {
          if (!target) return;
          const parcels = Number(collected);
          if (!Number.isInteger(parcels) || parcels < 0) {
            setFormError("Enter the number of parcels actually collected.");
            return;
          }
          setFormError("");
          await complete.mutateAsync({ id: target.pickup.id, parcels }).catch(() => undefined);
        }}
      >
        <Field
          label="Parcels collected"
          required
          error={formError || undefined}
          hint="Record what the rider actually took, not what was booked."
        >
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            value={collected}
            onChange={(event) => setCollected(event.target.value)}
          />
        </Field>
      </ConfirmDialog>

      {/* ── Fail ──────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={target?.kind === "fail"}
        onClose={closeAction}
        keepOpenOnConfirm
        tone="danger"
        size="md"
        title="Mark this pickup as failed?"
        confirmLabel="Mark failed"
        description={
          target
            ? `${target.pickup.pickup_no} will close without a collection. The merchant has to book again.`
            : undefined
        }
        onConfirm={async () => {
          if (!target) return;
          if (!failReason.trim()) {
            setFormError("A failure reason is required.");
            return;
          }
          setFormError("");
          await fail
            .mutateAsync({ id: target.pickup.id, reason: failReason.trim() })
            .catch(() => undefined);
        }}
      >
        <Field label="Failure reason" required error={formError || undefined}>
          <Textarea
            rows={3}
            value={failReason}
            placeholder="e.g. Shop shut, no answer on the contact number."
            onChange={(event) => setFailReason(event.target.value)}
          />
        </Field>
      </ConfirmDialog>

      <p className="sr-only" role="status">
        {list.isFetching ? "Loading pickups" : `${list.data?.items.length ?? 0} pickups shown`}
      </p>
    </>
  );
}
