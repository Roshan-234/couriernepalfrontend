"use client";

/**
 * Advert campaigns.
 *
 * The one thing this screen has to get right is that **activating puts an
 * advert in front of customers**. Everything seeded is a draft on purpose,
 * so the live state is rare and is marked in red rather than left to be
 * read off a status word. The lifecycle actions are buttons because the API
 * refuses a status sent with a save; a campaign that cannot be activated
 * from its current status is not offered the button at all.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Field,
  Input,
  Pagination,
  Select,
  StatCard,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { Notice, ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { AdCampaignEditor } from "@/components/admin/marketing/AdCampaignEditor";
import { LiveBadge, on, words } from "@/components/admin/marketing/shared";
import {
  CAMPAIGN_STATUSES,
  adCampaigns,
  canTransition,
  type AdCampaignRow,
  type CampaignStatus,
  type CampaignWrite,
} from "@/lib/resources/advertising";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const STATUS_TONES: Record<CampaignStatus, "neutral" | "blue" | "green" | "amber" | "teal"> = {
  draft: "neutral",
  scheduled: "blue",
  running: "green",
  paused: "amber",
  finished: "teal",
};

type Action = "activate" | "pause" | "finish";

const ACTION_COPY: Record<
  Action,
  { title: string; body: string; label: string; tone: "danger" | "default" }
> = {
  activate: {
    title: "Put this campaign on the live site?",
    body:
      "Its active creatives start appearing to real visitors on the public site immediately, in whichever placements they are assigned to. If the campaign has a start date in the future it becomes scheduled instead and goes live by itself when that date arrives.",
    label: "Activate — go live",
    tone: "danger",
  },
  pause: {
    title: "Pause this campaign?",
    body:
      "Its creatives stop being served straight away. Nothing is deleted and the counters are kept; the campaign can be activated again.",
    label: "Pause",
    tone: "default",
  },
  finish: {
    title: "Finish this campaign?",
    body:
      "Finishing is terminal — a finished campaign cannot be restarted, and running the same promotion again means creating a new campaign. The creatives and their counters are kept for the report.",
    label: "Finish",
    tone: "danger",
  },
};

export default function Page() {
  const cache = useQueryClient();
  const { success, error: errorToast } = useToast();

  const [status, setStatus] = useState("");
  const [occasion, setOccasion] = useState("");
  const [liveOnly, setLiveOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<AdCampaignRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState<{ row: AdCampaignRow; action: Action } | null>(null);
  const [deleting, setDeleting] = useState<AdCampaignRow | null>(null);

  const filters = useMemo(
    () => ({
      status,
      occasion: occasion.trim(),
      live: liveOnly ? "true" : "",
      page,
      per_page: 20,
    }),
    [status, occasion, liveOnly, page],
  );

  const list = useQuery({
    queryKey: queryKeys.adsAdmin.campaigns(filters),
    queryFn: () => adCampaigns.list(filters),
  });

  async function refresh() {
    await cache.invalidateQueries({ queryKey: queryKeys.adsAdmin.all });
  }

  const save = useMutation({
    mutationFn: (body: CampaignWrite) =>
      editing ? adCampaigns.update(editing.id, body) : adCampaigns.create(body),
    onSuccess: async () => {
      await refresh();
      success(editing ? "Campaign saved." : "Draft campaign created.");
      setEditing(null);
      setCreating(false);
    },
    onError: (err) =>
      errorToast("Could not save the campaign.", { description: errorMessage(err) }),
  });

  const transition = useMutation({
    mutationFn: ({ id, action }: { id: number; action: Action }) => adCampaigns[action](id),
    onSuccess: async (campaign) => {
      await refresh();
      if (campaign.status === "running") {
        success(`${campaign.name} is now on the live site.`, {
          description: "Its active creatives are being served to visitors.",
        });
      } else if (campaign.status === "scheduled") {
        success(`${campaign.name} is scheduled.`, {
          description: `It goes live by itself on ${on(campaign.starts_at)}.`,
        });
      } else {
        success(`${campaign.name} is now ${campaign.status}.`);
      }
      setConfirming(null);
    },
    onError: (err) =>
      errorToast("The API refused that change.", { description: errorMessage(err) }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adCampaigns.remove(id),
    onSuccess: async () => {
      await refresh();
      success("Campaign deleted.");
      setDeleting(null);
    },
    onError: (err) =>
      errorToast("Could not delete the campaign.", { description: errorMessage(err) }),
  });

  const rows = list.data?.items ?? [];
  const liveCount = rows.filter((row) => row.is_live).length;
  const draftCount = rows.filter((row) => row.status === "draft").length;

  const columns: DataTableColumn<AdCampaignRow>[] = [
    {
      id: "campaign",
      header: "Campaign",
      primary: true,
      sortable: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div>
          <Link
            href={`/admin/ads/${row.id}`}
            className="font-semibold text-[color:var(--brand-navy)] underline underline-offset-4"
          >
            {row.name}
          </Link>
          <p>
            <code className="text-xs text-slate-600">{row.code}</code>
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <div className="space-y-1">
          <Badge tone={STATUS_TONES[row.status]} variant="soft">
            {row.status}
          </Badge>
          <div>
            <LiveBadge live={row.is_live} />
          </div>
        </div>
      ),
    },
    {
      id: "occasion",
      header: "Occasion",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-slate-800">{row.occasion ? words(row.occasion) : "—"}</span>
      ),
    },
    {
      id: "window",
      header: "Window",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-slate-700">
          {row.starts_at || row.ends_at ? `${on(row.starts_at)} → ${on(row.ends_at)}` : "No dates"}
        </span>
      ),
    },
    {
      id: "creatives",
      header: "Creatives",
      align: "right",
      cell: (row) => (
        <span className="text-sm tabular-nums text-slate-800">{row.creative_count}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          {canTransition(row.status, "activate") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirming({ row, action: "activate" })}
            >
              Activate
            </Button>
          )}
          {canTransition(row.status, "pause") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming({ row, action: "pause" })}
            >
              Pause
            </Button>
          )}
          {canTransition(row.status, "finish") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming({ row, action: "finish" })}
            >
              Finish
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={row.status === "running"}
            title={
              row.status === "running"
                ? "A running campaign cannot be deleted. Pause or finish it first."
                : undefined
            }
            onClick={() => setDeleting(row)}
          >
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
        title="Advert campaigns"
        description="The company's own promotions on its own site — a festival offer, a corridor rate, a student season. No third-party network, no external script."
        actions={
          <>
            <Link href="/admin/ads/placements" className="action action-outline">
              Placements
            </Link>
            <Link href="/admin/ads/report" className="action action-outline">
              Performance
            </Link>
            <Button onClick={() => setCreating(true)}>New campaign</Button>
          </>
        }
      />

      <Notice
        tone="warning"
        title="Activating a campaign puts an advert on the live public site"
        className="mb-6"
      >
        Everything seeded here is deliberately a draft with inactive
        creatives, so nothing is showing to customers right now. Activate is
        the single action that changes that, and it takes effect immediately —
        there is no staging copy of the public site.
      </Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Campaigns"
          value={list.data?.total ?? 0}
          hint="Matching the current filters"
          loading={list.isLoading}
        />
        <StatCard
          label="Live on this page"
          value={liveCount}
          hint="Running and inside their dates"
          loading={list.isLoading}
        />
        <StatCard label="Drafts on this page" value={draftCount} loading={list.isLoading} />
      </div>

      <div className="panel">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Status">
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any status" },
                ...CAMPAIGN_STATUSES.map((value) => ({ value, label: value })),
              ]}
            />
          </Field>
          <Field label="Occasion" hint="Exact match, as stored — dashain, tihar, losar.">
            <Input
              value={occasion}
              placeholder="Any occasion"
              onChange={(event) => {
                setOccasion(event.target.value);
                setPage(1);
              }}
            />
          </Field>
          <div className="flex items-end pb-1">
            <Checkbox
              label="Live right now"
              hint="Running, and inside its date window."
              checked={liveOnly}
              onChange={(event) => {
                setLiveOnly(event.target.checked);
                setPage(1);
              }}
            />
          </div>
        </div>

        {list.isError ? (
          <EmptyState
            title="Could not load campaigns"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : (
          <>
            <DataTable
              caption="Advert campaigns with status, occasion, window and creative count"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={list.isLoading}
              mobileTitle={(row) => row.name}
              emptyTitle="No campaigns match"
              emptyDescription="Clear a filter, or create a draft campaign."
            />
            {(list.data?.pages ?? 1) > 1 && (
              <div className="mt-4">
                <Pagination
                  page={list.data?.page ?? 1}
                  pageCount={list.data?.pages ?? 1}
                  totalItems={list.data?.total}
                  pageSize={list.data?.per_page}
                  onPageChange={setPage}
                  label="Campaign pages"
                />
              </div>
            )}
          </>
        )}
      </div>

      <AdCampaignEditor
        open={creating || Boolean(editing)}
        campaign={editing}
        saving={save.isPending}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSubmit={(body) => save.mutate(body)}
      />

      <ConfirmDialog
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={async () => {
          if (confirming) {
            await transition.mutateAsync({ id: confirming.row.id, action: confirming.action });
          }
        }}
        tone={confirming ? ACTION_COPY[confirming.action].tone : "default"}
        title={confirming ? ACTION_COPY[confirming.action].title : ""}
        description={confirming ? ACTION_COPY[confirming.action].body : undefined}
        confirmLabel={confirming ? ACTION_COPY[confirming.action].label : "Confirm"}
      >
        {confirming && (
          <p className="text-sm text-slate-800">
            <span className="font-semibold">{confirming.row.name}</span>{" "}
            <code className="text-xs text-slate-600">{confirming.row.code}</code> —{" "}
            {confirming.row.creative_count} creative
            {confirming.row.creative_count === 1 ? "" : "s"}.
          </p>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove.mutateAsync(deleting.id);
        }}
        tone="danger"
        title={`Delete ${deleting?.name ?? ""}?`}
        description="The campaign and every creative under it are deleted, counters included. A running campaign is refused by the API — finish it instead, which keeps the numbers for the report."
        confirmLabel="Delete campaign"
      />
    </>
  );
}
