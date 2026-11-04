"use client";

/**
 * The consent register.
 *
 * This is the screen somebody opens when a regulator asks whether consent
 * was obtained, so a single record has to be readable on its own: what was
 * agreed, under which version of the notice, when, and when it lapses. The
 * table answers that at a glance and the drawer holds the full record
 * including the thin evidence fields.
 *
 * Records are immutable — changing a preference writes a new row — so
 * nothing on this page edits anything. The one judgement the UI makes is
 * marking a record as lapsed once `expires_at` has passed, which the
 * summary endpoint already applies when it decides what is in force.
 */

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  DataTable,
  Drawer,
  Field,
  Input,
  Pagination,
  Select,
  Skeleton,
  StatCard,
  type BadgeTone,
  type DataTableColumn,
} from "@/components/kit";
import { Describe, Notice, ScreenHeader, when } from "@/components/admin/integrations/ScreenHeader";
import { FilterBar, QueryError, optionalText } from "@/components/admin/finance/shared";
import { count } from "@/components/admin/analytics/charts";
import { queryKeys } from "@/lib/queryKeys";
import {
  CONSENT_ACTIONS,
  consentRegister,
  type ConsentRecordFilters,
  type ConsentRegisterRow,
} from "@/lib/resources/consent";

const PER_PAGE = 20;

/** The four the policy endpoint publishes, in the order the banner lists them. */
const CATEGORIES = [
  { key: "necessary", label: "Strictly necessary", required: true },
  { key: "analytics", label: "Analytics", required: false },
  { key: "marketing", label: "Marketing", required: false },
  { key: "preferences", label: "Preferences", required: false },
] as const;

const ACTION_TONES: Record<string, BadgeTone> = {
  given: "green",
  updated: "blue",
  withdrawn: "red",
};

const label = (value: string) => value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

type Standing = "withdrawn" | "lapsed" | "in_force" | "no_expiry";

/**
 * Where a record stands today.
 *
 * A withdrawal is not a consent that expired, and a consent whose
 * `expires_at` has passed is not one that was taken back — the register has
 * to tell the two apart, because only one of them is evidence that
 * permission was ever held.
 */
function standing(row: ConsentRegisterRow): Standing {
  if (row.action === "withdrawn") return "withdrawn";
  if (!row.expires_at) return "no_expiry";
  return new Date(row.expires_at).getTime() < Date.now() ? "lapsed" : "in_force";
}

const STANDING_LABEL: Record<Standing, string> = {
  withdrawn: "Withdrawn",
  lapsed: "Lapsed",
  in_force: "In force",
  no_expiry: "No expiry recorded",
};

const STANDING_TONE: Record<Standing, BadgeTone> = {
  withdrawn: "red",
  lapsed: "neutral",
  in_force: "green",
  no_expiry: "amber",
};

/** The agreed categories as yes/no over the full published list. */
function CategoryGrid({ granted }: { granted: string[] }) {
  return (
    <ul className="grid gap-1.5">
      {CATEGORIES.map((category) => {
        const on = category.required || granted.includes(category.key);
        return (
          <li key={category.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-800">
              {category.label}
              {category.required && (
                <span className="ml-1.5 text-xs text-slate-600">(cannot be refused)</span>
              )}
            </span>
            <Badge tone={on ? "green" : "neutral"} variant={on ? "soft" : "outline"}>
              {on ? "Agreed" : "Refused"}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

export default function ConsentRegisterPage() {
  const [subjectKey, setSubjectKey] = useState("");
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [policyVersion, setPolicyVersion] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [openRow, setOpenRow] = useState<ConsentRegisterRow | null>(null);

  const filters: ConsentRecordFilters = useMemo(
    () => ({
      subject_key: optionalText(subjectKey),
      user_id: optionalText(userId),
      action: optionalText(action),
      policy_version: optionalText(policyVersion),
      from: optionalText(from),
      to: optionalText(to),
      page,
      per_page: PER_PAGE,
    }),
    [subjectKey, userId, action, policyVersion, from, to, page],
  );

  const summary = useQuery({
    queryKey: queryKeys.consentRegister.summary,
    queryFn: () => consentRegister.summary(),
  });

  const records = useQuery({
    queryKey: queryKeys.consentRegister.records(filters),
    queryFn: () => consentRegister.records(filters),
    placeholderData: keepPreviousData,
  });

  const columns: DataTableColumn<ConsentRegisterRow>[] = [
    {
      id: "when",
      header: "Decided",
      primary: true,
      cell: (row) => (
        <div>
          <p className="text-sm font-semibold text-[color:var(--brand-navy)]">
            {when(row.created_at)}
          </p>
          <p className="text-xs text-slate-600">Record #{row.id}</p>
        </div>
      ),
    },
    {
      id: "action",
      header: "Decision",
      cell: (row) => (
        <Badge tone={ACTION_TONES[row.action] ?? "neutral"} variant="soft">
          {label(row.action)}
        </Badge>
      ),
    },
    {
      id: "categories",
      header: "Agreed to",
      cell: (row) =>
        row.action === "withdrawn" ? (
          <span className="text-sm text-slate-700">Nothing — consent taken back</span>
        ) : row.categories.length === 0 ? (
          <span className="text-sm text-slate-700">Necessary only — everything optional refused</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {row.categories.map((category) => (
              <Badge key={category} tone="teal" variant="soft" size="sm">
                {label(category)}
              </Badge>
            ))}
          </span>
        ),
    },
    {
      id: "policy",
      header: "Policy version",
      cell: (row) => (
        <span className="text-sm tabular-nums text-slate-800">{row.policy_version}</span>
      ),
    },
    {
      id: "standing",
      header: "Standing",
      cell: (row) => {
        const state = standing(row);
        return (
          <div>
            <Badge tone={STANDING_TONE[state]} variant="soft" dot>
              {STANDING_LABEL[state]}
            </Badge>
            {/* A withdrawal has an expiry column too, but it says nothing
                useful: the consent is already gone, not running out. */}
            {row.expires_at && state !== "withdrawn" && (
              <span className="mt-1 block text-xs text-slate-600">
                {state === "lapsed" ? "Lapsed" : "Lapses"} {when(row.expires_at)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "source",
      header: "Source",
      hideOnMobile: true,
      cell: (row) => <span className="text-sm text-slate-800">{label(row.source)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => setOpenRow(row)}>
          Open
        </Button>
      ),
    },
  ];

  const summaryData = summary.data;
  const accepted = Object.entries(summaryData?.accepted ?? {});

  return (
    <>
      <ScreenHeader
        eyebrow="Privacy"
        title="Consent register"
        description="Every consent decision as it was written, kept to demonstrate that permission was obtained. Records are never edited — a change of mind writes a new one."
      />

      {summary.isError ? (
        <div className="mb-5">
          <QueryError
            error={summary.error}
            title="Could not load the consent summary"
            onRetry={() => void summary.refetch()}
          />
        </div>
      ) : summary.isLoading || !summaryData ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="panel">
              <Skeleton lines={2} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Decisions in force"
              value={count(summaryData.decisions_in_force)}
              hint={`One per visitor, on policy ${summaryData.policy_version}`}
            />
            <StatCard
              label="Withdrawn"
              value={count(summaryData.withdrawn)}
              hint="Consent taken back and still standing withdrawn"
            />
            <StatCard
              label="Records held"
              value={count(summaryData.total_records)}
              hint="Every decision ever written, including superseded ones"
            />
            <StatCard
              label="Current policy"
              value={summaryData.policy_version}
              hint="Older versions are asked again rather than assumed"
            />
          </div>

          <section className="panel mb-5" aria-labelledby="acceptance">
            <h2 id="acceptance" className="text-sm font-bold text-[color:var(--brand-navy)]">
              Acceptance by category
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Over the {count(summaryData.decisions_in_force)} decisions in force. A rate that jumps
              after a banner redesign usually means the redesign made refusing harder.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {accepted.length === 0 ? (
                <p className="text-sm text-slate-600">No decisions are in force yet.</p>
              ) : (
                accepted.map(([category, bucket]) => (
                  <div key={category}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-800">{label(category)}</span>
                      <span className="text-sm tabular-nums text-slate-700">
                        {bucket.rate}% ({count(bucket.count)})
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                      <div
                        aria-hidden="true"
                        className="h-2 rounded-full bg-teal-500"
                        style={{ width: `${Math.min(Math.max(bucket.rate, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      <FilterBar
        label="Filter consent records"
        onReset={() => {
          setSubjectKey("");
          setUserId("");
          setAction("");
          setPolicyVersion("");
          setFrom("");
          setTo("");
          setPage(1);
        }}
      >
        <Field label="Subject key" hint="The pseudonymous cookie id, matched exactly.">
          <Input
            value={subjectKey}
            placeholder="Any visitor"
            onChange={(event) => {
              setSubjectKey(event.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="User id">
          <Input
            type="number"
            value={userId}
            placeholder="Any"
            onChange={(event) => {
              setUserId(event.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="Decision">
          <Select
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "Any decision" },
              ...CONSENT_ACTIONS.map((value) => ({ value, label: label(value) })),
            ]}
          />
        </Field>
        <Field label="Policy version">
          <Input
            value={policyVersion}
            placeholder="e.g. 2026-11-03.1"
            onChange={(event) => {
              setPolicyVersion(event.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="Decided from">
          <Input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="Decided to">
          <Input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
          />
        </Field>
      </FilterBar>

      {records.isError ? (
        <QueryError
          error={records.error}
          title="Could not load the register"
          onRetry={() => void records.refetch()}
        />
      ) : (
        <>
          <div className="panel p-0! sm:p-0!">
            <DataTable
              caption="Consent records"
              columns={columns}
              rows={records.data?.items ?? []}
              rowKey={(row) => row.id}
              loading={records.isLoading}
              emptyTitle="No consent records match"
              emptyDescription="Nothing has been recorded against these filters. On a site with no traffic yet, an empty register is the correct answer."
            />
          </div>
          {records.data && (
            <Pagination
              className="mt-5"
              page={records.data.page}
              pageCount={records.data.pages}
              pageSize={records.data.per_page}
              totalItems={records.data.total}
              onPageChange={setPage}
              label="Consent record pages"
            />
          )}
        </>
      )}

      <Drawer
        open={openRow !== null}
        onClose={() => setOpenRow(null)}
        size="lg"
        title={openRow ? `Consent record #${openRow.id}` : "Consent record"}
        description={openRow ? when(openRow.created_at) : undefined}
      >
        {openRow && (
          <div className="space-y-5">
            {openRow.action === "withdrawn" && (
              <Notice tone="warning" title="This record is a withdrawal">
                Consent was taken back on {when(openRow.created_at)}. The decision it replaced is
                still in the register above; both are kept, because the dates are the evidence.
              </Notice>
            )}

            <section>
              <h3 className="mb-2 text-sm font-semibold text-[color:var(--brand-navy)]">
                What was agreed
              </h3>
              <CategoryGrid granted={openRow.action === "withdrawn" ? [] : openRow.categories} />
            </section>

            <section>
              <h3 className="mb-1 text-sm font-semibold text-[color:var(--brand-navy)]">
                The decision
              </h3>
              <dl>
                <Describe term="Decision">
                  <Badge tone={ACTION_TONES[openRow.action] ?? "neutral"} variant="soft">
                    {label(openRow.action)}
                  </Badge>
                </Describe>
                <Describe term="Standing">
                  <Badge tone={STANDING_TONE[standing(openRow)]} variant="soft">
                    {STANDING_LABEL[standing(openRow)]}
                  </Badge>
                </Describe>
                <Describe term="Policy version">{openRow.policy_version}</Describe>
                <Describe term="Given at">{when(openRow.created_at)}</Describe>
                <Describe term="Lapses">
                  {openRow.action === "withdrawn"
                    ? "Not applicable — consent was withdrawn"
                    : openRow.expires_at
                      ? when(openRow.expires_at)
                      : "No expiry recorded"}
                </Describe>
                <Describe term="Source">{label(openRow.source)}</Describe>
              </dl>
            </section>

            <section>
              <h3 className="mb-1 text-sm font-semibold text-[color:var(--brand-navy)]">
                Evidence
              </h3>
              <dl>
                <Describe term="Subject key">
                  <span className="break-all font-mono text-xs">{openRow.subject_key}</span>
                </Describe>
                <Describe term="Account">
                  {openRow.user_id ? `User #${openRow.user_id}` : "No account — anonymous visitor"}
                </Describe>
                <Describe term="Country">{openRow.country ?? "—"}</Describe>
                <Describe term="IP hash">
                  <span className="break-all font-mono text-xs">{openRow.ip_hash ?? "—"}</span>
                </Describe>
                <Describe term="User agent">
                  <span className="break-words text-xs">{openRow.user_agent ?? "—"}</span>
                </Describe>
              </dl>
              <p className="mt-2 text-xs text-slate-600">
                The IP address itself is not stored. The hash is salted, so it can confirm that two
                records came from the same visitor without revealing the address behind either.
              </p>
            </section>
          </div>
        )}
      </Drawer>
    </>
  );
}
