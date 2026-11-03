"use client";

/**
 * Claims queue.
 *
 * The state machine lives on the server: `/status` only moves a claim between
 * open, under_review and awaiting_customer, and approve / reject / settle are
 * one-way doors. A closed claim is rendered read-only rather than offered
 * buttons the API will refuse.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  Input,
  Pagination,
  Select,
  Skeleton,
  StatCard,
  Textarea,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { Describe, Notice, ScreenHeader, when } from "@/components/admin/integrations/ScreenHeader";
import { claims } from "@/lib/resources/integrations";
import { shipments } from "@/lib/resources/operations";
import api, { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Claim, ClaimStatus, ClaimType } from "@/types/logistics";

const STATUSES: ClaimStatus[] = [
  "open",
  "under_review",
  "awaiting_customer",
  "approved",
  "rejected",
  "settled",
  "withdrawn",
];

/** The only transitions `/claims/<id>/status` will accept. */
const MANUAL_STATUSES: ClaimStatus[] = ["open", "under_review", "awaiting_customer"];

const TYPES: ClaimType[] = [
  "lost",
  "damaged",
  "partial_loss",
  "delay",
  "wrong_delivery",
  "cod_discrepancy",
  "overcharge",
  "other",
];

const STATUS_TONES: Record<ClaimStatus, "neutral" | "blue" | "amber" | "green" | "red" | "teal"> = {
  open: "blue",
  under_review: "amber",
  awaiting_customer: "amber",
  approved: "teal",
  rejected: "red",
  settled: "green",
  withdrawn: "neutral",
};

interface DirectoryUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
}

const label = (status: string) => status.replace(/_/g, " ");

export default function Page() {
  const cache = useQueryClient();
  const { success, error: errorToast } = useToast();

  const [status, setStatus] = useState("");
  const [claimType, setClaimType] = useState("");
  const [assignee, setAssignee] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [page, setPage] = useState(1);

  const [openId, setOpenId] = useState<number | null>(null);
  const [assignTo, setAssignTo] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [approveNote, setApproveNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [settling, setSettling] = useState(false);

  const filters = useMemo(
    () => ({
      status,
      claim_type: claimType,
      assigned_to: assignee ? Number(assignee) : undefined,
      shipment_id: shipmentId ? Number(shipmentId) : undefined,
      page,
      per_page: 20,
    }),
    [status, claimType, assignee, shipmentId, page],
  );

  const list = useQuery({
    queryKey: queryKeys.claims.list(filters),
    queryFn: () => claims.list(filters),
  });

  const detail = useQuery({
    queryKey: queryKeys.claims.detail(openId ?? 0),
    queryFn: () => claims.get(openId!),
    enabled: openId !== null,
  });

  /**
   * `/users/` is unpaginated and admin-only. It is read here so operators and
   * claimants show as names rather than bare ids.
   */
  const directory = useQuery({
    queryKey: queryKeys.admin.users({ scope: "claims-directory" }),
    queryFn: async () => (await api.get<DirectoryUser[]>("/users/")).data,
    staleTime: 5 * 60 * 1000,
  });

  const claim = detail.data ?? null;

  const shipment = useQuery({
    queryKey: queryKeys.shipments.detail(claim?.shipment_id ?? 0),
    queryFn: () => shipments.get(claim!.shipment_id!),
    enabled: Boolean(claim?.shipment_id),
  });

  const people = useMemo(() => {
    const map = new Map<number, DirectoryUser>();
    for (const user of directory.data ?? []) map.set(user.id, user);
    return map;
  }, [directory.data]);

  const operators = useMemo(
    () =>
      (directory.data ?? []).filter((user) =>
        user.roles.some((role) =>
          ["admin", "super_admin", "agent", "branch_manager", "finance"].includes(role),
        ),
      ),
    [directory.data],
  );

  function personName(id: number | null | undefined) {
    if (id === null || id === undefined) return "—";
    const user = people.get(id);
    if (!user) return `User #${id}`;
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  }

  async function refresh() {
    await cache.invalidateQueries({ queryKey: queryKeys.claims.all });
  }

  const assign = useMutation({
    mutationFn: () => claims.assign(openId!, Number(assignTo)),
    onSuccess: async () => {
      await refresh();
      success("Claim assigned.");
    },
    onError: (err) => errorToast("Could not assign the claim.", { description: errorMessage(err) }),
  });

  const move = useMutation({
    mutationFn: (next: string) => claims.setStatus(openId!, next),
    onSuccess: async () => {
      await refresh();
      success("Status updated.");
    },
    onError: (err) =>
      errorToast("Could not change the status.", { description: errorMessage(err) }),
  });

  const approve = useMutation({
    mutationFn: () =>
      claims.approve(openId!, Number(approveAmount), approveNote.trim() || undefined),
    onSuccess: async () => {
      await refresh();
      success("Claim approved.");
      setApproveAmount("");
      setApproveNote("");
    },
    onError: (err) => errorToast("Could not approve the claim.", { description: errorMessage(err) }),
  });

  const reject = useMutation({
    mutationFn: () => claims.reject(openId!, rejectReason.trim()),
    onSuccess: async () => {
      await refresh();
      success("Claim rejected.");
      setRejectReason("");
    },
    onError: (err) => errorToast("Could not reject the claim.", { description: errorMessage(err) }),
  });

  const settle = useMutation({
    mutationFn: () => claims.settle(openId!),
    onSuccess: async () => {
      await refresh();
      success("Claim settled.");
      setSettling(false);
    },
    onError: (err) => errorToast("Could not settle the claim.", { description: errorMessage(err) }),
  });

  const columns: DataTableColumn<Claim>[] = [
    {
      id: "claim",
      header: "Claim",
      primary: true,
      cell: (row) => (
        <div>
          <p className="font-semibold text-[color:var(--brand-navy)]">{row.claim_no}</p>
          <p className="text-xs text-slate-600">{when(row.created_at)}</p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (row) => <span className="text-sm text-slate-800">{label(row.claim_type)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge tone={STATUS_TONES[row.status] ?? "neutral"} variant="soft" dot>
          {label(row.status)}
        </Badge>
      ),
    },
    {
      id: "shipment",
      header: "Shipment",
      cell: (row) => (
        <span className="text-sm text-slate-800">
          {row.shipment_id ? `#${row.shipment_id}` : "—"}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Claimed",
      align: "right",
      cell: (row) => (
        <span className="text-sm text-slate-800">
          {row.currency} {row.claimed_amount.toLocaleString()}
        </span>
      ),
    },
    {
      id: "assignee",
      header: "Assigned to",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-slate-800">{personName(row.assigned_to)}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setOpenId(row.id);
            setAssignTo(row.assigned_to ? String(row.assigned_to) : "");
            setApproveAmount(String(row.claimed_amount));
            setApproveNote("");
            setRejectReason("");
          }}
        >
          Open
        </Button>
      ),
    },
  ];

  const rows = list.data?.items ?? [];
  const openCount = rows.filter((row) => !row.is_closed).length;
  const unassigned = rows.filter((row) => !row.assigned_to && !row.is_closed).length;

  const amountTooHigh =
    claim !== null && Number(approveAmount) > claim.claimed_amount;

  return (
    <>
      <ScreenHeader
        eyebrow="Operations"
        title="Claims"
        description="Lost, damaged, delayed and disputed shipments, from first report to settlement."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Claims on this page"
          value={list.data?.total ?? 0}
          hint="Matching the current filters"
          loading={list.isLoading}
        />
        <StatCard label="Still open" value={openCount} loading={list.isLoading} />
        <StatCard
          label="Unassigned"
          value={unassigned}
          hint="Open with nobody on them"
          loading={list.isLoading}
        />
      </div>

      <div className="panel">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Status">
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any status" },
                ...STATUSES.map((value) => ({ value, label: label(value) })),
              ]}
            />
          </Field>
          <Field label="Type">
            <Select
              value={claimType}
              onChange={(event) => {
                setClaimType(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any type" },
                ...TYPES.map((value) => ({ value, label: label(value) })),
              ]}
            />
          </Field>
          <Field label="Assigned to">
            <Select
              value={assignee}
              onChange={(event) => {
                setAssignee(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Anyone" },
                ...operators.map((user) => ({
                  value: String(user.id),
                  label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                })),
              ]}
            />
          </Field>
          <Field label="Shipment id">
            <Input
              type="number"
              value={shipmentId}
              placeholder="Any"
              onChange={(event) => {
                setShipmentId(event.target.value);
                setPage(1);
              }}
            />
          </Field>
        </div>

        {list.isError ? (
          <EmptyState
            title="Could not load claims"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : (
          <>
            <DataTable
              caption="Claims queue with status, shipment and assignee"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={list.isLoading}
              emptyTitle="No claims match"
              emptyDescription="Clear a filter, or enjoy the quiet."
            />
            {(list.data?.pages ?? 1) > 1 && (
              <div className="mt-4">
                <Pagination
                  page={list.data?.page ?? 1}
                  pageCount={list.data?.pages ?? 1}
                  totalItems={list.data?.total}
                  pageSize={list.data?.per_page}
                  onPageChange={setPage}
                  label="Claim pages"
                />
              </div>
            )}
          </>
        )}
      </div>

      <Drawer
        open={openId !== null}
        onClose={() => setOpenId(null)}
        size="lg"
        title={claim ? `Claim ${claim.claim_no}` : "Claim"}
        description={claim ? label(claim.claim_type) : undefined}
      >
        {detail.isLoading || !claim ? (
          <Skeleton lines={8} />
        ) : (
          <div className="space-y-5">
            {claim.is_closed && (
              <Notice tone="warning" title="This claim is closed">
                A {label(claim.status)} claim cannot be reopened or edited, so
                no actions are offered here.
              </Notice>
            )}

            <dl>
              <Describe term="Status">
                <Badge tone={STATUS_TONES[claim.status] ?? "neutral"} variant="soft">
                  {label(claim.status)}
                </Badge>
              </Describe>
              <Describe term="Priority">{claim.priority}</Describe>
              <Describe term="Raised by">{personName(claim.raised_by)}</Describe>
              <Describe term="Assigned to">{personName(claim.assigned_to)}</Describe>
              <Describe term="Claimed">
                {claim.currency} {claim.claimed_amount.toLocaleString()}
              </Describe>
              <Describe term="Approved">
                {claim.approved_amount
                  ? `${claim.currency} ${claim.approved_amount.toLocaleString()}`
                  : "—"}
              </Describe>
              <Describe term="Due">{when(claim.due_at)}</Describe>
            </dl>

            <section>
              <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                Shipment
              </h3>
              {!claim.shipment_id ? (
                <p className="mt-1 text-sm text-slate-700">
                  No shipment attached to this claim.
                </p>
              ) : shipment.isLoading ? (
                <Skeleton lines={2} />
              ) : shipment.isError ? (
                <p className="mt-1 text-sm text-slate-700">
                  Shipment #{claim.shipment_id} — {errorMessage(shipment.error)}
                </p>
              ) : (
                <dl>
                  <Describe term="Tracking">{shipment.data?.tracking_no}</Describe>
                  <Describe term="Status">{shipment.data?.status_label}</Describe>
                  <Describe term="Route">
                    {shipment.data?.origin ?? "?"} → {shipment.data?.destination ?? "?"}
                  </Describe>
                  <Describe term="Receiver">{shipment.data?.receiver_name ?? "—"}</Describe>
                </dl>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                Description
              </h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {claim.description || "Nothing written."}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">History</h3>
              <dl>
                <Describe term="Raised">{when(claim.created_at)}</Describe>
                <Describe term="Resolved">
                  {claim.resolved_at
                    ? `${when(claim.resolved_at)} by ${personName(claim.resolved_by)}`
                    : "—"}
                </Describe>
                <Describe term="Settled">{when(claim.settled_at)}</Describe>
              </dl>
              {claim.resolution_note && (
                <p className="mt-2 rounded-[0.5rem] bg-slate-50 p-3 text-sm text-slate-800">
                  <span className="font-semibold">Resolution: </span>
                  {claim.resolution_note}
                </p>
              )}
              {claim.rejection_reason && (
                <p className="mt-2 rounded-[0.5rem] bg-red-50 p-3 text-sm text-red-900">
                  <span className="font-semibold">Rejected: </span>
                  {claim.rejection_reason}
                </p>
              )}
            </section>

            {!claim.is_closed && (
              <section className="space-y-5 border-t border-slate-200 pt-5">
                <div>
                  <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                    Assign
                  </h3>
                  <div className="mt-2 flex flex-wrap items-end gap-3">
                    <Field label="Operator" className="min-w-[14rem] flex-1">
                      <Select
                        value={assignTo}
                        placeholder="Choose an operator"
                        onChange={(event) => setAssignTo(event.target.value)}
                        options={operators.map((user) => ({
                          value: user.id,
                          label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                        }))}
                      />
                    </Field>
                    <Button
                      loading={assign.isPending}
                      disabled={!assignTo}
                      onClick={() => assign.mutate()}
                    >
                      Assign
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                    Move status
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Only these three are reachable by hand. Approve, reject and
                    settle set the rest.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {MANUAL_STATUSES.map((next) => (
                      <Button
                        key={next}
                        variant="outline"
                        size="sm"
                        disabled={claim.status === next || move.isPending}
                        onClick={() => move.mutate(next)}
                      >
                        {label(next)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                    Approve
                  </h3>
                  <div className="mt-2 space-y-3">
                    <Field
                      label={`Approved amount (${claim.currency})`}
                      hint={`May not exceed the claimed ${claim.claimed_amount.toLocaleString()}.`}
                      error={amountTooHigh ? "Above the claimed amount." : undefined}
                    >
                      <Input
                        type="number"
                        min={0}
                        max={claim.claimed_amount}
                        value={approveAmount}
                        onChange={(event) => setApproveAmount(event.target.value)}
                      />
                    </Field>
                    <Field label="Resolution note" showOptional>
                      <Textarea
                        rows={3}
                        value={approveNote}
                        onChange={(event) => setApproveNote(event.target.value)}
                      />
                    </Field>
                    <Button
                      loading={approve.isPending}
                      disabled={!approveAmount || amountTooHigh}
                      onClick={() => approve.mutate()}
                    >
                      Approve claim
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                    Reject
                  </h3>
                  <div className="mt-2 space-y-3">
                    <Field label="Reason" required hint="The claimant reads this.">
                      <Textarea
                        rows={3}
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                      />
                    </Field>
                    <Button
                      variant="danger"
                      loading={reject.isPending}
                      disabled={!rejectReason.trim()}
                      onClick={() => reject.mutate()}
                    >
                      Reject claim
                    </Button>
                  </div>
                </div>

                {claim.status === "approved" && (
                  <div>
                    <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                      Settle
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Marks the approved amount as paid out and closes the claim.
                    </p>
                    <Button className="mt-2" onClick={() => setSettling(true)}>
                      Settle claim
                    </Button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={settling}
        onClose={() => setSettling(false)}
        onConfirm={async () => {
          await settle.mutateAsync();
        }}
        title="Settle this claim?"
        description="The claim closes for good once it is settled. It cannot be reopened or edited afterwards."
        confirmLabel="Settle"
      />
    </>
  );
}
