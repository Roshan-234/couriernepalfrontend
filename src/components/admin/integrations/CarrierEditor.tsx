"use client";

/**
 * Editor for a carrier connector.
 *
 * The model carries roughly seventy configuration columns, so the form is cut
 * into seven tabs inside a drawer rather than one endless scroll. Everything
 * the backend whitelists for writing is here; the health counters it owns are
 * rendered read-only.
 *
 * Credentials follow the house rule: the API returns masks, and a field only
 * joins the payload when the operator asks to replace or clear it.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Checkbox,
  Drawer,
  Field,
  Input,
  Select,
  Tabs,
  Textarea,
} from "@/components/kit";
import type { CarrierConfig } from "@/lib/resources/integrations";
import type { CarrierAuthType } from "@/types/logistics";
import { JsonMapField, readJsonObject, readStringMap, toJsonText } from "./JsonMapField";
import { Describe, Notice, when } from "./ScreenHeader";
import {
  applySecret,
  KEEP_SECRET,
  SecretField,
  type SecretState,
} from "./SecretField";

/**
 * `CarrierConfig` covers most of the admin payload. These columns are also
 * returned by `to_dict(include_config=True)` and are writable, but predate the
 * typed wrapper, so they are widened here rather than by editing `src/lib`.
 */
export type CarrierRow = CarrierConfig & {
  track_request_template?: Record<string, unknown> | null;
  create_request_template?: Record<string, unknown> | null;
  oauth_audience?: string | null;
  event_time_format?: string | null;
  error_message_path?: string | null;
  webhook_signature_algo?: string | null;
  retry_backoff_seconds?: number;
  poll_interval_minutes?: number;
  last_success_at?: string | null;
};

export const AUTH_TYPES: CarrierAuthType[] = [
  "none",
  "api_key",
  "basic",
  "bearer",
  "oauth2",
  "hmac",
];

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const CAPABILITIES = [
  ["Tracking", "supports_tracking", "Read tracking events for a shipment"],
  ["Booking", "supports_booking", "Create a shipment with the carrier"],
  ["Label", "supports_label", "Fetch a printable label"],
  ["Rates", "supports_rates", "Ask the carrier to quote"],
  ["Pickup", "supports_pickup", "Book a pickup"],
  ["Cancel", "supports_cancel", "Cancel a booked shipment"],
  ["Webhook", "supports_webhook", "Accept status callbacks from the carrier"],
] as const;

interface CarrierForm {
  code: string;
  name: string;
  display_name: string;
  logo_url: string;
  website_url: string;
  instructions: string;
  tracking_url_template: string;
  sort_order: string;
  is_active: boolean;
  is_sandbox: boolean;

  supports_tracking: boolean;
  supports_booking: boolean;
  supports_label: boolean;
  supports_rates: boolean;
  supports_pickup: boolean;
  supports_cancel: boolean;
  supports_webhook: boolean;

  api_base_url: string;
  sandbox_base_url: string;
  api_version: string;
  content_type: string;
  auth_type: CarrierAuthType;
  auth_header_name: string;
  auth_header_prefix: string;
  auth_query_param: string;
  extra_headers: string;
  extra_query_params: string;
  webhook_url: string;
  webhook_signature_header: string;

  account_number: string;
  username: string;
  client_id: string;
  oauth_token_url: string;
  oauth_scope: string;

  track_endpoint: string;
  create_shipment_endpoint: string;
  label_endpoint: string;
  rate_endpoint: string;
  pickup_endpoint: string;
  cancel_endpoint: string;
  track_method: string;
  create_method: string;
  track_request_template: string;
  create_request_template: string;

  tracking_number_path: string;
  status_path: string;
  events_path: string;
  event_status_path: string;
  event_time_path: string;
  event_location_path: string;
  event_description_path: string;
  status_map: string;

  timeout_seconds: string;
  max_retries: string;
  rate_limit_per_minute: string;
}

/** Dotted response paths, with the carrier-side meaning of each. */
const RESPONSE_PATHS: Array<[keyof CarrierForm, string, string]> = [
  [
    "tracking_number_path",
    "Tracking number",
    "Where the carrier's own tracking number sits in a booking response.",
  ],
  ["status_path", "Shipment status", "The current status for the whole shipment."],
  ["events_path", "Events array", "The list of scan events, for example data.history."],
  ["event_status_path", "Event status", "Read relative to one element of the events array."],
  ["event_time_path", "Event timestamp", "Read relative to one element of the events array."],
  ["event_location_path", "Event location", "Read relative to one element of the events array."],
  [
    "event_description_path",
    "Event description",
    "Read relative to one element of the events array.",
  ],
];

const str = (value: string | null | undefined) => value ?? "";
const num = (value: number | null | undefined, fallback: string) =>
  value === null || value === undefined ? fallback : String(value);

function blankForm(): CarrierForm {
  return {
    code: "",
    name: "",
    display_name: "",
    logo_url: "",
    website_url: "",
    instructions: "",
    tracking_url_template: "",
    sort_order: "0",
    is_active: true,
    is_sandbox: true,
    supports_tracking: true,
    supports_booking: false,
    supports_label: false,
    supports_rates: false,
    supports_pickup: false,
    supports_cancel: false,
    supports_webhook: false,
    api_base_url: "",
    sandbox_base_url: "",
    api_version: "",
    content_type: "application/json",
    auth_type: "none",
    auth_header_name: "",
    auth_header_prefix: "",
    auth_query_param: "",
    extra_headers: "",
    extra_query_params: "",
    webhook_url: "",
    webhook_signature_header: "",
    account_number: "",
    username: "",
    client_id: "",
    oauth_token_url: "",
    oauth_scope: "",
    track_endpoint: "",
    create_shipment_endpoint: "",
    label_endpoint: "",
    rate_endpoint: "",
    pickup_endpoint: "",
    cancel_endpoint: "",
    track_method: "GET",
    create_method: "POST",
    track_request_template: "",
    create_request_template: "",
    tracking_number_path: "",
    status_path: "",
    events_path: "",
    event_status_path: "",
    event_time_path: "",
    event_location_path: "",
    event_description_path: "",
    status_map: "",
    timeout_seconds: "20",
    max_retries: "3",
    rate_limit_per_minute: "60",
  };
}

function formFrom(carrier: CarrierRow): CarrierForm {
  return {
    code: carrier.code,
    name: carrier.name,
    display_name: str(carrier.display_name),
    logo_url: str(carrier.logo_url),
    website_url: str(carrier.website_url),
    instructions: str(carrier.instructions),
    tracking_url_template: str(carrier.tracking_url_template),
    sort_order: num(carrier.sort_order, "0"),
    is_active: Boolean(carrier.is_active),
    is_sandbox: Boolean(carrier.is_sandbox),
    supports_tracking: Boolean(carrier.capabilities?.tracking),
    supports_booking: Boolean(carrier.capabilities?.booking),
    supports_label: Boolean(carrier.capabilities?.label),
    supports_rates: Boolean(carrier.capabilities?.rates),
    supports_pickup: Boolean(carrier.capabilities?.pickup),
    supports_cancel: Boolean(carrier.capabilities?.cancel),
    supports_webhook: Boolean(carrier.capabilities?.webhook),
    api_base_url: str(carrier.api_base_url),
    sandbox_base_url: str(carrier.sandbox_base_url),
    api_version: str(carrier.api_version),
    content_type: str(carrier.content_type),
    auth_type: (carrier.auth_type as CarrierAuthType) ?? "none",
    auth_header_name: str(carrier.auth_header_name),
    auth_header_prefix: str(carrier.auth_header_prefix),
    auth_query_param: str(carrier.auth_query_param),
    extra_headers: toJsonText(carrier.extra_headers),
    extra_query_params: toJsonText(carrier.extra_query_params),
    webhook_url: str(carrier.webhook_url),
    webhook_signature_header: str(carrier.webhook_signature_header),
    account_number: str(carrier.account_number),
    username: str(carrier.username),
    client_id: str(carrier.client_id),
    oauth_token_url: str(carrier.oauth_token_url),
    oauth_scope: str(carrier.oauth_scope),
    track_endpoint: str(carrier.track_endpoint),
    create_shipment_endpoint: str(carrier.create_shipment_endpoint),
    label_endpoint: str(carrier.label_endpoint),
    rate_endpoint: str(carrier.rate_endpoint),
    pickup_endpoint: str(carrier.pickup_endpoint),
    cancel_endpoint: str(carrier.cancel_endpoint),
    track_method: str(carrier.track_method) || "GET",
    create_method: str(carrier.create_method) || "POST",
    track_request_template: toJsonText(carrier.track_request_template),
    create_request_template: toJsonText(carrier.create_request_template),
    tracking_number_path: str(carrier.tracking_number_path),
    status_path: str(carrier.status_path),
    events_path: str(carrier.events_path),
    event_status_path: str(carrier.event_status_path),
    event_time_path: str(carrier.event_time_path),
    event_location_path: str(carrier.event_location_path),
    event_description_path: str(carrier.event_description_path),
    status_map: toJsonText(carrier.status_map),
    timeout_seconds: num(carrier.timeout_seconds, "20"),
    max_retries: num(carrier.max_retries, "3"),
    rate_limit_per_minute: num(carrier.rate_limit_per_minute, "60"),
  };
}

interface SecretBag {
  api_key: SecretState;
  api_secret: SecretState;
  password: SecretState;
  client_secret: SecretState;
  webhook_secret: SecretState;
}

const BLANK_SECRETS: SecretBag = {
  api_key: KEEP_SECRET,
  api_secret: KEEP_SECRET,
  password: KEEP_SECRET,
  client_secret: KEEP_SECRET,
  webhook_secret: KEEP_SECRET,
};

const SECRET_KEYS = Object.keys(BLANK_SECRETS) as Array<keyof SecretBag>;

const SECRET_LABELS: Record<keyof SecretBag, string> = {
  api_key: "API key",
  api_secret: "API secret",
  password: "Password",
  client_secret: "OAuth client secret",
  webhook_secret: "Webhook signing secret",
};

/** Which credentials the chosen auth type actually needs. */
function relevantSecrets(auth: CarrierAuthType, webhook: boolean): Array<keyof SecretBag> {
  const base: Array<keyof SecretBag> =
    auth === "api_key" || auth === "bearer"
      ? ["api_key"]
      : auth === "basic"
        ? ["password"]
        : auth === "oauth2"
          ? ["client_secret"]
          : auth === "hmac"
            ? ["api_key", "api_secret"]
            : [];
  return webhook ? [...base, "webhook_secret"] : base;
}

function maskOf(carrier: CarrierRow | null, key: keyof SecretBag): string | undefined {
  if (!carrier) return undefined;
  const masks: Record<keyof SecretBag, string | undefined> = {
    api_key: carrier.api_key_masked,
    api_secret: carrier.api_secret_masked,
    password: carrier.password_masked,
    client_secret: carrier.client_secret_masked,
    webhook_secret: carrier.webhook_secret_masked,
  };
  return masks[key];
}

export interface CarrierEditorProps {
  open: boolean;
  /** `null` opens the drawer in create mode. */
  carrier: CarrierRow | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
  /** Test button and audit output, rendered on the Reliability tab. */
  testSlot?: ReactNode;
}

export function CarrierEditor({
  open,
  carrier,
  saving,
  onClose,
  onSubmit,
  testSlot,
}: CarrierEditorProps) {
  const [form, setForm] = useState<CarrierForm>(blankForm);
  const [secrets, setSecrets] = useState<SecretBag>(BLANK_SECRETS);
  const [tab, setTab] = useState("identity");
  const [showAllSecrets, setShowAllSecrets] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // Re-seed whenever the drawer opens, or opens on a different connector.
  useEffect(() => {
    if (!open) return;
    setForm(carrier ? formFrom(carrier) : blankForm());
    setSecrets(BLANK_SECRETS);
    setShowAllSecrets(false);
    setProblem(null);
    setTab("identity");
  }, [open, carrier]);

  const set = <K extends keyof CarrierForm>(key: K, value: CarrierForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const needed = useMemo(
    () => relevantSecrets(form.auth_type, form.supports_webhook),
    [form.auth_type, form.supports_webhook],
  );
  const shownSecrets = showAllSecrets ? SECRET_KEYS : needed;

  function build(): Record<string, unknown> | null {
    const payload: Record<string, unknown> = {};

    const jsonFields: Array<[keyof CarrierForm, string, "map" | "object"]> = [
      ["extra_headers", "Extra headers", "map"],
      ["extra_query_params", "Extra query parameters", "map"],
      ["status_map", "Status map", "map"],
      ["track_request_template", "Track request template", "object"],
      ["create_request_template", "Create request template", "object"],
    ];
    for (const [key, label, kind] of jsonFields) {
      const raw = form[key] as string;
      const parsed = kind === "map" ? readStringMap(raw) : readJsonObject(raw);
      if (!parsed.ok) {
        setProblem(`${label}: ${parsed.error}`);
        return null;
      }
      payload[key] = parsed.value;
    }

    const ints: Array<[keyof CarrierForm, string, number, number]> = [
      ["sort_order", "Sort order", 0, 100000],
      ["timeout_seconds", "Timeout", 1, 300],
      ["max_retries", "Max retries", 0, 20],
      ["rate_limit_per_minute", "Rate limit", 1, 100000],
    ];
    for (const [key, label, low, high] of ints) {
      const parsed = Number(form[key]);
      if (!Number.isInteger(parsed) || parsed < low || parsed > high) {
        setProblem(`${label} must be a whole number between ${low} and ${high}.`);
        return null;
      }
      payload[key] = parsed;
    }

    if (!carrier) {
      if (!form.code.trim()) {
        setProblem("A connector needs a short code.");
        return null;
      }
      payload.code = form.code.trim();
    }
    if (!form.name.trim()) {
      setProblem("A connector needs a name.");
      return null;
    }

    const strings: Array<keyof CarrierForm> = [
      "name",
      "display_name",
      "logo_url",
      "website_url",
      "instructions",
      "tracking_url_template",
      "api_base_url",
      "sandbox_base_url",
      "api_version",
      "content_type",
      "auth_header_name",
      "auth_header_prefix",
      "auth_query_param",
      "webhook_url",
      "webhook_signature_header",
      "account_number",
      "username",
      "client_id",
      "oauth_token_url",
      "oauth_scope",
      "track_endpoint",
      "create_shipment_endpoint",
      "label_endpoint",
      "rate_endpoint",
      "pickup_endpoint",
      "cancel_endpoint",
      "tracking_number_path",
      "status_path",
      "events_path",
      "event_status_path",
      "event_time_path",
      "event_location_path",
      "event_description_path",
    ];
    for (const key of strings) payload[key] = (form[key] as string).trim();

    payload.auth_type = form.auth_type;
    payload.track_method = form.track_method;
    payload.create_method = form.create_method;
    payload.is_active = form.is_active;
    payload.is_sandbox = form.is_sandbox;
    for (const [, column] of CAPABILITIES) payload[column] = form[column];

    for (const key of SECRET_KEYS) applySecret(payload, key, secrets[key]);

    setProblem(null);
    return payload;
  }

  function submit() {
    const payload = build();
    if (payload) onSubmit(payload);
  }

  const text = (
    key: keyof CarrierForm,
    label: string,
    options: { hint?: ReactNode; placeholder?: string; type?: string } = {},
  ) => (
    <Field label={label} hint={options.hint}>
      <Input
        type={options.type ?? "text"}
        placeholder={options.placeholder}
        value={form[key] as string}
        onChange={(event) => set(key, event.target.value as CarrierForm[typeof key])}
      />
    </Field>
  );

  const identity = (
    <div className="space-y-4">
      <Field
        label="Short code"
        hint={
          carrier
            ? "The code identifies this connector across the system and cannot be changed here."
            : "Lowercase, no spaces. Used in every carrier URL and tracking link."
        }
      >
        <Input
          value={form.code}
          disabled={Boolean(carrier)}
          onChange={(event) => set("code", event.target.value)}
        />
      </Field>
      {text("name", "Name")}
      {text("display_name", "Display name", {
        hint: "Shown to customers. Falls back to the name.",
      })}
      {text("logo_url", "Logo URL")}
      {text("website_url", "Website URL")}
      {text("tracking_url_template", "Customer tracking URL template", {
        hint: "The carrier's own tracking page. Use {tracking_number} as the placeholder.",
      })}
      <Field label="Instructions" hint="Internal notes for whoever operates this connector.">
        <Textarea
          rows={4}
          value={form.instructions}
          onChange={(event) => set("instructions", event.target.value)}
        />
      </Field>
      {text("sort_order", "Sort order", { type: "number" })}
      <Checkbox
        label="Active"
        hint="Inactive connectors are hidden from the public carrier list."
        checked={form.is_active}
        onChange={(event) => set("is_active", event.target.checked)}
      />
      <Checkbox
        label="Sandbox"
        hint="Uses the sandbox base URL instead of the live one."
        checked={form.is_sandbox}
        onChange={(event) => set("is_sandbox", event.target.checked)}
      />
    </div>
  );

  const capabilities = (
    <div className="space-y-4">
      <Notice>
        These flags describe what the carrier&rsquo;s API can do, and gate which
        endpoints this console asks you to fill in. They do not switch on live
        dispatch, which is off system-wide.
      </Notice>
      {CAPABILITIES.map(([label, column, description]) => (
        <Checkbox
          key={column}
          label={label}
          hint={description}
          checked={form[column]}
          onChange={(event) => set(column, event.target.checked)}
        />
      ))}
    </div>
  );

  const connection = (
    <div className="space-y-4">
      <Notice tone="warning" title="URLs are checked before they are stored">
        A URL pointing at localhost, a <code>.local</code> name, or a private or
        loopback IP range is rejected with a 400. The guard is deliberate: the
        server itself fetches these URLs later.
      </Notice>
      {text("api_base_url", "Live base URL", { placeholder: "https://api.carrier.com" })}
      {text("sandbox_base_url", "Sandbox base URL")}
      {text("api_version", "API version")}
      {text("content_type", "Content type", { placeholder: "application/json" })}
      <Field label="Auth type">
        <Select
          value={form.auth_type}
          onChange={(event) => set("auth_type", event.target.value as CarrierAuthType)}
          options={AUTH_TYPES.map((value) => ({ value, label: value }))}
        />
      </Field>
      {text("auth_header_name", "Auth header name", { placeholder: "Authorization" })}
      {text("auth_header_prefix", "Auth header prefix", { placeholder: "Bearer" })}
      {text("auth_query_param", "Auth query parameter", {
        hint: "For carriers that want the key in the query string instead of a header.",
      })}
      <JsonMapField
        label="Extra headers"
        hint="Sent on every request. A JSON object of string values."
        value={form.extra_headers}
        onChange={(value) => set("extra_headers", value)}
      />
      <JsonMapField
        label="Extra query parameters"
        hint="Appended to every request. A JSON object of string values."
        value={form.extra_query_params}
        onChange={(value) => set("extra_query_params", value)}
      />
      <h3 className="pt-2 text-sm font-semibold text-[color:var(--brand-navy)]">
        Inbound carrier webhooks
      </h3>
      {text("webhook_url", "Webhook URL registered with the carrier")}
      {text("webhook_signature_header", "Signature header to verify", {
        placeholder: "X-Carrier-Signature",
      })}
    </div>
  );

  const credentials = (
    <div className="space-y-5">
      <Notice title="How credentials are handled">
        Stored secrets come back masked and are never shown in full. Leaving a
        field alone keeps what is stored; <strong>Clear</strong> deletes it.
        Nothing here is sent anywhere until live dispatch is switched on.
      </Notice>
      {text("account_number", "Account number")}
      {text("username", "Username", { hint: "Used with basic auth." })}
      {text("client_id", "OAuth client id")}
      {text("oauth_token_url", "OAuth token URL")}
      {text("oauth_scope", "OAuth scope")}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-700">
          {needed.length > 0
            ? `Required for auth type "${form.auth_type}".`
            : `Auth type "${form.auth_type}" needs no credentials.`}
        </p>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => setShowAllSecrets((value) => !value)}
        >
          {showAllSecrets ? "Show only relevant" : "Show all credential fields"}
        </Button>
      </div>

      {shownSecrets.length === 0 ? (
        <p className="text-sm text-slate-600">Nothing to fill in.</p>
      ) : (
        shownSecrets.map((key) => (
          <SecretField
            key={key}
            name={key}
            label={SECRET_LABELS[key]}
            masked={maskOf(carrier, key)}
            state={secrets[key]}
            onChange={(next) => setSecrets((previous) => ({ ...previous, [key]: next }))}
          />
        ))
      )}
    </div>
  );

  const endpoints = (
    <div className="space-y-4">
      <p className="text-sm text-slate-700">
        Paths relative to the base URL, for example{" "}
        <code className="rounded bg-slate-100 px-1">
          /v2/track/{"{tracking_number}"}
        </code>
        .
      </p>
      {text("track_endpoint", "Track")}
      {text("create_shipment_endpoint", "Create shipment")}
      {text("label_endpoint", "Label")}
      {text("rate_endpoint", "Rate")}
      {text("pickup_endpoint", "Pickup")}
      {text("cancel_endpoint", "Cancel")}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Track method">
          <Select
            value={form.track_method}
            onChange={(event) => set("track_method", event.target.value)}
            options={HTTP_METHODS.map((value) => ({ value, label: value }))}
          />
        </Field>
        <Field label="Create method">
          <Select
            value={form.create_method}
            onChange={(event) => set("create_method", event.target.value)}
            options={HTTP_METHODS.map((value) => ({ value, label: value }))}
          />
        </Field>
      </div>
      <JsonMapField
        label="Track request template"
        hint="Request body sent for a tracking call, as a JSON object."
        value={form.track_request_template}
        onChange={(value) => set("track_request_template", value)}
        rows={6}
      />
      <JsonMapField
        label="Create request template"
        hint="Request body sent for a booking call, as a JSON object."
        value={form.create_request_template}
        onChange={(value) => set("create_request_template", value)}
        rows={6}
      />
    </div>
  );

  const mapping = (
    <div className="space-y-4">
      <Notice title="These are dotted paths into the carrier's JSON response">
        <code>data.shipment.status</code> reads <code>status</code> out of{" "}
        <code>shipment</code> out of <code>data</code>. The four{" "}
        <code>event_*</code> paths are read relative to one element of the events
        array, not from the top of the response.
      </Notice>
      {RESPONSE_PATHS.map(([key, label, hint]) => (
        <div key={key as string}>{text(key, label, { hint })}</div>
      ))}
      <JsonMapField
        label="Status map"
        hint={
          <>
            Translates the carrier&rsquo;s status vocabulary into ours. Keys are
            the carrier&rsquo;s words, values are our shipment statuses — for
            example <code>{'{"DEL": "delivered"}'}</code>.
          </>
        }
        value={form.status_map}
        onChange={(value) => set("status_map", value)}
        rows={8}
      />
    </div>
  );

  const reliability = (
    <div className="space-y-4">
      {text("timeout_seconds", "Timeout (seconds)", { type: "number", hint: "1 to 300." })}
      {text("max_retries", "Max retries", { type: "number", hint: "0 to 20." })}
      {text("rate_limit_per_minute", "Rate limit per minute", { type: "number" })}

      <div className="rounded-[0.75rem] border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">Health</h3>
        <p className="mt-1 text-xs text-slate-600">
          Owned by the system — read-only here.
        </p>
        <dl className="mt-3">
          <Describe term="Status">{carrier?.health_status ?? "—"}</Describe>
          <Describe term="Consecutive failures">
            {carrier?.consecutive_failures ?? 0}
          </Describe>
          <Describe term="Last sync">{when(carrier?.last_sync_at)}</Describe>
          <Describe term="Last error">
            <span className="text-red-800">{carrier?.last_error || "None"}</span>
          </Describe>
        </dl>
      </div>

      {testSlot}
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="lg"
      title={carrier ? `Edit ${carrier.display_name || carrier.name}` : "New connector"}
      description="Configuration only. Live carrier calls are not enabled yet."
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-3">
          {problem && (
            <p role="alert" className="mr-auto text-sm font-semibold text-red-700">
              {problem}
            </p>
          )}
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} loading={saving}>
            {carrier ? "Save changes" : "Create connector"}
          </Button>
        </div>
      }
    >
      <Tabs
        label="Connector configuration"
        value={tab}
        onValueChange={setTab}
        variant="pill"
        items={[
          { id: "identity", label: "Identity", content: identity },
          { id: "capabilities", label: "Capabilities", content: capabilities },
          { id: "connection", label: "Connection", content: connection },
          { id: "credentials", label: "Credentials", content: credentials },
          { id: "endpoints", label: "Endpoints", content: endpoints },
          { id: "mapping", label: "Response mapping", content: mapping },
          { id: "reliability", label: "Reliability", content: reliability },
        ]}
      />
    </Drawer>
  );
}
