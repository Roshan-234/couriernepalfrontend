"use client";

/**
 * Carrier connector console.
 *
 * Nothing on this screen talks to a carrier. The backend's `call_carrier`
 * seam is switched off (`CARRIER_LIVE_CALLS_ENABLED = False`), so this page
 * is purely configuration: it prepares connectors for the day dispatch is
 * turned on, and the "Test configuration" action is a local audit of those
 * settings rather than a ping.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  SearchInput,
  StatCard,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { CarrierEditor, type CarrierRow } from "@/components/admin/integrations/CarrierEditor";
import { Notice, ScreenHeader, when } from "@/components/admin/integrations/ScreenHeader";
import { carriers, type CarrierConfig, type CarrierTestResult } from "@/lib/resources/integrations";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/** The audit endpoint answers with more than the typed wrapper promises. */
type TestResult = CarrierTestResult & {
  ready?: boolean;
  environment?: string;
  base_url?: string | null;
  network_call_made?: boolean;
  checked_at?: string;
};

function healthTone(status: string | null | undefined) {
  if (status === "healthy") return "green" as const;
  if (status === "degraded") return "amber" as const;
  if (status === "down" || status === "failing") return "red" as const;
  return "neutral" as const;
}

export default function Page() {
  const cache = useQueryClient();
  const { success, error: errorToast } = useToast();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CarrierRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<CarrierRow | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const list = useQuery({
    queryKey: queryKeys.carriers.admin,
    queryFn: async () => (await carriers.all()) as CarrierRow[],
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = list.data ?? [];
    if (!term) return all;
    return all.filter((row) =>
      [row.code, row.name, row.display_name, row.api_base_url ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [list.data, search]);

  const openEditor = Boolean(editing) || creating;

  function closeEditor() {
    setEditing(null);
    setCreating(false);
    setTestResult(null);
  }

  const save = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const body = payload as Partial<CarrierConfig>;
      if (editing) return carriers.update(editing.code, body);
      return carriers.create(body as Partial<CarrierConfig> & { code: string; name: string });
    },
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.carriers.all });
      success(editing ? "Connector saved." : "Connector created.");
      closeEditor();
    },
    onError: (err) => errorToast("Could not save the connector.", { description: errorMessage(err) }),
  });

  const deactivate = useMutation({
    mutationFn: (code: string) => carriers.deactivate(code),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.carriers.all });
      success("Connector deactivated.");
      setDeactivating(null);
    },
    onError: (err) =>
      errorToast("Could not deactivate the connector.", { description: errorMessage(err) }),
  });

  const audit = useMutation({
    mutationFn: (code: string) => carriers.test(code) as Promise<TestResult>,
    onSuccess: (result) => setTestResult(result),
    onError: (err) => {
      setTestResult(null);
      errorToast("Could not audit the configuration.", { description: errorMessage(err) });
    },
  });

  const columns: DataTableColumn<CarrierRow>[] = [
    {
      id: "carrier",
      header: "Connector",
      primary: true,
      sortable: true,
      sortValue: (row) => row.display_name || row.name,
      cell: (row) => (
        <div>
          <p className="font-semibold text-[color:var(--brand-navy)]">
            {row.display_name || row.name}
          </p>
          <code className="text-xs text-slate-600">{row.code}</code>
        </div>
      ),
    },
    {
      id: "environment",
      header: "Environment",
      cell: (row) => (
        <div className="space-y-1">
          <Badge tone={row.is_sandbox ? "amber" : "navy"} variant="soft">
            {row.is_sandbox ? "Sandbox" : "Live"}
          </Badge>
          <p className="truncate text-xs text-slate-600">
            {(row.is_sandbox ? row.sandbox_base_url : row.api_base_url) || "No base URL"}
          </p>
        </div>
      ),
    },
    {
      id: "auth",
      header: "Auth",
      cell: (row) => <code className="text-xs text-slate-700">{row.auth_type}</code>,
    },
    {
      id: "configured",
      header: "Configured",
      cell: (row) =>
        row.is_configured ? (
          <Badge tone="green" variant="soft">
            Complete
          </Badge>
        ) : (
          <Badge tone="orange" variant="soft">
            Incomplete
          </Badge>
        ),
    },
    {
      id: "health",
      header: "Health",
      cell: (row) => (
        <div className="space-y-1">
          <Badge tone={healthTone(row.health_status)} variant="soft" dot>
            {row.health_status || "unknown"}
          </Badge>
          <p className="text-xs text-slate-600">
            {row.consecutive_failures > 0
              ? `${row.consecutive_failures} consecutive failures`
              : `Last sync ${when(row.last_sync_at)}`}
          </p>
        </div>
      ),
    },
    {
      id: "active",
      header: "Active",
      cell: (row) =>
        row.is_active ? (
          <Badge tone="teal" variant="soft">
            Active
          </Badge>
        ) : (
          <Badge tone="neutral" variant="soft">
            Inactive
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTestResult(null);
              setEditing(row);
            }}
          >
            Configure
          </Button>
          {row.is_active && (
            <Button variant="ghost" size="sm" onClick={() => setDeactivating(row)}>
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  const total = list.data?.length ?? 0;
  const configured = (list.data ?? []).filter((row) => row.is_configured).length;
  const unhealthy = (list.data ?? []).filter((row) => row.consecutive_failures > 0).length;

  const testSlot = editing ? (
    <div className="rounded-[0.75rem] border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-[color:var(--brand-navy)]">
        Test configuration
      </h3>
      <p className="mt-1 text-xs text-slate-600">
        A config audit only — it makes no network call and contacts no carrier.
        It reports what this connector would still be missing.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        loading={audit.isPending}
        onClick={() => audit.mutate(editing.code)}
      >
        Audit configuration (no network call)
      </Button>

      {testResult && (
        <div className="mt-4 space-y-3 text-sm">
          <p className="font-semibold text-slate-800">
            {testResult.ready
              ? "Nothing missing — this connector is ready for dispatch to be enabled."
              : "Not ready yet."}
          </p>
          {testResult.missing && testResult.missing.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Missing
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-800">
                {testResult.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-slate-600">
            Checked {when(testResult.checked_at)} against the{" "}
            {testResult.environment ?? (editing.is_sandbox ? "sandbox" : "live")}{" "}
            configuration. No request left this server.
          </p>
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <ScreenHeader
        eyebrow="Integrations"
        title="Carrier connectors"
        description="Wiring for the third-party carriers we hand shipments to: endpoints, credentials, response mapping and retry policy."
        actions={
          <Button
            onClick={() => {
              setTestResult(null);
              setCreating(true);
            }}
          >
            New connector
          </Button>
        }
      />

      <Notice tone="warning" title="Live carrier calls are not enabled" className="mb-6">
        Nothing configured here dispatches yet. The server&rsquo;s single
        outbound seam is switched off, so this screen prepares connectors for
        when it is turned on — it does not book, track or cancel anything today.
      </Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Connectors" value={total} loading={list.isLoading} />
        <StatCard
          label="Fully configured"
          value={`${configured}/${total}`}
          hint="Passing the config audit"
          loading={list.isLoading}
        />
        <StatCard
          label="With failures recorded"
          value={unhealthy}
          hint="Consecutive failures above zero"
          loading={list.isLoading}
        />
      </div>

      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput
            label="Search connectors"
            placeholder="Code, name or base URL"
            onSearch={setSearch}
            wrapperClassName="max-w-sm flex-1"
          />
        </div>

        {list.isError ? (
          <EmptyState
            title="Could not load connectors"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : (
          <DataTable
            caption="Carrier connectors with their environment, auth type and health"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.code}
            loading={list.isLoading}
            emptyTitle={search ? "No connector matches that search" : "No connectors yet"}
            emptyDescription={
              search
                ? "Try a different code or name."
                : "Add a connector to start configuring a carrier integration."
            }
          />
        )}
      </div>

      <CarrierEditor
        open={openEditor}
        carrier={editing}
        saving={save.isPending}
        onClose={closeEditor}
        onSubmit={(payload) => save.mutate(payload)}
        testSlot={testSlot}
      />

      <ConfirmDialog
        open={Boolean(deactivating)}
        onClose={() => setDeactivating(null)}
        onConfirm={async () => {
          if (deactivating) await deactivate.mutateAsync(deactivating.code);
        }}
        tone="danger"
        title={`Deactivate ${deactivating?.display_name || deactivating?.name || ""}?`}
        description="The connector disappears from the public carrier list and stops being offered. Its configuration and stored credentials are kept, and you can reactivate it from the editor."
        confirmLabel="Deactivate"
      />
    </>
  );
}
