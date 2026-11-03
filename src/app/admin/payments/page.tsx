"use client";

/**
 * Online payments and the gateway register.
 *
 * Two things worth calling out. Refunds are super_admin-only and bounded by
 * what is still refundable; the client checks the bound as a courtesy but the
 * server is the authority, so its refusal is shown rather than pre-empted.
 * And `POST /payments/:id/verify` answers 501 while no provider is wired up —
 * that is a state of the system, not a mistake the operator made, so it is
 * rendered as information and never as "payment confirmed".
 */

import { useMemo, useState } from "react";
import axios from "axios";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Drawer,
  Field,
  Input,
  Modal,
  Pagination,
  Select,
  Spinner,
  Tabs,
  Textarea,
  type DataTableColumn,
  type SelectOption,
  useToast,
} from "@/components/kit";
import { Money, formatMoney } from "@/components/admin/finance/money";
import {
  ActiveBadge,
  DetailList,
  DetailRow,
  FilterBar,
  FinanceHeader,
  InfoNotice,
  PaymentStatusBadge,
  QueryError,
  formatDateTime,
  optionalText,
} from "@/components/admin/finance/shared";
import {
  GatewayForm,
  SECRET_FIELDS,
  hasAnyCredential,
  maskedValue,
  type GatewayPayload,
} from "@/components/admin/finance/GatewayForm";
import { queryKeys } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/resources/client";
import { payments, type PaymentFilters } from "@/lib/resources/finance";
import type { Payment, PaymentGateway } from "@/types/logistics";

const PER_PAGE = 20;

const STATUS_OPTIONS: SelectOption[] = [
  { value: "initiated", label: "Initiated" },
  { value: "pending", label: "Pending" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

/** What is still refundable on a payment, as the server reports it. */
function refundableAmount(payment: Payment): number {
  return Math.max(0, payment.amount - payment.refund_amount);
}

/** The verify seam answers 501 until a provider is enabled. */
function isNotImplemented(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 501;
}

export default function PaymentsPage() {
  const toast = useToast();
  const cache = useQueryClient();

  const [tab, setTab] = useState("payments");

  // Payments list
  const [status, setStatus] = useState("");
  const [gatewayId, setGatewayId] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundError, setRefundError] = useState<string | null>(null);

  // Gateways
  const [editing, setEditing] = useState<PaymentGateway | null>(null);
  const [creating, setCreating] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<PaymentGateway | null>(null);

  const query: PaymentFilters = useMemo(
    () => ({
      status: optionalText(status),
      gateway_id: gatewayId === "" ? undefined : Number(gatewayId),
      page,
      per_page: PER_PAGE,
    }),
    [status, gatewayId, page],
  );

  const listQuery = useQuery({
    queryKey: queryKeys.payments.list(query),
    queryFn: () => payments.list(query),
    placeholderData: keepPreviousData,
  });

  const gatewaysQuery = useQuery({
    queryKey: queryKeys.payments.gatewaysAll,
    queryFn: () => payments.gateways.all(),
  });

  const detailQuery = useQuery({
    queryKey: queryKeys.payments.detail(detailId ?? 0),
    queryFn: () => payments.get(detailId as number),
    enabled: detailId !== null,
  });

  const gatewayOptions: SelectOption[] = useMemo(
    () =>
      (gatewaysQuery.data ?? []).map((gateway) => ({
        value: String(gateway.id),
        label: `${gateway.display_name || gateway.name} (${gateway.code})`,
      })),
    [gatewaysQuery.data],
  );

  const refreshPayments = async (id?: number) => {
    await cache.invalidateQueries({ queryKey: queryKeys.payments.all });
    if (id !== undefined) await cache.invalidateQueries({ queryKey: queryKeys.payments.detail(id) });
  };

  const verifyMutation = useMutation({
    mutationFn: (id: number) => payments.verify(id),
    onSuccess: async (result) => {
      if (result.provider && result.provider.enabled === false) {
        setVerifyNotice(
          result.provider.message ??
            result.provider.reason ??
            "No payment provider integration is enabled, so this payment could not be verified.",
        );
        return;
      }
      setVerifyNotice(null);
      toast.success("Verification returned", {
        description: `Payment ${result.payment_no} is now ${result.status}.`,
      });
      await refreshPayments(result.id);
    },
    onError: (error: unknown) => {
      if (isNotImplemented(error)) {
        setVerifyNotice(errorMessage(error, "Gateway integration is not enabled."));
        return;
      }
      setVerifyNotice(null);
      toast.error("Verification failed", { description: errorMessage(error) });
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { amount: number; reason?: string } }) =>
      payments.refund(id, body),
    onSuccess: async (payment) => {
      toast.success("Refund recorded", {
        description: `${formatMoney(payment.refund_amount, payment.currency)} refunded against ${
          payment.payment_no
        }.`,
      });
      closeRefund();
      await refreshPayments(payment.id);
    },
    onError: (error: unknown) => {
      setRefundError(errorMessage(error));
      toast.error("Refund refused", { description: errorMessage(error), duration: null });
    },
  });

  const saveGatewayMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: GatewayPayload }) => {
      const body = payload as unknown as Partial<PaymentGateway> & { code: string };
      return id === null ? payments.gateways.create(body) : payments.gateways.update(id, body);
    },
    onSuccess: async (gateway) => {
      toast.success("Gateway saved", { description: `${gateway.display_name || gateway.name} updated.` });
      setEditing(null);
      setCreating(false);
      // `gateways` is a prefix of `gatewaysAll`, so one call refreshes both.
      await cache.invalidateQueries({ queryKey: queryKeys.payments.gateways });
    },
    onError: (error: unknown) =>
      toast.error("Could not save the gateway", { description: errorMessage(error), duration: null }),
  });

  const deactivateGatewayMutation = useMutation({
    mutationFn: (id: number) => payments.gateways.deactivate(id),
    onSuccess: async () => {
      toast.success("Gateway deactivated");
      // `gateways` is a prefix of `gatewaysAll`, so one call refreshes both.
      await cache.invalidateQueries({ queryKey: queryKeys.payments.gateways });
    },
    onError: (error: unknown) =>
      toast.error("Could not deactivate the gateway", { description: errorMessage(error) }),
  });

  function closeRefund() {
    setRefundOpen(false);
    setRefundAmount("");
    setRefundReason("");
    setRefundError(null);
  }

  function openDetail(id: number) {
    setDetailId(id);
    setVerifyNotice(null);
  }

  const paymentColumns: DataTableColumn<Payment>[] = [
    {
      id: "payment",
      header: "Payment",
      primary: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[color:var(--brand-navy)]">{row.payment_no}</span>
          <span className="block text-xs text-slate-600">
            {row.shipment_id ? `Shipment #${row.shipment_id}` : row.invoice_id ? `Invoice #${row.invoice_id}` : "Unlinked"}
          </span>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.payment_no,
    },
    {
      id: "gateway",
      header: "Gateway",
      cell: (row) => <span className="text-sm text-slate-700">{row.gateway_code ?? "—"}</span>,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      cell: (row) => <Money amount={row.amount} currency={row.currency} />,
      sortable: true,
      sortValue: (row) => row.amount,
    },
    {
      id: "charge",
      header: "Service charge",
      align: "right",
      hideOnMobile: true,
      cell: (row) => <Money amount={row.service_charge} currency={row.currency} muted />,
    },
    {
      id: "refunded",
      header: "Refunded",
      align: "right",
      cell: (row) =>
        row.refund_amount > 0 ? (
          <Money amount={row.refund_amount} currency={row.currency} />
        ) : (
          <span className="text-sm text-slate-600">—</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <PaymentStatusBadge status={row.status} />,
    },
    {
      id: "paid",
      header: "Paid at",
      hideOnMobile: true,
      cell: (row) => <span className="text-sm text-slate-700">{formatDateTime(row.paid_at)}</span>,
      sortable: true,
      sortValue: (row) => row.paid_at,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <Button type="button" size="sm" variant="outline" onClick={() => openDetail(row.id)}>
          View
        </Button>
      ),
    },
  ];

  const gatewayColumns: DataTableColumn<PaymentGateway>[] = [
    {
      id: "gateway",
      header: "Gateway",
      primary: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[color:var(--brand-navy)]">
            {row.display_name || row.name}
          </span>
          <span className="block text-xs text-slate-600">{row.code}</span>
        </div>
      ),
    },
    {
      id: "mode",
      header: "Mode",
      cell: (row) => (
        <Badge tone={row.is_sandbox ? "amber" : "teal"}>{row.is_sandbox ? "Sandbox" : "Live"}</Badge>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: (row) => <ActiveBadge active={row.is_active} />,
    },
    {
      id: "configured",
      header: "Credentials",
      cell: (row) => (
        <Badge tone={row.is_configured ? "green" : "neutral"} variant="outline">
          {row.is_configured ? "Configured" : hasAnyCredential(row) ? "Partial" : "Not set"}
        </Badge>
      ),
    },
    {
      id: "limits",
      header: "Amount range",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-right text-xs tabular-nums text-slate-700">
          {formatMoney(row.min_amount, row.supported_currencies[0])} –{" "}
          {row.max_amount === null ? "no cap" : formatMoney(row.max_amount, row.supported_currencies[0])}
        </span>
      ),
    },
    {
      id: "charges",
      header: "Service charge",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-right text-xs tabular-nums text-slate-700">
          {row.service_charge_percent}% + {formatMoney(row.service_charge_flat, row.supported_currencies[0])}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(row)}>
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setDeactivateTarget(row)}
            disabled={!row.is_active}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  const data = listQuery.data;
  const detail = detailQuery.data;
  const refundable = detail ? refundableAmount(detail) : 0;

  const paymentsPane = (
    <>
      <FilterBar label="Filter payments" onReset={() => { setStatus(""); setGatewayId(""); setPage(1); }}>
        <Field label="Status">
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            options={[{ value: "", label: "Any status" }, ...STATUS_OPTIONS]}
          />
        </Field>
        <Field label="Gateway">
          <Select
            value={gatewayId}
            onChange={(event) => {
              setGatewayId(event.target.value);
              setPage(1);
            }}
            options={[{ value: "", label: "All gateways" }, ...gatewayOptions]}
            disabled={gatewaysQuery.isLoading}
          />
        </Field>
      </FilterBar>

      {listQuery.isError ? (
        <QueryError
          error={listQuery.error}
          title="Could not load payments"
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <>
          <div className="panel p-0! sm:p-0!">
            <DataTable
              caption="Payments"
              columns={paymentColumns}
              rows={data?.items ?? []}
              rowKey={(row) => row.id}
              loading={listQuery.isLoading}
              emptyTitle="No payments match these filters"
              emptyDescription="Clear the status and gateway filters to see everything."
            />
          </div>

          {data && (
            <Pagination
              className="mt-5"
              page={data.page}
              pageCount={data.pages}
              pageSize={data.per_page}
              totalItems={data.total}
              onPageChange={setPage}
              label="Payments pagination"
            />
          )}
        </>
      )}
    </>
  );

  const gatewaysPane = (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          Stored credentials come back masked. Editing a gateway leaves every secret untouched unless you
          explicitly replace or clear it.
        </p>
        <Button type="button" onClick={() => setCreating(true)}>
          Add gateway
        </Button>
      </div>

      {gatewaysQuery.isError ? (
        <QueryError
          error={gatewaysQuery.error}
          title="Could not load gateways"
          onRetry={() => void gatewaysQuery.refetch()}
        />
      ) : (
        <div className="panel p-0! sm:p-0!">
          <DataTable
            caption="Payment gateways"
            columns={gatewayColumns}
            rows={gatewaysQuery.data ?? []}
            rowKey={(row) => row.id}
            loading={gatewaysQuery.isLoading}
            emptyTitle="No gateways configured"
            emptyDescription="Add one to let customers pay online."
          />
        </div>
      )}
    </>
  );

  return (
    <>
      <FinanceHeader
        title="Payments"
        description="Online payments taken through the configured gateways, and the gateway register itself."
      />

      <Tabs
        label="Payments sections"
        value={tab}
        onValueChange={setTab}
        items={[
          { id: "payments", label: "Payments", content: paymentsPane },
          { id: "gateways", label: "Gateways", content: gatewaysPane },
        ]}
      />

      {/* ── Payment detail ─────────────────────────────────────────────── */}
      <Drawer
        open={detailId !== null}
        onClose={() => {
          setDetailId(null);
          setVerifyNotice(null);
        }}
        size="lg"
        title={detail ? detail.payment_no : "Payment"}
        description={detail ? `Gateway ${detail.gateway_code ?? "unknown"}` : undefined}
        footer={
          detail ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => verifyMutation.mutate(detail.id)}
                loading={verifyMutation.isPending}
                loadingLabel="Verifying"
              >
                Verify with gateway
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={refundable <= 0}
                onClick={() => {
                  setRefundAmount(refundable.toFixed(2));
                  setRefundReason("");
                  setRefundError(null);
                  setRefundOpen(true);
                }}
              >
                Refund
              </Button>
            </div>
          ) : undefined
        }
      >
        {detailQuery.isLoading && (
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner size="sm" /> Loading the payment…
          </p>
        )}

        {detailQuery.isError && (
          <QueryError
            error={detailQuery.error}
            title="Could not load this payment"
            onRetry={() => void detailQuery.refetch()}
          />
        )}

        {detail && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <PaymentStatusBadge status={detail.status} />
              {detail.refund_amount > 0 && (
                <Badge tone="orange" variant="outline">
                  Refunded {formatMoney(detail.refund_amount, detail.currency)}
                </Badge>
              )}
            </div>

            {verifyNotice && (
              <InfoNotice title="Gateway verification is not available yet">
                <p>{verifyNotice}</p>
                <p className="mt-1">
                  Nothing about this payment has changed, and its status above is unaffected.
                </p>
              </InfoNotice>
            )}

            <section aria-label="Amounts">
              <h3 className="eyebrow mb-2">Amounts</h3>
              <DetailList>
                <DetailRow label="Amount" emphasis>
                  <Money amount={detail.amount} currency={detail.currency} inline />
                </DetailRow>
                <DetailRow label="Service charge">
                  <Money amount={detail.service_charge} currency={detail.currency} inline />
                </DetailRow>
                <DetailRow label="Refunded to date">
                  <Money amount={detail.refund_amount} currency={detail.currency} inline />
                </DetailRow>
                <DetailRow label="Still refundable">
                  <Money amount={refundable} currency={detail.currency} inline />
                </DetailRow>
              </DetailList>
            </section>

            <section aria-label="References">
              <h3 className="eyebrow mb-2">References</h3>
              <DetailList>
                <DetailRow label="Shipment">
                  {detail.shipment_id ? `#${detail.shipment_id}` : "—"}
                </DetailRow>
                <DetailRow label="Invoice">{detail.invoice_id ? `#${detail.invoice_id}` : "—"}</DetailRow>
                <DetailRow label="Transaction id">{detail.transaction_id ?? "—"}</DetailRow>
                <DetailRow label="Gateway reference">{detail.gateway_reference ?? "—"}</DetailRow>
                <DetailRow label="Failure reason">{detail.failure_reason ?? "—"}</DetailRow>
                <DetailRow label="Created">{formatDateTime(detail.created_at)}</DetailRow>
                <DetailRow label="Paid at">{formatDateTime(detail.paid_at)}</DetailRow>
                <DetailRow label="Refunded at">{formatDateTime(detail.refunded_at)}</DetailRow>
              </DetailList>
            </section>

            <p className="text-sm text-slate-600">
              Refunds are restricted to super admins and bounded by the refundable balance. The server has
              the final say; its refusal is shown verbatim.
            </p>
          </div>
        )}
      </Drawer>

      {/* ── Refund ─────────────────────────────────────────────────────── */}
      <Modal
        open={refundOpen}
        onClose={closeRefund}
        title="Refund this payment"
        description={detail ? `${detail.payment_no} — ${formatMoney(refundable, detail.currency)} refundable.` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={closeRefund} disabled={refundMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={refundMutation.isPending}
              loadingLabel="Issuing refund"
              onClick={() => {
                if (!detail) return;
                const amount = Number(refundAmount);
                if (!Number.isFinite(amount) || amount <= 0) {
                  setRefundError("Enter an amount greater than zero.");
                  return;
                }
                if (amount > refundable) {
                  setRefundError(
                    `That is more than the ${formatMoney(refundable, detail.currency)} still refundable.`,
                  );
                  return;
                }
                refundMutation.mutate({
                  id: detail.id,
                  body: { amount, reason: optionalText(refundReason) },
                });
              }}
            >
              Issue refund
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <Field
              label="Refund amount"
              required
              hint={`At most ${formatMoney(refundable, detail.currency)} (${detail.currency}).`}
              error={refundError}
            >
              <Input
                type="number"
                step="0.01"
                min={0}
                max={refundable}
                inputMode="decimal"
                className="text-right tabular-nums"
                value={refundAmount}
                onChange={(event) => {
                  setRefundAmount(event.target.value);
                  setRefundError(null);
                }}
              />
            </Field>
            <Field label="Reason" showOptional>
              <Textarea
                rows={3}
                value={refundReason}
                onChange={(event) => setRefundReason(event.target.value)}
              />
            </Field>
          </div>
        )}
      </Modal>

      {/* ── Gateway create / edit ──────────────────────────────────────── */}
      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        size="xl"
        title={editing ? `Edit ${editing.display_name || editing.name}` : "Add a payment gateway"}
        description={
          editing
            ? `Credentials show as ${SECRET_FIELDS.length} masked fields; leave one alone and it is not sent.`
            : "A new gateway starts inactive-safe: review the mode and limits before switching it live."
        }
      >
        <GatewayForm
          key={editing ? `gateway-${editing.id}` : "gateway-new"}
          gateway={editing}
          busy={saveGatewayMutation.isPending}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={(payload) =>
            saveGatewayMutation.mutate({ id: editing ? editing.id : null, payload })
          }
        />
      </Modal>

      {/* ── Gateway deactivate ─────────────────────────────────────────── */}
      <ConfirmDialog
        open={deactivateTarget !== null}
        onClose={() => setDeactivateTarget(null)}
        tone="danger"
        onConfirm={async () => {
          if (!deactivateTarget) return;
          try {
            await deactivateGatewayMutation.mutateAsync(deactivateTarget.id);
          } catch {
            // Surfaced by the mutation's onError toast.
          }
        }}
        title="Deactivate this gateway?"
        description={
          deactivateTarget
            ? `${deactivateTarget.display_name || deactivateTarget.name} disappears from checkout immediately. Existing payments are untouched.`
            : undefined
        }
        confirmLabel="Deactivate"
      >
        {deactivateTarget && maskedValue(deactivateTarget, "secret_key_masked") && (
          <p className="text-sm text-slate-700">
            Its stored credentials are kept, so reactivating it later does not mean re-entering them.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
