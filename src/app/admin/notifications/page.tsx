"use client";

/**
 * Notification templates, SMS providers and the send log.
 *
 * The Nepali body is edited beside the English one so a translator can see
 * both at once. Neither Inter nor Plus Jakarta Sans covers Devanagari, so the
 * `ne` textarea carries its own font stack rather than falling back to
 * whatever the browser picks for an unmapped script.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  Input,
  Pagination,
  Select,
  Tabs,
  Textarea,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { JsonMapField, readStringMap, toJsonText } from "@/components/admin/integrations/JsonMapField";
import { Describe, Notice, ScreenHeader, when } from "@/components/admin/integrations/ScreenHeader";
import {
  applySecret,
  KEEP_SECRET,
  SecretField,
  type SecretState,
} from "@/components/admin/integrations/SecretField";
import {
  notifications,
  type NotificationLogRow,
  type SmsProvider,
} from "@/lib/resources/integrations";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { NotificationTemplate } from "@/types/logistics";

/** Mirrors `NotificationTemplate.EVENTS` on the backend model. */
const EVENTS = [
  "shipment.created",
  "shipment.picked_up",
  "shipment.in_transit",
  "shipment.out_for_delivery",
  "shipment.delivered",
  "shipment.delivery_failed",
  "shipment.returned",
  "pickup.scheduled",
  "pickup.completed",
  "cod.collected",
  "cod.remitted",
  "payment.succeeded",
  "payment.failed",
  "delivery.otp",
  "account.password_reset",
  "account.welcome",
] as const;

const CHANNELS: NotificationTemplate["channel"][] = ["email", "sms", "push", "whatsapp"];

/**
 * Placeholders usually carried by each event's payload. Offered as a starting
 * point for a new template; the authoritative list for a saved template is
 * its own `variables` column, which is what preview reports on.
 */
const SUGGESTED_VARIABLES: Record<string, string[]> = {
  "shipment.created": ["tracking_number", "receiver_name", "origin", "destination"],
  "shipment.picked_up": ["tracking_number", "rider_name", "picked_up_at"],
  "shipment.in_transit": ["tracking_number", "location"],
  "shipment.out_for_delivery": ["tracking_number", "rider_name", "rider_phone"],
  "shipment.delivered": ["tracking_number", "delivered_at", "receiver_name"],
  "shipment.delivery_failed": ["tracking_number", "reason", "next_attempt_at"],
  "shipment.returned": ["tracking_number", "reason"],
  "pickup.scheduled": ["pickup_no", "slot", "pickup_date"],
  "pickup.completed": ["pickup_no", "parcel_count"],
  "cod.collected": ["tracking_number", "amount", "currency"],
  "cod.remitted": ["remittance_no", "amount", "currency"],
  "payment.succeeded": ["amount", "currency", "reference"],
  "payment.failed": ["amount", "currency", "reason"],
  "delivery.otp": ["otp", "tracking_number"],
  "account.password_reset": ["first_name", "reset_link"],
  "account.welcome": ["first_name"],
};

/** Inter and Plus Jakarta Sans have no Devanagari coverage. */
const DEVANAGARI_STACK =
  '"Noto Sans Devanagari", "Noto Serif Devanagari", "Nirmala UI", "Mangal", "Kalimati", "Lohit Devanagari", sans-serif';

type PreviewResult = {
  subject: string;
  body: string;
  unfilled_variables?: string[];
};

interface TemplateForm {
  code: string;
  name: string;
  event: string;
  channel: NotificationTemplate["channel"];
  subject: string;
  body_en: string;
  body_ne: string;
  variables: string;
  is_active: boolean;
  send_to_sender: boolean;
  send_to_receiver: boolean;
}

function blankTemplate(): TemplateForm {
  return {
    code: "",
    name: "",
    event: EVENTS[0],
    channel: "email",
    subject: "",
    body_en: "",
    body_ne: "",
    variables: "",
    is_active: true,
    send_to_sender: false,
    send_to_receiver: true,
  };
}

function templateForm(template: NotificationTemplate): TemplateForm {
  return {
    code: template.code,
    name: template.name,
    event: template.event,
    channel: template.channel,
    subject: template.subject ?? "",
    body_en: template.body_en ?? "",
    body_ne: template.body_ne ?? "",
    variables: (template.variables ?? []).join(", "),
    is_active: template.is_active,
    send_to_sender: template.send_to_sender,
    send_to_receiver: template.send_to_receiver,
  };
}

interface ProviderForm {
  name: string;
  sender_id: string;
  api_base_url: string;
  send_endpoint: string;
  param_map: string;
  is_active: boolean;
  is_primary: boolean;
  is_sandbox: boolean;
}

function providerForm(provider: SmsProvider): ProviderForm {
  return {
    name: provider.name,
    sender_id: provider.sender_id ?? "",
    api_base_url: provider.api_base_url ?? "",
    send_endpoint: provider.send_endpoint ?? "",
    param_map: toJsonText(provider.param_map),
    is_active: provider.is_active,
    is_primary: provider.is_primary,
    is_sandbox: Boolean(provider.is_sandbox),
  };
}

export default function Page() {
  const cache = useQueryClient();
  const { success, error: errorToast } = useToast();

  const [tab, setTab] = useState("templates");

  // Templates
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(blankTemplate);
  const [removing, setRemoving] = useState<NotificationTemplate | null>(null);
  const [preview, setPreview] = useState<{ en?: PreviewResult; ne?: PreviewResult } | null>(null);

  // Providers
  const [providerOpen, setProviderOpen] = useState(false);
  const [providerCode, setProviderCode] = useState<string | null>(null);
  const [provider, setProvider] = useState<ProviderForm | null>(null);
  const [providerToken, setProviderToken] = useState<SecretState>(KEEP_SECRET);
  const [providerSecret, setProviderSecret] = useState<SecretState>(KEEP_SECRET);

  // Logs
  const [logChannel, setLogChannel] = useState("");
  const [logStatus, setLogStatus] = useState("");
  const [logPage, setLogPage] = useState(1);

  const templates = useQuery({
    queryKey: queryKeys.notifications.templates,
    queryFn: () => notifications.templates(),
  });

  const providers = useQuery({
    queryKey: queryKeys.notifications.smsProviders,
    queryFn: () => notifications.providers(),
  });

  const logFilters = useMemo(
    () => ({ channel: logChannel, status: logStatus, page: logPage, per_page: 20 }),
    [logChannel, logStatus, logPage],
  );

  const logs = useQuery({
    queryKey: queryKeys.notifications.logs(logFilters),
    queryFn: () => notifications.logs(logFilters),
  });

  const selectedProvider = useMemo(
    () => (providers.data ?? []).find((row) => row.code === providerCode) ?? null,
    [providers.data, providerCode],
  );

  function openTemplate(template: NotificationTemplate | null) {
    setEditingCode(template?.code ?? null);
    setForm(template ? templateForm(template) : blankTemplate());
    setPreview(null);
    setEditorOpen(true);
  }

  function openProvider(row: SmsProvider) {
    setProviderCode(row.code);
    setProvider(providerForm(row));
    setProviderToken(KEEP_SECRET);
    setProviderSecret(KEEP_SECRET);
    setProviderOpen(true);
  }

  const saveTemplate = useMutation({
    mutationFn: () => {
      const body = {
        name: form.name.trim(),
        event: form.event,
        channel: form.channel,
        subject: form.subject.trim(),
        body_en: form.body_en,
        body_ne: form.body_ne,
        variables: form.variables
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        is_active: form.is_active,
        send_to_sender: form.send_to_sender,
        send_to_receiver: form.send_to_receiver,
      };
      if (editingCode) return notifications.updateTemplate(editingCode, body);
      return notifications.createTemplate({ ...body, code: form.code.trim() });
    },
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.notifications.templates });
      success("Template saved.");
      setEditorOpen(false);
    },
    onError: (err) => errorToast("Could not save the template.", { description: errorMessage(err) }),
  });

  const removeTemplate = useMutation({
    mutationFn: (code: string) => notifications.removeTemplate(code),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.notifications.templates });
      success("Template deleted.");
      setRemoving(null);
    },
    onError: (err) =>
      errorToast("Could not delete the template.", { description: errorMessage(err) }),
  });

  const runPreview = useMutation({
    mutationFn: async (code: string) => {
      const [en, ne] = await Promise.all([
        notifications.preview(code, { language: "en" }) as Promise<PreviewResult>,
        notifications.preview(code, { language: "ne" }) as Promise<PreviewResult>,
      ]);
      return { en, ne };
    },
    onSuccess: (result) => setPreview(result),
    onError: (err) => errorToast("Could not render a preview.", { description: errorMessage(err) }),
  });

  const saveProvider = useMutation({
    mutationFn: () => {
      const map = readStringMap(provider?.param_map ?? "");
      if (!map.ok) throw new Error(`Parameter map: ${map.error}`);
      const body: Record<string, unknown> = {
        name: provider!.name.trim(),
        sender_id: provider!.sender_id.trim(),
        api_base_url: provider!.api_base_url.trim(),
        send_endpoint: provider!.send_endpoint.trim(),
        param_map: map.value,
        is_active: provider!.is_active,
        is_primary: provider!.is_primary,
        is_sandbox: provider!.is_sandbox,
      };
      applySecret(body, "token", providerToken);
      applySecret(body, "secret", providerSecret);
      return notifications.updateProvider(providerCode!, body as Partial<SmsProvider>);
    },
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.notifications.smsProviders });
      success("Provider saved.");
      setProviderOpen(false);
    },
    onError: (err) =>
      errorToast("Could not save the provider.", {
        description: err instanceof Error ? err.message : errorMessage(err),
      }),
  });

  const templateColumns: DataTableColumn<NotificationTemplate>[] = [
    {
      id: "template",
      header: "Template",
      primary: true,
      sortable: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div>
          <p className="font-semibold text-[color:var(--brand-navy)]">{row.name}</p>
          <code className="text-xs text-slate-600">{row.code}</code>
        </div>
      ),
    },
    {
      id: "event",
      header: "Event",
      cell: (row) => <code className="text-xs text-slate-700">{row.event}</code>,
    },
    {
      id: "channel",
      header: "Channel",
      cell: (row) => (
        <Badge tone="teal" variant="soft">
          {row.channel}
        </Badge>
      ),
    },
    {
      id: "languages",
      header: "Bodies",
      cell: (row) => (
        <span className="text-sm text-slate-800">
          {[row.body_en ? "EN" : null, row.body_ne ? "ने" : null].filter(Boolean).join(" + ") ||
            "None"}
        </span>
      ),
    },
    {
      id: "active",
      header: "Active",
      cell: (row) =>
        row.is_active ? (
          <Badge tone="green" variant="soft">
            Active
          </Badge>
        ) : (
          <Badge tone="neutral" variant="soft">
            Off
          </Badge>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => openTemplate(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setRemoving(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const providerColumns: DataTableColumn<SmsProvider>[] = [
    {
      id: "provider",
      header: "Provider",
      primary: true,
      cell: (row) => (
        <div>
          <p className="font-semibold text-[color:var(--brand-navy)]">{row.name}</p>
          <code className="text-xs text-slate-600">{row.code}</code>
        </div>
      ),
    },
    {
      id: "sender",
      header: "Sender id",
      cell: (row) => <span className="text-sm text-slate-800">{row.sender_id || "—"}</span>,
    },
    {
      id: "configured",
      header: "Credentials",
      cell: (row) =>
        row.is_configured ? (
          <Badge tone="green" variant="soft">
            Configured
          </Badge>
        ) : (
          <Badge tone="orange" variant="soft">
            Missing
          </Badge>
        ),
    },
    {
      id: "primary",
      header: "Role",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.is_primary && (
            <Badge tone="navy" variant="soft">
              Primary
            </Badge>
          )}
          <Badge tone={row.is_active ? "teal" : "neutral"} variant="soft">
            {row.is_active ? "Active" : "Off"}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => openProvider(row)}>
          Edit
        </Button>
      ),
    },
  ];

  const logColumns: DataTableColumn<NotificationLogRow>[] = [
    {
      id: "sent",
      header: "Sent",
      primary: true,
      cell: (row) => <span className="text-sm text-slate-800">{when(row.sent_at)}</span>,
    },
    {
      id: "channel",
      header: "Channel",
      cell: (row) => <code className="text-xs text-slate-700">{row.channel}</code>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge
          tone={
            row.status?.toLowerCase() === "sent"
              ? "green"
              : row.status?.toLowerCase() === "failed"
                ? "red"
                : "neutral"
          }
          variant="soft"
        >
          {row.status || "unknown"}
        </Badge>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: (row) => <span className="text-sm text-slate-800">{row.user_id ?? "—"}</span>,
    },
    {
      id: "payload",
      header: "Payload",
      hideOnMobile: true,
      cell: (row) => (
        <span className="line-clamp-2 block max-w-md text-xs text-slate-700">
          {row.payload || "—"}
        </span>
      ),
    },
  ];

  const suggestions = SUGGESTED_VARIABLES[form.event] ?? [];

  const templatesPane = (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end">
        <Button onClick={() => openTemplate(null)}>New template</Button>
      </div>
      {templates.isError ? (
        <EmptyState
          title="Could not load templates"
          description={errorMessage(templates.error)}
          action={<Button onClick={() => templates.refetch()}>Try again</Button>}
        />
      ) : (
        <DataTable
          caption="Notification templates by event and channel"
          columns={templateColumns}
          rows={templates.data ?? []}
          rowKey={(row) => row.code}
          loading={templates.isLoading}
          emptyTitle="No templates yet"
          emptyDescription="Add a template to control what a customer reads when an event fires."
          emptyAction={<Button onClick={() => openTemplate(null)}>New template</Button>}
        />
      )}
    </div>
  );

  const providersPane = (
    <div className="space-y-4">
      <Notice title="Credentials are stored masked">
        A provider&rsquo;s token and secret come back masked. Leaving them
        alone keeps what is stored; clearing one is an explicit action.
      </Notice>
      {providers.isError ? (
        <EmptyState
          title="Could not load providers"
          description={errorMessage(providers.error)}
          action={<Button onClick={() => providers.refetch()}>Try again</Button>}
        />
      ) : (
        <DataTable
          caption="SMS providers with their credential and primary state"
          columns={providerColumns}
          rows={providers.data ?? []}
          rowKey={(row) => row.code}
          loading={providers.isLoading}
          emptyTitle="No SMS providers"
          emptyDescription="None have been seeded for this environment."
        />
      )}
    </div>
  );

  return (
    <>
      <ScreenHeader
        eyebrow="Integrations"
        title="Notifications"
        description="The words customers receive, the gateway that carries them, and the record of what went out."
      />

      <div className="panel mb-6">
        <Tabs
          label="Notification settings"
          value={tab}
          onValueChange={setTab}
          items={[
            { id: "templates", label: "Templates", content: templatesPane },
            { id: "providers", label: "SMS providers", content: providersPane },
          ]}
        />
      </div>

      <section className="panel">
        <header className="mb-4">
          <h2 className="text-xl font-bold text-[color:var(--brand-navy)]">Send log</h2>
          <p className="mt-1 text-sm text-slate-700">
            Every notification the system has recorded. Channel and status are
            matched exactly as stored — the log predates a fixed vocabulary, so
            values such as <code>EMAIL</code>, <code>SMS</code>,{" "}
            <code>SENT</code> and <code>FAILED</code> are typical.
          </p>
        </header>

        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:max-w-xl">
          <Field label="Channel">
            <Input
              value={logChannel}
              placeholder="Any"
              onChange={(event) => {
                setLogChannel(event.target.value);
                setLogPage(1);
              }}
            />
          </Field>
          <Field label="Status">
            <Input
              value={logStatus}
              placeholder="Any"
              onChange={(event) => {
                setLogStatus(event.target.value);
                setLogPage(1);
              }}
            />
          </Field>
        </div>

        {logs.isError ? (
          <EmptyState
            title="Could not load the send log"
            description={errorMessage(logs.error)}
            action={<Button onClick={() => logs.refetch()}>Try again</Button>}
          />
        ) : (
          <>
            <DataTable
              caption="Notification send log"
              columns={logColumns}
              rows={logs.data?.items ?? []}
              rowKey={(row) => row.id}
              loading={logs.isLoading}
              density="compact"
              emptyTitle="Nothing logged"
              emptyDescription={
                logChannel || logStatus
                  ? "No entries match those filters."
                  : "No notification has been recorded yet."
              }
            />
            {(logs.data?.pages ?? 1) > 1 && (
              <div className="mt-4">
                <Pagination
                  page={logs.data?.page ?? 1}
                  pageCount={logs.data?.pages ?? 1}
                  totalItems={logs.data?.total}
                  pageSize={logs.data?.per_page}
                  onPageChange={setLogPage}
                  label="Send log pages"
                />
              </div>
            )}
          </>
        )}
      </section>

      <Drawer
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        size="lg"
        title={editingCode ? `Edit ${form.name || editingCode}` : "New template"}
        description="English and Nepali bodies are edited side by side."
        footer={
          <div className="flex w-full flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            {editingCode && (
              <Button
                variant="outline"
                loading={runPreview.isPending}
                onClick={() => runPreview.mutate(editingCode)}
              >
                Preview
              </Button>
            )}
            <Button
              loading={saveTemplate.isPending}
              disabled={!form.name.trim() || (!editingCode && !form.code.trim())}
              onClick={() => saveTemplate.mutate()}
            >
              Save template
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field
            label="Code"
            required
            hint={editingCode ? "The code is the template's identity and cannot be changed." : undefined}
          >
            <Input
              value={form.code}
              disabled={Boolean(editingCode)}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
            />
          </Field>
          <Field label="Name" required>
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event">
              <Select
                value={form.event}
                onChange={(event) => setForm({ ...form, event: event.target.value })}
                options={EVENTS.map((value) => ({ value, label: value }))}
              />
            </Field>
            <Field label="Channel">
              <Select
                value={form.channel}
                onChange={(event) =>
                  setForm({
                    ...form,
                    channel: event.target.value as NotificationTemplate["channel"],
                  })
                }
                options={CHANNELS.map((value) => ({ value, label: value }))}
              />
            </Field>
          </div>
          <Field label="Subject" hint="Used by the email channel; ignored by SMS.">
            <Input
              value={form.subject}
              onChange={(event) => setForm({ ...form, subject: event.target.value })}
            />
          </Field>

          <div className="rounded-[0.6rem] border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-[color:var(--brand-navy)]">
              Placeholders
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Write them as <code>{"{name}"}</code> in either body. Anything the
              sender does not supply survives rendering verbatim, so preview
              reports which are still unfilled.
            </p>
            {suggestions.length > 0 && (
              <p className="mt-2 text-xs text-slate-700">
                Usually available for <code>{form.event}</code>:{" "}
                {suggestions.map((variable) => (
                  <code key={variable} className="mr-2 rounded bg-white px-1">
                    {`{${variable}}`}
                  </code>
                ))}
              </p>
            )}
            <div className="mt-3">
              <Field
                label="Declared variables"
                hint="Comma separated. This is the list preview checks against."
              >
                <Input
                  value={form.variables}
                  onChange={(event) => setForm({ ...form, variables: event.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Body — English">
              <Textarea
                rows={10}
                value={form.body_en}
                onChange={(event) => setForm({ ...form, body_en: event.target.value })}
              />
            </Field>
            <Field
              label="Body — नेपाली"
              hint="Rendered with a Devanagari font stack so the script is legible here."
            >
              <Textarea
                rows={10}
                lang="ne"
                style={{ fontFamily: DEVANAGARI_STACK, fontSize: "1rem", lineHeight: 1.8 }}
                value={form.body_ne}
                onChange={(event) => setForm({ ...form, body_ne: event.target.value })}
              />
            </Field>
          </div>

          <Checkbox
            label="Active"
            checked={form.is_active}
            onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
          />
          <Checkbox
            label="Send to sender"
            checked={form.send_to_sender}
            onChange={(event) => setForm({ ...form, send_to_sender: event.target.checked })}
          />
          <Checkbox
            label="Send to receiver"
            checked={form.send_to_receiver}
            onChange={(event) => setForm({ ...form, send_to_receiver: event.target.checked })}
          />

          {preview && (
            <div className="space-y-3 rounded-[0.6rem] border border-teal-200 bg-teal-50/60 p-3">
              <p className="text-sm font-semibold text-teal-900">
                Preview — rendered against sample context. Nothing was sent.
              </p>
              {(["en", "ne"] as const).map((language) => {
                const result = preview[language];
                if (!result) return null;
                return (
                  <div key={language} className="rounded-[0.5rem] bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {language === "en" ? "English" : "नेपाली"}
                    </p>
                    {result.subject && (
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {result.subject}
                      </p>
                    )}
                    <p
                      className="mt-1 whitespace-pre-wrap text-sm text-slate-800"
                      lang={language}
                      style={language === "ne" ? { fontFamily: DEVANAGARI_STACK } : undefined}
                    >
                      {result.body || "(empty)"}
                    </p>
                    {result.unfilled_variables && result.unfilled_variables.length > 0 && (
                      <p className="mt-2 text-xs text-amber-900">
                        Unfilled: {result.unfilled_variables.join(", ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Drawer>

      <Drawer
        open={providerOpen}
        onClose={() => setProviderOpen(false)}
        size="lg"
        title={selectedProvider ? `Edit ${selectedProvider.name}` : "Provider"}
        description="Gateway wiring and masked credentials."
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" onClick={() => setProviderOpen(false)}>
              Cancel
            </Button>
            <Button loading={saveProvider.isPending} onClick={() => saveProvider.mutate()}>
              Save provider
            </Button>
          </div>
        }
      >
        {provider && selectedProvider && (
          <div className="space-y-4">
            <dl>
              <Describe term="Code">
                <code>{selectedProvider.code}</code>
              </Describe>
              <Describe term="Credentials">
                {selectedProvider.is_configured ? "Configured" : "Missing"}
              </Describe>
              <Describe term="Primary">{selectedProvider.is_primary ? "Yes" : "No"}</Describe>
              <Describe term="Last error">
                <span className="text-red-800">{selectedProvider.last_error || "None"}</span>
              </Describe>
            </dl>

            <Field label="Name">
              <Input
                value={provider.name}
                onChange={(event) => setProvider({ ...provider, name: event.target.value })}
              />
            </Field>
            <Field label="Sender id">
              <Input
                value={provider.sender_id}
                onChange={(event) => setProvider({ ...provider, sender_id: event.target.value })}
              />
            </Field>
            <Field
              label="API base URL"
              hint="A localhost or private-range URL is rejected with a 400 by the stored-SSRF guard."
            >
              <Input
                value={provider.api_base_url}
                onChange={(event) =>
                  setProvider({ ...provider, api_base_url: event.target.value })
                }
              />
            </Field>
            <Field label="Send endpoint">
              <Input
                value={provider.send_endpoint}
                onChange={(event) =>
                  setProvider({ ...provider, send_endpoint: event.target.value })
                }
              />
            </Field>
            <JsonMapField
              label="Parameter map"
              hint="Our field names on the left, the provider's on the right."
              value={provider.param_map}
              onChange={(value) => setProvider({ ...provider, param_map: value })}
            />

            <SecretField
              name="token"
              label="API token"
              masked={selectedProvider.token_masked}
              state={providerToken}
              onChange={setProviderToken}
            />
            <SecretField
              name="secret"
              label="API secret"
              masked={selectedProvider.secret_masked}
              state={providerSecret}
              onChange={setProviderSecret}
            />

            <Checkbox
              label="Active"
              checked={provider.is_active}
              onChange={(event) => setProvider({ ...provider, is_active: event.target.checked })}
            />
            <Checkbox
              label="Primary"
              hint="The gateway chosen first when an SMS has to go out."
              checked={provider.is_primary}
              onChange={(event) => setProvider({ ...provider, is_primary: event.target.checked })}
            />
            <Checkbox
              label="Sandbox"
              checked={provider.is_sandbox}
              onChange={(event) => setProvider({ ...provider, is_sandbox: event.target.checked })}
            />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (removing) await removeTemplate.mutateAsync(removing.code);
        }}
        tone="danger"
        title={`Delete ${removing?.name ?? "this template"}?`}
        description="The event stops producing a message on this channel until another template covers it. This cannot be undone."
        confirmLabel="Delete template"
      />
    </>
  );
}
