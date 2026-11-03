"use client";

/**
 * Rider directory.
 *
 * A rider is a profile attached to an existing user account, not an account
 * of its own, so creating one takes a `user_id` and the API answers 409 when
 * that user already has a profile. That is a routine mistake rather than a
 * failure, so it is surfaced on the field that caused it.
 */

import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaMotorcycle } from "react-icons/fa";
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Modal,
  Pagination,
  Select,
  useToast,
  type BadgeTone,
  type DataTableColumn,
} from "@/components/kit";
import { errorMessage } from "@/lib/resources/client";
import { branches, geo, riders } from "@/lib/resources/operations";
import { queryKeys } from "@/lib/queryKeys";
import type { Rider, RiderStatus, VehicleType } from "@/types/logistics";
import { failureNotice, isConflict } from "@/components/admin/operations/errors";
import { dateTime, text, titleCase } from "@/components/admin/operations/format";
import { DistrictMultiSelect } from "@/components/admin/operations/DistrictMultiSelect";
import { FilterPanel, LoadError, PageHeader } from "@/components/admin/operations/Layout";

const PER_PAGE = 20;

const RIDER_STATUSES: RiderStatus[] = [
  "available",
  "on_duty",
  "off_duty",
  "on_leave",
  "suspended",
];

const VEHICLE_TYPES: VehicleType[] = ["bike", "scooter", "cycle", "van", "truck", "foot"];

const STATUS_TONES: Record<RiderStatus, BadgeTone> = {
  available: "green",
  on_duty: "blue",
  off_duty: "neutral",
  on_leave: "amber",
  suspended: "red",
};

interface RiderForm {
  user_id: string;
  rider_code: string;
  branch_id: string;
  phone: string;
  national_id: string;
  license_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  vehicle_type: VehicleType;
  vehicle_number: string;
  status: RiderStatus;
  serves_districts: string[];
  max_daily_capacity: string;
  handles_cod: boolean;
}

const BLANK_FORM: RiderForm = {
  user_id: "",
  rider_code: "",
  branch_id: "",
  phone: "",
  national_id: "",
  license_number: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  vehicle_type: "bike",
  vehicle_number: "",
  status: "available",
  serves_districts: [],
  max_daily_capacity: "30",
  handles_cod: true,
};

function toForm(rider: Rider): RiderForm {
  return {
    user_id: String(rider.user_id),
    rider_code: rider.rider_code,
    branch_id: rider.branch_id ? String(rider.branch_id) : "",
    phone: rider.phone ?? "",
    national_id: rider.national_id ?? "",
    license_number: rider.license_number ?? "",
    emergency_contact_name: rider.emergency_contact_name ?? "",
    emergency_contact_phone: rider.emergency_contact_phone ?? "",
    vehicle_type: rider.vehicle_type,
    vehicle_number: rider.vehicle_number ?? "",
    status: rider.status,
    serves_districts: rider.serves_districts ?? [],
    max_daily_capacity: String(rider.max_daily_capacity ?? 30),
    handles_cod: rider.handles_cod,
  };
}

/** Everything the API lets an admin write, minus the immutable identity. */
function toBody(form: RiderForm): Partial<Rider> {
  return {
    branch_id: form.branch_id ? Number(form.branch_id) : null,
    phone: form.phone.trim() || null,
    national_id: form.national_id.trim() || null,
    license_number: form.license_number.trim() || null,
    emergency_contact_name: form.emergency_contact_name.trim() || null,
    emergency_contact_phone: form.emergency_contact_phone.trim() || null,
    vehicle_type: form.vehicle_type,
    vehicle_number: form.vehicle_number.trim() || null,
    status: form.status,
    serves_districts: form.serves_districts,
    max_daily_capacity: Number(form.max_daily_capacity) || 0,
    handles_cod: form.handles_cod,
  };
}

export default function Page() {
  const toast = useToast();
  const cache = useQueryClient();

  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("");
  const [district, setDistrict] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Rider | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<RiderForm>(BLANK_FORM);
  const [userIdError, setUserIdError] = useState("");
  const [deactivating, setDeactivating] = useState<Rider | null>(null);

  const query = useMemo(
    () => ({
      page,
      per_page: PER_PAGE,
      branch_id: branchId ? Number(branchId) : undefined,
      status: (status || undefined) as RiderStatus | undefined,
      district: district || undefined,
    }),
    [branchId, district, page, status],
  );

  const list = useQuery({
    queryKey: queryKeys.riders.list(query),
    queryFn: () => riders.list(query),
    placeholderData: keepPreviousData,
  });

  const branchList = useQuery({
    queryKey: queryKeys.branches.list(),
    queryFn: () => branches.list(),
    staleTime: 10 * 60 * 1000,
  });

  const districtList = useQuery({
    queryKey: queryKeys.geo.districts(),
    queryFn: () => geo.districts(),
    staleTime: 60 * 60 * 1000,
  });

  const branchNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const branch of branchList.data ?? []) map.set(branch.id, branch.name);
    return map;
  }, [branchList.data]);

  const refresh = () => cache.invalidateQueries({ queryKey: queryKeys.riders.all });

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setUserIdError("");
  };

  const create = useMutation({
    mutationFn: () =>
      riders.create({ ...toBody(form), user_id: Number(form.user_id), rider_code: form.rider_code.trim() || undefined }),
    onSuccess: async (rider) => {
      toast.success("Rider created", {
        description: `${rider.name} is on the roster as ${rider.rider_code}.`,
      });
      closeForm();
      setForm(BLANK_FORM);
      await refresh();
    },
    onError: (error) => {
      if (isConflict(error)) {
        setUserIdError(
          errorMessage(error, "That user already has a rider profile.") +
            " Open the existing rider instead of creating a second profile.",
        );
        return;
      }
      const notice = failureNotice(error, "create the rider");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const update = useMutation({
    mutationFn: (rider: Rider) => riders.update(rider.id, toBody(form)),
    onSuccess: async (rider) => {
      toast.success("Rider saved", { description: `${rider.name}'s profile is up to date.` });
      closeForm();
      await refresh();
    },
    onError: (error) => {
      const notice = failureNotice(error, "save the rider");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const deactivate = useMutation({
    mutationFn: (rider: Rider) => riders.deactivate(rider.id),
    onSuccess: async () => {
      toast.success("Rider deactivated", {
        description: "They are off duty and keep their history, but can no longer be given work.",
      });
      setDeactivating(null);
      await refresh();
    },
    onError: (error) => {
      const notice = failureNotice(error, "deactivate the rider");
      toast.error(notice.title, { description: notice.description });
    },
  });

  const startCreate = () => {
    setForm(BLANK_FORM);
    setUserIdError("");
    setCreating(true);
  };

  const startEdit = (rider: Rider) => {
    setForm(toForm(rider));
    setUserIdError("");
    setEditing(rider);
  };

  const submit = () => {
    if (editing) {
      update.mutate(editing);
      return;
    }
    const userId = Number(form.user_id);
    if (!Number.isInteger(userId) || userId <= 0) {
      setUserIdError("A rider profile attaches to an existing user. Enter that user's numeric id.");
      return;
    }
    setUserIdError("");
    create.mutate();
  };

  const activeCount = [branchId, status, district].filter(Boolean).length;

  const clear = () => {
    setBranchId("");
    setStatus("");
    setDistrict("");
    setPage(1);
  };

  const columns: DataTableColumn<Rider>[] = [
    {
      id: "name",
      header: "Rider",
      primary: true,
      sortable: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-[color:var(--brand-navy)]">{row.name}</p>
          <p className="text-xs text-slate-600">
            {row.rider_code} &middot; {text(row.phone)}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Duty status",
      sortable: true,
      sortValue: (row) => row.status,
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={STATUS_TONES[row.status] ?? "neutral"} size="sm" dot>
            {titleCase(row.status)}
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
      id: "vehicle",
      header: "Vehicle",
      sortable: true,
      sortValue: (row) => row.vehicle_type,
      cell: (row) => (
        <div className="min-w-0">
          <p className="text-sm text-slate-800">{titleCase(row.vehicle_type)}</p>
          <p className="text-xs text-slate-600">{text(row.vehicle_number)}</p>
        </div>
      ),
    },
    {
      id: "branch",
      header: "Branch",
      sortable: true,
      sortValue: (row) => branchNames.get(row.branch_id ?? -1) ?? "",
      cell: (row) =>
        row.branch_id ? (
          (branchNames.get(row.branch_id) ?? `Branch #${row.branch_id}`)
        ) : (
          <span className="text-slate-600">Unassigned</span>
        ),
    },
    {
      id: "location",
      header: "Last location",
      hideOnMobile: true,
      sortable: true,
      sortValue: (row) => (row.location_updated_at ? new Date(row.location_updated_at) : null),
      cell: (row) => (
        <span className="text-sm text-slate-700">{dateTime(row.location_updated_at)}</span>
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
        <PageHeader title="Riders" />
        <LoadError message={errorMessage(list.error)} onRetry={() => void list.refetch()} />
      </>
    );
  }

  const formOpen = creating || editing !== null;
  const saving = create.isPending || update.isPending;

  return (
    <>
      <PageHeader
        title="Riders"
        description="Everyone who can be given a pickup or a delivery, and the branch they work out of."
        actions={<Button onClick={startCreate}>Add a rider</Button>}
      />

      <FilterPanel
        label="Rider filters"
        activeCount={activeCount}
        onClear={clear}
        note={
          district
            ? "Coverage is stored as JSON, so the API filters by district after it has paginated. A district-filtered page can hold fewer than twenty rows while later pages still have matches — that is the endpoint working as built, not a missing page."
            : undefined
        }
      >
        <Field label="Branch">
          <Select
            value={branchId}
            onChange={(event) => {
              setBranchId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Any branch</option>
            {(branchList.data ?? []).map((branch) => (
              <option key={branch.id} value={String(branch.id)}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Duty status">
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Any status</option>
            {RIDER_STATUSES.map((option) => (
              <option key={option} value={option}>
                {titleCase(option)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Serves district">
          <Select
            value={district}
            onChange={(event) => {
              setDistrict(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Any district</option>
            {(districtList.data ?? []).map((item) => (
              <option key={item.slug} value={item.name}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
      </FilterPanel>

      <div className="panel p-0! overflow-hidden">
        <DataTable
          caption="Riders matching the current filters"
          columns={columns}
          rows={list.data?.items ?? []}
          rowKey={(row) => row.id}
          loading={list.isLoading}
          skeletonRows={8}
          emptyTitle={activeCount > 0 ? "No riders match these filters" : "No riders yet"}
          emptyDescription={
            activeCount > 0
              ? "Clear the filters, or check the note above about district coverage."
              : "Add a rider profile to an existing user account to get started."
          }
          emptyIcon={<FaMotorcycle aria-hidden="true" />}
          emptyAction={<Button onClick={startCreate}>Add a rider</Button>}
        />
      </div>

      <Pagination
        className="mt-6"
        page={list.data?.page ?? page}
        pageCount={list.data?.pages ?? 1}
        totalItems={list.data?.total ?? 0}
        pageSize={list.data?.per_page ?? PER_PAGE}
        onPageChange={setPage}
        label="Rider pages"
      />

      <Modal
        open={formOpen}
        onClose={closeForm}
        size="lg"
        title={editing ? `Edit ${editing.name}` : "Add a rider"}
        description={
          editing
            ? `${editing.rider_code} · user #${editing.user_id}`
            : "The profile attaches to a user account that already exists."
        }
        footer={
          <>
            <Button variant="outline" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving}>
              {editing ? "Save rider" : "Create rider"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="User id"
                required
                error={userIdError || undefined}
                hint="The numeric id of an existing account with no rider profile."
              >
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={form.user_id}
                  onChange={(event) => setForm({ ...form, user_id: event.target.value })}
                />
              </Field>
              <Field label="Rider code" showOptional hint="Generated when left blank.">
                <Input
                  value={form.rider_code}
                  placeholder="RD-A1B2C3"
                  onChange={(event) => setForm({ ...form, rider_code: event.target.value })}
                />
              </Field>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Home branch">
              <Select
                value={form.branch_id}
                onChange={(event) => setForm({ ...form, branch_id: event.target.value })}
              >
                <option value="">No branch</option>
                {(branchList.data ?? []).map((branch) => (
                  <option key={branch.id} value={String(branch.id)}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Duty status">
              <Select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as RiderStatus })
                }
                options={RIDER_STATUSES.map((option) => ({
                  value: option,
                  label: titleCase(option),
                }))}
              />
            </Field>

            <Field label="Phone">
              <Input
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </Field>

            <Field label="National ID" showOptional>
              <Input
                value={form.national_id}
                onChange={(event) => setForm({ ...form, national_id: event.target.value })}
              />
            </Field>

            <Field label="Vehicle type">
              <Select
                value={form.vehicle_type}
                onChange={(event) =>
                  setForm({ ...form, vehicle_type: event.target.value as VehicleType })
                }
                options={VEHICLE_TYPES.map((option) => ({
                  value: option,
                  label: titleCase(option),
                }))}
              />
            </Field>

            <Field label="Vehicle number" showOptional>
              <Input
                value={form.vehicle_number}
                onChange={(event) => setForm({ ...form, vehicle_number: event.target.value })}
              />
            </Field>

            <Field label="Licence number" showOptional>
              <Input
                value={form.license_number}
                onChange={(event) => setForm({ ...form, license_number: event.target.value })}
              />
            </Field>

            <Field label="Daily capacity" hint="Maximum parcels a shift should hold.">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={form.max_daily_capacity}
                onChange={(event) =>
                  setForm({ ...form, max_daily_capacity: event.target.value })
                }
              />
            </Field>

            <Field label="Emergency contact" showOptional>
              <Input
                value={form.emergency_contact_name}
                onChange={(event) =>
                  setForm({ ...form, emergency_contact_name: event.target.value })
                }
              />
            </Field>

            <Field label="Emergency phone" showOptional>
              <Input
                type="tel"
                value={form.emergency_contact_phone}
                onChange={(event) =>
                  setForm({ ...form, emergency_contact_phone: event.target.value })
                }
              />
            </Field>
          </div>

          <Checkbox
            label="Can carry cash on delivery"
            checked={form.handles_cod}
            onChange={(event) => setForm({ ...form, handles_cod: event.target.checked })}
          />

          <div className="space-y-1.5">
            <p
              id="rider-districts-label"
              className="text-sm font-semibold text-[color:var(--brand-navy)]"
            >
              Districts served
            </p>
            <DistrictMultiSelect
              aria-labelledby="rider-districts-label"
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
        title="Deactivate this rider?"
        confirmLabel="Deactivate"
        description={
          deactivating
            ? `${deactivating.name} (${deactivating.rider_code}) is put off duty and stops being offered for pickups and deliveries. Their past work stays on the profile, but there is no endpoint that reactivates a rider, so reversing this needs a change on the server.`
            : undefined
        }
        onConfirm={async () => {
          if (deactivating) await deactivate.mutateAsync(deactivating).catch(() => undefined);
        }}
      />

      <p className="sr-only" role="status">
        {list.isFetching ? "Loading riders" : `${list.data?.items.length ?? 0} riders shown`}
      </p>
    </>
  );
}
