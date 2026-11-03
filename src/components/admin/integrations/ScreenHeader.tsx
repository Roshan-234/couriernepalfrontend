"use client";

/** Shared page furniture for the integrations and operations admin screens. */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ScreenHeaderProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function ScreenHeader({ eyebrow, title, description, actions }: ScreenHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        <p className="eyebrow text-[color:var(--brand-teal)]">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold text-[color:var(--brand-navy)]">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-700">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export type NoticeTone = "info" | "warning";

export interface NoticeProps {
  tone?: NoticeTone;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A standing explanation, not a transient alert — used for the "nothing is
 * dispatched yet" statements these screens have to make honestly.
 */
export function Notice({ tone = "info", title, children, className }: NoticeProps) {
  return (
    <div
      className={cn(
        "rounded-[0.75rem] border px-4 py-3 text-sm",
        tone === "warning"
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-teal-200 bg-teal-50/70 text-teal-900",
        className,
      )}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div className={cn(title && "mt-1")}>{children}</div>
    </div>
  );
}

export interface DescribeProps {
  term: ReactNode;
  children: ReactNode;
}

/** One row of a read-only detail list. */
export function Describe({ term, children }: DescribeProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 py-2 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">{term}</dt>
      <dd className="text-sm text-slate-800">{children}</dd>
    </div>
  );
}

/** Short relative-ish timestamp. Falls back to an em dash. */
export function when(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
