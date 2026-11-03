"use client";

/**
 * User directory.
 *
 * `GET /users/` is unpaginated and has no search, so both are done here over
 * the full list. Status changes and role changes are separate mutations
 * because the backend treats them differently: any admin may set a status,
 * only a super_admin may touch roles, and nobody may do either to themselves.
 *
 * There is no "create user" action on purpose — `POST /users/` answers with a
 * temporary password in the response body, and that flow needs rethinking
 * before it gets a screen.
 */

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  Pagination,
  SearchInput,
  Select,
  StatCard,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { Describe, Notice, ScreenHeader } from "@/components/admin/integrations/ScreenHeader";
import { useAuth } from "@/contexts/AuthContext";
import api, { errorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

interface DirectoryUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  status: string;
}

const STATUSES = ["active", "inactive", "suspended", "pending"] as const;

/** Mirrors the roles seeded by `app/models/__init__.py`. */
const ROLES = [
  "super_admin",
  "admin",
  "finance",
  "branch_manager",
  "agent",
  "rider",
  "merchant",
  "customer",
] as const;

const STATUS_TONES: Record<string, "green" | "neutral" | "red" | "amber"> = {
  active: "green",
  inactive: "neutral",
  suspended: "red",
  pending: "amber",
};

const ROLE_TONES: Record<string, "navy" | "teal" | "indigo" | "neutral"> = {
  super_admin: "navy",
  admin: "navy",
  finance: "indigo",
  branch_manager: "indigo",
  agent: "teal",
  rider: "teal",
  merchant: "teal",
  customer: "neutral",
};

const PER_PAGE = 20;

const fullName = (user: DirectoryUser) =>
  `${user.first_name} ${user.last_name}`.trim() || user.email;

export default function Page() {
  const cache = useQueryClient();
  const { user: current } = useAuth();
  const { success, error: errorToast } = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<DirectoryUser | null>(null);
  const [draftRoles, setDraftRoles] = useState<string[]>([]);

  const isSuperAdmin = Boolean(current?.roles.includes("super_admin"));

  const list = useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: async () => (await api.get<DirectoryUser[]>("/users/")).data,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (list.data ?? []).filter((user) => {
      if (roleFilter && !user.roles.includes(roleFilter)) return false;
      if (statusFilter && user.status !== statusFilter) return false;
      if (!term) return true;
      return [fullName(user), user.email, user.roles.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [list.data, search, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  // A filter change can leave the viewer past the end of the new result set.
  useEffect(() => {
    setPage((value) => Math.min(value, pageCount));
  }, [pageCount]);

  const rows = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page],
  );

  /** Protects the account you are signed in with, and other super_admins. */
  function lockedReason(user: DirectoryUser): string | null {
    if (user.id === current?.id) return "You cannot change your own account here.";
    if (user.roles.includes("super_admin") && !isSuperAdmin)
      return "Only a super_admin may edit an administrator account.";
    return null;
  }

  const changeStatus = useMutation({
    mutationFn: ({ user, status }: { user: DirectoryUser; status: string }) =>
      api.put(`/users/${user.id}`, { status }),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.admin.users() });
      success("Account status saved.");
    },
    onError: (err) =>
      errorToast("Could not change the status.", { description: errorMessage(err) }),
  });

  const changeRoles = useMutation({
    mutationFn: ({ user, roles }: { user: DirectoryUser; roles: string[] }) =>
      api.put(`/users/${user.id}`, { roles }),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.admin.users() });
      success("Roles saved.");
      setEditing(null);
    },
    onError: (err) =>
      errorToast("Could not change the roles.", {
        description: `${errorMessage(err)} Changing roles is restricted to super_admin accounts.`,
        duration: null,
      }),
  });

  const columns: DataTableColumn<DirectoryUser>[] = [
    {
      id: "user",
      header: "User",
      primary: true,
      sortable: true,
      sortValue: (row) => fullName(row),
      cell: (row) => (
        <div>
          <p className="font-semibold text-[color:var(--brand-navy)]">{fullName(row)}</p>
          <p className="text-xs text-slate-600">{row.email}</p>
        </div>
      ),
    },
    {
      id: "roles",
      header: "Roles",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.length === 0 ? (
            <span className="text-sm text-slate-600">None</span>
          ) : (
            row.roles.map((role) => (
              <Badge key={role} tone={ROLE_TONES[role] ?? "neutral"} variant="soft">
                {role.replace(/_/g, " ")}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortValue: (row) => row.status,
      cell: (row) => {
        const locked = lockedReason(row);
        return (
          <div className="space-y-1">
            <Select
              aria-label={`Account status for ${row.email}`}
              value={row.status}
              disabled={Boolean(locked) || changeStatus.isPending}
              onChange={(event) =>
                changeStatus.mutate({ user: row, status: event.target.value })
              }
              options={STATUSES.map((value) => ({ value, label: value }))}
            />
            {locked && <p className="text-xs text-slate-600">{locked}</p>}
          </div>
        );
      },
    },
    {
      id: "state",
      header: "State",
      hideOnMobile: true,
      cell: (row) => (
        <Badge tone={STATUS_TONES[row.status] ?? "neutral"} variant="soft" dot>
          {row.status}
        </Badge>
      ),
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
            setEditing(row);
            setDraftRoles(row.roles);
          }}
        >
          Roles
        </Button>
      ),
    },
  ];

  const editingLocked = editing ? lockedReason(editing) : null;
  const total = list.data?.length ?? 0;
  const admins = (list.data ?? []).filter((user) =>
    user.roles.some((role) => ["admin", "super_admin"].includes(role)),
  ).length;
  const suspended = (list.data ?? []).filter((user) => user.status !== "active").length;

  return (
    <>
      <ScreenHeader
        eyebrow="Administration"
        title="Users"
        description="Everyone with an account: customers, merchants, riders and staff."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Accounts" value={total} loading={list.isLoading} />
        <StatCard label="Staff and admins" value={admins} loading={list.isLoading} />
        <StatCard
          label="Not active"
          value={suspended}
          hint="Inactive, suspended or pending"
          loading={list.isLoading}
        />
      </div>

      {!isSuperAdmin && (
        <Notice className="mb-6" title="Role editing needs a super_admin">
          You can change account statuses. Role changes are refused by the API
          for anyone below super_admin, and the refusal is shown here rather
          than hidden.
        </Notice>
      )}

      <div className="panel">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SearchInput
            label="Search users"
            placeholder="Name, email or role"
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          <Field label="Role">
            <Select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any role" },
                ...ROLES.map((value) => ({ value, label: value.replace(/_/g, " ") })),
              ]}
            />
          </Field>
          <Field label="Status">
            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any status" },
                ...STATUSES.map((value) => ({ value, label: value })),
              ]}
            />
          </Field>
        </div>

        {list.isError ? (
          <EmptyState
            title="Could not load users"
            description={errorMessage(list.error)}
            action={<Button onClick={() => list.refetch()}>Try again</Button>}
          />
        ) : (
          <>
            <DataTable
              caption="User directory with roles and account status"
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              loading={list.isLoading}
              emptyTitle="No users match"
              emptyDescription="Try a different search or clear the filters."
            />
            {pageCount > 1 && (
              <div className="mt-4">
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  totalItems={filtered.length}
                  pageSize={PER_PAGE}
                  onPageChange={setPage}
                  label="User pages"
                />
              </div>
            )}
          </>
        )}
      </div>

      <Drawer
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Roles for ${fullName(editing)}` : "Roles"}
        description="Roles decide which parts of the console and API an account can reach."
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              loading={changeRoles.isPending}
              disabled={!isSuperAdmin || Boolean(editingLocked) || draftRoles.length === 0}
              onClick={() => editing && changeRoles.mutate({ user: editing, roles: draftRoles })}
            >
              Save roles
            </Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <dl>
              <Describe term="Email">{editing.email}</Describe>
              <Describe term="Status">{editing.status}</Describe>
              <Describe term="Current roles">
                {editing.roles.join(", ") || "None"}
              </Describe>
            </dl>

            {editingLocked && (
              <Notice tone="warning" title="Locked">
                {editingLocked}
              </Notice>
            )}
            {!isSuperAdmin && !editingLocked && (
              <Notice tone="warning" title="Read-only for you">
                Only a super_admin may update roles. Saving would come back as
                a 403 from the API.
              </Notice>
            )}

            <fieldset className="space-y-2" disabled={!isSuperAdmin || Boolean(editingLocked)}>
              <legend className="text-sm font-semibold text-[color:var(--brand-navy)]">
                Roles
              </legend>
              {ROLES.map((role) => (
                <Checkbox
                  key={role}
                  label={role.replace(/_/g, " ")}
                  checked={draftRoles.includes(role)}
                  onChange={(event) =>
                    setDraftRoles((previous) =>
                      event.target.checked
                        ? [...previous, role]
                        : previous.filter((value) => value !== role),
                    )
                  }
                />
              ))}
            </fieldset>

            {draftRoles.length === 0 && (
              <p className="text-sm font-semibold text-red-700">
                An account needs at least one role.
              </p>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
