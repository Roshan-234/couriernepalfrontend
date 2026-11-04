"use client";

/**
 * Pieces shared by the advertising, notice and email-marketing screens.
 *
 * The path validator here is a deliberate duplicate of the server's
 * `site_path`. The server is the authority and still rejects a bad value;
 * repeating the rule in the browser is so the editor can say *which* field
 * and *why* while it is being typed, instead of surfacing one 400 at save
 * time. The two must agree — see `app/advertising/routes.py`.
 */

import { useId, type ReactNode } from "react";
import { Badge, Field, Textarea } from "@/components/kit";
import type { NepaliState } from "@/lib/resources/advertising";
import { cn } from "@/lib/utils";

/* ── Site-relative paths ────────────────────────────────────────────────── */

/**
 * Characters the API refuses inside a path: `_FORBIDDEN_PATH_CHARS`. The
 * control range runs to 0x20 inclusive, so a space is rejected too, and the
 * backslash is listed on its own because some browsers normalise `/\host`
 * into a protocol-relative URL.
 */
const FORBIDDEN_PATH_CHARS = /[\\<>"'`{}|^\u0000- \u007f]/;

/** Why this value would be refused, or null if it is acceptable. */
export function sitePathProblem(value: string, limit = 300): string | null {
  const candidate = value.trim();
  if (!candidate) return null;
  if (candidate.length > limit) return `At most ${limit} characters.`;
  if (!candidate.startsWith("/")) {
    return "Must be a site-relative path starting with “/”. The API rejects absolute URLs, javascript: and data: — this value ends up in a link.";
  }
  if (candidate.startsWith("//") || candidate.startsWith("/\\")) {
    return "Must not be a protocol-relative URL — “//somewhere” leaves this site.";
  }
  if (FORBIDDEN_PATH_CHARS.test(candidate)) {
    return "Contains a character that is not valid in a path (spaces, quotes, backslashes and angle brackets are refused).";
  }
  return null;
}

/** The standing hint shown under every path field. */
export const PATH_HINT =
  "Site-relative, starting with “/” — for example /pricing or /blog/dashain-cut-off.";

/** Split a textarea of paths into entries, one per line, blanks dropped. */
export function parsePathList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** The first problem in a list of paths, named by the offending line. */
export function pathListProblem(text: string): string | null {
  for (const entry of parsePathList(text)) {
    const problem = sitePathProblem(entry);
    if (problem) return `“${entry}”: ${problem}`;
  }
  if (parsePathList(text).length > 50) return "At most 50 paths.";
  return null;
}

export interface PathListFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  /** Shown when nothing is entered, to say what empty means. */
  emptyMeans: string;
}

/** A list of page paths, one per line, validated as it is typed. */
export function PathListField({
  label,
  value,
  onChange,
  hint,
  emptyMeans,
}: PathListFieldProps) {
  const problem = pathListProblem(value);
  const count = parsePathList(value).length;
  return (
    <Field
      label={label}
      error={problem ?? undefined}
      hint={
        hint ?? (
          <>
            One path per line. {PATH_HINT} {count === 0 ? emptyMeans : `${count} path${count === 1 ? "" : "s"}.`}
          </>
        )
      }
    >
      <Textarea
        rows={3}
        value={value}
        placeholder={"/pricing\n/blog"}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

/* ── Comma-separated lists ──────────────────────────────────────────────── */

export function parseCommaList(text: string): string[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Two-letter country codes, which is the only audience targeting there is. */
export function countryListProblem(text: string): string | null {
  for (const code of parseCommaList(text)) {
    if (!/^[A-Za-z]{2}$/.test(code)) {
      return `“${code}” is not a two-letter country code. Use NP, AE, GB.`;
    }
  }
  return null;
}

/* ── Timestamps ─────────────────────────────────────────────────────────── */

/**
 * The API stores these naive and compares them against `utcnow()`, so the
 * value in the box is UTC and is labelled as such. Converting to local time
 * here would mean a campaign went live an hour early in Kathmandu.
 */
export const UTC_HINT = "UTC. The server compares campaign windows against UTC, not Kathmandu time.";

/** ISO from the API into the `datetime-local` shape, without shifting it. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

/** The box back into ISO, or null to clear the column. */
export function fromLocalInput(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? `${trimmed}:00` : null;
}

/** Readable timestamp, or an em dash. Mirrors `when` in the integrations kit. */
export function at(value: string | null | undefined): string {
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

/** Date only, for a campaign window. */
export function on(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── Small presentational pieces ────────────────────────────────────────── */

/**
 * The marker for "a visitor can see this right now".
 *
 * Status and visibility are not the same thing — a running campaign outside
 * its dates shows nothing, an active notice before its start shows nothing —
 * so `is_live` gets its own unambiguous badge rather than being inferred
 * from the status pill beside it.
 */
export function LiveBadge({ live }: { live: boolean }) {
  return live ? (
    <Badge tone="red" variant="solid" dot>
      On the live site
    </Badge>
  ) : (
    <Badge tone="neutral" variant="soft">
      Not showing
    </Badge>
  );
}

/**
 * How much Nepali a row has, as a badge.
 *
 * Three states rather than the API's `needs_nepali` boolean, which is true
 * for every seeded row — including the two creatives that already carry a
 * reviewed festival headline. Flattening those to the same "missing" as a
 * campaign with nothing would hide the gap worth acting on.
 */
export function NepaliBadge({ state }: { state: NepaliState }) {
  if (state === "complete") {
    return (
      <Badge tone="green" variant="soft">
        Complete
      </Badge>
    );
  }
  if (state === "partial") {
    return (
      <Badge tone="amber" variant="soft" title="Part of the Nepali is written; the rest falls back to English.">
        Part written
      </Badge>
    );
  }
  return (
    <Badge tone="orange" variant="soft" title="No Nepali at all; a Nepali reader sees the English.">
      None yet
    </Badge>
  );
}

/** A horizontal bar for a rate, used where a chart would be overkill. */
export function RateBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-slate-200"
        role="img"
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-[color:var(--brand-teal)]"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-700">{label}</span>
    </div>
  );
}

/** Section heading inside a drawer form. */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={cn("grid gap-4", className)}>
      <div>
        <h3 id={headingId} className="text-sm font-semibold text-[color:var(--brand-navy)]">
          {title}
        </h3>
        {description && <p className="mt-1 text-xs text-slate-600">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Lower-cased machine value rendered as words. */
export const words = (value: string) => value.replace(/_/g, " ");
