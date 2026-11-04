"use client";

/**
 * Email campaigns.
 *
 * The list deliberately does not carry a Send button. Sending needs the
 * campaign's code typed back by hand and the audience size in front of the
 * person doing it, so it lives on the campaign's own page where both are
 * available. What the list shows is approval state, because that is the
 * thing that decides whether a send is possible at all.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
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
import { EmailCampaignEditor } from "@/components/admin/marketing/EmailCampaignEditor";
import { at } from "@/components/admin/marketing/shared";
import {
  EMAIL_CAMPAIGN_STATUSES,
  emailCampaigns,
  type EmailCampaignRow,
  type EmailCampaignStatus,
  type EmailCampaignWrite,
} from "@/lib/resources/marketing";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const STATUS_TONES: Record<EmailCampaignStatus, "neutral" | "blue" | "amber" | "green" | "red"> = {
  draft: "neutral",
  scheduled: "blue",
  sending: "amber",
  sent: "green",
  cancelled: "red",
};

export default function Page() {
  const cache = useQueryClient();
  const { success, error: errorToast } = useToast();

  const [status, setStatus] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<EmailCampaignRow | null>(null);

  const filters = useMemo(
    () => ({ status, q: term.trim(), page, per_page: 20 }),
    [status, term, page],
  );

  const list = useQuery({
    queryKey: queryKeys.marketing.campaigns(filters),
    queryFn: () => emailCampaigns.list(filters),
  });

  const create = useMutation({
    mutationFn: (body: EmailCampaignWrite) => emailCampaigns.create(body),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.marketing.all });
      success("Draft campaign created.");
      setCreating(false);
    },
    onError: (err) =>
      errorToast("Could not create the campaign.", { description: errorMessage(err) }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => emailCampaigns.remove(id),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.marketing.all });
      success("Draft deleted.");
      setDeleting(null);
    },
    onError: (err) =>
      errorToast("Could not delete the campaign.", { description: errorMessage(err) }),
  });

  const rows = list.data?.items ?? [];
  const approved = rows.filter((row) => row.is_approved).length;
  const sent = rows.filter((row) => row.status === "sent").length;

  const columns: DataTableColumn<EmailCampaignRow>[] = [
    {
      id: "campaign",
      header: "Campaign",
      primary: true,
      sortable: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div>
          <Link
            href={`/admin/marketing/campaigns/${row.id}`}
            className="font-semibold text-[color:var(--brand-navy)] underline underline-offset-4"
          >
            {row.name}
          </Link>
          <p>
            <code className="text-xs text-slate-600">{row.code}</code>
          </p>
          <p className="mt-1 max-w-xl text-xs text-slate-600">{row.subject}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge tone={STATUS_TONES[row.status]} variant="soft">
          {row.status}
        </Badge>
      ),
    },
    {
      id: "approval",
      header: "Approval",
      cell: (row) =>
        row.is_approved ? (
          <Badge tone="green" variant="solid" dot>
            Approved
          </Badge>
        ) : (
          <div>
            <Badge tone="amber" variant="soft">
              Not approved
            </Badge>
            <p className="mt-1 text-xs text-slate-600">Cannot send.</p>
          </div>
        ),
    },
    {
      id: "outcome",
      header: "Outcome",
      hideOnMobile: true,
      cell: (row) =>
        row.status === "sent" ? (
          <span className="text-xs tabular-nums text-slate-700">
            {row.delivered}/{row.recipients} delivered
            {row.failed ? ` · ${row.failed} failed` : ""}
          </span>
        ) : (
          <span className="text-xs text-slate-600">Not sent</span>
        ),
    },
    {
      id: "created",
      header: "Created",
      hideOnMobile: true,
      cell: (row) => <span className="text-xs text-slate-700">{at(row.created_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Link
            href={`/admin/marketing/campaigns/${row.id}`}
            className="action action-outline min-h-11! gap-1.5! px-4! py-2! text-xs!"
          >
            Open
          </Link>
          <Button
            variant="ghost"
            size="sm"
            disabled={row.status !== "draft"}
            title={
              row.status !== "draft"
                ? "Only an untouched draft can be deleted; a campaign that has sent is the record of what went to whom."
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
        title="Email campaigns"
        description="Service updates and seasonal offers to people who confirmed a subscription."
        actions={
          <>
            <Link href="/admin/marketing/contacts" className="action action-outline">
              Contacts
            </Link>
            <Button onClick={() => setCreating(true)}>New campaign</Button>
          </>
        }
      />

      <Notice tone="warning" title="A send cannot be undone" className="mb-6">
        Sending is on each campaign&rsquo;s own page, not here, because it
        needs the audience size in front of you and the campaign&rsquo;s code
        typed back by hand. A campaign also cannot send until somebody has
        approved it, and any edit to the subject, body or audience withdraws
        that approval.
      </Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Campaigns"
          value={list.data?.total ?? 0}
          hint="Matching the current filters"
          loading={list.isLoading}
        />
        <StatCard label="Approved on this page" value={approved} loading={list.isLoading} />
        <StatCard label="Already sent" value={sent} loading={list.isLoading} />
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
                ...EMAIL_CAMPAIGN_STATUSES.map((value) => ({ value, label: value })),
              ]}
            />
          </Field>
          <Field label="Search" hint="Code or name.">
            <Input
              value={term}
              placeholder="Any"
              onChange={(event) => {
                setTerm(event.target.value);
                setPage(1);
              }}
            />
          </Field>
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
              caption="Email campaigns with status, approval state and delivery outcome"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={list.isLoading}
              mobileTitle={(row) => row.name}
              emptyTitle="No campaigns match"
              emptyDescription="Clear a filter, or draft one."
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

      <EmailCampaignEditor
        open={creating}
        campaign={null}
        saving={create.isPending}
        onClose={() => setCreating(false)}
        onSubmit={(body) => create.mutate(body)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove.mutateAsync(deleting.id);
        }}
        tone="danger"
        title={`Delete ${deleting?.name ?? ""}?`}
        description="Only an untouched draft can be deleted. The API refuses anything that has sent, because those rows are the record of what went to whom."
        confirmLabel="Delete draft"
      />
    </>
  );
}
