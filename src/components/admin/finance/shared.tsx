"use client";

/**
 * Small pieces shared by the four finance screens — page headers, the filter
 * strip, read-only detail rows and the status→tone maps. They exist so the
 * COD, remittance, payment and rate screens look like one console rather than
 * four, and so a status colour is decided once.
 */

import { Badge, Button, type BadgeTone } from "@/components/kit";
import { errorMessage } from "@/lib/resources/client";
import { cn } from "@/lib/utils";

// ── Page furniture ──────────────────────────────────────────────────────────

export interface FinanceHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export function FinanceHeader({ title, description, actions }: FinanceHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-[color:var(--brand-navy)] sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
  /** Accessible name for the filter group. */
  label: string;
  className?: string;
}

/** The filter strip above a list. A real fieldset so the group is announced. */
export function FilterBar({ children, onReset, label, className }: FilterBarProps) {
  return (
    <section className={cn("panel mb-5", className)} aria-label={label}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
      {onReset && (
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      )}
    </section>
  );
}

// ── Feedback ────────────────────────────────────────────────────────────────

export interface QueryErrorProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

/** A failed read, stated plainly, never swallowed into an empty table. */
export function QueryError({ error, title = "Could not load this list", onRetry }: QueryErrorProps) {
  return (
    <div role="alert" className="panel border-red-200! bg-red-50!">
      <p className="text-sm font-bold text-red-800">{title}</p>
      <p className="mt-1 text-sm text-red-800">{errorMessage(error)}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/**
 * A state that is neither a success nor a fault the operator can clear — the
 * payment-verify seam returning 501 is the motivating case.
 */
export function InfoNotice({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-bold text-[color:var(--brand-navy)]">{title}</p>
      {children && <div className="mt-1 text-sm text-slate-700">{children}</div>}
    </div>
  );
}

// ── Read-only detail rows ───────────────────────────────────────────────────

export function DetailList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <dl className={cn("divide-y divide-slate-100", className)}>{children}</dl>;
}

export function DetailRow({
  label,
  children,
  emphasis = false,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-2">
      <dt
        className={cn(
          "text-xs font-semibold uppercase tracking-wide text-slate-600",
          emphasis && "text-[color:var(--brand-navy)]",
        )}
      >
        {label}
      </dt>
      <dd className={cn("min-w-0 text-right text-sm text-slate-800", emphasis && "font-bold")}>
        {children}
      </dd>
    </div>
  );
}

// ── Dates ───────────────────────────────────────────────────────────────────

const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DATE_ONLY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return DATE_TIME.format(parsed);
}

export function formatDay(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return DATE_ONLY.format(parsed);
}

// ── Status presentation ─────────────────────────────────────────────────────

const COD_TONES: Record<string, BadgeTone> = {
  pending: "amber",
  collected: "blue",
  deposited: "indigo",
  remitted: "green",
  cancelled: "neutral",
};

const REMITTANCE_TONES: Record<string, BadgeTone> = {
  draft: "neutral",
  approved: "blue",
  paid: "green",
  cancelled: "red",
};

const PAYMENT_TONES: Record<string, BadgeTone> = {
  initiated: "neutral",
  pending: "amber",
  success: "green",
  failed: "red",
  cancelled: "neutral",
  refunded: "orange",
};

function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase());
}

export function CodStatusBadge({ status }: { status: string }) {
  return <Badge tone={COD_TONES[status] ?? "neutral"}>{titleCase(status)}</Badge>;
}

export function RemittanceStatusBadge({ status }: { status: string }) {
  return <Badge tone={REMITTANCE_TONES[status] ?? "neutral"}>{titleCase(status)}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return <Badge tone={PAYMENT_TONES[status] ?? "neutral"}>{titleCase(status)}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "green" : "neutral"} variant={active ? "soft" : "outline"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

export { titleCase };

// ── Form value coercion ─────────────────────────────────────────────────────

/** `""` means "not given" for an optional numeric input, not zero. */
export function optionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** `""` collapses to `undefined` so the query string stays clean. */
export function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}
