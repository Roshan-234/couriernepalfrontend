"use client";

/**
 * Freight bills.
 *
 * `/api/invoices` on the wire, a freight bill on paper: it charges for
 * carriage rather than for goods. The list shows both figures that matter —
 * what was charged in the billing currency and what the customer settles in
 * rupees — because the rate is agreed per bill and a reprint has to match.
 *
 * Every status can be filtered on here, including the two only an
 * administrator can set. Reading a list is not writing to one; the gate on
 * setting `issued` and `paid` lives on the bill's own form.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  ConfirmDialog,
  DataTable,
  Field,
  Pagination,
  SearchInput,
  Select,
  StatCard,
  buttonClassNames,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { ScreenHeader, when } from "@/components/admin/integrations/ScreenHeader";
import { QueryError } from "@/components/admin/finance/shared";
import { Money } from "@/components/admin/finance/money";
import { DocumentStatusBadge, documentLabel, saveFile } from "@/components/admin/documents/shared";
import { FREIGHT_BILL_STATUSES, freightBills } from "@/lib/resources/documents";
import type { FreightBill } from "@/lib/resources/documents";
import { errorMessage } from "@/lib/resources/client";
import { queryKeys } from "@/lib/queryKeys";

const PER_PAGE = 20;

export default function Page() {
  const toast = useToast();
  const cache = useQueryClient();

  const [status, setStatus] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<FreightBill | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  const searching = term.trim() !== "";

  const filters = useMemo(() => ({ status, page, per_page: PER_PAGE }), [status, page]);

  const listQuery = useQuery({
    queryKey: queryKeys.freightBills.list(filters),
    queryFn: () => freightBills.list(filters),
    placeholderData: keepPreviousData,
    enabled: !searching,
  });

  const searchQuery = useQuery({
    queryKey: queryKeys.freightBills.list({ q: term.trim() }),
    queryFn: () => freightBills.search(term.trim()),
    enabled: searching,
  });

  const rows = useMemo(() => {
    if (!searching) return listQuery.data?.items ?? [];
    const found = searchQuery.data ?? [];
    return status === "" ? found : found.filter((row) => row.status === status);
  }, [searching, listQuery.data, searchQuery.data, status]);

  const loading = searching ? searchQuery.isLoading : listQuery.isLoading;
  const error = searching ? searchQuery.error : listQuery.error;
  const failed = searching ? searchQuery.isError : listQuery.isError;

  const remove = useMutation({
    mutationFn: (id: number) => freightBills.remove(id),
    onSuccess: async () => {
      toast.success("Freight bill deleted");
      await cache.invalidateQueries({ queryKey: queryKeys.freightBills.all });
    },
    onError: (cause: unknown) =>
      toast.error("Could not delete the freight bill", { description: errorMessage(cause) }),
  });

  async function download(row: FreightBill) {
    setDownloading(row.id);
    try {
      saveFile(await freightBills.file(row.id), row.file_name ?? `${row.invoice_number}.xlsx`);
    } catch (cause) {
      toast.error("Could not download the Excel file", {
        description: errorMessage(cause),
        duration: null,
      });
    } finally {
      setDownloading(null);
    }
  }

  const columns: DataTableColumn<FreightBill>[] = [
    {
      id: "number",
      header: "Bill",
      primary: true,
      cell: (row) => (
        <div className="min-w-0">
          <Link
            href={`/admin/freight-bills/${row.id}`}
            className="font-semibold text-[color:var(--brand-navy)] underline underline-offset-4"
          >
            {row.invoice_number}
          </Link>
          <p className="text-xs text-slate-600">{when(row.created_at)}</p>
        </div>
      ),
    },
    {
      id: "buyer",
      header: "Billed to",
      cell: (row) => (
        <div className="text-sm text-slate-800">
          {row.buyer_name || "—"}
          {row.awb_no && <span className="block text-xs text-slate-600">AWB {row.awb_no}</span>}
        </div>
      ),
    },
    {
      id: "account",
      header: "Account",
      hideOnMobile: true,
      cell: (row) => <span className="text-sm text-slate-800">{row.account_name || "—"}</span>,
    },
    {
      id: "charges",
      header: "Charges",
      align: "right",
      cell: (row) => <Money amount={row.subtotal} currency={row.currency} />,
    },
    {
      id: "rate",
      header: "Rate",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm tabular-nums text-slate-800">{row.fx_rate ?? "—"}</span>
      ),
    },
    {
      id: "npr",
      header: "Settles",
      align: "right",
      cell: (row) => <Money amount={row.total_npr} currency="NPR" />,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <DocumentStatusBadge status={row.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Link
            href={`/admin/freight-bills/${row.id}`}
            className={buttonClassNames({ variant: "outline", size: "sm" })}
          >
            Open
          </Link>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={!row.file_name}
            loading={downloading === row.id}
            loadingLabel="Downloading"
            onClick={() => download(row)}
          >
            Download
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setRemoving(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const total = searching ? rows.length : (listQuery.data?.total ?? 0);
  const drafts = rows.filter((row) => row.status === "draft").length;
  const unrated = rows.filter((row) => !row.fx_rate).length;

  return (
    <>
      <ScreenHeader
        eyebrow="Documents"
        title="Freight bills"
        description="Charges for carriage, totalled in the billing currency and settled in rupees at the rate agreed on the day."
        actions={
          <Link href="/admin/freight-bills/new" className={buttonClassNames()}>
            New freight bill
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={searching ? "Search matches" : "Freight bills"}
          value={total}
          hint={searching ? "Most recent 50" : "Matching the current filters"}
          loading={loading}
        />
        <StatCard label="Still draft" value={drafts} loading={loading} />
        <StatCard
          label="No exchange rate"
          value={unrated}
          hint="Cannot be settled in rupees yet"
          loading={loading}
        />
      </div>

      <div className="panel">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Search" className="lg:col-span-2">
            <SearchInput
              label="Search freight bills"
              placeholder="Customer, biller or bill number"
              defaultValue={term}
              loading={searching && searchQuery.isFetching}
              onSearch={(value) => {
                setTerm(value);
                setPage(1);
              }}
            />
          </Field>
          {/*
            Every status is filterable, including the two only an
            administrator can set: reading a list is not writing to one, and a
            clerk still has to be able to find the bills that were issued.
          */}
          <Field label="Status">
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any status" },
                ...FREIGHT_BILL_STATUSES.map((value) => ({
                  value,
                  label: documentLabel(value),
                })),
              ]}
            />
          </Field>
        </div>

        {failed ? (
          <QueryError
            error={error}
            title="Could not load freight bills"
            onRetry={() => (searching ? searchQuery.refetch() : listQuery.refetch())}
          />
        ) : (
          <>
            <DataTable
              caption="Freight bills with customer, charges, exchange rate and rupee total"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={loading}
              emptyTitle="No freight bills match"
              emptyDescription="Clear a filter, or raise one from scratch."
            />
            {searching ? (
              <p className="mt-3 text-xs text-slate-600">
                Search returns the 50 most recent matches and is not paged. Clear it to filter
                and page the full list.
              </p>
            ) : (
              (listQuery.data?.pages ?? 1) > 1 && (
                <div className="mt-4">
                  <Pagination
                    page={listQuery.data?.page ?? 1}
                    pageCount={listQuery.data?.pages ?? 1}
                    totalItems={listQuery.data?.total}
                    pageSize={listQuery.data?.per_page}
                    onPageChange={setPage}
                    label="Freight bill pages"
                  />
                </div>
              )
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (removing) await remove.mutateAsync(removing.id);
          setRemoving(null);
        }}
        title={`Delete ${removing?.invoice_number ?? "this freight bill"}?`}
        description="The record and its generated Excel file go for good. Only a draft can be deleted by a non-administrator."
        confirmLabel="Delete"
        tone="danger"
      />
    </>
  );
}
