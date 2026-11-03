"use client";

/**
 * The admin shipment worklist.
 *
 * Filters live in the URL (see `useUrlFilters`) and are sent to
 * `/shipments/page` as query parameters. That endpoint currently narrows on
 * `search` only, so the same predicates are also evaluated over the rows it
 * returns — otherwise picking "COD" would silently change nothing. When the
 * browser has to drop rows the panel says so, rather than letting the page
 * count disagree with the table for no visible reason.
 */

import Link from "next/link";
import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FaBoxOpen } from "react-icons/fa";
import {
  Badge,
  DataTable,
  Field,
  Input,
  Pagination,
  STATUS_GROUPS,
  STATUS_LABELS,
  SearchInput,
  Select,
  StatusBadge,
  type DataTableColumn,
} from "@/components/kit";
import { errorMessage } from "@/lib/resources/client";
import { branches, geo, riders, shipments } from "@/lib/resources/operations";
import { queryKeys } from "@/lib/queryKeys";
import type { PaymentStatus, Shipment, StatusGroup } from "@/types/logistics";
import { dateTime, money, text } from "./format";
import { ALL_STATUSES } from "./statusTransitions";
import { FilterPanel, LoadError, PageHeader } from "./Layout";
import { useUrlFilters } from "./useUrlFilters";

const PER_PAGE = 20;

const FILTER_DEFAULTS = {
  q: "",
  status: "",
  cod: "",
  payment: "",
  origin: "",
  destination: "",
  branch: "",
  rider: "",
  from: "",
  to: "",
  page: "1",
} as const;

type FilterKey = keyof typeof FILTER_DEFAULTS;

const NOT_A_FILTER: readonly FilterKey[] = ["page"];

/** Group order for the status picker, matching the lifecycle. */
const GROUP_ORDER: { id: StatusGroup; label: string }[] = [
  { id: "booking", label: "Booking" },
  { id: "collection", label: "Collection" },
  { id: "line_haul", label: "Line haul" },
  { id: "last_mile", label: "Last mile" },
  { id: "return", label: "Return to sender" },
  { id: "exception", label: "Exceptions" },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Part paid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

/** Start of the day a `YYYY-MM-DD` input names, in local time. */

export function ShipmentsWorklist() {
  const { values, apply, clear, activeCount } = useUrlFilters<FilterKey>(
    FILTER_DEFAULTS,
    NOT_A_FILTER,
  );

  const page = Math.max(1, Number(values.page) || 1);

  // Every one of these is applied server-side by `/shipments/page`, so the
  // page totals and the summary tiles describe the same filtered set.
  const apiQuery = useMemo(
    () => ({
      all: 1 as const,
      page,
      per_page: PER_PAGE,
      search: values.q || undefined,
      status: values.status || undefined,
      is_cod: values.cod === "yes" ? "1" : values.cod === "no" ? "0" : undefined,
      payment_status: values.payment || undefined,
      origin_district: values.origin || undefined,
      destination_district: values.destination || undefined,
      branch_id: values.branch || undefined,
      rider_id: values.rider || undefined,
      date_from: values.from || undefined,
      date_to: values.to || undefined,
    }),
    [page, values],
  );

  const list = useQuery({
    queryKey: queryKeys.shipments.list(apiQuery),
    queryFn: () => shipments.page(apiQuery),
    placeholderData: keepPreviousData,
  });

  const districtList = useQuery({
    queryKey: queryKeys.geo.districts(),
    queryFn: () => geo.districts(),
    staleTime: 60 * 60 * 1000,
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

  const riderNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const rider of riderList.data?.items ?? []) map.set(rider.id, rider.name);
    return map;
  }, [riderList.data]);

  const rows = list.data?.items ?? [];

  const setFilter = (key: FilterKey, value: string) => apply({ [key]: value, page: "1" } as Partial<Record<FilterKey, string>>);

  const columns: DataTableColumn<Shipment>[] = [
    {
      id: "tracking_no",
      header: "Tracking",
      primary: true,
      sortable: true,
      sortValue: (row) => row.tracking_no,
      cell: (row) => (
        <Link
          href={`/admin/shipments/${row.id}`}
          className="font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-700"
        >
          {row.tracking_no}
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortValue: (row) => row.status,
      cell: (row) => (
        <StatusBadge
          status={row.status}
          label={row.status_label}
          group={row.status_group}
          size="sm"
        />
      ),
    },
    {
      id: "route",
      header: "Route",
      sortable: true,
      sortValue: (row) => row.destination_district ?? row.destination ?? "",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-800">
            {text(row.origin_district ?? row.origin)} &rarr;{" "}
            {text(row.destination_district ?? row.destination)}
          </p>
          <p className="truncate text-xs text-slate-600">{text(row.receiver_name)}</p>
        </div>
      ),
    },
    {
      id: "cod",
      header: "COD",
      align: "right",
      sortable: true,
      sortValue: (row) => (row.is_cod ? row.cod_amount : -1),
      cell: (row) =>
        row.is_cod ? (
          <span className="tabular-nums font-semibold text-slate-800">
            {money(row.cod_amount, row.cod_currency)}
          </span>
        ) : (
          <span className="text-slate-600">Prepaid</span>
        ),
    },
    {
      id: "payment",
      header: "Payment",
      hideOnMobile: true,
      sortable: true,
      sortValue: (row) => row.payment_status,
      cell: (row) => (
        <Badge
          size="sm"
          tone={
            row.payment_status === "paid"
              ? "green"
              : row.payment_status === "unpaid"
                ? "red"
                : "amber"
          }
        >
          {row.payment_status === "partial" ? "Part paid" : row.payment_status}
        </Badge>
      ),
    },
    {
      id: "rider",
      header: "Rider",
      sortable: true,
      sortValue: (row) => row.rider?.name ?? riderNames.get(row.rider_id ?? -1) ?? "",
      cell: (row) =>
        row.rider?.name ?? riderNames.get(row.rider_id ?? -1) ?? (
          <span className="text-slate-600">Unassigned</span>
        ),
    },
    {
      id: "created_at",
      header: "Booked",
      sortable: true,
      sortValue: (row) => new Date(row.created_at),
      cell: (row) => <span className="text-slate-700">{dateTime(row.created_at)}</span>,
    },
    {
      id: "open",
      header: "Open",
      srOnlyHeader: true,
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <Link
          href={`/admin/shipments/${row.id}`}
          className="text-sm font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-700"
        >
          Open<span className="sr-only"> shipment {row.tracking_no}</span>
        </Link>
      ),
    },
  ];

  if (list.isError) {
    return (
      <>
        <PageHeader title="Shipments" />
        <LoadError message={errorMessage(list.error)} onRetry={() => void list.refetch()} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Shipments"
        description="Every shipment in the network. Filter the worklist, then open one to move it through its next step."
      />

      <FilterPanel
        label="Shipment filters"
        activeCount={activeCount}
        onClear={clear}
        note="Filters are shared through the address bar, so this view survives a refresh."
        lead={
          <SearchInput
            label="Search shipments"
            placeholder="Tracking number, origin or destination"
            defaultValue={values.q}
            loading={list.isFetching}
            onSearch={(next) => apply({ q: next, page: "1" })}
          />
        }
      >
        <Field label="Status">
          <Select
            value={values.status}
            onChange={(event) => setFilter("status", event.target.value)}
          >
            <option value="">All statuses</option>
            {GROUP_ORDER.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {ALL_STATUSES.filter((status) => STATUS_GROUPS[status] === group.id).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        <Field label="Cash on delivery">
          <Select
            value={values.cod}
            onChange={(event) => setFilter("cod", event.target.value)}
            options={[
              { value: "", label: "COD and prepaid" },
              { value: "yes", label: "COD only" },
              { value: "no", label: "Prepaid only" },
            ]}
          />
        </Field>

        <Field label="Payment status">
          <Select
            value={values.payment}
            onChange={(event) => setFilter("payment", event.target.value)}
          >
            <option value="">Any payment status</option>
            {PAYMENT_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Branch">
          <Select
            value={values.branch}
            onChange={(event) => setFilter("branch", event.target.value)}
          >
            <option value="">Any branch</option>
            {(branchList.data ?? []).map((branch) => (
              <option key={branch.id} value={String(branch.id)}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Origin district">
          <Select
            value={values.origin}
            onChange={(event) => setFilter("origin", event.target.value)}
          >
            <option value="">Any origin</option>
            {(districtList.data ?? []).map((district) => (
              <option key={district.slug} value={district.name}>
                {district.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Destination district">
          <Select
            value={values.destination}
            onChange={(event) => setFilter("destination", event.target.value)}
          >
            <option value="">Any destination</option>
            {(districtList.data ?? []).map((district) => (
              <option key={district.slug} value={district.name}>
                {district.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Rider">
          <Select
            value={values.rider}
            onChange={(event) => setFilter("rider", event.target.value)}
          >
            <option value="">Any rider</option>
            {(riderList.data?.items ?? []).map((rider) => (
              <option key={rider.id} value={String(rider.id)}>
                {rider.name} ({rider.rider_code})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Booked from">
          <Input
            type="date"
            value={values.from}
            max={values.to || undefined}
            onChange={(event) => setFilter("from", event.target.value)}
          />
        </Field>

        <Field label="Booked to">
          <Input
            type="date"
            value={values.to}
            min={values.from || undefined}
            onChange={(event) => setFilter("to", event.target.value)}
          />
        </Field>
      </FilterPanel>

      <div className="panel p-0! overflow-hidden">
        <DataTable
          caption="Shipments matching the current filters"
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          loading={list.isLoading}
          skeletonRows={PER_PAGE > 8 ? 8 : PER_PAGE}
          emptyTitle={activeCount > 0 ? "No shipments match these filters" : "No shipments yet"}
          emptyDescription={
            activeCount > 0
              ? "Widen the filters, or clear them to see the whole network."
              : "Shipments appear here as soon as they are booked."
          }
          emptyIcon={<FaBoxOpen aria-hidden="true" />}
          defaultSort={{ columnId: "created_at", direction: "desc" }}
        />
      </div>

      <Pagination
        className="mt-6"
        page={list.data?.page ?? page}
        pageCount={list.data?.pages ?? 1}
        totalItems={list.data?.total ?? 0}
        pageSize={list.data?.per_page ?? PER_PAGE}
        onPageChange={(next) => apply({ page: String(next) })}
        label="Shipment pages"
      />

      <p className="sr-only" role="status">
        {list.isFetching ? "Loading shipments" : `${rows.length} shipments shown`}
      </p>
    </>
  );
}

export default ShipmentsWorklist;
