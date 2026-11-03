"use client";

/**
 * Merchant remittances — the payout side of COD.
 *
 * A remittance gathers a merchant's collections over a period and pays them
 * out. `total_collected` and `net_payable` are derived on the server from the
 * collections it actually gathered, so this screen offers no inputs for them
 * and never computes them: it shows what came back. Approve and pay are
 * super_admin-only and enforced by the backend, so the buttons stay visible
 * and a 403 is surfaced verbatim rather than hidden behind a guess at the
 * current user's role.
 */

import { useMemo, useState } from "react";
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
  Textarea,
  type DataTableColumn,
  type SelectOption,
  useToast,
} from "@/components/kit";
import { Money, formatMoney } from "@/components/admin/finance/money";
import {
  CodStatusBadge,
  DetailList,
  DetailRow,
  FilterBar,
  FinanceHeader,
  InfoNotice,
  QueryError,
  RemittanceStatusBadge,
  formatDateTime,
  formatDay,
  optionalNumber,
  optionalText,
  titleCase,
} from "@/components/admin/finance/shared";
import { queryKeys } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/resources/client";
import { cod, type CodFilters } from "@/lib/resources/finance";
import type { CodRemittance } from "@/types/logistics";

const PER_PAGE = 20;

const STATUS_OPTIONS: SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

interface Filters {
  status: string;
  merchantId: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_FILTERS: Filters = { status: "", merchantId: "", dateFrom: "", dateTo: "" };

interface CreateForm {
  merchantId: string;
  periodStart: string;
  periodEnd: string;
  serviceFee: string;
  taxAmount: string;
  adjustment: string;
  notes: string;
}

const EMPTY_CREATE: CreateForm = {
  merchantId: "",
  periodStart: "",
  periodEnd: "",
  serviceFee: "",
  taxAmount: "",
  adjustment: "",
  notes: "",
};

export default function RemittancesPage() {
  const toast = useToast();
  const cache = useQueryClient();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [createError, setCreateError] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<CodRemittance | null>(null);
  const [payTarget, setPayTarget] = useState<CodRemittance | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [payError, setPayError] = useState<string | null>(null);

  const patch = (next: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setPage(1);
  };

  const query: CodFilters = useMemo(
    () => ({
      status: optionalText(filters.status),
      merchant_id: filters.merchantId === "" ? undefined : Number(filters.merchantId),
      date_from: optionalText(filters.dateFrom),
      date_to: optionalText(filters.dateTo),
      page,
      per_page: PER_PAGE,
    }),
    [filters, page],
  );

  const listQuery = useQuery({
    queryKey: queryKeys.cod.remittances(query),
    queryFn: () => cod.remittances(query),
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.cod.summary,
    queryFn: () => cod.summary(),
    staleTime: 60 * 1000,
  });

  const detailQuery = useQuery({
    queryKey: queryKeys.cod.remittance(detailId ?? 0),
    queryFn: () => cod.remittance(detailId as number),
    enabled: detailId !== null,
  });

  const merchantOptions: SelectOption[] = useMemo(
    () =>
      // The summary groups by merchant id only; it carries no display name.
      (summaryQuery.data?.merchants ?? []).map((merchant) => ({
        value: String(merchant.merchant_id),
        label: `Merchant #${merchant.merchant_id}`,
      })),
    [summaryQuery.data],
  );

  const refresh = async (id?: number) => {
    await cache.invalidateQueries({ queryKey: queryKeys.cod.all });
    if (id !== undefined) {
      await cache.invalidateQueries({ queryKey: queryKeys.cod.remittance(id) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (body: Parameters<typeof cod.createRemittance>[0]) => cod.createRemittance(body),
    onSuccess: async (remittance) => {
      toast.success("Remittance created", {
        description: `${remittance.remittance_no} gathered ${remittance.collection_count} collection${
          remittance.collection_count === 1 ? "" : "s"
        }. Net payable ${formatMoney(remittance.net_payable, remittance.currency)}.`,
      });
      setCreateOpen(false);
      setCreateForm(EMPTY_CREATE);
      setCreateError(null);
      await refresh();
      // Open the detail so the operator reads the server's totals, not a guess.
      setDetailId(remittance.id);
    },
    onError: (error: unknown) => {
      setCreateError(errorMessage(error));
      toast.error("Could not create the remittance", { description: errorMessage(error) });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => cod.approveRemittance(id),
    onSuccess: async (remittance) => {
      toast.success("Remittance approved", { description: `${remittance.remittance_no} is approved.` });
      await refresh(remittance.id);
    },
    onError: (error: unknown) =>
      toast.error("Approval refused", {
        description: errorMessage(error),
        duration: null,
      }),
  });

  const payMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { payment_reference: string; payment_method?: string } }) =>
      cod.payRemittance(id, body),
    onSuccess: async (remittance) => {
      toast.success("Payout recorded", {
        description: `${remittance.remittance_no} released ${formatMoney(
          remittance.net_payable,
          remittance.currency,
        )}.`,
      });
      closePay();
      await refresh(remittance.id);
    },
    onError: (error: unknown) => {
      setPayError(errorMessage(error));
      toast.error("Payout refused", { description: errorMessage(error), duration: null });
    },
  });

  function closePay() {
    setPayTarget(null);
    setPaymentReference("");
    setPaymentMethod("");
    setPayError(null);
  }

  const columns: DataTableColumn<CodRemittance>[] = [
    {
      id: "remittance",
      header: "Remittance",
      primary: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[color:var(--brand-navy)]">{row.remittance_no}</span>
          <span className="block text-xs text-slate-600">Merchant #{row.merchant_id}</span>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.remittance_no,
    },
    {
      id: "period",
      header: "Period",
      cell: (row) => (
        <span className="text-sm text-slate-700">
          {formatDay(row.period_start)} – {formatDay(row.period_end)}
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.period_start,
    },
    {
      id: "count",
      header: "Collections",
      align: "right",
      cell: (row) => <span className="tabular-nums text-sm text-slate-700">{row.collection_count}</span>,
      sortable: true,
      sortValue: (row) => row.collection_count,
    },
    {
      id: "collected",
      header: "Collected",
      align: "right",
      cell: (row) => <Money amount={row.total_collected} currency={row.currency} />,
      sortable: true,
      sortValue: (row) => row.total_collected,
    },
    {
      id: "deductions",
      header: "Fee / tax / adj.",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <div className="text-right text-xs tabular-nums text-slate-600">
          <div>{formatMoney(row.service_fee, row.currency)}</div>
          <div>{formatMoney(row.tax_amount, row.currency)}</div>
          <div>{formatMoney(row.adjustment, row.currency)}</div>
        </div>
      ),
    },
    {
      id: "net",
      header: "Net payable",
      align: "right",
      cell: (row) => (
        <Money amount={row.net_payable} currency={row.currency} className="text-[color:var(--brand-navy)]" />
      ),
      sortable: true,
      sortValue: (row) => row.net_payable,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <RemittanceStatusBadge status={row.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setDetailId(row.id)}>
            View
          </Button>
          {row.status === "draft" && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setApproveTarget(row)}>
              Approve
            </Button>
          )}
          {row.status === "approved" && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setPayTarget(row);
                setPaymentReference("");
                setPaymentMethod("");
                setPayError(null);
              }}
            >
              Pay
            </Button>
          )}
        </div>
      ),
    },
  ];

  const data = listQuery.data;
  const detail = detailQuery.data;
  const detailPaid = detail?.status === "paid";

  return (
    <>
      <FinanceHeader
        title="Merchant remittances"
        description="Payouts gathered from COD collections. Totals are derived server-side from the collections each remittance picked up."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            New remittance
          </Button>
        }
      />

      <FilterBar label="Filter remittances" onReset={() => patch(EMPTY_FILTERS)}>
        <Field label="Status">
          <Select
            value={filters.status}
            onChange={(event) => patch({ status: event.target.value })}
            options={[{ value: "", label: "Any status" }, ...STATUS_OPTIONS]}
          />
        </Field>
        <Field label="Merchant">
          {merchantOptions.length > 0 ? (
            <Select
              value={filters.merchantId}
              onChange={(event) => patch({ merchantId: event.target.value })}
              options={[{ value: "", label: "All merchants" }, ...merchantOptions]}
            />
          ) : (
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Merchant ID"
              value={filters.merchantId}
              onChange={(event) => patch({ merchantId: event.target.value })}
            />
          )}
        </Field>
        <Field label="Period from">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => patch({ dateFrom: event.target.value })}
          />
        </Field>
        <Field label="Period to">
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(event) => patch({ dateTo: event.target.value })}
          />
        </Field>
      </FilterBar>

      {listQuery.isError ? (
        <QueryError
          error={listQuery.error}
          title="Could not load remittances"
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <>
          <div className="panel p-0! sm:p-0!">
            <DataTable
              caption="Merchant remittances"
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(row) => row.id}
              loading={listQuery.isLoading}
              emptyTitle="No remittances yet"
              emptyDescription="Create one for a merchant over a date range and the server will gather their collections."
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
              label="Remittances pagination"
            />
          )}
        </>
      )}

      {/* ── Detail ─────────────────────────────────────────────────────── */}
      <Drawer
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        size="lg"
        title={detail ? detail.remittance_no : "Remittance"}
        description={
          detail
            ? `Merchant #${detail.merchant_id} · ${formatDay(detail.period_start)} – ${formatDay(
                detail.period_end,
              )}`
            : undefined
        }
        footer={
          detail && !detailPaid ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {detail.status === "draft" && (
                <Button type="button" variant="outline" onClick={() => setApproveTarget(detail)}>
                  Approve
                </Button>
              )}
              {detail.status === "approved" && (
                <Button
                  type="button"
                  onClick={() => {
                    setPayTarget(detail);
                    setPaymentReference("");
                    setPaymentMethod("");
                    setPayError(null);
                  }}
                >
                  Pay out
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {detailQuery.isLoading && (
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner size="sm" /> Loading the remittance…
          </p>
        )}

        {detailQuery.isError && (
          <QueryError
            error={detailQuery.error}
            title="Could not load this remittance"
            onRetry={() => void detailQuery.refetch()}
          />
        )}

        {detail && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <RemittanceStatusBadge status={detail.status} />
              {detailPaid && <Badge tone="neutral" variant="outline">Read-only</Badge>}
            </div>

            {detailPaid && (
              <InfoNotice title="This remittance has been paid">
                A paid remittance is immutable. Nothing on it can be changed; raise an adjustment on the
                next period instead.
              </InfoNotice>
            )}

            <section aria-label="Remittance totals">
              <h3 className="eyebrow mb-2">Totals (server-derived)</h3>
              <DetailList>
                <DetailRow label="Collections gathered">{detail.collection_count}</DetailRow>
                <DetailRow label="Total collected">
                  <Money amount={detail.total_collected} currency={detail.currency} inline />
                </DetailRow>
                <DetailRow label="Service fee">
                  <Money amount={detail.service_fee} currency={detail.currency} inline />
                </DetailRow>
                <DetailRow label="Tax">
                  <Money amount={detail.tax_amount} currency={detail.currency} inline />
                </DetailRow>
                <DetailRow label="Adjustment">
                  <Money amount={detail.adjustment} currency={detail.currency} inline />
                </DetailRow>
                <DetailRow label="Net payable" emphasis>
                  <Money amount={detail.net_payable} currency={detail.currency} inline />
                </DetailRow>
              </DetailList>
            </section>

            <section aria-label="Payout record">
              <h3 className="eyebrow mb-2">Payout</h3>
              <DetailList>
                <DetailRow label="Method">{detail.payment_method ?? "—"}</DetailRow>
                <DetailRow label="Reference">{detail.payment_reference ?? "—"}</DetailRow>
                <DetailRow label="Bank account">{detail.bank_account ?? "—"}</DetailRow>
                <DetailRow label="Approved at">{formatDateTime(detail.approved_at)}</DetailRow>
                <DetailRow label="Paid at">{formatDateTime(detail.paid_at)}</DetailRow>
                <DetailRow label="Created">{formatDateTime(detail.created_at)}</DetailRow>
                {detail.notes && <DetailRow label="Notes">{detail.notes}</DetailRow>}
              </DetailList>
            </section>

            <section aria-label="Attached collections">
              <h3 className="eyebrow mb-2">Attached collections</h3>
              <DataTable
                caption={`Collections attached to ${detail.remittance_no}`}
                density="compact"
                mobileCards={false}
                rows={detail.collections ?? []}
                rowKey={(row) => row.id}
                emptyTitle="No collections attached"
                emptyDescription="The server found nothing to gather for this merchant and period."
                columns={[
                  {
                    id: "shipment",
                    header: "Shipment",
                    cell: (row) => <span className="text-sm">#{row.shipment_id}</span>,
                  },
                  {
                    id: "amount",
                    header: "Amount",
                    align: "right",
                    cell: (row) => <Money amount={row.amount} currency={row.currency} />,
                  },
                  {
                    id: "mode",
                    header: "Mode",
                    cell: (row) => <span className="text-sm">{titleCase(row.collection_mode)}</span>,
                  },
                  {
                    id: "status",
                    header: "Status",
                    cell: (row) => <CodStatusBadge status={row.status} />,
                  },
                  {
                    id: "collected",
                    header: "Collected",
                    cell: (row) => (
                      <span className="text-sm text-slate-700">{formatDateTime(row.collected_at)}</span>
                    ),
                  },
                ]}
              />
            </section>
          </div>
        )}
      </Drawer>

      {/* ── Create ─────────────────────────────────────────────────────── */}
      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateError(null);
        }}
        size="lg"
        title="New remittance"
        description="Pick a merchant and a period. The server gathers the matching collections and derives the totals."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const merchantId = optionalNumber(createForm.merchantId);
                if (merchantId === undefined) {
                  setCreateError("Choose a merchant.");
                  return;
                }
                if (createForm.periodStart === "" || createForm.periodEnd === "") {
                  setCreateError("Both period dates are required.");
                  return;
                }
                if (createForm.periodEnd < createForm.periodStart) {
                  setCreateError("The period ends before it starts.");
                  return;
                }
                createMutation.mutate({
                  merchant_id: merchantId,
                  period_start: createForm.periodStart,
                  period_end: createForm.periodEnd,
                  service_fee: optionalNumber(createForm.serviceFee),
                  tax_amount: optionalNumber(createForm.taxAmount),
                  adjustment: optionalNumber(createForm.adjustment),
                  notes: optionalText(createForm.notes),
                });
              }}
              loading={createMutation.isPending}
              loadingLabel="Creating remittance"
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <InfoNotice title="Totals are not entered here">
            <code>total_collected</code> and <code>net_payable</code> are computed by the server from the
            collections it gathers. They appear once the remittance exists.
          </InfoNotice>

          <Field label="Merchant" required error={createError}>
            {merchantOptions.length > 0 ? (
              <Select
                value={createForm.merchantId}
                onChange={(event) => {
                  setCreateForm((form) => ({ ...form, merchantId: event.target.value }));
                  setCreateError(null);
                }}
                placeholder="Choose a merchant"
                options={merchantOptions}
              />
            ) : (
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Merchant ID"
                value={createForm.merchantId}
                onChange={(event) => {
                  setCreateForm((form) => ({ ...form, merchantId: event.target.value }));
                  setCreateError(null);
                }}
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Period start" required>
              <Input
                type="date"
                value={createForm.periodStart}
                onChange={(event) =>
                  setCreateForm((form) => ({ ...form, periodStart: event.target.value }))
                }
              />
            </Field>
            <Field label="Period end" required>
              <Input
                type="date"
                value={createForm.periodEnd}
                onChange={(event) => setCreateForm((form) => ({ ...form, periodEnd: event.target.value }))}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Service fee" showOptional hint="Deducted from the collected total.">
              <Input
                type="number"
                step="0.01"
                min={0}
                inputMode="decimal"
                className="text-right tabular-nums"
                value={createForm.serviceFee}
                onChange={(event) => setCreateForm((form) => ({ ...form, serviceFee: event.target.value }))}
              />
            </Field>
            <Field label="Tax amount" showOptional>
              <Input
                type="number"
                step="0.01"
                min={0}
                inputMode="decimal"
                className="text-right tabular-nums"
                value={createForm.taxAmount}
                onChange={(event) => setCreateForm((form) => ({ ...form, taxAmount: event.target.value }))}
              />
            </Field>
            <Field label="Adjustment" showOptional hint="Positive or negative.">
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                className="text-right tabular-nums"
                value={createForm.adjustment}
                onChange={(event) => setCreateForm((form) => ({ ...form, adjustment: event.target.value }))}
              />
            </Field>
          </div>

          <Field label="Notes" showOptional>
            <Textarea
              rows={3}
              value={createForm.notes}
              onChange={(event) => setCreateForm((form) => ({ ...form, notes: event.target.value }))}
            />
          </Field>
        </div>
      </Modal>

      {/* ── Approve ────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={approveTarget !== null}
        onClose={() => setApproveTarget(null)}
        onConfirm={async () => {
          if (!approveTarget) return;
          try {
            await approveMutation.mutateAsync(approveTarget.id);
          } catch {
            // Surfaced by the mutation's onError toast, including a 403.
          }
        }}
        title="Approve this remittance?"
        description={
          approveTarget
            ? `${approveTarget.remittance_no} covering ${approveTarget.collection_count} collection${
                approveTarget.collection_count === 1 ? "" : "s"
              } will be marked approved and become payable.`
            : undefined
        }
        confirmLabel="Approve"
      >
        <p className="text-sm text-slate-700">
          Approval is restricted to super admins. If your account is a plain admin the server will refuse
          with a 403 and the message is shown as-is.
        </p>
      </ConfirmDialog>

      {/* ── Pay ────────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={payTarget !== null}
        onClose={closePay}
        keepOpenOnConfirm
        size="md"
        tone="danger"
        onConfirm={async () => {
          if (!payTarget) return;
          const reference = paymentReference.trim();
          if (reference === "") {
            setPayError("A payment reference is required before money is released.");
            return;
          }
          try {
            await payMutation.mutateAsync({
              id: payTarget.id,
              body: { payment_reference: reference, payment_method: optionalText(paymentMethod) },
            });
          } catch {
            // Surfaced by the mutation's onError toast and the inline error.
          }
        }}
        title="Release this payout?"
        description={
          payTarget
            ? `${payTarget.remittance_no} will be marked paid and becomes immutable.`
            : undefined
        }
        confirmLabel="Release payout"
      >
        {payTarget && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Net payable being released
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[color:var(--brand-navy)]">
                {formatMoney(payTarget.net_payable, payTarget.currency)}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                To merchant #{payTarget.merchant_id} for {formatDay(payTarget.period_start)} –{" "}
                {formatDay(payTarget.period_end)}.
              </p>
            </div>

            <Field
              label="Payment reference"
              required
              hint="The bank transfer or cheque reference. The backend rejects a payout without one."
              error={payError}
            >
              <Input
                value={paymentReference}
                onChange={(event) => {
                  setPaymentReference(event.target.value);
                  setPayError(null);
                }}
                placeholder="e.g. FT26110300412"
                autoComplete="off"
              />
            </Field>

            <Field label="Payment method" showOptional>
              <Input
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                placeholder="e.g. bank_transfer"
                autoComplete="off"
              />
            </Field>

            <p className="text-sm text-slate-700">
              Paying out is restricted to super admins; a plain admin gets a 403 and the server&rsquo;s
              message is shown here.
            </p>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
