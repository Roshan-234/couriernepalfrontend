"use client";

/**
 * One data subject request, and everything that can be done to it.
 *
 * The API's rules are mirrored here rather than discovered by hitting them:
 * export and erase answer 409 until identity is verified, erase is
 * super-admin only and wants the reference typed back, an extension can be
 * taken once, and a completed or refused request is closed for good. Each
 * unavailable action is rendered disabled with the reason next to it,
 * because a button that fails is worse than a button that explains itself.
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Drawer,
  Field,
  Input,
  Modal,
  Textarea,
  useToast,
  type BadgeTone,
} from "@/components/kit";
import { Describe, Notice, when } from "@/components/admin/integrations/ScreenHeader";
import { errorMessage } from "@/lib/resources/client";
import {
  CLOSED_STATUSES,
  privacy,
  type DataRequestRow,
  type ErasureReport,
  type ExportResult,
} from "@/lib/resources/privacy";

export const KIND_LABELS: Record<string, string> = {
  access: "Access (Art. 15)",
  rectification: "Rectification (Art. 16)",
  erasure: "Erasure (Art. 17)",
  restriction: "Restriction (Art. 18)",
  portability: "Portability (Art. 20)",
  objection: "Objection (Art. 21)",
};

export const STATUS_TONES: Record<string, BadgeTone> = {
  received: "blue",
  verifying: "amber",
  in_progress: "indigo",
  completed: "green",
  refused: "neutral",
};

export const label = (value: string) =>
  value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/** Closed requests have no deadline left to miss and no actions left to take. */
export function isClosed(request: DataRequestRow): boolean {
  return CLOSED_STATUSES.includes(request.status);
}

/** The deadline in words. Overdue is stated as such, not as a negative number. */
export function deadlineText(request: DataRequestRow): string {
  if (isClosed(request)) return "Closed — no deadline";
  if (!request.deadline) return "No deadline recorded";
  if (request.is_overdue) return `Overdue since ${when(request.deadline)}`;
  const days = request.days_remaining;
  if (days === null) return when(request.deadline);
  if (days === 0) return `Due today, ${when(request.deadline)}`;
  return `${days} day${days === 1 ? "" : "s"} left — due ${when(request.deadline)}`;
}

function ReportList({ title, entries }: { title: string; entries: Record<string, number> }) {
  const rows = Object.entries(entries);
  if (rows.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600">{title}</h4>
      <ul className="mt-1 grid gap-0.5">
        {rows.map(([key, value]) => (
          <li key={key} className="flex justify-between gap-4 text-sm text-slate-800">
            <span>{label(key)}</span>
            <span className="tabular-nums">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface RequestDrawerProps {
  request: DataRequestRow | null;
  onClose: () => void;
  /** Only a super_admin may erase. Anyone else sees why the button is off. */
  canErase: boolean;
  /** Refresh the queue and the overdue count after a change. */
  onChanged: () => Promise<unknown>;
}

export function RequestDrawer({ request, onClose, canErase, onChanged }: RequestDrawerProps) {
  const toast = useToast();

  const [verifyNote, setVerifyNote] = useState("");
  const [extendReason, setExtendReason] = useState("");
  const [outcomeNote, setOutcomeNote] = useState("");
  const [exported, setExported] = useState<ExportResult | null>(null);

  const [eraseOpen, setEraseOpen] = useState(false);
  const [eraseConfirm, setEraseConfirm] = useState("");
  const [eraseNote, setEraseNote] = useState("");
  const [eraseReport, setEraseReport] = useState<ErasureReport | null>(null);

  function close() {
    setVerifyNote("");
    setExtendReason("");
    setOutcomeNote("");
    setExported(null);
    setEraseOpen(false);
    setEraseConfirm("");
    setEraseNote("");
    onClose();
  }

  const fail = (title: string) => (error: unknown) =>
    toast.error(title, { description: errorMessage(error) });

  const verify = useMutation({
    mutationFn: () => privacy.verify(request!.id, verifyNote.trim()),
    onSuccess: async () => {
      setVerifyNote("");
      toast.success("Identity verified", {
        description: "Export and erase are now available for this request.",
      });
      await onChanged();
    },
    onError: fail("Could not record the verification"),
  });

  const extend = useMutation({
    mutationFn: () => privacy.extend(request!.id, extendReason.trim()),
    onSuccess: async () => {
      setExtendReason("");
      toast.success("Extension taken", {
        description: "The reason has to be given to the requester within the first month.",
      });
      await onChanged();
    },
    onError: fail("Could not extend the deadline"),
  });

  const complete = useMutation({
    mutationFn: () => privacy.complete(request!.id, outcomeNote.trim()),
    onSuccess: async () => {
      setOutcomeNote("");
      toast.success("Request completed");
      await onChanged();
    },
    onError: fail("Could not complete the request"),
  });

  const refuse = useMutation({
    mutationFn: () => privacy.refuse(request!.id, outcomeNote.trim()),
    onSuccess: async () => {
      setOutcomeNote("");
      toast.success("Request refused", {
        description: "The grounds, and the right to complain, have to be sent to the requester.",
      });
      await onChanged();
    },
    onError: fail("Could not refuse the request"),
  });

  const exportBundle = useMutation({
    mutationFn: () => privacy.exportBundle(request!.id),
    onSuccess: async (result) => {
      setExported(result);
      toast.success("Bundle written to the server", {
        description: "It is a file on disk; it was deliberately not returned to the browser.",
      });
      await onChanged();
    },
    onError: fail("Could not write the export"),
  });

  const erase = useMutation({
    mutationFn: () => privacy.erase(request!.id, eraseConfirm.trim(), eraseNote.trim()),
    onSuccess: async (result) => {
      setEraseOpen(false);
      setEraseConfirm("");
      setEraseNote("");
      setEraseReport(result.report);
      toast.success("Subject erased", { description: "The request is now completed." });
      await onChanged();
    },
    onError: fail("Could not erase the subject"),
  });

  const busy =
    verify.isPending ||
    extend.isPending ||
    complete.isPending ||
    refuse.isPending ||
    exportBundle.isPending ||
    erase.isPending;

  const closed = request ? isClosed(request) : false;
  const verified = request?.identity_verified ?? false;

  return (
    <>
      <Drawer
        open={request !== null}
        onClose={close}
        size="lg"
        title={request ? request.reference : "Request"}
        description={request ? KIND_LABELS[request.kind] ?? label(request.kind) : undefined}
      >
        {request && (
          <div className="space-y-5">
            {request.is_overdue && (
              <Notice tone="warning" title="This request is past its statutory deadline">
                Art. 12(3) gives one month. Missing it is the infringement in itself, whatever the
                eventual answer, so this one needs closing today rather than queuing.
              </Notice>
            )}

            {closed && (
              <Notice title={`This request is ${request.status}`}>
                Closed on {when(request.completed_at)}. It cannot be reopened, extended or closed
                again, so those actions are not offered.
              </Notice>
            )}

            <dl>
              <Describe term="Status">
                <Badge tone={STATUS_TONES[request.status] ?? "neutral"} variant="soft" dot>
                  {label(request.status)}
                </Badge>
              </Describe>
              <Describe term="Right claimed">{KIND_LABELS[request.kind] ?? label(request.kind)}</Describe>
              <Describe term="Email">{request.email}</Describe>
              <Describe term="Account">
                {request.user_id ? `User #${request.user_id}` : "No matching account"}
              </Describe>
              <Describe term="Filed">{when(request.created_at)}</Describe>
              <Describe term="Deadline">{deadlineText(request)}</Describe>
              <Describe term="Extended until">
                {request.extended_until ? when(request.extended_until) : "Not extended"}
              </Describe>
              <Describe term="Identity">
                {verified ? (
                  <Badge tone="green" variant="soft">
                    Verified {when(request.identity_verified_at)}
                  </Badge>
                ) : (
                  <Badge tone="amber" variant="soft">
                    Not verified
                  </Badge>
                )}
              </Describe>
            </dl>

            {request.details && (
              <section>
                <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                  What they asked for
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{request.details}</p>
              </section>
            )}

            {request.outcome_note && (
              <section>
                <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">Outcome</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                  {request.outcome_note}
                </p>
              </section>
            )}

            {!verified && !closed && (
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                  Verify the requester&apos;s identity
                </h3>
                <p className="mt-1 text-sm text-slate-700">
                  Nothing is exported or erased before this. Say <em>how</em> identity was
                  established — which document was seen, which account the request came from, which
                  number was called back. This is the field a regulator reads.
                </p>
                <div className="mt-3 grid gap-3">
                  <Field label="Verification note" required>
                    <Textarea
                      rows={3}
                      value={verifyNote}
                      onChange={(event) => setVerifyNote(event.target.value)}
                      placeholder="Called back on the number held for the account and confirmed the last two shipments."
                    />
                  </Field>
                  <div>
                    <Button
                      type="button"
                      onClick={() => verify.mutate()}
                      disabled={verifyNote.trim() === "" || busy}
                      loading={verify.isPending}
                      loadingLabel="Recording"
                    >
                      Record verification
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {!closed && (
              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                  Answer the request
                </h3>
                <p className="mt-1 text-sm text-slate-700">
                  A note is required either way: a completion says what was done, and a refusal has
                  to give grounds, because Art. 12(4) means it will be written into a letter.
                </p>
                <div className="mt-3 grid gap-3">
                  <Field label="Outcome note" required>
                    <Textarea
                      rows={3}
                      value={outcomeNote}
                      onChange={(event) => setOutcomeNote(event.target.value)}
                      placeholder="Sent the export by encrypted link on 4 November; the subject confirmed receipt."
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => complete.mutate()}
                      disabled={outcomeNote.trim() === "" || busy}
                      loading={complete.isPending}
                      loadingLabel="Completing"
                    >
                      Complete
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => refuse.mutate()}
                      disabled={outcomeNote.trim() === "" || busy}
                      loading={refuse.isPending}
                      loadingLabel="Refusing"
                    >
                      Refuse
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {!closed && (
              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                  Extend by two months
                </h3>
                {request.extended_until ? (
                  <p className="mt-1 text-sm text-slate-700">
                    Already extended to {when(request.extended_until)}. The API allows one
                    extension, so there is nothing further to take. The reason given is held on
                    the record but is not returned to this screen.
                  </p>
                ) : (
                  <div className="mt-2 grid gap-3">
                    <p className="text-sm text-slate-700">
                      Art. 12(3) allows two further months where the request is complex. The
                      requester has to be told within the first month, with the reason — so the
                      reason is required here and is the text that gets sent.
                    </p>
                    <Field label="Reason for the extension" required>
                      <Input
                        value={extendReason}
                        onChange={(event) => setExtendReason(event.target.value)}
                        placeholder="Three years of archived shipments have to be retrieved from cold storage."
                      />
                    </Field>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => extend.mutate()}
                        disabled={extendReason.trim() === "" || busy}
                        loading={extend.isPending}
                        loadingLabel="Extending"
                      >
                        Take the extension
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                Export the subject&apos;s bundle
              </h3>
              <p className="mt-1 text-sm text-slate-700">
                The bundle is written to a file on the server at 0600 and never returned to the
                browser: a complete copy of one person&apos;s record is the most sensitive object
                this system can make, and an API response lands in access logs, proxy buffers and
                browser history. Deliver it by whatever channel the identity check established.
              </p>
              {!verified && (
                <p className="mt-2 text-sm font-semibold text-amber-800">
                  Unavailable until identity is verified — the API answers 409.
                </p>
              )}
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => exportBundle.mutate()}
                  disabled={!verified || busy}
                  loading={exportBundle.isPending}
                  loadingLabel="Writing"
                >
                  Write export to the server
                </Button>
              </div>
              {exported && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    File on the server
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-800">
                    {exported.export_path}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Sections: {exported.sections.join(", ")}.
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    There is nothing to download here. The file is on the application server, not in
                    this browser.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-red-200 bg-red-50/60 p-4">
              <h3 className="text-sm font-semibold text-red-900">Erase the subject</h3>
              <p className="mt-1 text-sm text-red-900">
                Irreversible, and not a delete button: some records are anonymised and kept, some
                are deleted, and some are retained in full because tax law and carriage liability
                require it. The confirmation step lists which is which.
              </p>
              {!canErase && (
                <p className="mt-2 text-sm font-semibold text-red-900">
                  Only a super_admin may erase. Ask one to do it.
                </p>
              )}
              {canErase && !verified && (
                <p className="mt-2 text-sm font-semibold text-red-900">
                  Unavailable until identity is verified — the API answers 409.
                </p>
              )}
              <div className="mt-3">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setEraseOpen(true)}
                  disabled={!canErase || !verified || busy}
                >
                  Erase this subject…
                </Button>
              </div>
            </section>
          </div>
        )}
      </Drawer>

      {/* ── Erase confirmation ──────────────────────────────────────────── */}
      <Modal
        open={eraseOpen && request !== null}
        onClose={() => setEraseOpen(false)}
        size="lg"
        title="Erase this subject?"
        description={request ? `Request ${request.reference} — ${request.email}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setEraseOpen(false)} disabled={erase.isPending}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => erase.mutate()}
              disabled={
                !request ||
                eraseConfirm.trim() !== request.reference ||
                eraseNote.trim() === "" ||
                erase.isPending
              }
              loading={erase.isPending}
              loadingLabel="Erasing"
            >
              Erase permanently
            </Button>
          </>
        }
      >
        {request && (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">This does not delete everything, and cannot.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <strong>Anonymised and kept:</strong> the account row (email, username and name
                  replaced, login disabled), the sender details on their shipments, and their
                  consent records, which are unlinked from the account but kept as evidence.
                </li>
                <li>
                  <strong>Kept in full:</strong> invoices, because an anonymised tax record is not a
                  tax record; the marketing contact, stripped to a suppression record so the next
                  import does not mail them again; and the data request itself, as proof it was
                  answered in time.
                </li>
                <li>
                  <strong>Deleted outright:</strong> sessions and saved addresses.
                </li>
                <li>
                  The <strong>recipients</strong> of their shipments are not touched. Those are
                  another person&apos;s details and not this subject&apos;s to erase.
                </li>
              </ul>
            </div>

            <Field
              label="Type the request reference to confirm"
              required
              hint={`Exactly: ${request.reference}`}
            >
              <Input
                value={eraseConfirm}
                onChange={(event) => setEraseConfirm(event.target.value)}
                placeholder={request.reference}
                autoComplete="off"
                spellCheck={false}
              />
            </Field>

            <Field label="Note for the record" required hint="What was decided, and on whose authority.">
              <Textarea
                rows={3}
                value={eraseNote}
                onChange={(event) => setEraseNote(event.target.value)}
                placeholder="Erasure approved by the data protection lead after the identity check on 4 November."
              />
            </Field>
          </div>
        )}
      </Modal>

      {/* ── What the erasure actually did ───────────────────────────────── */}
      <Modal
        open={eraseReport !== null}
        onClose={() => setEraseReport(null)}
        size="lg"
        title="Erasure report"
        description="The server's own account of what it changed, deleted and kept."
        footer={<Button onClick={() => setEraseReport(null)}>Close</Button>}
      >
        {eraseReport && (
          <div className="space-y-4">
            <dl>
              <Describe term="Subject">{eraseReport.subject_email}</Describe>
              <Describe term="Account">
                {eraseReport.user_id ? `User #${eraseReport.user_id}` : "No account matched"}
              </Describe>
            </dl>
            <div className="grid gap-4 sm:grid-cols-3">
              <ReportList title="Anonymised" entries={eraseReport.anonymised} />
              <ReportList title="Deleted" entries={eraseReport.deleted} />
              <ReportList title="Retained" entries={eraseReport.retained} />
            </div>
            {eraseReport.notes.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Why, in the server&apos;s words
                </h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-800">
                  {eraseReport.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
