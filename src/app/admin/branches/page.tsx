"use client";

/**
 * Branch network.
 *
 * `district` is not free text: the API resolves it against the national
 * district list and answers 400 for anything it does not recognise. So the
 * form offers the list rather than an input, and `serves_districts` — the
 * coverage a branch delivers into — is picked from the same source.
 *
 * Deactivation is soft. The row stays so historic shipments still resolve to
 * a branch, which the confirmation says in as many words.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaWarehouse } from "react-icons/fa";
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
  type BadgeTone,
  type DataTableColumn,
} from "@/components/kit";
import { errorMessage } from "@/lib/resources/client";
import { branches, geo } from "@/lib/resources/operations";
import { queryKeys } from "@/lib/queryKeys";
import type { Branch, BranchType } from "@/types/logistics";
import { failureNotice, isConflict } from "@/components/admin/operations/errors";
import { text, titleCase } from "@/components/admin/operations/format";
import { DistrictMultiSelect } from "@/components/admin/operations/DistrictMultiSelect";
import { FilterPanel, LoadError, PageHeader } from "@/components/admin/operations/Layout";

const BRANCH_TYPES: BranchType[] = ["hub", "branch", "pickup_point", "franchise"];

const TYPE_TONES: Record<BranchType, BadgeTone> = {
  hub: "navy",
  branch: "teal",
  pickup_point: "blue",
  franchise: "indigo",
};

const TYPE_LABELS: Record<BranchType, string> = {
  hub: "Hub",
  branch: "Branch",
  pickup_point: "Pickup point",
  franchise: "Franchise",
};

interface BranchForm {
  code: string;
  name: string;
  type: BranchType;
  district: string;
  city: string;
  address: string;
  landmark: string;
  postal_code: string;
  phone: string;
  alternate_phone: string;
  email: string;
  manager_name: string;
  opening_hours: string;
  serves_districts: string[];
  accepts_walk_in: boolean;
  handles_cod: boolean;
  handles_international: boolean;
}

const BLANK_FORM: BranchForm = {
  code: "",
  name: "",
  type: "branch",
  district: "",
  city: "",
  address: "",
  landmark: "",
  postal_code: "",
  phone: "",
  alternate_phone: "",
  email: "",
  manager_name: "",
  opening_hours: "",
  serves_districts: [],
  accepts_walk_in: true,
  handles_cod: true,
  handles_international: false,
};

function toForm(branch: Branch): BranchForm {
  return {
    code: branch.code,
    name: branch.name,
    type: branch.type,
    district: branch.district ?? "",
    city: branch.city ?? "",
    address: branch.address ?? "",
    landmark: branch.landmark ?? "",
    postal_code: branch.postal_code ?? "",
    phone: branch.phone ?? "",
    alternate_phone: branch.alternate_phone ?? "",
    email: branch.email ?? "",
    manager_name: branch.manager_name ?? "",
    opening_hours: branch.opening_hours ?? "",
    serves_districts: branch.serves_districts ?? [],
    accepts_walk_in: branch.accepts_walk_in,
    handles_cod: branch.handles_cod,
    handles_international: branch.handles_international,
  };
}

function toBody(form: BranchForm): Partial<Branch> {
  return {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    type: form.type,
    district: form.district,
    city: form.city.trim() || null,
    address: form.address.trim() || null,
    landmark: form.landmark.trim() || null,
    postal_code: form.postal_code.trim() || null,
    phone: form.phone.trim() || null,
    alternate_phone: form.alternate_phone.trim() || null,
    email: form.email.trim() || null,
    manager_name: form.manager_name.trim() || null,
    opening_hours: form.opening_hours.trim() || null,
    serves_districts: form.serves_districts,
    accepts_walk_in: form.accepts_walk_in,
    handles_cod: form.handles_cod,
    handles_international: form.handles_international,
  };
}

export default function Page() {
  const toast = useToast();
  const cache = useQueryClient();

  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [province, setProvince] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm>(BLANK_FORM);
  const [codeError, setCodeError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [deactivating, setDeactivating] = useState<Branch | null>(null);

  const filters = useMemo(
    () => ({
      district: district || undefined,
      type: type || undefined,
      province: province || undefined,
    }),
    [district, province, type],
  );

  const list = useQuery({
    queryKey: queryKeys.branches.list(filters),
    queryFn: () => branches.list(filters),
  });

  const districtList = useQuery({
    queryKey: queryKeys.geo.districts(),
    queryFn: () => geo.districts(),
    staleTime: 60 * 60 * 1000,
  });

  const provinceList = useQuery({
    queryKey: queryKeys.geo.provinces,
    queryFn: () => geo.provinces(),
    staleTime: 60 * 60 * 1000,
  });

  const refresh = () => cache.invalidateQueries({ queryKey: queryKeys.branches.all });

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setCodeError("");
    setDistrictError("");
  };

  const create = useMutation({
    mutationFn: () => branches.create(toBody(form)),
    onSuccess: async (branch) => {
      toast.success("Branch created", {
        description: `${branch.name} (${branch.code}) is on the network in ${branch.district}.`,
      });
      closeForm();
      setForm(BLANK_FORM);
      await refresh();
    },
    onError: (error) => {
      if (isConflict(error)) {
        setCodeError(errorMessage(error, "That branch code is already in use."));
        return;
      }
      const notice = failureNotice(error, "create the branch");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const update = useMutation({
    mutationFn: (branch: Branch) => branches.update(branch.id, toBody(form)),
    onSuccess: async (branch) => {
      toast.success("Branch saved", { description: `${branch.name} is up to date.` });
      closeForm();
      await refresh();
    },
    onError: (error) => {
      if (isConflict(error)) {
        setCodeError(errorMessage(error, "That branch code is already in use."));
        return;
      }
      const notice = failureNotice(error, "save the branch");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const deactivate = useMutation({
    mutationFn: (branch: Branch) => branches.deactivate(branch.id),
    onSuccess: async () => {
      toast.success("Branch deactivated", {
        description: "It no longer takes new work. The record stays for historic shipments.",
      });
      setDeactivating(null);
      await refresh();
    },
    onError: (error) => {
      const notice = failureNotice(error, "deactivate the branch");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const startCreate = () => {
    setForm(BLANK_FORM);
    setCodeError("");
    setDistrictError("");
    setCreating(true);
  };

  const startEdit = (branch: Branch) => {
    setForm(toForm(branch));
    setCodeError("");
    setDistrictError("");
    setEditing(branch);
  };

  const submit = () => {
    if (!form.code.trim()) {
      setCodeError("A branch code is required.");
      return;
    }
    if (!form.district) {
      setDistrictError("Choose a district. The API rejects any value outside the national list.");
      return;
    }
    setCodeError("");
    setDistrictError("");
    if (editing) update.mutate(editing);
    else create.mutate();
  };

  const activeCount = [district, type, province].filter(Boolean).length;

  const clear = () => {
    setDistrict("");
    setType("");
    setProvince("");
  };

  const columns: DataTableColumn<Branch>[] = [
    {
      id: "name",
      header: "Branch",
      primary: true,
      sortable: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-[color:var(--brand-navy)]">{row.name}</p>
          <p className="text-xs text-slate-600">{row.code}</p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      sortable: true,
      sortValue: (row) => row.type,
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={TYPE_TONES[row.type] ?? "neutral"} size="sm">
            {TYPE_LABELS[row.type] ?? titleCase(row.type)}
          </Badge>
          {!row.is_active && (
            <Badge tone="neutral" size="sm" variant="outline">
              Deactivated
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "district",
      header: "District",
      sortable: true,
      sortValue: (row) => row.district ?? "",
      cell: (row) => (
        <div className="min-w-0">
          <p className="text-sm text-slate-800">{text(row.district)}</p>
          <p className="text-xs text-slate-600">{text(row.province)}</p>
        </div>
      ),
    },
    {
      id: "coverage",
      header: "Serves",
      hideOnMobile: true,
      sortable: true,
      sortValue: (row) => row.serves_districts?.length ?? 0,
      cell: (row) => (
        <span className="text-sm text-slate-700">
          {row.serves_districts?.length
            ? `${row.serves_districts.length} district${row.serves_districts.length === 1 ? "" : "s"}`
            : "No coverage set"}
        </span>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: (row) => <span className="text-sm text-slate-800">{text(row.phone)}</span>,
    },
    {
      id: "cod",
      header: "COD",
      sortable: true,
      sortValue: (row) => row.handles_cod,
      cell: (row) =>
        row.handles_cod ? (
          <Badge tone="green" size="sm">
            Handles COD
          </Badge>
        ) : (
          <span className="text-sm text-slate-600">No COD</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      srOnlyHeader: true,
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button variant="outline" size="sm" onClick={() => startEdit(row)}>
            Edit<span className="sr-only"> {row.name}</span>
          </Button>
          {row.is_active && (
            <Button variant="ghost" size="sm" onClick={() => setDeactivating(row)}>
              Deactivate<span className="sr-only"> {row.name}</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (list.isError) {
    return (
      <>
        <PageHeader title="Branches" />
        <LoadError message={errorMessage(list.error)} onRetry={() => void list.refetch()} />
      </>
    );
  }

  const formOpen = creating || editing !== null;
  const saving = create.isPending || update.isPending;

  return (
    <>
      <PageHeader
        title="Branches"
        description="Hubs, branches, pickup points and franchises, and the districts each one delivers into."
        actions={<Button onClick={startCreate}>Add a branch</Button>}
      />

      <FilterPanel label="Branch filters" activeCount={activeCount} onClear={clear}>
        <Field label="District">
          <Select value={district} onChange={(event) => setDistrict(event.target.value)}>
            <option value="">Any district</option>
            {(districtList.data ?? []).map((item) => (
              <option key={item.slug} value={item.name}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Type">
          <Select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">Any type</option>
            {BRANCH_TYPES.map((option) => (
              <option key={option} value={option}>
                {TYPE_LABELS[option]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Province">
          <Select value={province} onChange={(event) => setProvince(event.target.value)}>
            <option value="">Any province</option>
            {(provinceList.data ?? []).map((item) => (
              <option key={item.code} value={item.name}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
      </FilterPanel>

      <div className="panel p-0! overflow-hidden">
        <DataTable
          caption="Branches matching the current filters"
          columns={columns}
          rows={list.data ?? []}
          rowKey={(row) => row.id}
          loading={list.isLoading}
          skeletonRows={8}
          emptyTitle={activeCount > 0 ? "No branches match these filters" : "No branches yet"}
          emptyDescription={
            activeCount > 0
              ? "Clear the filters to see the whole network."
              : "Add the first hub to start routing shipments."
          }
          emptyIcon={<FaWarehouse aria-hidden="true" />}
          emptyAction={<Button onClick={startCreate}>Add a branch</Button>}
          defaultSort={{ columnId: "name", direction: "asc" }}
        />
      </div>

      <Modal
        open={formOpen}
        onClose={closeForm}
        size="lg"
        title={editing ? `Edit ${editing.name}` : "Add a branch"}
        description={
          editing
            ? `${editing.code} · ${text(editing.district)}`
            : "Province is filled in from the district, so there is no need to set it here."
        }
        footer={
          <>
            <Button variant="outline" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving}>
              {editing ? "Save branch" : "Create branch"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code" required error={codeError || undefined}>
              <Input
                value={form.code}
                placeholder="KTM-01"
                onChange={(event) => setForm({ ...form, code: event.target.value })}
              />
            </Field>

            <Field label="Name" required>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </Field>

            <Field label="Type">
              <Select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value as BranchType })
                }
                options={BRANCH_TYPES.map((option) => ({
                  value: option,
                  label: TYPE_LABELS[option],
                }))}
              />
            </Field>

            <Field
              label="District"
              required
              error={districtError || undefined}
              hint="Resolved against the national list; anything else is a 400."
            >
              <Select
                value={form.district}
                disabled={districtList.isLoading}
                onChange={(event) => setForm({ ...form, district: event.target.value })}
              >
                <option value="">
                  {districtList.isLoading ? "Loading districts…" : "Choose a district"}
                </option>
                {(districtList.data ?? []).map((item) => (
                  <option key={item.slug} value={item.name}>
                    {item.name} &middot; {item.province}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="City" showOptional>
              <Input
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
              />
            </Field>

            <Field label="Postal code" showOptional>
              <Input
                value={form.postal_code}
                onChange={(event) => setForm({ ...form, postal_code: event.target.value })}
              />
            </Field>

            <Field label="Phone">
              <Input
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </Field>

            <Field label="Alternate phone" showOptional>
              <Input
                type="tel"
                value={form.alternate_phone}
                onChange={(event) => setForm({ ...form, alternate_phone: event.target.value })}
              />
            </Field>

            <Field label="Email" showOptional>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Field>

            <Field label="Manager" showOptional>
              <Input
                value={form.manager_name}
                onChange={(event) => setForm({ ...form, manager_name: event.target.value })}
              />
            </Field>

            <Field label="Landmark" showOptional>
              <Input
                value={form.landmark}
                onChange={(event) => setForm({ ...form, landmark: event.target.value })}
              />
            </Field>

            <Field label="Opening hours" showOptional>
              <Input
                value={form.opening_hours}
                placeholder={"Sun–Fri 09:00–18:00"}
                onChange={(event) => setForm({ ...form, opening_hours: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Address" showOptional>
            <Textarea
              rows={2}
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
            />
          </Field>

          <div className="space-y-1">
            <Checkbox
              label="Accepts walk-in customers"
              checked={form.accepts_walk_in}
              onChange={(event) => setForm({ ...form, accepts_walk_in: event.target.checked })}
            />
            <Checkbox
              label="Handles cash on delivery"
              checked={form.handles_cod}
              onChange={(event) => setForm({ ...form, handles_cod: event.target.checked })}
            />
            <Checkbox
              label="Handles international shipments"
              checked={form.handles_international}
              onChange={(event) =>
                setForm({ ...form, handles_international: event.target.checked })
              }
            />
          </div>

          <div className="space-y-1.5">
            <p
              id="branch-districts-label"
              className="text-sm font-semibold text-[color:var(--brand-navy)]"
            >
              Districts this branch delivers into
            </p>
            <DistrictMultiSelect
              aria-labelledby="branch-districts-label"
              value={form.serves_districts}
              districts={districtList.data ?? []}
              loading={districtList.isLoading}
              onChange={(next) => setForm({ ...form, serves_districts: next })}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deactivating !== null}
        onClose={() => setDeactivating(null)}
        tone="danger"
        title="Deactivate this branch?"
        confirmLabel="Deactivate"
        description={
          deactivating
            ? `${deactivating.name} (${deactivating.code}) stops taking new work and drops out of district coverage. This is a soft deactivate — the record is kept so shipments and riders already pointing at it still resolve — but there is no endpoint that turns a branch back on, so reversing it needs a change on the server.`
            : undefined
        }
        onConfirm={async () => {
          if (deactivating) await deactivate.mutateAsync(deactivating).catch(() => undefined);
        }}
      />

      <p className="sr-only" role="status">
        {list.isFetching ? "Loading branches" : `${list.data?.length ?? 0} branches shown`}
      </p>
    </>
  );
}
