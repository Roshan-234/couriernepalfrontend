"use client";

/**
 * Outbound webhook endpoints.
 *
 * Delivery is not switched on yet: `webhooks.test` writes a pending delivery
 * row and stops there. The screen says so rather than implying a POST left
 * the building.
 *
 * The signing secret is returned exactly once, by the create call. It is held
 * in component state for the modal that shows it and never written into the
 * query cache, so it cannot be read back off a later render.
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
  Modal,
  Pagination,
  Skeleton,
  Tabs,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { Describe, Notice, ScreenHeader, when } from "@/components/admin/integrations/ScreenHeader";
import { webhooks } from "@/lib/resources/integrations";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { WebhookDelivery, WebhookEndpoint } from "@/types/logistics";

/** Mirrors `WebhookEndpoint.EVENTS` on the backend model. */
const EVENTS = [
  "shipment.created",
  "shipment.status_changed",
  "shipment.picked_up",
  "shipment.out_for_delivery",
  "shipment.delivered",
  "shipment.delivery_failed",
  "shipment.returned",
  "shipment.cancelled",
  "pickup.scheduled",
  "pickup.completed",
  "cod.collected",
  "cod.remitted",
  "payment.succeeded",
  "payment.failed",
] as const;

const DELIVERY_TONES: Record<WebhookDelivery["status"], "neutral" | "green" | "amber" | "red"> = {
  pending: "neutral",
  delivered: "green",
  failed: "amber",
  exhausted: "red",
};

function EventPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (event: string) => void;
}) {
  return (
    <fieldset className="rounded-[0.6rem] border border-slate-200 p-3">
      <legend className="px-1 text-sm font-semibold text-[color:var(--brand-navy)]">
        Events
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {EVENTS.map((event) => (
          <Checkbox
            key={event}
            label={<code className="text-xs">{event}</code>}
            checked={selected.includes(event)}
            onChange={() => onToggle(event)}
          />
        ))}
      </div>
    </fieldset>
  );
}

export default function Page() {
  const cache = useQueryClient();
  const { success, error: errorToast, info } = useToast();

  const [creatingOpen, setCreatingOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [selected, setSelected] = useState<WebhookEndpoint | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEvents, setEditEvents] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [removing, setRemoving] = useState<WebhookEndpoint | null>(null);

  const list = useQuery({
    queryKey: queryKeys.webhooks.list,
    queryFn: () => webhooks.list(),
  });

  const deliveries = useQuery({
    queryKey: [...queryKeys.webhooks.deliveries(selected?.id ?? 0), deliveryPage],
    queryFn: () => webhooks.deliveries(selected!.id, { page: deliveryPage, per_page: 20 }),
    enabled: Boolean(selected),
  });

  function openEndpoint(endpoint: WebhookEndpoint) {
    setSelected(endpoint);
    setEditUrl(endpoint.url);
    setEditDescription(endpoint.description ?? "");
    setEditEvents(endpoint.events ?? []);
    setEditActive(endpoint.is_active);
    setDeliveryPage(1);
  }

  const create = useMutation({
    mutationFn: () =>
      webhooks.create({
        url: newUrl.trim(),
        events: newEvents,
        description: newDescription.trim() || undefined,
      }),
    onSuccess: async (endpoint) => {
      await cache.invalidateQueries({ queryKey: queryKeys.webhooks.all });
      setCreatingOpen(false);
      setNewUrl("");
      setNewDescription("");
      setNewEvents([]);
      // Held in local state only — deliberately never cached.
      if (endpoint.secret) {
        setCopied(false);
        setRevealedSecret(endpoint.secret);
      } else {
        success("Endpoint created.");
      }
    },
    onError: (err) =>
      errorToast("Could not create the endpoint.", { description: errorMessage(err) }),
  });

  const update = useMutation({
    mutationFn: () =>
      webhooks.update(selected!.id, {
        url: editUrl.trim(),
        description: editDescription.trim(),
        events: editEvents,
        is_active: editActive,
      }),
    onSuccess: async (endpoint) => {
      await cache.invalidateQueries({ queryKey: queryKeys.webhooks.all });
      setSelected(endpoint);
      success("Endpoint saved.");
    },
    onError: (err) => errorToast("Could not save the endpoint.", { description: errorMessage(err) }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => webhooks.remove(id),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.webhooks.all });
      success("Endpoint deleted.");
      setRemoving(null);
      setSelected(null);
    },
    onError: (err) =>
      errorToast("Could not delete the endpoint.", { description: errorMessage(err) }),
  });

  const sendTest = useMutation({
    mutationFn: (id: number) => webhooks.test(id),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.webhooks.all });
      info("Test delivery queued.", {
        description:
          "A pending delivery row was written. Nothing has been sent — outbound delivery is not enabled yet.",
      });
    },
    onError: (err) =>
      errorToast("Could not queue the test delivery.", { description: errorMessage(err) }),
  });

  const columns: DataTableColumn<WebhookEndpoint>[] = [
    {
      id: "url",
      header: "Endpoint",
      primary: true,
      cell: (row) => (
        <div>
          <p className="break-all font-semibold text-[color:var(--brand-navy)]">{row.url}</p>
          {row.description && <p className="text-xs text-slate-600">{row.description}</p>}
        </div>
      ),
    },
    {
      id: "events",
      header: "Events",
      cell: (row) => (
        <span className="text-sm text-slate-800">
          {row.events?.length ?? 0} subscribed
        </span>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: (row) =>
        row.disabled_at ? (
          <Badge tone="red" variant="soft" dot>
            Auto-disabled
          </Badge>
        ) : row.is_active ? (
          <Badge tone="green" variant="soft" dot>
            Active
          </Badge>
        ) : (
          <Badge tone="neutral" variant="soft">
            Paused
          </Badge>
        ),
    },
    {
      id: "health",
      header: "Health",
      cell: (row) => (
        <div className="text-xs text-slate-700">
          <p>
            {row.consecutive_failures > 0
              ? `${row.consecutive_failures} consecutive failures`
              : "No recent failures"}
          </p>
          <p className="text-slate-600">Last success {when(row.last_success_at)}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => openEndpoint(row)}>
            Open
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setRemoving(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const deliveryColumns: DataTableColumn<WebhookDelivery>[] = [
    {
      id: "event",
      header: "Event",
      primary: true,
      cell: (row) => <code className="text-xs">{row.event_type}</code>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge tone={DELIVERY_TONES[row.status] ?? "neutral"} variant="soft">
          {row.status}
        </Badge>
      ),
    },
    { id: "attempts", header: "Attempts", cell: (row) => row.attempt_count },
    {
      id: "response",
      header: "Response",
      cell: (row) => (
        <span className="text-sm text-slate-800">{row.response_status ?? "—"}</span>
      ),
    },
    {
      id: "created",
      header: "Queued",
      hideOnMobile: true,
      cell: (row) => <span className="text-xs text-slate-700">{when(row.created_at)}</span>,
    },
    {
      id: "error",
      header: "Error",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs text-red-800">{row.error ? row.error : "—"}</span>
      ),
    },
  ];

  const settingsPane = selected && (
    <div className="space-y-4">
      <dl>
        <Describe term="Signature header">{selected.signature_header}</Describe>
        <Describe term="Signature algorithm">{selected.signature_algo}</Describe>
        <Describe term="Signing secret">
          <code>{selected.secret_masked ?? "Stored"}</code>
        </Describe>
        <Describe term="Consecutive failures">{selected.consecutive_failures}</Describe>
        <Describe term="Last success">{when(selected.last_success_at)}</Describe>
        <Describe term="Last failure">{when(selected.last_failure_at)}</Describe>
        <Describe term="Auto-disabled">
          {selected.disabled_at ? when(selected.disabled_at) : "No"}
        </Describe>
        <Describe term="Last error">
          <span className="text-red-800">{selected.last_error || "None"}</span>
        </Describe>
      </dl>

      {selected.disabled_at && (
        <Notice tone="warning" title="This endpoint was disabled automatically">
          Too many consecutive failures. Fix the receiving end, then re-enable
          it below.
        </Notice>
      )}

      <Field label="URL">
        <Input value={editUrl} onChange={(event) => setEditUrl(event.target.value)} />
      </Field>
      <Field label="Description">
        <Input
          value={editDescription}
          onChange={(event) => setEditDescription(event.target.value)}
        />
      </Field>
      <EventPicker
        selected={editEvents}
        onToggle={(event) =>
          setEditEvents((previous) =>
            previous.includes(event)
              ? previous.filter((value) => value !== event)
              : [...previous, event],
          )
        }
      />
      <Checkbox
        label="Active"
        hint="Paused endpoints keep their configuration but receive nothing."
        checked={editActive}
        onChange={(event) => setEditActive(event.target.checked)}
      />
      <div className="flex flex-wrap gap-2">
        <Button loading={update.isPending} onClick={() => update.mutate()}>
          Save endpoint
        </Button>
        <Button
          variant="outline"
          loading={sendTest.isPending}
          onClick={() => sendTest.mutate(selected.id)}
        >
          Queue test delivery
        </Button>
      </div>
      <p className="text-xs text-slate-600">
        &ldquo;Queue test delivery&rdquo; writes a pending row to the delivery
        log. It does not send an HTTP request — outbound delivery is not
        enabled yet.
      </p>
    </div>
  );

  const deliveriesPane = selected && (
    <div className="space-y-4">
      {deliveries.isError ? (
        <EmptyState
          title="Could not load deliveries"
          description={errorMessage(deliveries.error)}
          action={<Button onClick={() => deliveries.refetch()}>Try again</Button>}
        />
      ) : (
        <>
          <DataTable
            caption={`Delivery attempts for ${selected.url}`}
            columns={deliveryColumns}
            rows={deliveries.data?.items ?? []}
            rowKey={(row) => row.id}
            loading={deliveries.isLoading}
            density="compact"
            emptyTitle="No deliveries yet"
            emptyDescription="Nothing has been queued for this endpoint."
          />
          {(deliveries.data?.pages ?? 1) > 1 && (
            <Pagination
              page={deliveries.data?.page ?? 1}
              pageCount={deliveries.data?.pages ?? 1}
              totalItems={deliveries.data?.total}
              pageSize={deliveries.data?.per_page}
              onPageChange={setDeliveryPage}
              label="Delivery pages"
            />
          )}
        </>
      )}
    </div>
  );

  const endpoints = useMemo(() => list.data ?? [], [list.data]);

  return (
    <>
      <ScreenHeader
        eyebrow="Integrations"
        title="Webhook endpoints"
        description="Where we will post shipment, pickup, COD and payment events once outbound delivery is switched on."
        actions={<Button onClick={() => setCreatingOpen(true)}>Add endpoint</Button>}
      />

      <Notice tone="warning" title="Outbound delivery is not enabled" className="mb-6">
        Endpoints, events and signing secrets are all real and stored. Sending
        is not: a queued delivery stays <code>pending</code> until the sender
        is turned on.
      </Notice>

      <div className="panel">
        {list.isError ? (
          <EmptyState
            title="Could not load endpoints"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : (
          <DataTable
            caption="Webhook endpoints with their subscribed events and delivery health"
            columns={columns}
            rows={endpoints}
            rowKey={(row) => row.id}
            loading={list.isLoading}
            emptyTitle="No endpoints yet"
            emptyDescription="Add an endpoint to subscribe a system of yours to courier events."
            emptyAction={<Button onClick={() => setCreatingOpen(true)}>Add endpoint</Button>}
          />
        )}
      </div>

      <Modal
        open={creatingOpen}
        onClose={() => setCreatingOpen(false)}
        title="New webhook endpoint"
        description="The signing secret is generated on save and shown once."
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreatingOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={create.isPending}
              disabled={!newUrl.trim() || newEvents.length === 0}
              onClick={() => create.mutate()}
            >
              Create endpoint
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="URL" required hint="Must be reachable over HTTPS from our servers.">
            <Input
              value={newUrl}
              placeholder="https://example.com/hooks/courier"
              onChange={(event) => setNewUrl(event.target.value)}
            />
          </Field>
          <Field label="Description" showOptional>
            <Input
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
            />
          </Field>
          <EventPicker
            selected={newEvents}
            onToggle={(event) =>
              setNewEvents((previous) =>
                previous.includes(event)
                  ? previous.filter((value) => value !== event)
                  : [...previous, event],
              )
            }
          />
          {newEvents.length === 0 && (
            <p className="text-sm text-slate-700">Pick at least one event.</p>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(revealedSecret)}
        onClose={() => setRevealedSecret(null)}
        title="Copy the signing secret now"
        description="This is the only time it is shown. It is not stored anywhere you can read it back."
        size="lg"
        closeOnOverlayClick={false}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setRevealedSecret(null)}>
              I have saved it
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Notice tone="warning" title="This will not be shown again">
            Store it in your secret manager before closing this dialog. If you
            lose it, delete the endpoint and create a new one.
          </Notice>
          <pre className="overflow-x-auto rounded-[0.6rem] border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800">
            {revealedSecret}
          </pre>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!revealedSecret) return;
              try {
                await navigator.clipboard.writeText(revealedSecret);
                setCopied(true);
              } catch {
                errorToast("Could not copy.", {
                  description: "Select the secret above and copy it manually.",
                });
              }
            }}
          >
            {copied ? "Copied" : "Copy secret"}
          </Button>
        </div>
      </Modal>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        size="lg"
        title={selected?.url ?? "Endpoint"}
        description="Settings and delivery history for this endpoint."
      >
        {selected ? (
          <Tabs
            label="Endpoint detail"
            variant="pill"
            items={[
              { id: "settings", label: "Settings", content: settingsPane },
              { id: "deliveries", label: "Deliveries", content: deliveriesPane },
            ]}
          />
        ) : (
          <Skeleton lines={6} />
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (removing) await remove.mutateAsync(removing.id);
        }}
        tone="danger"
        title="Delete this endpoint?"
        description="The endpoint, its signing secret and its delivery history go away. This cannot be undone."
        confirmLabel="Delete endpoint"
      />
    </>
  );
}
