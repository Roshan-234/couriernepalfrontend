"use client";

/**
 * The marketing contact list.
 *
 * The absent button is the important part of this screen. There is no "add
 * subscriber" anywhere, because the API has no endpoint that can create
 * one: a subscription only becomes live when the person confirms it from
 * their own inbox, and the import endpoint writes `pending` rows whatever
 * is claimed about where the list came from. Rather than leave somebody
 * hunting for the button, the panel at the top says it is missing and why.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  EmptyState,
  Field,
  Input,
  Modal,
  Pagination,
  Select,
  Skeleton,
  StatCard,
  Textarea,
  useToast,
  type DataTableColumn,
  DataTable,
} from "@/components/kit";
import { Describe, Notice, ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { at } from "@/components/admin/marketing/shared";
import {
  CONTACT_STATUSES,
  marketingContacts,
  type ContactStatus,
  type ImportResult,
  type MarketingContact,
} from "@/lib/resources/marketing";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const STATUS_TONES: Record<ContactStatus, "amber" | "green" | "neutral" | "orange" | "red"> = {
  pending: "amber",
  subscribed: "green",
  unsubscribed: "neutral",
  bounced: "orange",
  complained: "red",
};

const STATUS_MEANS: Record<ContactStatus, string> = {
  pending: "Asked to subscribe but has not confirmed from their inbox. Cannot be mailed.",
  subscribed: "Confirmed. The only state a campaign mails.",
  unsubscribed: "Opted out. Kept as a suppression record so an import cannot re-add them.",
  bounced: "Mail to this address failed. Not mailed again.",
  complained: "Marked a mailing as spam. Not mailed, and not sent a confirmation either.",
};

export default function Page() {
  const cache = useQueryClient();
  const { success, error: errorToast } = useToast();

  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");
  const [country, setCountry] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);

  const [openId, setOpenId] = useState<number | null>(null);
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState<"en" | "ne">("en");
  const [name, setName] = useState("");
  const [suppressing, setSuppressing] = useState(false);
  const [suppressReason, setSuppressReason] = useState("");
  const [complained, setComplained] = useState(false);

  const [importing, setImporting] = useState(false);
  const [importAddresses, setImportAddresses] = useState("");
  const [importSource, setImportSource] = useState("");
  const [importConsent, setImportConsent] = useState("");
  const [importConfirmMail, setImportConfirmMail] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const filters = useMemo(
    () => ({
      status,
      tag: tag.trim(),
      country: country.trim().toUpperCase(),
      q: term.trim(),
      page,
      per_page: 20,
    }),
    [status, tag, country, term, page],
  );

  const list = useQuery({
    queryKey: queryKeys.marketing.contacts(filters),
    queryFn: () => marketingContacts.list(filters),
  });

  const detail = useQuery({
    queryKey: queryKeys.marketing.contact(openId ?? 0),
    queryFn: () => marketingContacts.get(openId!),
    enabled: openId !== null,
  });

  async function refresh() {
    await cache.invalidateQueries({ queryKey: queryKeys.marketing.all });
  }

  const saveContact = useMutation({
    mutationFn: () =>
      marketingContacts.update(openId!, {
        tags: tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        language,
        name: name.trim() || null,
      }),
    onSuccess: async () => {
      await refresh();
      success("Contact updated.");
    },
    onError: (err) =>
      errorToast("Could not update the contact.", { description: errorMessage(err) }),
  });

  const suppress = useMutation({
    mutationFn: () =>
      marketingContacts.suppress(openId!, {
        reason: suppressReason.trim() || undefined,
        complained,
      }),
    onSuccess: async () => {
      await refresh();
      success("Suppression recorded.");
      setSuppressing(false);
      setSuppressReason("");
      setComplained(false);
    },
    onError: (err) =>
      errorToast("Could not record the suppression.", { description: errorMessage(err) }),
  });

  const runImport = useMutation({
    mutationFn: () =>
      marketingContacts.import({
        contacts: importAddresses
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [email, ...rest] = line.split(",").map((part) => part.trim());
            return rest.length ? { email, name: rest.join(", ") } : { email };
          }),
        source: importSource.trim(),
        consent_text: importConsent.trim(),
        send_confirmation: importConfirmMail,
      }),
    onSuccess: async (result) => {
      await refresh();
      setImportResult(result);
      success(`${result.created} contact${result.created === 1 ? "" : "s"} imported as pending.`);
    },
    onError: (err) => errorToast("The import was refused.", { description: errorMessage(err) }),
  });

  const contact = detail.data ?? null;
  const rows = list.data?.items ?? [];
  const mailable = rows.filter((row) => row.is_mailable).length;
  const pending = rows.filter((row) => row.status === "pending").length;

  const importCount = importAddresses
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;

  const columns: DataTableColumn<MarketingContact>[] = [
    {
      id: "contact",
      header: "Contact",
      primary: true,
      sortable: true,
      sortValue: (row) => row.email,
      cell: (row) => (
        <div>
          <p className="font-semibold text-[color:var(--brand-navy)]">{row.email}</p>
          <p className="text-xs text-slate-600">
            {row.name || "No name"} · {row.language.toUpperCase()}
            {row.country ? ` · ${row.country}` : ""}
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
          {row.is_mailable ? (
            <p className="text-xs text-slate-600">Mailable</p>
          ) : (
            <p className="text-xs text-slate-600">Not mailable</p>
          )}
        </div>
      ),
    },
    {
      id: "tags",
      header: "Tags",
      hideOnMobile: true,
      cell: (row) =>
        row.tags.length ? (
          <div className="flex flex-wrap gap-1">
            {row.tags.map((item) => (
              <Badge key={item} tone="navy" variant="outline" size="sm">
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-600">—</span>
        ),
    },
    {
      id: "confirmed",
      header: "Confirmed",
      hideOnMobile: true,
      cell: (row) => <span className="text-xs text-slate-700">{at(row.confirmed_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setOpenId(row.id);
            setTags(row.tags.join(", "));
            setLanguage(row.language === "ne" ? "ne" : "en");
            setName(row.name ?? "");
            setSuppressing(false);
            setSuppressReason("");
            setComplained(false);
          }}
        >
          Open
        </Button>
      ),
    },
  ];

  return (
    <>
      <ScreenHeader
        eyebrow="Marketing"
        title="Email contacts"
        description="People who asked to hear from the company, and the evidence that they asked."
        actions={
          <>
            <Link href="/admin/marketing/campaigns" className="action action-outline">
              Email campaigns
            </Link>
            <Button
              onClick={() => {
                setImportResult(null);
                setImporting(true);
              }}
            >
              Import addresses
            </Button>
          </>
        }
      />

      <Notice tone="info" title="There is no “add subscriber” button, deliberately" className="mb-6">
        Nothing in this admin area can create a subscribed contact — not even
        a super admin. A subscription is only consent if the person confirmed
        it from their own mailbox, so the only way in is the public sign-up
        form or an import, and an import writes <strong>pending</strong> rows
        that stay unmailable until each person clicks the link sent to them.
        Importing a bought or inherited list and treating it as subscribed is
        the breach this makes impossible.
      </Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Contacts"
          value={list.data?.total ?? 0}
          hint="Matching the current filters"
          loading={list.isLoading}
        />
        <StatCard
          label="Mailable on this page"
          value={mailable}
          hint="Confirmed, not suppressed"
          loading={list.isLoading}
        />
        <StatCard
          label="Awaiting confirmation"
          value={pending}
          hint="Pending; cannot be mailed a campaign"
          loading={list.isLoading}
        />
      </div>

      <div className="panel">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Status">
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any status" },
                ...CONTACT_STATUSES.map((value) => ({ value, label: value })),
              ]}
            />
          </Field>
          <Field label="Tag" hint="Exact tag, not a substring.">
            <Input
              value={tag}
              placeholder="Any tag"
              onChange={(event) => {
                setTag(event.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="Country" hint="Two-letter code.">
            <Input
              value={country}
              maxLength={2}
              placeholder="Any"
              onChange={(event) => {
                setCountry(event.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="Search" hint="Email or name.">
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
            title="Could not load contacts"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : (
          <>
            <DataTable
              caption="Marketing contacts with their subscription status and tags"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={list.isLoading}
              mobileTitle={(row) => row.email}
              emptyTitle="No contacts match"
              emptyDescription="Clear a filter. An empty list overall is the expected state until somebody subscribes from the public site."
            />
            {(list.data?.pages ?? 1) > 1 && (
              <div className="mt-4">
                <Pagination
                  page={list.data?.page ?? 1}
                  pageCount={list.data?.pages ?? 1}
                  totalItems={list.data?.total}
                  pageSize={list.data?.per_page}
                  onPageChange={setPage}
                  label="Contact pages"
                />
              </div>
            )}
          </>
        )}
      </div>

      <Drawer
        open={openId !== null}
        onClose={() => setOpenId(null)}
        size="lg"
        title={contact?.email ?? "Contact"}
        description={contact ? STATUS_MEANS[contact.status] : undefined}
        footer={
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setOpenId(null)}>
              Close
            </Button>
            <Button onClick={() => saveContact.mutate()} loading={saveContact.isPending}>
              Save tags and language
            </Button>
          </div>
        }
      >
        {detail.isLoading || !contact ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="grid gap-7">
            <section className="grid gap-4">
              <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                What can be changed
              </h3>
              <p className="rounded-[0.75rem] border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                Tags, language and name, and nothing else. The address is the
                identity of the consent record, and the status moves only by
                the person confirming or by a suppression — the API answers
                403 to either sent from here.
              </p>
              <Field label="Name" showOptional>
                <Input value={name} maxLength={150} onChange={(event) => setName(event.target.value)} />
              </Field>
              <Field label="Tags" hint="Comma separated — merchant, diaspora-uk, student.">
                <Input value={tags} onChange={(event) => setTags(event.target.value)} />
              </Field>
              <Field label="Language">
                <Select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value === "ne" ? "ne" : "en")}
                  options={[
                    { value: "en", label: "English" },
                    { value: "ne", label: "Nepali" },
                  ]}
                />
              </Field>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
                Evidence of consent
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                The view to open when somebody asks why they are being emailed.
              </p>
              <dl className="mt-3">
                <Describe term="Status">
                  <Badge tone={STATUS_TONES[contact.status]} variant="soft">
                    {contact.status}
                  </Badge>
                </Describe>
                <Describe term="Mailable">{contact.is_mailable ? "Yes" : "No"}</Describe>
                <Describe term="Source">{contact.source || "—"}</Describe>
                <Describe term="Wording shown">{contact.consent_text || "—"}</Describe>
                <Describe term="Confirmation sent">{at(contact.confirm_sent_at)}</Describe>
                <Describe term="Confirmed">{at(contact.confirmed_at)}</Describe>
                <Describe term="Sign-up IP hash">
                  <code className="text-xs break-all">{contact.signup_ip_hash || "—"}</code>
                </Describe>
                <Describe term="Confirm IP hash">
                  <code className="text-xs break-all">{contact.confirm_ip_hash || "—"}</code>
                </Describe>
                <Describe term="Unsubscribed">{at(contact.unsubscribed_at)}</Describe>
                <Describe term="Unsubscribe reason">{contact.unsubscribe_reason || "—"}</Describe>
                <Describe term="Bounces">{contact.bounce_count}</Describe>
                <Describe term="Last mailed">{at(contact.last_sent_at)}</Describe>
              </dl>
            </section>

            <section className="rounded-[0.75rem] border border-amber-300 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Suppress</h3>
              <p className="mt-1 text-xs text-amber-900">
                For an objection that arrived off-channel — by reply, by phone,
                at a counter. It writes the same suppression record the
                one-click unsubscribe link does, which is what stops the next
                import quietly re-adding them.
              </p>
              {suppressing ? (
                <div className="mt-3 grid gap-3">
                  <Field label="Reason" hint="Free text, and worth filling in.">
                    <Input
                      value={suppressReason}
                      maxLength={200}
                      placeholder="Asked by phone to be taken off the list"
                      onChange={(event) => setSuppressReason(event.target.value)}
                    />
                  </Field>
                  <Checkbox
                    label="They complained about spam"
                    hint="Stronger than an unsubscribe: it also bars the confirmation mail that would otherwise let them back in."
                    checked={complained}
                    onChange={(event) => setComplained(event.target.checked)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="danger"
                      onClick={() => suppress.mutate()}
                      loading={suppress.isPending}
                    >
                      Record suppression
                    </Button>
                    <Button variant="outline" onClick={() => setSuppressing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="mt-3" onClick={() => setSuppressing(true)}>
                  Suppress this contact
                </Button>
              )}
            </section>
          </div>
        )}
      </Drawer>

      <Modal
        open={importing}
        onClose={() => setImporting(false)}
        size="lg"
        title="Import addresses as pending contacts"
        description="Every row lands as pending and is unmailable until the person confirms."
        footer={
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setImporting(false)}>
              Close
            </Button>
            <Button
              onClick={() => runImport.mutate()}
              loading={runImport.isPending}
              disabled={!importCount || !importSource.trim() || !importConsent.trim()}
            >
              Import {importCount || ""} as pending
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Field
            label="Addresses"
            required
            hint="One per line. Add a name after a comma if you have one: ram@example.com, Ram Thapa. At most 1000 per import."
          >
            <Textarea
              rows={6}
              value={importAddresses}
              onChange={(event) => setImportAddresses(event.target.value)}
            />
          </Field>
          <Field
            label="Where this list came from"
            required
            hint="Stored on every row. If the consent claim turns out to be false, this is what scopes the damage to exactly these addresses."
          >
            <Input
              value={importSource}
              maxLength={60}
              placeholder="counter-signups-dashain-2026"
              onChange={(event) => setImportSource(event.target.value)}
            />
          </Field>
          <Field
            label="The wording they agreed to"
            required
            hint="The exact consent text the list is claimed to carry."
          >
            <Textarea
              rows={3}
              value={importConsent}
              maxLength={400}
              onChange={(event) => setImportConsent(event.target.value)}
            />
          </Field>
          <Checkbox
            label="Email each new contact a confirmation link now"
            hint="This sends a bulk message to people who have not asked for one. Only do it for a list whose consent claim is real and recent."
            checked={importConfirmMail}
            onChange={(event) => setImportConfirmMail(event.target.checked)}
          />

          {importResult && (
            <div className="rounded-[0.75rem] border border-teal-200 bg-teal-50/70 px-3 py-2 text-sm text-teal-900">
              <p className="font-semibold">
                {importResult.created} created, {importResult.skipped_existing} already on file
                {importResult.invalid.length ? `, ${importResult.invalid.length} invalid` : ""}.
              </p>
              <p className="mt-1 text-xs">{importResult.note}</p>
              {importResult.invalid.length > 0 && (
                <p className="mt-1 text-xs">
                  Rejected: {importResult.invalid.join(", ")}
                </p>
              )}
              {!importResult.confirmation_sent && importResult.created > 0 && (
                <p className="mt-1 text-xs">
                  No confirmation was sent, so these rows will stay pending until
                  somebody confirms by another route.
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-slate-600">
            An address already on file is left exactly as it is: an import never
            resurrects a suppressed address and never resets a confirmation
            already in flight.
          </p>
        </div>
      </Modal>
    </>
  );
}
