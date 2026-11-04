"use client";

/**
 * Data subject requests.
 *
 * The queue is sorted by deadline because the deadline is what is owed: an
 * extended request filed first is not more urgent than an ordinary one
 * filed later. The overdue count sits at the top of the screen whatever
 * the filters say, since missing the one-month deadline in Art. 12(3) is
 * itself the infringement — it is not a backlog figure that can be worked
 * off quietly next week.
 *
 * The retention schedule shares this screen because it answers the other
 * half of the same question: how long anything is kept, and on what basis.
 */

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  DataTable,
  Field,
  Pagination,
  Select,
  StatCard,
  Tabs,
  type DataTableColumn,
} from "@/components/kit";
import { ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { FilterBar, QueryError, optionalText } from "@/components/admin/finance/shared";
import {
  KIND_LABELS,
  RequestDrawer,
  STATUS_TONES,
  deadlineText,
  label,
} from "@/components/admin/privacy/RequestDrawer";
import { RetentionPanel } from "@/components/admin/privacy/RetentionPanel";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";
import {
  DATA_REQUEST_KINDS,
  DATA_REQUEST_STATUSES,
  privacy,
  type DataRequestFilters,
  type DataRequestRow,
} from "@/lib/resources/privacy";

const PER_PAGE = 20;

export default function PrivacyRequestsPage() {
  const cache = useQueryClient();
  const { user } = useAuth();
  const canErase = Boolean(user?.roles.includes("super_admin"));

  const [tab, setTab] = useState("queue");
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [overdue, setOverdue] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);

  const filters: DataRequestFilters = useMemo(
    () => ({
      kind: optionalText(kind),
      status: optionalText(status),
      overdue: optionalText(overdue),
      page,
      per_page: PER_PAGE,
    }),
    [kind, status, overdue, page],
  );

  const queue = useQuery({
    queryKey: queryKeys.privacy.queue(filters),
    queryFn: () => privacy.queue(filters),
    placeholderData: keepPreviousData,
  });

  const overdueQuery = useQuery({
    queryKey: queryKeys.privacy.overdue,
    queryFn: () => privacy.overdue(),
  });

  const rows = useMemo(() => queue.data?.items ?? [], [queue.data]);
  const openRequest = rows.find((row) => row.id === openId) ?? null;

  const refresh = () =>
    Promise.all([
      cache.invalidateQueries({ queryKey: queryKeys.privacy.all }),
      cache.invalidateQueries({ queryKey: queryKeys.privacy.overdue }),
    ]);

  const columns: DataTableColumn<DataRequestRow>[] = [
    {
      id: "reference",
      header: "Reference",
      primary: true,
      cell: (row) => (
        <div>
          <p className="font-mono text-sm font-semibold text-[color:var(--brand-navy)]">
            {row.reference}
          </p>
          <p className="text-xs text-slate-600">{row.email}</p>
        </div>
      ),
    },
    {
      id: "kind",
      header: "Right",
      cell: (row) => (
        <span className="text-sm text-slate-800">{KIND_LABELS[row.kind] ?? label(row.kind)}</span>
      ),
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
      id: "deadline",
      header: "Deadline",
      cell: (row) => (
        <span
          className={
            row.is_overdue ? "text-sm font-semibold text-red-800" : "text-sm text-slate-800"
          }
        >
          {deadlineText(row)}
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.deadline,
    },
    {
      id: "identity",
      header: "Identity",
      cell: (row) =>
        row.identity_verified ? (
          <Badge tone="green" variant="soft">
            Verified
          </Badge>
        ) : (
          <Badge tone="amber" variant="outline">
            Not verified
          </Badge>
        ),
    },
    {
      id: "filed",
      header: "Filed",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-slate-700">
          {row.created_at ? row.created_at.slice(0, 10) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => setOpenId(row.id)}>
          Open
        </Button>
      ),
    },
  ];

  const counts = overdueQuery.data;
  const isOverdue = (counts?.overdue ?? 0) > 0;

  const queuePane = (
    <div className="grid gap-5">
      <FilterBar
        label="Filter requests"
        onReset={() => {
          setKind("");
          setStatus("");
          setOverdue("");
          setPage(1);
        }}
      >
        <Field label="Right claimed">
          <Select
            value={kind}
            onChange={(event) => {
              setKind(event.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "Any right" },
              ...DATA_REQUEST_KINDS.map((value) => ({
                value,
                label: KIND_LABELS[value] ?? label(value),
              })),
            ]}
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
              ...DATA_REQUEST_STATUSES.map((value) => ({ value, label: label(value) })),
            ]}
          />
        </Field>
        <Field label="Overdue">
          <Select
            value={overdue}
            onChange={(event) => {
              setOverdue(event.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "Overdue and not" },
              { value: "true", label: "Overdue only" },
              { value: "false", label: "Still within the deadline" },
            ]}
          />
        </Field>
      </FilterBar>

      {queue.isError ? (
        <QueryError
          error={queue.error}
          title="Could not load the request queue"
          onRetry={() => void queue.refetch()}
        />
      ) : (
        <>
          <div className="panel p-0! sm:p-0!">
            <DataTable
              caption="Data subject requests, nearest deadline first"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={queue.isLoading}
              emptyTitle="No requests match"
              emptyDescription="Nobody has asked yet, or the filters exclude everything. An empty queue is the state to want."
            />
          </div>
          {queue.data && (
            <Pagination
              page={queue.data.page}
              pageCount={queue.data.pages}
              pageSize={queue.data.per_page}
              totalItems={queue.data.total}
              onPageChange={setPage}
              label="Request pages"
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <ScreenHeader
        eyebrow="Privacy"
        title="Data subject requests"
        description="Access, rectification, erasure, restriction, portability and objection — each with one month to answer, and each needing an identity check before any data moves."
      />

      {/* The deadline figure, where it cannot be scrolled past. */}
      <section
        role={isOverdue ? "alert" : undefined}
        aria-labelledby="overdue-heading"
        className={`panel mb-5 ${
          isOverdue ? "border-red-300! bg-red-50!" : "border-green-200! bg-green-50/60!"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="overdue-heading"
              className={`eyebrow ${isOverdue ? "text-red-900" : "text-green-900"}`}
            >
              Past the statutory deadline
            </h2>
            <p
              className={`mt-1 text-4xl font-bold tabular-nums ${
                isOverdue ? "text-red-800" : "text-green-800"
              }`}
            >
              {overdueQuery.isLoading ? "—" : (counts?.overdue ?? 0)}
            </p>
            <p className={`mt-2 max-w-2xl text-sm ${isOverdue ? "text-red-900" : "text-green-900"}`}>
              {isOverdue
                ? "Art. 12(3) gives one month. Being late is the infringement in itself — it is not made good by answering well afterwards. These need today, not the backlog."
                : "Nothing is late. Art. 12(3) gives one month from the day a request arrives, extendable by two only where the request is genuinely complex."}
            </p>
          </div>
          <div className="grid gap-2 text-right">
            <div>
              <p className="eyebrow text-slate-600">Due within 7 days</p>
              <p className="text-2xl font-bold tabular-nums text-[color:var(--brand-navy)]">
                {overdueQuery.isLoading ? "—" : (counts?.due_within_7_days ?? 0)}
              </p>
            </div>
            {counts?.oldest_reference && (
              <p className="text-xs text-slate-700">
                Oldest overdue:{" "}
                <span className="font-mono font-semibold">{counts.oldest_reference}</span>
              </p>
            )}
            {isOverdue && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setOverdue("true");
                  setStatus("");
                  setKind("");
                  setPage(1);
                  setTab("queue");
                }}
              >
                Show only overdue
              </Button>
            )}
          </div>
        </div>
      </section>

      {overdueQuery.isError && (
        <div className="mb-5">
          <QueryError
            error={overdueQuery.error}
            title="Could not load the overdue count"
            onRetry={() => void overdueQuery.refetch()}
          />
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Requests matching"
          value={queue.data?.total ?? 0}
          hint="Across every page of the current filters"
          loading={queue.isLoading}
        />
        <StatCard
          label="Awaiting an identity check"
          value={rows.filter((row) => !row.identity_verified).length}
          hint="Nothing can be exported or erased until this is done"
          loading={queue.isLoading}
        />
        <StatCard
          label="Still open"
          value={rows.filter((row) => row.status !== "completed" && row.status !== "refused").length}
          hint="On this page of the queue"
          loading={queue.isLoading}
        />
      </div>

      <Tabs
        label="Privacy sections"
        value={tab}
        onValueChange={setTab}
        items={[
          { id: "queue", label: "Request queue", content: queuePane },
          { id: "retention", label: "Retention schedule", content: <RetentionPanel /> },
        ]}
      />

      <RequestDrawer
        request={openRequest}
        onClose={() => setOpenId(null)}
        canErase={canErase}
        onChanged={refresh}
      />
    </>
  );
}
