"use client";

/**
 * Packing lists.
 *
 * The office has been typing these into Excel by hand; this is the list they
 * come from. Each row is one exporter's declaration of what is in their
 * cartons, and the Excel file is the point of the screen — so the download is
 * on the row, not buried a page deeper.
 *
 * Search and the status filter come from different endpoints. `/search` is
 * unpaginated, capped at 50 and takes no status, so a search is filtered down
 * in the browser and the table says so rather than pretending to page.
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
import { DocumentStatusBadge, documentLabel, saveFile } from "@/components/admin/documents/shared";
import { PACKING_LIST_STATUSES, packingLists } from "@/lib/resources/documents";
import type { PackingList } from "@/lib/resources/documents";
import { errorMessage } from "@/lib/resources/client";
import { queryKeys } from "@/lib/queryKeys";

const PER_PAGE = 20;

export default function Page() {
  const toast = useToast();
  const cache = useQueryClient();

  const [status, setStatus] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<PackingList | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  const searching = term.trim() !== "";

  const filters = useMemo(
    () => ({ status, page, per_page: PER_PAGE }),
    [status, page],
  );

  const listQuery = useQuery({
    queryKey: queryKeys.packingLists.list(filters),
    queryFn: () => packingLists.list(filters),
    placeholderData: keepPreviousData,
    enabled: !searching,
  });

  const searchQuery = useQuery({
    queryKey: queryKeys.packingLists.list({ q: term.trim() }),
    queryFn: () => packingLists.search(term.trim()),
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
    mutationFn: (id: number) => packingLists.remove(id),
    onSuccess: async () => {
      toast.success("Packing list deleted");
      await cache.invalidateQueries({ queryKey: queryKeys.packingLists.all });
    },
    onError: (cause: unknown) =>
      toast.error("Could not delete the packing list", { description: errorMessage(cause) }),
  });

  async function download(row: PackingList) {
    setDownloading(row.id);
    try {
      saveFile(await packingLists.file(row.id), row.file_name ?? `${row.pl_number}.xlsx`);
    } catch (cause) {
      toast.error("Could not download the Excel file", {
        description: errorMessage(cause),
        duration: null,
      });
    } finally {
      setDownloading(null);
    }
  }

  const columns: DataTableColumn<PackingList>[] = [
    {
      id: "number",
      header: "Number",
      primary: true,
      cell: (row) => (
        <div className="min-w-0">
          <Link
            href={`/admin/packing-lists/${row.id}`}
            className="font-semibold text-[color:var(--brand-navy)] underline underline-offset-4"
          >
            {row.pl_number}
          </Link>
          <p className="text-xs text-slate-600">{when(row.created_at)}</p>
        </div>
      ),
    },
    {
      id: "shipper",
      header: "Shipper",
      cell: (row) => <span className="text-sm text-slate-800">{row.sender_name || "—"}</span>,
    },
    {
      id: "consignee",
      header: "Consignee",
      cell: (row) => (
        <div className="text-sm text-slate-800">
          {row.receiver_name || "—"}
          {row.receiver_country && (
            <span className="block text-xs text-slate-600">{row.receiver_country}</span>
          )}
        </div>
      ),
    },
    {
      id: "boxes",
      header: "Cartons",
      align: "right",
      hideOnMobile: true,
      cell: (row) => <span className="text-sm tabular-nums text-slate-800">{row.total_packages}</span>,
    },
    {
      id: "quantity",
      header: "Quantity",
      align: "right",
      cell: (row) => (
        <span className="text-sm tabular-nums text-slate-800">
          {row.total_items} {row.quantity_unit || "PCS"}
        </span>
      ),
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
            href={`/admin/packing-lists/${row.id}`}
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
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setRemoving(row)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const total = searching ? rows.length : (listQuery.data?.total ?? 0);
  const finalized = rows.filter((row) => row.status === "finalized").length;
  const ungenerated = rows.filter((row) => !row.file_name).length;

  return (
    <>
      <ScreenHeader
        eyebrow="Documents"
        title="Packing lists"
        description="The exporter's declaration of what is in each carton. The generated file carries their letterhead, not ours."
        actions={
          <Link href="/admin/packing-lists/new" className={buttonClassNames()}>
            New packing list
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={searching ? "Search matches" : "Packing lists"}
          value={total}
          hint={searching ? "Most recent 50" : "Matching the current filters"}
          loading={loading}
        />
        <StatCard label="Finalized on this page" value={finalized} loading={loading} />
        <StatCard
          label="No Excel yet"
          value={ungenerated}
          hint="Generate before the office needs the file"
          loading={loading}
        />
      </div>

      <div className="panel">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Search" className="lg:col-span-2">
            <SearchInput
              label="Search packing lists"
              placeholder="Shipper, consignee or PL number"
              defaultValue={term}
              loading={searching && searchQuery.isFetching}
              onSearch={(value) => {
                setTerm(value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="Status">
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any status" },
                ...PACKING_LIST_STATUSES.map((value) => ({
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
            title="Could not load packing lists"
            onRetry={() => (searching ? searchQuery.refetch() : listQuery.refetch())}
          />
        ) : (
          <>
            <DataTable
              caption="Packing lists with shipper, consignee, carton count and status"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={loading}
              emptyTitle="No packing lists match"
              emptyDescription="Clear a filter, or start one from scratch."
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
                    label="Packing list pages"
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
        title={`Delete ${removing?.pl_number ?? "this packing list"}?`}
        description="The record and its generated Excel file go for good. A finalized list can only be deleted by an administrator."
        confirmLabel="Delete"
        tone="danger"
      />
    </>
  );
}
