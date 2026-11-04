"use client";

/**
 * One email campaign: approve it, proof it, send it, read what happened.
 *
 * Sending is the single most irreversible action in this admin area, so it
 * is gated the way the API gates it and no more gently: the campaign must
 * be approved, the audience size is shown before the commitment, and the
 * campaign's own code has to be typed back — a checkbox would not stop the
 * wrong campaign going out from the wrong tab, which is the mistake this
 * guards against.
 *
 * The report shows no open or click rate. Those are `null` on purpose and
 * the API says why; the reason is rendered rather than an empty metric that
 * reads as broken instrumentation.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Breadcrumbs,
  Button,
  DataTable,
  EmptyState,
  Field,
  Input,
  Modal,
  Skeleton,
  StatCard,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { Describe, Notice, ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { EmailCampaignEditor } from "@/components/admin/marketing/EmailCampaignEditor";
import { at, words } from "@/components/admin/marketing/shared";
import {
  MAIL_NOT_CONFIGURED,
  SKIP_REASONS,
  emailCampaigns,
  type EmailCampaignWrite,
  type EmailSendRow,
  type SendResult,
  type TestSendResult,
} from "@/lib/resources/marketing";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const SEND_STATUS_TONES: Record<EmailSendRow["status"], "neutral" | "green" | "red" | "amber"> = {
  queued: "neutral",
  sent: "green",
  failed: "red",
  skipped: "amber",
};

export default function Page() {
  const params = useParams<{ campaignId: string }>();
  const campaignId = Number(params.campaignId);
  const cache = useQueryClient();
  const { success, error: errorToast, warning } = useToast();

  const [editing, setEditing] = useState(false);
  const [testAddress, setTestAddress] = useState("");
  const [testResult, setTestResult] = useState<TestSendResult | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  const campaign = useQuery({
    queryKey: queryKeys.marketing.campaign(campaignId),
    queryFn: () => emailCampaigns.get(campaignId),
    enabled: Number.isFinite(campaignId),
  });

  const report = useQuery({
    queryKey: queryKeys.marketing.campaignReport(campaignId),
    queryFn: () => emailCampaigns.report(campaignId),
    enabled: Number.isFinite(campaignId),
  });

  const sends = useQuery({
    queryKey: queryKeys.marketing.campaignSends(campaignId, { per_page: 50 }),
    queryFn: () => emailCampaigns.sends(campaignId, { per_page: 50 }),
    enabled: Number.isFinite(campaignId),
  });

  async function refresh() {
    await cache.invalidateQueries({ queryKey: queryKeys.marketing.all });
  }

  const save = useMutation({
    mutationFn: (body: EmailCampaignWrite) => emailCampaigns.update(campaignId, body),
    onSuccess: async (row) => {
      await refresh();
      setEditing(false);
      if (row.is_approved) success("Campaign saved.");
      else
        warning("Campaign saved — the approval was withdrawn.", {
          description: "Approve it again before it can send.",
        });
    },
    onError: (err) =>
      errorToast("Could not save the campaign.", { description: errorMessage(err) }),
  });

  const approve = useMutation({
    mutationFn: () => emailCampaigns.approve(campaignId),
    onSuccess: async () => {
      await refresh();
      success("Approved. It can now be sent.");
    },
    onError: (err) => errorToast("Could not approve.", { description: errorMessage(err) }),
  });

  const test = useMutation({
    mutationFn: () => emailCampaigns.test(campaignId, testAddress.trim()),
    onSuccess: (result) => {
      setTestResult(result);
      if (result.sent) success(`Proof sent to ${result.recipient}.`);
      else errorToast("The proof was not sent.", { description: result.error ?? "" });
    },
    onError: (err) => {
      setTestResult(null);
      errorToast("The proof was not sent.", { description: errorMessage(err) });
    },
  });

  const send = useMutation({
    mutationFn: () => emailCampaigns.send(campaignId, confirmCode.trim()),
    onSuccess: async (result) => {
      await refresh();
      setSendResult(result);
      setConfirmCode("");
      if (!result.mail_configured) {
        errorToast("Nothing was actually sent — mail is not configured.", {
          description:
            "Every recipient is recorded as a failure with “not sent - mail not configured”. Re-running after mail is configured retries exactly those.",
        });
      } else {
        success(`Sent to ${result.sent_now} recipient${result.sent_now === 1 ? "" : "s"}.`);
      }
    },
    onError: (err) => errorToast("The send was refused.", { description: errorMessage(err) }),
  });

  const data = campaign.data;
  const rows = useMemo(() => sends.data?.items ?? [], [sends.data]);

  const columns: DataTableColumn<EmailSendRow>[] = [
    {
      id: "contact",
      header: "Contact",
      primary: true,
      cell: (row) => <span className="text-sm text-slate-800">#{row.contact_id}</span>,
    },
    {
      id: "status",
      header: "Outcome",
      cell: (row) => (
        <Badge tone={SEND_STATUS_TONES[row.status]} variant="soft">
          {row.status}
        </Badge>
      ),
    },
    {
      id: "why",
      header: "Why",
      cell: (row) => (
        <span className="text-xs text-slate-700">
          {row.skip_reason
            ? (SKIP_REASONS[row.skip_reason] ?? words(row.skip_reason))
            : row.error === MAIL_NOT_CONFIGURED
              ? "There was no mail server to hand it to — it was never attempted."
              : (row.error ?? "—")}
        </span>
      ),
    },
    {
      id: "sent",
      header: "Handed over",
      align: "right",
      cell: (row) => <span className="text-xs text-slate-700">{at(row.sent_at)}</span>,
    },
  ];

  if (campaign.isError) {
    return (
      <EmptyState
        title="Could not load this campaign"
        description={errorMessage(campaign.error)}
        action={<Button onClick={() => campaign.refetch()}>Try again</Button>}
        secondaryAction={
          <Link href="/admin/marketing/campaigns" className="action action-outline">
            Back to campaigns
          </Link>
        }
      />
    );
  }

  const sendable = Boolean(data && data.is_approved && data.status !== "sent" && data.status !== "cancelled");

  return (
    <>
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Email campaigns", href: "/admin/marketing/campaigns" },
          { label: data?.name ?? "Campaign" },
        ]}
      />

      <ScreenHeader
        eyebrow="Marketing"
        title={data?.name ?? "Campaign"}
        description={data?.subject}
        actions={
          data ? (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
              {!data.is_approved && (
                <Button variant="outline" onClick={() => approve.mutate()} loading={approve.isPending}>
                  Approve
                </Button>
              )}
              <Button
                variant="danger"
                disabled={!sendable}
                title={
                  data.is_approved
                    ? undefined
                    : "A campaign cannot send without an approval."
                }
                onClick={() => {
                  setSendResult(null);
                  setConfirmCode("");
                  setSendOpen(true);
                }}
              >
                Send
              </Button>
            </>
          ) : undefined
        }
      />

      {data && (
        <div
          className={`mb-6 rounded-[0.75rem] border px-4 py-3 text-sm ${
            data.is_approved
              ? "border-green-300 bg-green-50 text-green-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="font-semibold">
            {data.is_approved
              ? "Approved for sending"
              : "Not approved — this campaign cannot be sent"}
          </p>
          <p className="mt-1">
            {data.is_approved
              ? "Somebody has read what goes out and signed it off. Editing the subject, preheader, body or audience withdraws this immediately, and the campaign has to be approved again."
              : "Approval is a person saying they have read the thing that will actually be sent. Approve it from the button above once the copy is final; editing after that withdraws the approval again."}
          </p>
        </div>
      )}

      {data?.status === "sent" && (
        <Notice tone="warning" title="This campaign has already been sent" className="mb-6">
          It cannot be edited. Sending again resumes rather than resends:
          contacts already handled are left alone, and only rows that were
          skipped, or that failed because there was no mail server, are tried
          again.
        </Notice>
      )}

      <div className="mb-6 grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="panel">
          <h2 className="text-sm font-semibold text-[color:var(--brand-navy)]">Campaign</h2>
          {campaign.isLoading || !data ? (
            <Skeleton className="mt-4 h-56" />
          ) : (
            <dl className="mt-3">
              <Describe term="Code">
                <code className="text-xs">{data.code}</code>
              </Describe>
              <Describe term="Status">{data.status}</Describe>
              <Describe term="Audience size">{data.audience_size}</Describe>
              <Describe term="Audience">
                {Object.keys(data.audience).length === 0
                  ? "Confirmed subscribers"
                  : [
                      data.audience.status?.length
                        ? `status: ${data.audience.status.join(", ")}`
                        : null,
                      data.audience.tags?.length ? `tags: ${data.audience.tags.join(", ")}` : null,
                      data.audience.country?.length
                        ? `countries: ${data.audience.country.join(", ")}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
              </Describe>
              <Describe term="Nepali body">{data.body_ne ? "Written" : "Falls back to English"}</Describe>
              <Describe term="Scheduled for">{at(data.scheduled_for)}</Describe>
              <Describe term="Started">{at(data.started_at)}</Describe>
              <Describe term="Completed">{at(data.completed_at)}</Describe>
              <Describe term="Created">{at(data.created_at)}</Describe>
            </dl>
          )}
        </div>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard
              label="Recipients"
              value={report.data?.recipients ?? 0}
              hint="Audience members not skipped"
              loading={report.isLoading}
            />
            <StatCard
              label="Delivered"
              value={report.data?.delivered ?? 0}
              hint="Accepted by the mail server"
              loading={report.isLoading}
            />
            <StatCard label="Failed" value={report.data?.failed ?? 0} loading={report.isLoading} />
            <StatCard
              label="Unsubscribes"
              value={report.data?.unsubscribes ?? 0}
              hint="Attributed to this mailing"
              loading={report.isLoading}
            />
          </div>

          <div className="panel">
            <h2 className="text-sm font-semibold text-[color:var(--brand-navy)]">
              Open rate and click rate
            </h2>
            <p className="mt-2 text-sm text-slate-800">
              Not measured, and not a gap in the instrumentation.
            </p>
            {report.data && (
              <p className="mt-1 text-sm text-slate-700">{report.data.tracking_note}</p>
            )}
            <p className="mt-2 text-xs text-slate-600">
              “Delivered” means the mail server accepted the message, not that
              it reached an inbox. Nothing short of a bounce or a complaint
              tells us that.
            </p>
          </div>

          {report.data && Object.keys(report.data.skipped_by_reason).length > 0 && (
            <div className="panel">
              <h2 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                Skipped, by reason
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                These were in the audience and were deliberately not mailed.
                That is what makes a thin send explainable rather than just
                small.
              </p>
              <dl className="mt-3">
                {Object.entries(report.data.skipped_by_reason).map(([reason, count]) => (
                  <Describe key={reason} term={`${words(reason)} — ${SKIP_REASONS[reason] ?? ""}`}>
                    {count}
                  </Describe>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <div className="panel mb-6">
        <h2 className="text-lg font-bold text-[color:var(--brand-navy)]">Send a proof</h2>
        <p className="mt-1 text-sm text-slate-700">
          One named address. No audience is evaluated and no send row is
          written, so a proof can never consume the once-per-contact slot the
          real send needs. The subject is prefixed with [TEST].
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Address" className="min-w-64 flex-1">
            <Input
              type="email"
              value={testAddress}
              placeholder="you@moonlight.test"
              onChange={(event) => setTestAddress(event.target.value)}
            />
          </Field>
          <Button
            variant="outline"
            disabled={!testAddress.trim()}
            loading={test.isPending}
            onClick={() => test.mutate()}
          >
            Send proof
          </Button>
        </div>
        {testResult && (
          <p
            className={`mt-3 rounded-[0.75rem] border px-3 py-2 text-sm ${
              testResult.sent
                ? "border-green-300 bg-green-50 text-green-900"
                : "border-red-300 bg-red-50 text-red-900"
            }`}
          >
            {testResult.sent
              ? `Handed to the mail server for ${testResult.recipient}.`
              : testResult.error === MAIL_NOT_CONFIGURED
                ? "Not sent: there is no mail server configured, so nothing was attempted. This is not a delivery failure."
                : `Not sent: ${testResult.error}`}
          </p>
        )}
      </div>

      <div className="panel">
        <h2 className="text-lg font-bold text-[color:var(--brand-navy)]">Per-contact outcome</h2>
        <p className="mt-1 text-sm text-slate-700">
          One row per contact the send considered, with why each one was
          skipped or failed.
        </p>
        <div className="mt-4">
          {sends.isError ? (
            <EmptyState
              title="Could not load the send rows"
              description={errorMessage(sends.error)}
              action={<Button onClick={() => sends.refetch()}>Try again</Button>}
            />
          ) : (
            <DataTable
              caption="Per-contact send outcomes for this campaign"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={sends.isLoading}
              density="compact"
              emptyTitle="Nothing has been attempted"
              emptyDescription="Send rows appear once the campaign has been sent."
            />
          )}
        </div>
      </div>

      {data && (
        <EmailCampaignEditor
          open={editing}
          campaign={data}
          saving={save.isPending}
          onClose={() => setEditing(false)}
          onSubmit={(body) => save.mutate(body)}
        />
      )}

      <Modal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        size="lg"
        title="Send this campaign"
        description="This cannot be undone. A message that has left cannot be recalled."
        footer={
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setSendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!data || confirmCode.trim() !== data.code}
              loading={send.isPending}
              onClick={() => send.mutate()}
            >
              Send to {data?.audience_size ?? 0} contact
              {data?.audience_size === 1 ? "" : "s"}
            </Button>
          </div>
        }
      >
        {data && (
          <div className="grid gap-4">
            <div className="rounded-[0.75rem] border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
              <p className="font-semibold">
                {data.audience_size} contact{data.audience_size === 1 ? "" : "s"} are in this
                audience.
              </p>
              <p className="mt-1">
                Each one that is confirmed and not suppressed is mailed now.
                Everyone else gets a skipped row saying why — they are not
                mailed, but they are counted here.
              </p>
            </div>

            <dl>
              <Describe term="Subject">{data.subject}</Describe>
              <Describe term="Audience">
                {Object.keys(data.audience).length === 0
                  ? "Confirmed subscribers"
                  : JSON.stringify(data.audience)}
              </Describe>
              <Describe term="Approved">{data.is_approved ? "Yes" : "No"}</Describe>
            </dl>

            <Field
              label={`Type the campaign code to confirm: ${data.code}`}
              required
              hint="Typing the code back is what stops the wrong campaign going out from the wrong tab. The API requires it; it is not a formality this screen invented."
            >
              <Input
                value={confirmCode}
                autoComplete="off"
                onChange={(event) => setConfirmCode(event.target.value)}
              />
            </Field>

            {sendResult && (
              <div
                className={`rounded-[0.75rem] border px-3 py-2 text-sm ${
                  sendResult.mail_configured
                    ? "border-green-300 bg-green-50 text-green-900"
                    : "border-red-300 bg-red-50 text-red-900"
                }`}
              >
                {sendResult.mail_configured ? (
                  <p className="font-semibold">
                    {sendResult.sent_now} handed to the mail server,{" "}
                    {sendResult.failed_now} failed, {sendResult.skipped} skipped,{" "}
                    {sendResult.already_handled} already handled by an earlier run.
                  </p>
                ) : (
                  <>
                    <p className="font-semibold">Nothing was sent — mail is not configured.</p>
                    <p className="mt-1">
                      There is no mail server for this deployment to hand a
                      message to, so every recipient is recorded as a failure
                      reading “{MAIL_NOT_CONFIGURED}”. That is the one failure
                      that is safe to retry: running the send again once mail
                      is configured picks up exactly those rows and leaves
                      everything else alone.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
