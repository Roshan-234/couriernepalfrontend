"use client";

/**
 * The retention schedule: what is kept, for how long, and why.
 *
 * Two things this screen has to do rather than tidy away. The `basis` is
 * the column an auditor reads, and several seeded rules still say
 * "[TO CONFIRM with counsel]" — that marker is meant to be seen and
 * removed by a person, so it is surfaced as a badge and the text is shown
 * in full. And `auto_purge` is scheduled deletion: switching it on gets a
 * confirmation that says plainly which rows go and after how long.
 *
 * `code` and `target` are not editable here because they are not editable
 * there: they name the rows a purge would delete, and a typo in them is a
 * deletion of the wrong table.
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Modal,
  Textarea,
  useToast,
  type DataTableColumn,
} from "@/components/kit";
import { Notice, when } from "@/components/admin/integrations/ScreenHeader";
import { QueryError } from "@/components/admin/finance/shared";
import { queryKeys } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/resources/client";
import { privacy, type RetentionRule } from "@/lib/resources/privacy";

/** The marker the backend writes into a basis it wants a lawyer to read. */
const TO_CONFIRM = "[TO CONFIRM";

function needsCounsel(rule: RetentionRule): boolean {
  return (rule.basis ?? "").includes(TO_CONFIRM);
}

/** "1095 days" is hard to weigh; "3 years" is not. Both are shown. */
function inYears(days: number): string {
  if (days < 365) return `${Math.round((days / 30) * 10) / 10} months`;
  const years = Math.round((days / 365) * 10) / 10;
  return `${years} year${years === 1 ? "" : "s"}`;
}

interface EditState {
  rule: RetentionRule;
  retainDays: string;
  basis: string;
  autoPurge: boolean;
  isActive: boolean;
}

export function RetentionPanel() {
  const toast = useToast();
  const cache = useQueryClient();

  const [edit, setEdit] = useState<EditState | null>(null);
  const [purgeConfirm, setPurgeConfirm] = useState(false);

  const schedule = useQuery({
    queryKey: queryKeys.privacy.retention,
    queryFn: () => privacy.retention(),
  });

  const refresh = () => cache.invalidateQueries({ queryKey: queryKeys.privacy.retention });

  const save = useMutation({
    mutationFn: (state: EditState) =>
      privacy.updateRetention(state.rule.id, {
        retain_days: Number(state.retainDays),
        basis: state.basis,
        auto_purge: state.autoPurge,
        is_active: state.isActive,
      }),
    onSuccess: async (rule) => {
      setEdit(null);
      setPurgeConfirm(false);
      toast.success(`${rule.label} updated`, {
        description: rule.auto_purge
          ? `Rows older than ${rule.retain_days} days will be deleted automatically.`
          : "Automatic deletion stays off for this rule.",
      });
      await refresh();
    },
    onError: (error) =>
      toast.error("Could not update the rule", { description: errorMessage(error) }),
  });

  const seed = useMutation({
    mutationFn: () => privacy.seedRetention(),
    onSuccess: async (result) => {
      toast.success("Schedule seeded", {
        description: `${result.created} added, ${result.updated} refreshed. Periods and purge flags somebody set were left alone.`,
      });
      await refresh();
    },
    onError: (error) =>
      toast.error("Could not seed the schedule", { description: errorMessage(error) }),
  });

  const columns: DataTableColumn<RetentionRule>[] = [
    {
      id: "rule",
      header: "Rule",
      primary: true,
      cell: (rule) => (
        <div>
          <p className="font-semibold text-[color:var(--brand-navy)]">{rule.label}</p>
          <p className="font-mono text-xs text-slate-600">{rule.code}</p>
        </div>
      ),
    },
    {
      id: "target",
      header: "Rows",
      cell: (rule) => <span className="font-mono text-xs text-slate-800">{rule.target}</span>,
    },
    {
      id: "period",
      header: "Kept for",
      align: "right",
      cell: (rule) => (
        <div className="tabular-nums">
          <p className="text-sm font-semibold text-slate-800">{rule.retain_days} days</p>
          <p className="text-xs text-slate-600">{inYears(rule.retain_days)}</p>
        </div>
      ),
      sortable: true,
      sortValue: (rule) => rule.retain_days,
    },
    {
      id: "purge",
      header: "Automatic deletion",
      cell: (rule) => (
        <Badge tone={rule.auto_purge ? "red" : "neutral"} variant={rule.auto_purge ? "soft" : "outline"}>
          {rule.auto_purge ? "On — rows are deleted" : "Off"}
        </Badge>
      ),
    },
    {
      id: "state",
      header: "State",
      hideOnMobile: true,
      cell: (rule) => (
        <div>
          <Badge tone={rule.is_active ? "green" : "neutral"} variant="soft">
            {rule.is_active ? "Active" : "Inactive"}
          </Badge>
          {rule.last_purged_at && (
            <span className="mt-1 block text-xs text-slate-600">
              Last purge {when(rule.last_purged_at)} ({rule.last_purged_count} rows)
            </span>
          )}
        </div>
      ),
    },
    {
      id: "basis",
      header: "Basis",
      cell: (rule) => (
        <div className="max-w-md">
          {needsCounsel(rule) && (
            <Badge tone="amber" variant="soft" className="mb-1">
              Needs counsel
            </Badge>
          )}
          <p className="text-sm text-slate-700">{rule.basis ?? "No basis recorded."}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (rule) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setEdit({
              rule,
              retainDays: String(rule.retain_days),
              basis: rule.basis ?? "",
              autoPurge: rule.auto_purge,
              isActive: rule.is_active,
            })
          }
        >
          Edit
        </Button>
      ),
    },
  ];

  const data = schedule.data;
  const turningPurgeOn = edit !== null && edit.autoPurge && !edit.rule.auto_purge;
  const daysInvalid =
    edit !== null && (!Number.isInteger(Number(edit.retainDays)) || Number(edit.retainDays) < 1);

  function submit() {
    if (!edit || daysInvalid) return;
    if (turningPurgeOn) {
      setPurgeConfirm(true);
      return;
    }
    save.mutate(edit);
  }

  if (schedule.isError) {
    return (
      <QueryError
        error={schedule.error}
        title="Could not load the retention schedule"
        onRetry={() => void schedule.refetch()}
      />
    );
  }

  return (
    <div className="grid gap-5">
      <Notice title="Storage limitation, as a table somebody can change">
        Art. 5(1)(e) says personal data is kept no longer than necessary, and “necessary” is a
        business judgement rather than an engineering one — so these are rows with the reason
        stored next to the period, not constants buried in code.
      </Notice>

      {(data?.unconfirmed ?? 0) > 0 && (
        <Notice tone="warning" title={`${data?.unconfirmed} rules are still unconfirmed`}>
          Their basis carries a <code>[TO CONFIRM]</code> marker: the period was a starting
          suggestion, and the legal judgement behind it has not been made yet. Nepali tax law, not
          GDPR, sets the floor on invoices and COD. Read each one with counsel and rewrite the
          basis when it is settled.
        </Notice>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {data ? `${data.total} rules in the schedule.` : "Loading the schedule…"}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => seed.mutate()}
          loading={seed.isPending}
          loadingLabel="Seeding"
        >
          Install the default schedule
        </Button>
      </div>

      <div className="panel p-0! sm:p-0!">
        <DataTable
          caption="Retention rules"
          columns={columns}
          rows={data?.items ?? []}
          rowKey={(rule) => rule.id}
          loading={schedule.isLoading}
          emptyTitle="No retention rules yet"
          emptyDescription="Nothing has been seeded. Install the default schedule to get a starting point, then confirm each period."
        />
      </div>

      <Modal
        open={edit !== null}
        onClose={() => setEdit(null)}
        size="lg"
        title={edit ? `Edit ${edit.rule.label}` : "Edit rule"}
        description={
          edit ? `${edit.rule.code} — governs rows in ${edit.rule.target}.` : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setEdit(null)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={daysInvalid || save.isPending} loading={save.isPending} loadingLabel="Saving">
              {turningPurgeOn ? "Review and save…" : "Save"}
            </Button>
          </>
        }
      >
        {edit && (
          <div className="space-y-4">
            <Field
              label="Keep for (days)"
              required
              hint={`${inYears(Number(edit.retainDays) || 0)}. A positive whole number, under a century.`}
              error={daysInvalid ? "Enter a whole number of days, at least 1." : null}
            >
              <Input
                type="number"
                min={1}
                max={36500}
                value={edit.retainDays}
                onChange={(event) => setEdit({ ...edit, retainDays: event.target.value })}
              />
            </Field>

            <Field
              label="Basis"
              hint="Why this period and not another. This is the field an auditor reads."
            >
              <Textarea
                rows={4}
                value={edit.basis}
                onChange={(event) => setEdit({ ...edit, basis: event.target.value })}
              />
            </Field>

            {/* Both states are spelled out in words. The tick alone is a
                thin signal for a setting that deletes data on a timer. */}
            <Checkbox
              label="Delete rows automatically once they are older than this"
              hint={
                edit.autoPurge
                  ? "Currently ON: a scheduled job permanently deletes the matching rows, and nothing asks again at the time."
                  : "Currently OFF: rows are kept until somebody deletes them. This is the default, deliberately."
              }
              checked={edit.autoPurge}
              onChange={(event) => setEdit({ ...edit, autoPurge: event.target.checked })}
            />

            <Checkbox
              label="Rule is active"
              hint={
                edit.isActive
                  ? "Currently ACTIVE: the rule is applied."
                  : "Currently INACTIVE: the rule is kept for the record but is not applied."
              }
              checked={edit.isActive}
              onChange={(event) => setEdit({ ...edit, isActive: event.target.checked })}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={purgeConfirm && edit !== null}
        onClose={() => setPurgeConfirm(false)}
        onConfirm={() => {
          if (edit) save.mutate(edit);
        }}
        tone="danger"
        size="md"
        title="Switch on scheduled deletion?"
        confirmLabel="Yes, delete on this schedule"
        keepOpenOnConfirm
        description={
          edit
            ? `From now on, rows in ${edit.rule.target} older than ${edit.retainDays} days (${inYears(
                Number(edit.retainDays) || 0,
              )}) will be deleted automatically by the purge job. The deletion is permanent, happens without anyone being asked again, and the rows cannot be recovered afterwards.`
            : undefined
        }
      >
        {edit && needsCounsel(edit.rule) && (
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            This rule&apos;s basis is still marked <code>[TO CONFIRM]</code>. Switching on automatic
            deletion against an unconfirmed period means data may be destroyed earlier than the law
            allows — settle the basis first.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
