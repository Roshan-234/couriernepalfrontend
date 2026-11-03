"use client";

/**
 * Textarea for the JSON-object columns on a connector (`extra_headers`,
 * `status_map`, the request templates).
 *
 * The parent owns the raw text so an operator can leave the box in a
 * half-typed state while editing another tab; validation happens on save via
 * `readJsonObject`.
 */

import type { ReactNode } from "react";
import { Field, Textarea } from "@/components/kit";

export type JsonResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

/** Parse an editor's text into a plain object. Blank means "empty object". */
export function readJsonObject(text: string): JsonResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, value: {} };
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: "Not valid JSON." };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
    return { ok: false, error: "Must be a JSON object, for example {\"key\": \"value\"}." };
  return { ok: true, value: parsed as Record<string, unknown> };
}

/** Same as `readJsonObject` but rejects non-string values. */
export function readStringMap(
  text: string,
): { ok: true; value: Record<string, string> } | { ok: false; error: string } {
  const parsed = readJsonObject(text);
  if (!parsed.ok) return parsed;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.value)) {
    if (typeof value !== "string")
      return { ok: false, error: `"${key}" must be a string.` };
    out[key] = value;
  }
  return { ok: true, value: out };
}

/** Pretty-print whatever the API sent back into editor text. */
export function toJsonText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && Object.keys(value as object).length === 0) return "";
  return JSON.stringify(value, null, 2);
}

export interface JsonMapFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  hint?: ReactNode;
  rows?: number;
  disabled?: boolean;
}

export function JsonMapField({
  label,
  value,
  onChange,
  hint,
  rows = 5,
  disabled,
}: JsonMapFieldProps) {
  const parsed = readJsonObject(value);
  return (
    <Field label={label} hint={hint} error={parsed.ok ? undefined : parsed.error}>
      <Textarea
        rows={rows}
        spellCheck={false}
        className="font-mono text-xs"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
