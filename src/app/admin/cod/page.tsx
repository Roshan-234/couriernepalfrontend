"use client";

/**
 * COD collections — every rupee taken at a customer's door.
 *
 * A collection moves pending → collected → deposited → remitted. This screen
 * owns the two middle transitions an office clerk performs: banking the cash
 * (deposit, which needs a bank reference) and signing it off (verify). The
 * summary strip and every figure below it come from the server; nothing here
 * adds two amounts together.
 */

import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Modal,
  Pagination,
  Select,
  Skeleton,
  StatCard,
  type DataTableColumn,
  type SelectOption,
  useToast,
} from "@/components/kit";
import { Money, formatMoney } from "@/components/admin/finance/money";
import {
  CodStatusBadge,
  FilterBar,
  FinanceHeader,
  QueryError,
  formatDateTime,
  optionalText,
  titleCase,
} from "@/components/admin/finance/shared";
import { queryKeys } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/resources/client";
import { cod, type CodFilters } from "@/lib/resources/finance";
import { branches, riders } from "@/lib/resources/operations";
import type { CodCollection } from "@/types/logistics";

const PER_PAGE = 20;

const STATUS_OPTIONS: SelectOption[] = [
  { value: "pending", label: "Pending" },
  { value: "collected", label: "Collected" },
  { value: "deposited", label: "Deposited" },
  { value: "remitted", label: "Remitted" },
  { value: "cancelled", label: "Cancelled" },
];

interface Filters {
  status: string;
  merchantId: string;
  branchId: string;
  riderId: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_FILTERS: Filters = {
  status: "",
  merchantId: "",
  branchId: "",
  riderId: "",
  dateFrom: "",
  dateTo: "",
};

export default function CodCollectionsPage() {
  const toast = useToast();
  const cache = useQueryClient();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [depositTarget, setDepositTarget] = useState<CodCollection | null>(null);
  const [depositReference, setDepositReference] = useState("");
  const [depositError, setDepositError] = useState<string | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<CodCollection | null>(null);

  const patch = (next: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setPage(1);
  };

  const query: CodFilters = useMemo(
    () => ({
      status: optionalText(filters.status),
      merchant_id: filters.merchantId === "" ? undefined : Number(filters.merchantId),
      branch_id: filters.branchId === "" ? undefined : Number(filters.branchId),
      rider_id: filters.riderId === "" ? undefined : Number(filters.riderId),
      date_from: optionalText(filters.dateFrom),
      date_to: optionalText(filters.dateTo),
      page,
      per_page: PER_PAGE,
    }),
    [filters, page],
  );

  const summaryQuery = useQuery({
    queryKey: queryKeys.cod.summary,
    queryFn: () => cod.summary(),
  });

  const listQuery = useQuery({
    queryKey: queryKeys.cod.collections(query),
    queryFn: () => cod.collections(query),
    placeholderData: keepPreviousData,
  });

  const branchesQuery = useQuery({
    queryKey: queryKeys.branches.list({}),
    queryFn: () => branches.list(),
    staleTime: 5 * 60 * 1000,
  });

  const ridersQuery = useQuery({
    queryKey: queryKeys.riders.list({ per_page: 200 }),
    queryFn: () => riders.list({ per_page: 200 }),
    staleTime: 5 * 60 * 1000,
  });

  /** The only merchant directory this console has is the COD summary. */
  const merchantOptions: SelectOption[] = useMemo(
    () =>
      // The summary groups by merchant id only; it carries no display name.
      (summaryQuery.data?.merchants ?? []).map((merchant) => ({
        value: String(merchant.merchant_id),
        label: `Merchant #${merchant.merchant_id}`,
      })),
    [summaryQuery.data],
  );

  const branchOptions: SelectOption[] = useMemo(
    () => (branchesQuery.data ?? []).map((branch) => ({ value: String(branch.id), label: branch.name })),
    [branchesQuery.data],
  );

  const riderOptions: SelectOption[] = useMemo(
    () =>
      (ridersQuery.data?.items ?? []).map((rider) => ({
        value: String(rider.id),
        label: `${rider.name} (${rider.rider_code})`,
      })),
    [ridersQuery.data],
  );

  const refreshCod = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: queryKeys.cod.all }),
      cache.invalidateQueries({ queryKey: queryKeys.cod.summary }),
    ]);
  };

  const depositMutation = useMutation({
    mutationFn: ({ id, reference }: { id: number; reference: string }) => cod.deposit(id, reference),
    onSuccess: async (collection) => {
      toast.success("Deposit recorded", {
        description: `${formatMoney(collection.amount, collection.currency)} banked against ${
          collection.deposit_reference ?? "the given reference"
        }.`,
      });
      closeDeposit();
      await refreshCod();
    },
    onError: (error: unknown) => {
      setDepositError(errorMessage(error));
      toast.error("Deposit failed", { description: errorMessage(error) });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: number) => cod.verify(id),
    onSuccess: async (collection) => {
      toast.success("Collection verified", {
        description: `Collection #${collection.id} is signed off.`,
      });
      await refreshCod();
    },
    onError: (error: unknown) =>
      toast.error("Verification failed", { description: errorMessage(error) }),
  });

  function closeDeposit() {
    setDepositTarget(null);
    setDepositReference("");
    setDepositError(null);
  }

  const summary = summaryQuery.data;
  // The API breaks each status down per merchant, so roll those up to get the
  // organisation-wide position the tiles show.
  const byStatus = useMemo(() => {
    const totals: Record<string, { count: number; amount: number }> = {};
    for (const merchant of summary?.merchants ?? []) {
      for (const [status, bucket] of Object.entries(merchant.by_status ?? {})) {
        const running = totals[status] ?? { count: 0, amount: 0 };
        totals[status] = {
          count: running.count + bucket.count,
          amount: Math.round((running.amount + bucket.amount) * 100) / 100,
        };
      }
    }
    return totals;
  }, [summary]);
  const statusCards = Object.entries(byStatus).filter(([, bucket]) => bucket.count > 0);
  const totalCollected =
    Math.round(Object.values(byStatus).reduce((sum, b) => sum + b.amount, 0) * 100) / 100;

  const columns: DataTableColumn<CodCollection>[] = [
    {
      id: "shipment",
      header: "Shipment",
      primary: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[color:var(--brand-navy)]">#{row.shipment_id}</span>
          <span className="block text-xs text-slate-600">Collection #{row.id}</span>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.shipment_id,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      className: "tabular-nums",
      cell: (row) => <Money amount={row.amount} currency={row.currency} />,
      sortable: true,
      sortValue: (row) => row.amount,
    },
    {
      id: "mode",
      header: "Mode",
      cell: (row) => <span className="text-sm text-slate-700">{titleCase(row.collection_mode)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <CodStatusBadge status={row.status} />,
    },
    {
      id: "collected",
      header: "Collected",
      cell: (row) => <span className="text-sm text-slate-700">{formatDateTime(row.collected_at)}</span>,
      sortable: true,
      sortValue: (row) => row.collected_at,
    },
    {
      id: "deposited",
      header: "Deposited",
      cell: (row) => (
        <div className="text-sm text-slate-700">
          {formatDateTime(row.deposited_at)}
          {row.deposit_reference && (
            <span className="block text-xs text-slate-600">Ref {row.deposit_reference}</span>
          )}
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.deposited_at,
    },
    {
      id: "verified",
      header: "Verified",
      hideOnMobile: true,
      cell: (row) => <span className="text-sm text-slate-700">{formatDateTime(row.verified_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setDepositTarget(row);
              setDepositReference(row.deposit_reference ?? "");
              setDepositError(null);
            }}
            disabled={row.status === "remitted" || row.status === "cancelled"}
          >
            Deposit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setVerifyTarget(row)}
            disabled={Boolean(row.verified_at) || row.status === "cancelled"}
          >
            Verify
          </Button>
        </div>
      ),
    },
  ];

  const data = listQuery.data;

  return (
    <>
      <FinanceHeader
        title="COD collections"
        description="Cash taken at the door, from the rider's handover through banking and sign-off. Totals are the server's; this screen never re-adds them."
      />

      {summaryQuery.isError ? (
        <div className="mb-5">
          <QueryError
            error={summaryQuery.error}
            title="Could not load the COD summary"
            onRetry={() => void summaryQuery.refetch()}
          />
        </div>
      ) : summaryQuery.isLoading ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="panel">
              <Skeleton lines={2} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Outstanding"
            value={formatMoney(summary?.total_outstanding, "NPR")}
            hint="Collected but not yet remitted to merchants"
          />
          <StatCard
            label="Remitted"
            value={formatMoney(summary?.total_remitted, "NPR")}
            hint="Already paid out"
          />
          <StatCard
            label="Total collected"
            value={formatMoney(totalCollected, "NPR")}
            hint="All collections in scope"
          />
          {statusCards.map(([status, bucket]) => (
            <StatCard
              key={status}
              label={titleCase(status)}
              value={formatMoney(bucket.amount, "NPR")}
              hint={`${bucket.count} collection${bucket.count === 1 ? "" : "s"}`}
            />
          ))}
        </div>
      )}

      <FilterBar label="Filter collections" onReset={() => patch(EMPTY_FILTERS)}>
        <Field label="Status">
          <Select
            value={filters.status}
            onChange={(event) => patch({ status: event.target.value })}
            options={[{ value: "", label: "Any status" }, ...STATUS_OPTIONS]}
          />
        </Field>
        <Field label="Merchant">
          <Select
            value={filters.merchantId}
            onChange={(event) => patch({ merchantId: event.target.value })}
            options={[{ value: "", label: "All merchants" }, ...merchantOptions]}
            disabled={summaryQuery.isLoading}
          />
        </Field>
        <Field label="Branch">
          <Select
            value={filters.branchId}
            onChange={(event) => patch({ branchId: event.target.value })}
            options={[{ value: "", label: "All branches" }, ...branchOptions]}
            disabled={branchesQuery.isLoading}
          />
        </Field>
        <Field label="Rider">
          <Select
            value={filters.riderId}
            onChange={(event) => patch({ riderId: event.target.value })}
            options={[{ value: "", label: "All riders" }, ...riderOptions]}
            disabled={ridersQuery.isLoading}
          />
        </Field>
        <Field label="Collected from">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => patch({ dateFrom: event.target.value })}
          />
        </Field>
        <Field label="Collected to">
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
          title="Could not load collections"
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <>
          <div className="panel p-0! sm:p-0!">
            <DataTable
              caption="COD collections"
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(row) => row.id}
              loading={listQuery.isLoading}
              emptyTitle="No collections match these filters"
              emptyDescription="Widen the date range or clear the merchant, branch and rider filters."
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
              label="Collections pagination"
            />
          )}
        </>
      )}

      <Modal
        open={depositTarget !== null}
        onClose={closeDeposit}
        title="Record a bank deposit"
        description={
          depositTarget
            ? `Collection #${depositTarget.id} for shipment #${depositTarget.shipment_id}.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={closeDeposit} disabled={depositMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!depositTarget) return;
                const reference = depositReference.trim();
                if (reference === "") {
                  setDepositError("A deposit reference is required.");
                  return;
                }
                depositMutation.mutate({ id: depositTarget.id, reference });
              }}
              loading={depositMutation.isPending}
              loadingLabel="Recording deposit"
            >
              Record deposit
            </Button>
          </>
        }
      >
        {depositTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Amount banked:{" "}
              <Money amount={depositTarget.amount} currency={depositTarget.currency} inline />
            </p>
            <Field
              label="Deposit reference"
              required
              hint="The bank slip or transfer reference. The backend will not accept a deposit without one."
              error={depositError}
            >
              <Input
                value={depositReference}
                onChange={(event) => {
                  setDepositReference(event.target.value);
                  setDepositError(null);
                }}
                placeholder="e.g. NIC-2026-00481"
                autoComplete="off"
              />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={verifyTarget !== null}
        onClose={() => setVerifyTarget(null)}
        onConfirm={async () => {
          if (!verifyTarget) return;
          try {
            await verifyMutation.mutateAsync(verifyTarget.id);
          } catch {
            // Reported by the mutation's onError toast.
          }
        }}
        title="Verify this collection?"
        description={
          verifyTarget
            ? `Signing off collection #${verifyTarget.id} for ${formatMoney(
                verifyTarget.amount,
                verifyTarget.currency,
              )} confirms the money reached the account. It is recorded against your user.`
            : undefined
        }
        confirmLabel="Verify"
      />
    </>
  );
}
