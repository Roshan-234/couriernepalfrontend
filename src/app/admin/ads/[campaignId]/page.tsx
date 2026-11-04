"use client";

/**
 * One advert campaign and the creatives under it.
 *
 * A creative is only served when four things are true at once: the campaign
 * is running and inside its dates, the creative is active, its placement is
 * active, and the slot has not already been filled by something with a
 * higher priority. The "Served?" column says which of those is failing
 * rather than showing a bare toggle, because "active" on its own is the
 * thing people misread as "showing".
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Breadcrumbs,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Skeleton,
  StatCard,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { Describe, Notice, ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { CreativeEditor } from "@/components/admin/marketing/CreativeEditor";
import { LiveBadge, NepaliBadge, at, on, words } from "@/components/admin/marketing/shared";
import {
  adCampaigns,
  adCreatives,
  adPlacements,
  canTransition,
  nepaliState,
  type AdCreativeRow,
  type CreativeWrite,
} from "@/lib/resources/advertising";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

type Action = "activate" | "pause" | "finish";

export default function Page() {
  const params = useParams<{ campaignId: string }>();
  const campaignId = Number(params.campaignId);
  const cache = useQueryClient();
  const { success, error: errorToast } = useToast();

  const [editing, setEditing] = useState<AdCreativeRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdCreativeRow | null>(null);
  const [activating, setActivating] = useState<AdCreativeRow | null>(null);
  const [lifecycle, setLifecycle] = useState<Action | null>(null);

  const campaign = useQuery({
    queryKey: queryKeys.adsAdmin.campaign(campaignId),
    queryFn: () => adCampaigns.get(campaignId),
    enabled: Number.isFinite(campaignId),
  });

  const creatives = useQuery({
    queryKey: queryKeys.adsAdmin.creatives(campaignId),
    queryFn: () => adCreatives.listFor(campaignId),
    enabled: Number.isFinite(campaignId),
  });

  const placements = useQuery({
    queryKey: queryKeys.adsAdmin.placements,
    queryFn: () => adPlacements.list(),
    staleTime: 5 * 60 * 1000,
  });

  async function refresh() {
    await cache.invalidateQueries({ queryKey: queryKeys.adsAdmin.all });
  }

  /**
   * Put one creative the API just returned back into the list.
   *
   * An image upload answers with the full admin shape, so there is nothing
   * a refetch would tell us that this does not — and refetching while the
   * editor is open would replace the row the drawer is bound to and reset
   * the half-typed form inside it.
   */
  function patchCreative(row: AdCreativeRow) {
    cache.setQueryData<AdCreativeRow[]>(
      queryKeys.adsAdmin.creatives(campaignId),
      (current) => current?.map((item) => (item.id === row.id ? row : item)),
    );
  }

  const save = useMutation({
    mutationFn: (body: CreativeWrite) =>
      editing ? adCreatives.update(editing.id, body) : adCreatives.create(campaignId, body),
    onSuccess: async () => {
      await refresh();
      success(editing ? "Creative saved." : "Creative added.");
      setEditing(null);
      setCreating(false);
    },
    onError: (err) =>
      errorToast("Could not save the creative.", { description: errorMessage(err) }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? adCreatives.activate(id) : adCreatives.deactivate(id),
    onSuccess: async (row) => {
      await refresh();
      success(row.is_active ? "Creative switched on." : "Creative switched off.");
      setActivating(null);
    },
    onError: (err) =>
      errorToast("The API refused that change.", { description: errorMessage(err) }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adCreatives.remove(id),
    onSuccess: async () => {
      await refresh();
      success("Creative deleted.");
      setDeleting(null);
    },
    onError: (err) =>
      errorToast("Could not delete the creative.", { description: errorMessage(err) }),
  });

  const transition = useMutation({
    mutationFn: (action: Action) => adCampaigns[action](campaignId),
    onSuccess: async (row) => {
      await refresh();
      success(`Campaign is now ${row.status}.`);
      setLifecycle(null);
    },
    onError: (err) =>
      errorToast("The API refused that change.", { description: errorMessage(err) }),
  });

  const data = campaign.data;
  const rows = useMemo(() => creatives.data ?? [], [creatives.data]);
  const placementById = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of placements.data ?? []) map.set(item.id, item.code);
    return map;
  }, [placements.data]);
  const placementActive = useMemo(() => {
    const map = new Map<number, boolean>();
    for (const item of placements.data ?? []) map.set(item.id, item.is_active);
    return map;
  }, [placements.data]);

  /**
   * Which creatives would actually be served, applying the same rule the
   * `/serve` endpoint does: highest priority first, capped at the
   * placement's `max_creatives`.
   */
  const servedIds = useMemo(() => {
    const caps = new Map<number, number>();
    for (const item of placements.data ?? []) caps.set(item.id, item.max_creatives || 1);
    const used = new Map<number, number>();
    const served = new Set<number>();
    const ordered = [...rows].sort((a, b) => b.priority - a.priority || a.id - b.id);
    for (const row of ordered) {
      if (!row.is_active) continue;
      if (placementActive.get(row.placement_id) === false) continue;
      const cap = caps.get(row.placement_id) ?? 1;
      const count = used.get(row.placement_id) ?? 0;
      if (count >= cap) continue;
      used.set(row.placement_id, count + 1);
      served.add(row.id);
    }
    return served;
  }, [rows, placements.data, placementActive]);

  function servedState(row: AdCreativeRow) {
    if (!row.is_active) return { tone: "neutral" as const, label: "Off", why: "The creative is switched off." };
    if (placementActive.get(row.placement_id) === false) {
      return { tone: "amber" as const, label: "Blocked", why: "Its placement is inactive." };
    }
    if (!servedIds.has(row.id)) {
      return {
        tone: "amber" as const,
        label: "Over capacity",
        why: "Something with a higher priority already fills this slot.",
      };
    }
    if (!data?.is_live) {
      return {
        tone: "blue" as const,
        label: "Ready",
        why: "Would be served as soon as the campaign is live.",
      };
    }
    return { tone: "red" as const, label: "Being served", why: "Visible to visitors right now." };
  }

  const columns: DataTableColumn<AdCreativeRow>[] = [
    {
      id: "creative",
      header: "Creative",
      primary: true,
      cell: (row) => (
        <div className="flex items-start gap-3">
          {row.image_path && (
            /* Decorative here: the headline beside it names the creative,
               and the alt-text state is reported in words below rather
               than left to whether this thumbnail happens to have any.
               `<img>` rather than `next/image` because `image_path` may be
               any origin — see `CreativeImageField`. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={row.image_path}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-10 w-16 shrink-0 rounded-[0.4rem] border border-slate-300 bg-white object-contain"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-[color:var(--brand-navy)]">{row.headline}</p>
            <p className="text-xs text-slate-600">
              {row.placement ?? placementById.get(row.placement_id) ?? "—"} · {row.format} ·
              priority {row.priority}
            </p>
            {row.image_path && !row.image_alt && (
              <p className="mt-1 text-xs font-semibold text-red-700">
                Image with no alt text — cannot be activated.
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "served",
      header: "Served?",
      cell: (row) => {
        const state = servedState(row);
        return (
          <div className="space-y-1">
            <Badge tone={state.tone} variant="soft" dot>
              {state.label}
            </Badge>
            <p className="text-xs text-slate-600">{state.why}</p>
          </div>
        );
      },
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
      id: "target",
      header: "Links to",
      hideOnMobile: true,
      cell: (row) => (
        <code className="text-xs text-slate-700">{row.target_path || "Not a link"}</code>
      ),
    },
    {
      id: "counters",
      header: "Lifetime",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs tabular-nums text-slate-700">
          {row.impressions.toLocaleString()} impressions · {row.clicks.toLocaleString()} clicks ·{" "}
          {row.click_through_rate}% CTR
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
              onClick={() => toggle.mutate({ id: row.id, active: false })}
            >
              Switch off
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setActivating(row)}>
              Switch on
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

  if (campaign.isError) {
    return (
      <EmptyState
        title="Could not load this campaign"
        description={errorMessage(campaign.error)}
        action={<Button onClick={() => campaign.refetch()}>Try again</Button>}
        secondaryAction={
          <Link href="/admin/ads" className="action action-outline">
            Back to campaigns
          </Link>
        }
      />
    );
  }

  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);

  return (
    <>
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Advert campaigns", href: "/admin/ads" },
          { label: data?.name ?? "Campaign" },
        ]}
      />

      <ScreenHeader
        eyebrow="Marketing"
        title={data?.name ?? "Campaign"}
        description={data?.objective ?? undefined}
        actions={
          data ? (
            <>
              {canTransition(data.status, "activate") && (
                <Button onClick={() => setLifecycle("activate")}>Activate</Button>
              )}
              {canTransition(data.status, "pause") && (
                <Button variant="outline" onClick={() => setLifecycle("pause")}>
                  Pause
                </Button>
              )}
              {canTransition(data.status, "finish") && (
                <Button variant="outline" onClick={() => setLifecycle("finish")}>
                  Finish
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {data?.is_live && (
        <Notice tone="warning" title="This campaign is on the live site" className="mb-6">
          Its creatives marked “Being served” are visible to real visitors
          right now. Pausing stops them immediately.
        </Notice>
      )}

      <div className="mb-6 grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="panel">
          <h2 className="text-sm font-semibold text-[color:var(--brand-navy)]">Campaign</h2>
          {campaign.isLoading || !data ? (
            <Skeleton className="mt-4 h-40" />
          ) : (
            <dl className="mt-3">
              <Describe term="Code">
                <code className="text-xs">{data.code}</code>
              </Describe>
              <Describe term="Status">{data.status}</Describe>
              <Describe term="Visible now">
                <LiveBadge live={data.is_live} />
              </Describe>
              <Describe term="Occasion">{data.occasion ? words(data.occasion) : "—"}</Describe>
              <Describe term="Window">
                {data.starts_at || data.ends_at
                  ? `${on(data.starts_at)} → ${on(data.ends_at)}`
                  : "No dates — runs until paused"}
              </Describe>
              <Describe term="Landing path">
                <code className="text-xs">{data.landing_path || "—"}</code>
              </Describe>
              <Describe term="UTM campaign">{data.utm_campaign || "—"}</Describe>
              <Describe term="Created">{at(data.created_at)}</Describe>
            </dl>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Creatives" value={rows.length} loading={creatives.isLoading} />
          <StatCard
            label="Lifetime impressions"
            value={impressions.toLocaleString()}
            hint="Counted since each creative was created"
            loading={creatives.isLoading}
          />
          <StatCard
            label="Lifetime clicks"
            value={clicks.toLocaleString()}
            hint={impressions ? `${((clicks / impressions) * 100).toFixed(2)}% CTR` : "No impressions yet"}
            loading={creatives.isLoading}
          />
        </div>
      </div>

      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[color:var(--brand-navy)]">Creatives</h2>
            <p className="text-sm text-slate-700">
              Highest priority first, which is the order the server fills a slot in.
            </p>
          </div>
          <Button onClick={() => setCreating(true)}>Add creative</Button>
        </div>

        {creatives.isError ? (
          <EmptyState
            title="Could not load creatives"
            description={errorMessage(creatives.error)}
            action={<Button onClick={() => creatives.refetch()}>Try again</Button>}
          />
        ) : (
          <DataTable
            caption="Creatives in this campaign with whether each would be served"
            columns={columns}
            rows={[...rows].sort((a, b) => b.priority - a.priority || a.id - b.id)}
            rowKey={(row) => row.id}
            loading={creatives.isLoading}
            mobileTitle={(row) => row.headline}
            emptyTitle="No creatives yet"
            emptyDescription="A campaign with no creatives serves nothing, whatever its status."
          />
        )}

        {rows.some((row) => nepaliState(row) !== "complete") && (
          <p className="mt-4 rounded-[0.75rem] border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <strong>
              {rows.filter((row) => nepaliState(row) !== "complete").length} of{" "}
              {rows.length} creatives still need Nepali copy.
            </strong>{" "}
            A Nepali reader is shown the English wherever a field is empty, so
            nothing breaks — but this is work waiting on a native speaker
            rather than a finished campaign. Open a creative to write it; the
            boxes hold whatever is already stored.
          </p>
        )}
      </div>

      <CreativeEditor
        open={creating || Boolean(editing)}
        creative={editing}
        placements={placements.data ?? []}
        saving={save.isPending}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSubmit={(body) => save.mutate(body)}
        onImageChanged={patchCreative}
      />

      <ConfirmDialog
        open={Boolean(activating)}
        onClose={() => setActivating(null)}
        onConfirm={async () => {
          if (activating) await toggle.mutateAsync({ id: activating.id, active: true });
        }}
        tone={data?.is_live ? "danger" : "default"}
        title="Switch this creative on?"
        description={
          data?.is_live
            ? "This campaign is live, so the creative starts being served to visitors as soon as it is switched on."
            : "The creative is marked active. It is still not served until the campaign itself is activated."
        }
        confirmLabel="Switch on"
      >
        {activating?.image_path && !activating.image_alt && (
          <p className="text-sm font-semibold text-red-700">
            This creative has an image and no alt text, so the API will refuse.
            Add alt text first.
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
        title={`Delete “${deleting?.headline ?? ""}”?`}
        description="The creative goes, and its impression and click counters go with it. Switching it off instead keeps the numbers."
        confirmLabel="Delete creative"
      />

      <ConfirmDialog
        open={Boolean(lifecycle)}
        onClose={() => setLifecycle(null)}
        onConfirm={async () => {
          if (lifecycle) await transition.mutateAsync(lifecycle);
        }}
        tone={lifecycle === "pause" ? "default" : "danger"}
        title={
          lifecycle === "activate"
            ? "Put this campaign on the live site?"
            : lifecycle === "pause"
              ? "Pause this campaign?"
              : "Finish this campaign?"
        }
        description={
          lifecycle === "activate"
            ? "Its active creatives start appearing to real visitors immediately, unless its start date is still ahead — in which case it becomes scheduled."
            : lifecycle === "pause"
              ? "Serving stops straight away. Nothing is deleted and it can be activated again."
              : "Finishing is terminal. A finished campaign cannot be restarted."
        }
        confirmLabel={
          lifecycle === "activate" ? "Activate — go live" : lifecycle === "pause" ? "Pause" : "Finish"
        }
      />
    </>
  );
}
