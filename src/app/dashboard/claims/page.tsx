"use client";

/**
 * Customer claims: raise one against your own shipment, follow it through
 * review, and withdraw it while it is still open.
 *
 * The customer layout already wraps this in `<Workspace>` with its
 * `ProtectedRoute`, so nothing here re-checks the session.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaFileAlt } from "react-icons/fa";
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
import { queryKeys } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/resources/client";
import { claims } from "@/lib/resources/integrations";
import { shipments } from "@/lib/resources/operations";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Claim, ClaimStatus, ClaimType, Shipment } from "@/types/logistics";

/**
 * `GET /claims/mine` answers with `{claims: [...], total, …}` while the typed
 * wrapper declares a bare array, and `toPage` in `resources/client.ts` does
 * not know the `claims` key. Normalising here keeps the fix local: that
 * module is shared with other screens and not ours to change.
 */
function toClaimList(payload: unknown): Claim[] {
  if (Array.isArray(payload)) return payload as Claim[];
  if (payload && typeof payload === "object") {
    const record = payload as { claims?: unknown; items?: unknown };
    if (Array.isArray(record.claims)) return record.claims as Claim[];
    if (Array.isArray(record.items)) return record.items as Claim[];
  }
  return [];
}

const CLAIM_TYPES: Array<{ value: ClaimType; label: string }> = [
  { value: "lost", label: "Parcel lost" },
  { value: "damaged", label: "Parcel damaged" },
  { value: "partial_loss", label: "Part of the contents missing" },
  { value: "delay", label: "Delivered late" },
  { value: "wrong_delivery", label: "Delivered to the wrong person" },
  { value: "cod_discrepancy", label: "Cash on delivery does not match" },
  { value: "overcharge", label: "Overcharged" },
  { value: "other", label: "Something else" },
];

const STATUS_TONES: Record<ClaimStatus, BadgeTone> = {
  open: "amber",
  under_review: "blue",
  awaiting_customer: "orange",
  approved: "green",
  rejected: "red",
  settled: "teal",
  withdrawn: "neutral",
};

const STATUS_LABELS: Record<ClaimStatus, string> = {
  open: "Open",
  under_review: "Under review",
  awaiting_customer: "Waiting on you",
  approved: "Approved",
  rejected: "Rejected",
  settled: "Settled",
  withdrawn: "Withdrawn",
};

const TYPE_LABELS: Record<ClaimType, string> = CLAIM_TYPES.reduce(
  (map, entry) => ({ ...map, [entry.value]: entry.label }),
  {} as Record<ClaimType, string>,
);

interface FormState {
  shipment_id: string;
  claim_type: ClaimType;
  description: string;
  claimed_amount: string;
}

const EMPTY_FORM: FormState = {
  shipment_id: "",
  claim_type: "damaged",
  description: "",
  claimed_amount: "",
};

/** What the operator decided, in the claimant's words. */
function Outcome({ claim }: { claim: Claim }) {
  if (claim.status === "rejected") {
    return (
      <span className="text-slate-800">
        Rejected
        {claim.rejection_reason && (
          <span className="block text-xs text-slate-600">{claim.rejection_reason}</span>
        )}
      </span>
    );
  }

  if (claim.status === "approved" || claim.status === "settled") {
    return (
      <span className="text-slate-800 tabular-nums">
        {formatCurrency(claim.approved_amount, claim.currency || "NPR")}
        <span className="block text-xs text-slate-600">
          {claim.status === "settled" ? "Paid out" : "Approved, awaiting payout"}
        </span>
      </span>
    );
  }

  if (claim.status === "withdrawn") {
    return <span className="text-slate-600">Withdrawn by you</span>;
  }

  return <span className="text-slate-600">Still being reviewed</span>;
}

export default function CustomerClaimsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [toWithdraw, setToWithdraw] = useState<Claim | null>(null);

  const myShipments = useQuery({
    queryKey: queryKeys.shipments.list({ scope: "mine" }),
    queryFn: () => shipments.mine(),
  });

  const myClaims = useQuery({
    queryKey: queryKeys.claims.list({ scope: "mine" }),
    queryFn: async () => toClaimList(await claims.mine()),
  });

  const shipmentOptions = useMemo(
    () =>
      (myShipments.data ?? []).map((shipment: Shipment) => ({
        value: shipment.id,
        label: `${shipment.tracking_no} — ${
          shipment.destination_district || shipment.destination || "destination unknown"
        } (${shipment.status_label})`,
      })),
    [myShipments.data],
  );

  const createClaim = useMutation({
    mutationFn: (body: {
      shipment_id: number;
      claim_type: string;
      description: string;
      claimed_amount?: number;
    }) => claims.create(body),
    onSuccess: (claim) => {
      toast.success(`Claim ${claim.claim_no} raised`, {
        description: "We will review it and update the status here.",
      });
      setForm(EMPTY_FORM);
      setErrors({});
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.all });
    },
    onError: (error) => {
      toast.error("Could not raise the claim", { description: errorMessage(error) });
    },
  });

  const withdrawClaim = useMutation({
    mutationFn: (id: number) => claims.withdraw(id),
    onSuccess: (claim) => {
      toast.success(`Claim ${claim.claim_no} withdrawn`);
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.all });
    },
    onError: (error) => {
      toast.error("Could not withdraw the claim", { description: errorMessage(error) });
    },
    onSettled: () => setToWithdraw(null),
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found: Partial<Record<keyof FormState, string>> = {};

    if (!form.shipment_id) found.shipment_id = "Choose the shipment this is about.";
    if (form.description.trim().length < 10) {
      found.description = "Describe what went wrong in a sentence or two.";
    }
    if (form.claimed_amount) {
      const amount = Number(form.claimed_amount);
      if (Number.isNaN(amount) || amount < 0) {
        found.claimed_amount = "Enter the amount in rupees, or leave it blank.";
      }
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Check the form", { description: "Some details still need fixing." });
      return;
    }

    createClaim.mutate({
      shipment_id: Number(form.shipment_id),
      claim_type: form.claim_type,
      description: form.description.trim(),
      ...(form.claimed_amount ? { claimed_amount: Number(form.claimed_amount) } : {}),
    });
  };

  const noShipments = !myShipments.isPending && shipmentOptions.length === 0;

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2 text-teal-700">Claims</p>
        <h1 className="text-3xl font-bold text-[color:var(--brand-navy)]">
          Something went wrong with a delivery
        </h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600">
          Raise a claim against one of your shipments. You can withdraw it at any point
          before it is resolved.
        </p>
      </header>

      <Card as="section" aria-labelledby="raise-heading">
        <CardHeader>
          <CardTitle id="raise-heading">Raise a claim</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field
              label="Shipment"
              required
              error={errors.shipment_id}
              hint={
                myShipments.isError
                  ? `Your shipments could not be loaded. ${errorMessage(myShipments.error)}`
                  : noShipments
                    ? "You have no shipments to claim against yet."
                    : "Only shipments booked on your account can be claimed against."
              }
            >
              <Select
                value={form.shipment_id}
                onChange={(event) => set("shipment_id", event.target.value)}
                placeholder={myShipments.isPending ? "Loading your shipments…" : "Choose a shipment"}
                options={shipmentOptions}
                disabled={myShipments.isPending || noShipments}
              />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="What happened" required>
                <Select
                  value={form.claim_type}
                  onChange={(event) => set("claim_type", event.target.value as ClaimType)}
                  options={CLAIM_TYPES}
                />
              </Field>

              <Field
                label="Amount claimed (NPR)"
                showOptional
                error={errors.claimed_amount}
                hint="Leave blank if you are not asking for money back."
              >
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={form.claimed_amount}
                  onChange={(event) => set("claimed_amount", event.target.value)}
                  placeholder="0.00"
                />
              </Field>
            </div>

            <Field
              label="Description"
              required
              error={errors.description}
              hint="What was damaged or missing, when you noticed, and anything the rider said."
            >
              <Textarea
                rows={4}
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
                placeholder="The outer box arrived crushed and two of the four items inside were broken."
              />
            </Field>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                loading={createClaim.isPending}
                loadingLabel="Submitting the claim"
                disabled={noShipments}
              >
                Submit claim
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setErrors({});
                }}
                disabled={createClaim.isPending}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card as="section" aria-labelledby="my-claims-heading">
        <CardHeader>
          <CardTitle id="my-claims-heading">Your claims</CardTitle>
        </CardHeader>
        <CardBody>
          {myClaims.isError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
            >
              <p className="font-semibold">Could not load your claims.</p>
              <p className="mt-1 text-red-800">{errorMessage(myClaims.error)}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => myClaims.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : (
            <DataTable<Claim>
              caption="Claims you have raised"
              rows={myClaims.data ?? []}
              rowKey={(row) => row.id}
              loading={myClaims.isPending}
              emptyTitle="No claims raised"
              emptyDescription="If a delivery goes wrong, raise a claim above and track it here."
              emptyIcon={<FaFileAlt aria-hidden="true" />}
              columns={[
                {
                  id: "claim_no",
                  header: "Reference",
                  primary: true,
                  cell: (row) => (
                    <span className="font-semibold text-[color:var(--brand-navy)]">
                      {row.claim_no}
                    </span>
                  ),
                },
                {
                  id: "type",
                  header: "Type",
                  cell: (row) => (
                    <span className="text-slate-800">
                      {TYPE_LABELS[row.claim_type] ?? row.claim_type}
                      {row.description && (
                        <span className="block max-w-xs truncate text-xs text-slate-600">
                          {row.description}
                        </span>
                      )}
                    </span>
                  ),
                },
                {
                  id: "raised",
                  header: "Raised",
                  hideOnMobile: true,
                  cell: (row) => (
                    <span className="text-slate-700">
                      {row.created_at ? formatDate(row.created_at) : "—"}
                    </span>
                  ),
                },
                {
                  id: "claimed",
                  header: "Claimed",
                  align: "right",
                  cell: (row) => (
                    <span className="text-slate-800 tabular-nums">
                      {row.claimed_amount
                        ? formatCurrency(row.claimed_amount, row.currency || "NPR")
                        : "—"}
                    </span>
                  ),
                },
                {
                  id: "status",
                  header: "Status",
                  cell: (row) => (
                    <Badge tone={STATUS_TONES[row.status] ?? "neutral"}>
                      {STATUS_LABELS[row.status] ?? row.status}
                    </Badge>
                  ),
                },
                {
                  id: "outcome",
                  header: "Outcome",
                  cell: (row) => <Outcome claim={row} />,
                },
                {
                  id: "actions",
                  header: "Actions",
                  srOnlyHeader: true,
                  align: "right",
                  cell: (row) =>
                    row.is_closed ? (
                      <span className="text-xs text-slate-600">Closed</span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setToWithdraw(row)}
                        disabled={withdrawClaim.isPending}
                      >
                        Withdraw
                        <span className="sr-only"> claim {row.claim_no}</span>
                      </Button>
                    ),
                },
              ]}
            />
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={toWithdraw !== null}
        onClose={() => setToWithdraw(null)}
        onConfirm={() => {
          if (toWithdraw) withdrawClaim.mutate(toWithdraw.id);
        }}
        title="Withdraw this claim?"
        description={
          toWithdraw
            ? `Claim ${toWithdraw.claim_no} will be closed and cannot be reopened. You would have to raise a new one.`
            : undefined
        }
        confirmLabel="Withdraw claim"
        cancelLabel="Keep it open"
        tone="danger"
      />
    </div>
  );
}
