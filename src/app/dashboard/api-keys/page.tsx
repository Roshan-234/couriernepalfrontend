"use client";

/**
 * Merchant API keys: mint, inspect and revoke the credentials that reach the
 * server-to-server shipping API.
 *
 * The plaintext key exists in exactly one response and is stored only as a
 * bcrypt hash, so it is held in local component state for the life of one
 * modal and never handed to React Query. Writing it into the list cache
 * would persist a live credential in memory for every later render of this
 * screen — the list is therefore refetched from the server, which returns
 * the prefix only.
 *
 * The customer layout already wraps this in `<Workspace>` with its
 * `ProtectedRoute`, so nothing here re-checks the session.
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaCheck, FaCopy, FaKey } from "react-icons/fa";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Modal,
  Select,
  useToast,
  type BadgeTone,
} from "@/components/kit";
import { queryKeys } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/resources/client";
import { merchantKeys } from "@/lib/resources/integrations";
import { formatDate } from "@/lib/utils";
import type { ApiKeyScope, MerchantApiKey, MerchantApiKeyCreated } from "@/types/logistics";

const SCOPES: Array<{ value: ApiKeyScope; label: string; hint: string }> = [
  { value: "shipments:read", label: "Read shipments", hint: "List and fetch your shipments." },
  { value: "shipments:write", label: "Create shipments", hint: "Book shipments and parcels." },
  { value: "tracking:read", label: "Read tracking", hint: "Fetch tracking events." },
  { value: "rates:read", label: "Read rates", hint: "Quote a price before booking." },
  { value: "pickups:write", label: "Book pickups", hint: "Request collections." },
  { value: "cod:read", label: "Read COD", hint: "See cash-on-delivery balances." },
  { value: "webhooks:manage", label: "Manage webhooks", hint: "Register and edit endpoints." },
];

const SCOPE_LABELS: Record<ApiKeyScope, string> = SCOPES.reduce(
  (map, scope) => ({ ...map, [scope.value]: scope.label }),
  {} as Record<ApiKeyScope, string>,
);

/**
 * The backend returns the one-time secret as `api_key`; the shared type in
 * `src/types/logistics.ts` calls it `plaintext_key`. Read both rather than
 * silently show an empty key when one of the two moves.
 */
function plaintextOf(created: MerchantApiKeyCreated): string {
  const record = created as unknown as Record<string, unknown>;
  const value = record.plaintext_key ?? record.api_key;
  return typeof value === "string" ? value : "";
}

function keyState(key: MerchantApiKey): { label: string; tone: BadgeTone } {
  if (key.revoked_at) return { label: "Revoked", tone: "red" };
  if (key.expires_at && new Date(key.expires_at).getTime() < Date.now()) {
    return { label: "Expired", tone: "orange" };
  }
  if (!key.is_active) return { label: "Disabled", tone: "neutral" };
  return { label: "Active", tone: "green" };
}

interface FormState {
  name: string;
  environment: "live" | "test";
  expires_at: string;
  scopes: ApiKeyScope[];
}

const EMPTY_FORM: FormState = {
  name: "",
  environment: "test",
  expires_at: "",
  scopes: ["shipments:read", "tracking:read"],
};

export default function MerchantApiKeysPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<"name" | "scopes", string>>>({});
  const [toRevoke, setToRevoke] = useState<MerchantApiKey | null>(null);
  /** Lives only as long as the reveal modal is open. Never cached. */
  const [revealed, setRevealed] = useState<{ name: string; secret: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const keysQuery = useQuery({
    queryKey: queryKeys.merchant.keys,
    queryFn: () => merchantKeys.list(),
  });

  const createKey = useMutation({
    mutationFn: (body: {
      name: string;
      scopes: string[];
      environment?: "live" | "test";
      expires_at?: string;
    }) => merchantKeys.create(body),
    onSuccess: (created) => {
      const secret = plaintextOf(created);
      setRevealed({ name: created.name, secret });
      setCopied(false);
      setForm(EMPTY_FORM);
      setErrors({});
      if (!secret) {
        toast.warning("The key was created but the secret did not come back", {
          description: "Revoke it and mint another one.",
        });
      }
      // Refetch from the server rather than seeding the cache with `created`:
      // that object carries the plaintext secret and the list must not.
      queryClient.invalidateQueries({ queryKey: queryKeys.merchant.keys });
    },
    onError: (error) => {
      toast.error("Could not create the key", { description: errorMessage(error) });
    },
  });

  const revokeKey = useMutation({
    mutationFn: (id: number) => merchantKeys.revoke(id),
    onSuccess: () => {
      toast.success("Key revoked", { description: "It stops working on the next call." });
      queryClient.invalidateQueries({ queryKey: queryKeys.merchant.keys });
    },
    onError: (error) => {
      toast.error("Could not revoke the key", { description: errorMessage(error) });
    },
    onSettled: () => setToRevoke(null),
  });

  const toggleScope = (scope: ApiKeyScope, checked: boolean) => {
    setForm((current) => ({
      ...current,
      scopes: checked
        ? [...current.scopes, scope]
        : current.scopes.filter((entry) => entry !== scope),
    }));
    setErrors((current) => ({ ...current, scopes: undefined }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found: Partial<Record<"name" | "scopes", string>> = {};
    if (!form.name.trim()) found.name = "Name the integration this key is for.";
    if (form.scopes.length === 0) found.scopes = "Grant at least one scope.";

    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Check the form", { description: "Some details still need fixing." });
      return;
    }

    createKey.mutate({
      name: form.name.trim(),
      scopes: form.scopes,
      environment: form.environment,
      ...(form.expires_at ? { expires_at: form.expires_at } : {}),
    });
  };

  const copySecret = async () => {
    if (!revealed?.secret) return;
    try {
      await navigator.clipboard.writeText(revealed.secret);
      setCopied(true);
      toast.success("Key copied to the clipboard");
    } catch {
      toast.error("Could not reach the clipboard", {
        description: "Select the key in the box and copy it by hand.",
      });
    }
  };

  const closeReveal = () => {
    setRevealed(null);
    setCopied(false);
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2 text-teal-700">API keys</p>
        <h1 className="text-3xl font-bold text-[color:var(--brand-navy)]">
          Credentials for the shipping API
        </h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600">
          Each key carries its own scopes, so an integration that only reads tracking
          never gets permission to book. Keys are shown once at creation and stored as a
          hash afterwards.
        </p>
      </header>

      <Card as="section" aria-labelledby="create-key-heading">
        <CardHeader>
          <CardTitle id="create-key-heading">Create a key</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Name" required error={errors.name}>
                <Input
                  value={form.name}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, name: event.target.value }));
                    setErrors((current) => ({ ...current, name: undefined }));
                  }}
                  placeholder="Warehouse sync"
                />
              </Field>

              <Field
                label="Environment"
                hint="Test keys are for integration work; live keys move real parcels."
              >
                <Select
                  value={form.environment}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      environment: event.target.value === "live" ? "live" : "test",
                    }))
                  }
                  options={[
                    { value: "test", label: "Test" },
                    { value: "live", label: "Live" },
                  ]}
                />
              </Field>

              <Field label="Expires on" showOptional hint="Leave blank for a key with no expiry.">
                <Input
                  type="date"
                  value={form.expires_at}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, expires_at: event.target.value }))
                  }
                />
              </Field>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-[color:var(--brand-navy)]">
                Scopes <span className="text-red-700" aria-hidden="true">*</span>
              </legend>
              <p className="text-xs text-slate-600">
                Grant the least this integration needs. Scopes cannot be changed later —
                revoke the key and mint another.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {SCOPES.map((scope) => (
                  <Checkbox
                    key={scope.value}
                    label={scope.label}
                    hint={scope.hint}
                    checked={form.scopes.includes(scope.value)}
                    onChange={(event) => toggleScope(scope.value, event.target.checked)}
                  />
                ))}
              </div>
              <div aria-live="polite">
                {errors.scopes && (
                  <p className="text-xs font-semibold text-red-700">{errors.scopes}</p>
                )}
              </div>
            </fieldset>

            <Button
              type="submit"
              loading={createKey.isPending}
              loadingLabel="Creating the key"
              leftIcon={<FaKey aria-hidden="true" />}
            >
              Create key
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card as="section" aria-labelledby="key-list-heading">
        <CardHeader>
          <CardTitle id="key-list-heading">Your keys</CardTitle>
        </CardHeader>
        <CardBody>
          {keysQuery.isError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
            >
              <p className="font-semibold">Could not load your keys.</p>
              <p className="mt-1 text-red-800">{errorMessage(keysQuery.error)}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => keysQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : (
            <DataTable<MerchantApiKey>
              caption="API keys on your merchant account"
              rows={keysQuery.data ?? []}
              rowKey={(row) => row.id}
              loading={keysQuery.isPending}
              emptyTitle="No API keys yet"
              emptyDescription="Create one above to start calling the shipping API."
              emptyIcon={<FaKey aria-hidden="true" />}
              columns={[
                {
                  id: "name",
                  header: "Name",
                  primary: true,
                  cell: (row) => (
                    <span className="font-semibold text-[color:var(--brand-navy)]">
                      {row.name}
                      <span className="block font-mono text-xs font-normal text-slate-600">
                        {row.key_prefix}…
                      </span>
                    </span>
                  ),
                },
                {
                  id: "environment",
                  header: "Environment",
                  cell: (row) => (
                    <Badge tone={row.environment === "live" ? "navy" : "neutral"}>
                      {row.environment === "live" ? "Live" : "Test"}
                    </Badge>
                  ),
                },
                {
                  id: "scopes",
                  header: "Scopes",
                  cell: (row) => (
                    <span className="flex flex-wrap justify-end gap-1 md:justify-start">
                      {row.scopes.length === 0 ? (
                        <span className="text-xs text-slate-600">None</span>
                      ) : (
                        row.scopes.map((scope) => (
                          <Badge key={scope} tone="teal" size="sm">
                            {SCOPE_LABELS[scope] ?? scope}
                          </Badge>
                        ))
                      )}
                    </span>
                  ),
                },
                {
                  id: "last_used",
                  header: "Last used",
                  cell: (row) => (
                    <span className="text-slate-800">
                      {row.last_used_at ? formatDate(row.last_used_at) : "Never"}
                      <span className="block text-xs text-slate-600">
                        {row.use_count.toLocaleString()} call
                        {row.use_count === 1 ? "" : "s"}
                      </span>
                    </span>
                  ),
                },
                {
                  id: "status",
                  header: "Status",
                  cell: (row) => {
                    const state = keyState(row);
                    return (
                      <span>
                        <Badge tone={state.tone}>{state.label}</Badge>
                        {row.expires_at && !row.revoked_at && (
                          <span className="block text-xs text-slate-600">
                            Expires {formatDate(row.expires_at)}
                          </span>
                        )}
                      </span>
                    );
                  },
                },
                {
                  id: "actions",
                  header: "Actions",
                  srOnlyHeader: true,
                  align: "right",
                  cell: (row) =>
                    row.revoked_at ? (
                      <span className="text-xs text-slate-600">
                        Revoked {formatDate(row.revoked_at)}
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setToRevoke(row)}
                        disabled={revokeKey.isPending}
                      >
                        Revoke
                        <span className="sr-only"> the key named {row.name}</span>
                      </Button>
                    ),
                },
              ]}
            />
          )}
        </CardBody>
      </Card>

      <Modal
        open={revealed !== null}
        onClose={closeReveal}
        title="Copy your new API key now"
        description="This is the only time it will ever be shown."
        size="lg"
        footer={
          <Button onClick={closeReveal}>I have stored it safely</Button>
        }
      >
        <div className="space-y-4">
          <div
            role="alert"
            className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          >
            <p className="font-semibold">This key will not be shown again.</p>
            <p className="mt-1">
              Only a hash of it is stored, so we cannot recover it. If you lose it, revoke
              the key and create another.
            </p>
          </div>

          <Field
            label={`Key for ${revealed?.name ?? "your integration"}`}
            hint="Treat it like a password: never commit it or paste it into a browser."
          >
            <Input
              readOnly
              value={revealed?.secret ?? ""}
              className="font-mono text-xs"
              onFocus={(event) => event.currentTarget.select()}
            />
          </Field>

          <Button
            variant="outline"
            onClick={copySecret}
            disabled={!revealed?.secret}
            leftIcon={copied ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />}
          >
            {copied ? "Copied" : "Copy key"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={toRevoke !== null}
        onClose={() => setToRevoke(null)}
        onConfirm={() => {
          if (toRevoke) revokeKey.mutate(toRevoke.id);
        }}
        title="Revoke this key?"
        description={
          toRevoke
            ? `"${toRevoke.name}" stops working on its next call. Anything using it will start failing immediately.`
            : undefined
        }
        confirmLabel="Revoke key"
        cancelLabel="Keep it"
        tone="danger"
      />
    </div>
  );
}
