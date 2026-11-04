"use client";

/**
 * Site notices — the bars, dialogs and toasts a visitor sees.
 *
 * These are for things people need to know rather than things being sold:
 * a festival closure, a border disruption, a changed cut-off. Activating
 * one puts it in front of every visitor matching its paths, so that action
 * is confirmed and the live state is marked in red. Active and live are
 * kept apart in the table: a notice can be active and still show nothing,
 * because its date window has not opened.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Field,
  Pagination,
  Select,
  StatCard,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { Notice, ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { NoticeEditor } from "@/components/admin/marketing/NoticeEditor";
import { LiveBadge, NepaliBadge, on } from "@/components/admin/marketing/shared";
import {
  NOTICE_TONES,
  adminNotices,
  nepaliState,
  type AdminNoticeRow,
  type NoticeWrite,
} from "@/lib/resources/advertising";
import type { NoticeTone } from "@/lib/resources/ads";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const TONE_TONES: Record<NoticeTone, "blue" | "teal" | "amber" | "red"> = {
  info: "blue",
  promotion: "teal",
  warning: "amber",
  disruption: "red",
};

export default function Page() {
  const cache = useQueryClient();
  const { success, error: errorToast } = useToast();

  const [tone, setTone] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<AdminNoticeRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState<AdminNoticeRow | null>(null);
  const [deleting, setDeleting] = useState<AdminNoticeRow | null>(null);

  const filters = useMemo(
    () => ({ tone, active, page, per_page: 20 }),
    [tone, active, page],
  );

  const list = useQuery({
    queryKey: queryKeys.adsAdmin.notices(filters),
    queryFn: () => adminNotices.list(filters),
  });

  async function refresh() {
    await cache.invalidateQueries({ queryKey: queryKeys.adsAdmin.all });
  }

  const save = useMutation({
    mutationFn: (body: NoticeWrite) =>
      editing ? adminNotices.update(editing.id, body) : adminNotices.create(body),
    onSuccess: async () => {
      await refresh();
      success(editing ? "Notice saved." : "Notice created, inactive.");
      setEditing(null);
      setCreating(false);
    },
    onError: (err) => errorToast("Could not save the notice.", { description: errorMessage(err) }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, on: turnOn }: { id: number; on: boolean }) =>
      turnOn ? adminNotices.activate(id) : adminNotices.deactivate(id),
    onSuccess: async (row) => {
      await refresh();
      if (!row.is_active) success(`${row.code} is off the site.`);
      else if (row.is_live) {
        success(`${row.code} is on the live site.`, {
          description: "Visitors on the pages it matches see it now.",
        });
      } else {
        success(`${row.code} is active but not showing yet.`, {
          description: `It appears when its window opens on ${on(row.starts_at)}.`,
        });
      }
      setPublishing(null);
    },
    onError: (err) => errorToast("The API refused that change.", { description: errorMessage(err) }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminNotices.remove(id),
    onSuccess: async () => {
      await refresh();
      success("Notice deleted.");
      setDeleting(null);
    },
    onError: (err) =>
      errorToast("Could not delete the notice.", { description: errorMessage(err) }),
  });

  const rows = list.data?.items ?? [];
  const liveCount = rows.filter((row) => row.is_live).length;
  const activeCount = rows.filter((row) => row.is_active).length;

  const columns: DataTableColumn<AdminNoticeRow>[] = [
    {
      id: "notice",
      header: "Notice",
      primary: true,
      cell: (row) => (
        <div>
          <p className="font-semibold text-[color:var(--brand-navy)]">{row.title}</p>
          <p>
            <code className="text-xs text-slate-600">{row.code}</code>
          </p>
          {row.body && <p className="mt-1 max-w-xl text-xs text-slate-600">{row.body}</p>}
        </div>
      ),
    },
    {
      id: "presentation",
      header: "Shown as",
      cell: (row) => (
        <div className="space-y-1">
          <Badge tone={TONE_TONES[row.tone]} variant="soft">
            {row.tone}
          </Badge>
          <p className="text-xs text-slate-600">{row.style}</p>
          {!row.is_dismissible && (
            <p className="text-xs font-semibold text-amber-800">Cannot be dismissed</p>
          )}
        </div>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: (row) => (
        <div className="space-y-1">
          <Badge tone={row.is_active ? "teal" : "neutral"} variant="soft">
            {row.is_active ? "Active" : "Inactive"}
          </Badge>
          <div>
            <LiveBadge live={row.is_live} />
          </div>
          {row.is_active && !row.is_live && (
            <p className="text-xs text-slate-600">
              {on(row.starts_at)} → {on(row.ends_at)}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "nepali",
      header: "Nepali",
      sortable: true,
      // Worst first, so what still needs a translator sorts to the top.
      sortValue: (row) => ["none", "partial", "complete"].indexOf(nepaliState(row)),
      cell: (row) => <NepaliBadge state={nepaliState(row)} />,
    },
    {
      id: "frequency",
      header: "Frequency",
      hideOnMobile: true,
      cell: (row) => (
        <p className="text-xs text-slate-700">
          Dismissal sticks{" "}
          {row.dismiss_days ? `${row.dismiss_days} day${row.dismiss_days === 1 ? "" : "s"}` : "for the session"}
          {row.max_impressions ? ` · max ${row.max_impressions} views` : " · no view cap"}
        </p>
      ),
    },
    {
      id: "counters",
      header: "Seen",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs tabular-nums text-slate-700">
          {row.impressions.toLocaleString()} shown · {row.dismissals.toLocaleString()} dismissed
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
          {row.is_active ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggle.mutate({ id: row.id, on: false })}
            >
              Take down
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setPublishing(row)}>
              Activate
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ScreenHeader
        eyebrow="Marketing"
        title="Site notices"
        description="Announcements shown as a bar, a dialog or a toast — a festival closure, a border disruption, a changed cut-off time."
        actions={<Button onClick={() => setCreating(true)}>New notice</Button>}
      />

      <Notice tone="warning" title="Activating a notice shows it to every visitor it matches" className="mb-6">
        It takes effect immediately on the live public site, on whichever
        pages its path list covers — all of them if that list is empty.
        Everything seeded here is inactive on purpose. Taking one down is
        equally immediate, whatever its dates say.
      </Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Notices"
          value={list.data?.total ?? 0}
          hint="Matching the current filters"
          loading={list.isLoading}
        />
        <StatCard label="Active on this page" value={activeCount} loading={list.isLoading} />
        <StatCard
          label="Showing right now"
          value={liveCount}
          hint="Active and inside their window"
          loading={list.isLoading}
        />
      </div>

      <div className="panel">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Tone">
            <Select
              value={tone}
              onChange={(event) => {
                setTone(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any tone" },
                ...NOTICE_TONES.map((value) => ({ value, label: value })),
              ]}
            />
          </Field>
          <Field label="Active">
            <Select
              value={active}
              onChange={(event) => {
                setActive(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Active and inactive" },
                { value: "true", label: "Active only" },
                { value: "false", label: "Inactive only" },
              ]}
            />
          </Field>
        </div>

        {list.isError ? (
          <EmptyState
            title="Could not load notices"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : (
          <>
            <DataTable
              caption="Site notices with style, tone, state and frequency capping"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={list.isLoading}
              mobileTitle={(row) => row.title}
              emptyTitle="No notices match"
              emptyDescription="Clear a filter, or create one."
            />
            {(list.data?.pages ?? 1) > 1 && (
              <div className="mt-4">
                <Pagination
                  page={list.data?.page ?? 1}
                  pageCount={list.data?.pages ?? 1}
                  totalItems={list.data?.total}
                  pageSize={list.data?.per_page}
                  onPageChange={setPage}
                  label="Notice pages"
                />
              </div>
            )}
          </>
        )}

        {rows.some((row) => nepaliState(row) !== "complete") && (
          <p className="mt-4 rounded-[0.75rem] border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <strong>
              {rows.filter((row) => nepaliState(row) !== "complete").length} of{" "}
              {rows.length} notices still need Nepali copy.
            </strong>{" "}
            A Nepali reader sees the English wherever a field is empty. For a
            disruption notice that is worth fixing before it goes up — the
            people most affected by a border closure are the ones reading in
            Nepali.
          </p>
        )}
      </div>

      <NoticeEditor
        open={creating || Boolean(editing)}
        notice={editing}
        saving={save.isPending}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSubmit={(body) => save.mutate(body)}
      />

      <ConfirmDialog
        open={Boolean(publishing)}
        onClose={() => setPublishing(null)}
        onConfirm={async () => {
          if (publishing) await toggle.mutateAsync({ id: publishing.id, on: true });
        }}
        tone="danger"
        title="Put this notice on the live site?"
        description="Every visitor on a page it matches sees it, immediately. If it has a start date in the future it stays hidden until then; if it has no dates it shows from now until you take it down."
        confirmLabel="Activate — go live"
      >
        {publishing && (
          <div className="space-y-1 text-sm text-slate-800">
            <p className="font-semibold">{publishing.title}</p>
            <p className="text-xs text-slate-600">
              {publishing.style} · {publishing.tone} ·{" "}
              {publishing.is_dismissible ? "dismissible" : "cannot be dismissed"}
            </p>
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove.mutateAsync(deleting.id);
        }}
        tone="danger"
        title={`Delete ${deleting?.code ?? ""}?`}
        description="The notice and its impression and dismissal counts are removed. Taking it down instead keeps both."
        confirmLabel="Delete notice"
      />
    </>
  );
}
