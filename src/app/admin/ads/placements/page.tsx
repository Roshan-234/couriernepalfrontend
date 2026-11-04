"use client";

/**
 * Advert placements — the named slots a creative can occupy.
 *
 * Slots are rows rather than hard-coded template positions, so this screen
 * is where marketing sees what exists. Two things it has to be honest
 * about: deactivating a slot stops everything in it serving, whatever the
 * campaigns say, and a slot with creatives in it cannot be deleted — the
 * API refuses rather than cascading somebody's artwork away.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
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
  SearchInput,
  StatCard,
  Textarea,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { Notice, ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { FormSection } from "@/components/admin/marketing/shared";
import {
  adPlacements,
  type AdPlacementRow,
  type PlacementWrite,
} from "@/lib/resources/advertising";
import { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

interface Form {
  code: string;
  name: string;
  description: string;
  recommended_width: string;
  recommended_height: string;
  max_creatives: string;
  is_active: boolean;
}

const blank: Form = {
  code: "",
  name: "",
  description: "",
  recommended_width: "",
  recommended_height: "",
  max_creatives: "1",
  is_active: true,
};

function formFrom(row: AdPlacementRow): Form {
  return {
    code: row.code,
    name: row.name,
    description: row.description ?? "",
    recommended_width: row.recommended_width === null ? "" : String(row.recommended_width),
    recommended_height: row.recommended_height === null ? "" : String(row.recommended_height),
    max_creatives: String(row.max_creatives ?? 1),
    is_active: row.is_active,
  };
}

export default function Page() {
  const cache = useQueryClient();
  const { success, error: errorToast } = useToast();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdPlacementRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdPlacementRow | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [showErrors, setShowErrors] = useState(false);

  const list = useQuery({
    queryKey: queryKeys.adsAdmin.placements,
    queryFn: () => adPlacements.list(),
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = list.data ?? [];
    if (!term) return all;
    return all.filter((row) =>
      [row.code, row.name, row.description ?? ""].join(" ").toLowerCase().includes(term),
    );
  }, [list.data, search]);

  function openEditor(row: AdPlacementRow | null) {
    setForm(row ? formFrom(row) : blank);
    setShowErrors(false);
    setEditing(row);
    setCreating(row === null);
  }

  function closeEditor() {
    setEditing(null);
    setCreating(false);
  }

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const errors: Partial<Record<keyof Form, string>> = {};
  if (!form.code.trim()) errors.code = "A code is required — the public side renders a slot by its code.";
  if (!form.name.trim()) errors.name = "A name is required.";
  for (const key of ["recommended_width", "recommended_height"] as const) {
    const value = form[key].trim();
    if (value && !/^\d+$/.test(value)) errors[key] = "A whole number of pixels, or empty.";
    else if (value && (Number(value) < 1 || Number(value) > 10000)) {
      errors[key] = "Between 1 and 10000 pixels.";
    }
  }
  if (!/^\d+$/.test(form.max_creatives.trim())) errors.max_creatives = "A whole number.";
  else if (Number(form.max_creatives) < 1 || Number(form.max_creatives) > 20) {
    errors.max_creatives = "Between 1 and 20.";
  }
  const invalid = Object.keys(errors).length > 0;
  const show = (key: keyof Form) => (showErrors ? errors[key] : undefined);

  const save = useMutation({
    mutationFn: (body: PlacementWrite) =>
      editing ? adPlacements.update(editing.id, body) : adPlacements.create(body),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.adsAdmin.all });
      success(editing ? "Placement saved." : "Placement created.");
      closeEditor();
    },
    onError: (err) =>
      errorToast("Could not save the placement.", { description: errorMessage(err) }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adPlacements.remove(id),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.adsAdmin.all });
      success("Placement deleted.");
      setDeleting(null);
    },
    onError: (err) =>
      errorToast("Could not delete the placement.", { description: errorMessage(err) }),
  });

  function submit() {
    setShowErrors(true);
    if (invalid) return;
    save.mutate({
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      recommended_width: form.recommended_width.trim() ? Number(form.recommended_width) : null,
      recommended_height: form.recommended_height.trim() ? Number(form.recommended_height) : null,
      max_creatives: Number(form.max_creatives),
      is_active: form.is_active,
    });
  }

  const columns: DataTableColumn<AdPlacementRow>[] = [
    {
      id: "placement",
      header: "Slot",
      primary: true,
      sortable: true,
      sortValue: (row) => row.code,
      cell: (row) => (
        <div>
          <p className="font-semibold text-[color:var(--brand-navy)]">{row.name}</p>
          <code className="text-xs text-slate-600">{row.code}</code>
          {row.description && (
            <p className="mt-1 max-w-xl text-xs text-slate-600">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      id: "size",
      header: "Recommended",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-xs tabular-nums text-slate-700">
          {row.recommended_width && row.recommended_height
            ? `${row.recommended_width}×${row.recommended_height}`
            : "—"}
        </span>
      ),
    },
    {
      id: "capacity",
      header: "Holds",
      align: "right",
      cell: (row) => (
        <span className="text-sm tabular-nums text-slate-800">{row.max_creatives}</span>
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
          <Badge tone="amber" variant="soft">
            Inactive — serves nothing
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
          <Button variant="outline" size="sm" onClick={() => openEditor(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const active = (list.data ?? []).filter((row) => row.is_active).length;
  const capacity = (list.data ?? []).reduce((sum, row) => sum + (row.max_creatives || 0), 0);

  return (
    <>
      <ScreenHeader
        eyebrow="Marketing"
        title="Advert placements"
        description="The slots the site has. A creative is assigned to one of these; the code is what the public page renders against."
        actions={
          <>
            <Link href="/admin/ads" className="action action-outline">
              Campaigns
            </Link>
            <Button onClick={() => openEditor(null)}>New placement</Button>
          </>
        }
      />

      <Notice tone="info" title="A slot is a hole in a page, not something that renders" className="mb-6">
        Placements are seeded active, unlike campaigns and creatives: an empty
        slot shows nothing by itself. Deactivating one is a blunt instrument —
        every creative in it stops being served, whatever its campaign says.
      </Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Slots" value={list.data?.length ?? 0} loading={list.isLoading} />
        <StatCard
          label="Active"
          value={`${active}/${list.data?.length ?? 0}`}
          loading={list.isLoading}
        />
        <StatCard
          label="Total capacity"
          value={capacity}
          hint="Creatives that could be on screen at once across the site"
          loading={list.isLoading}
        />
      </div>

      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput
            label="Search placements"
            placeholder="Code, name or description"
            onSearch={setSearch}
            wrapperClassName="max-w-sm flex-1"
          />
        </div>

        {list.isError ? (
          <EmptyState
            title="Could not load placements"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : (
          <DataTable
            caption="Advert placements with recommended size, capacity and whether they are active"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            loading={list.isLoading}
            mobileTitle={(row) => row.name}
            emptyTitle={search ? "No slot matches that search" : "No placements yet"}
            emptyDescription={
              search ? "Try a different code or name." : "Add a slot before assigning creatives."
            }
          />
        )}
      </div>

      <Drawer
        open={creating || Boolean(editing)}
        onClose={closeEditor}
        size="md"
        title={editing ? `Edit ${editing.name}` : "New placement"}
        description="The code has to match what the public page asks for."
        footer={
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            {showErrors && invalid && (
              <p role="alert" className="mr-auto text-sm font-semibold text-red-700">
                Fix the highlighted fields first.
              </p>
            )}
            <Button type="button" variant="outline" onClick={closeEditor} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} loading={save.isPending}>
              {editing ? "Save changes" : "Create placement"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-7">
          <FormSection title="Identity">
            <Field
              label="Code"
              required
              error={show("code")}
              hint="Lower case with underscores, e.g. home_hero. Changing it on an existing slot stops the page that renders it from finding anything."
            >
              <Input
                value={form.code}
                maxLength={60}
                onChange={(event) => set("code", event.target.value)}
              />
            </Field>
            <Field label="Name" required error={show("name")}>
              <Input
                value={form.name}
                maxLength={150}
                onChange={(event) => set("name", event.target.value)}
              />
            </Field>
            <Field
              label="Description"
              showOptional
              hint="Where it is and what it suits. Read by whoever is deciding where an offer should go."
            >
              <Textarea
                rows={3}
                value={form.description}
                maxLength={300}
                onChange={(event) => set("description", event.target.value)}
              />
            </Field>
          </FormSection>

          <FormSection
            title="Shape and capacity"
            description="The recommended size is advice for whoever makes the artwork; nothing is resized or rejected on it."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Recommended width" showOptional error={show("recommended_width")}>
                <Input
                  type="number"
                  value={form.recommended_width}
                  onChange={(event) => set("recommended_width", event.target.value)}
                />
              </Field>
              <Field label="Recommended height" showOptional error={show("recommended_height")}>
                <Input
                  type="number"
                  value={form.recommended_height}
                  onChange={(event) => set("recommended_height", event.target.value)}
                />
              </Field>
            </div>
            <Field
              label="Maximum creatives"
              required
              error={show("max_creatives")}
              hint="How many show at once. Above this, the highest priority wins and the rest are not served."
              >
              <Input
                type="number"
                value={form.max_creatives}
                onChange={(event) => set("max_creatives", event.target.value)}
              />
            </Field>
            <Checkbox
              label="Active"
              hint="Switching this off stops every creative in this slot being served, whatever its campaign says."
              checked={form.is_active}
              onChange={(event) => set("is_active", event.target.checked)}
            />
          </FormSection>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove.mutateAsync(deleting.id);
        }}
        tone="danger"
        title={`Delete ${deleting?.name ?? ""}?`}
        description="The API refuses while any creative still points at this slot — move or delete those first. Deactivating instead keeps the slot and its creatives, and serves nothing."
        confirmLabel="Delete placement"
      />
    </>
  );
}
