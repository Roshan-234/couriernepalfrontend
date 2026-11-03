"use client";

/**
 * Tri-state control for a credential the API only ever returns masked.
 *
 * The update endpoints treat an omitted key as "keep what is stored" and an
 * empty string as "clear it". A form that round-tripped the mask would send
 * the mask back as the new secret, so the default here is `keep`: the field
 * contributes nothing to the payload until the operator explicitly chooses to
 * replace or clear it.
 */

import type { ReactNode } from "react";
import { Button, Input } from "@/components/kit";

export type SecretMode = "keep" | "set" | "clear";

export interface SecretState {
  mode: SecretMode;
  value: string;
}

/** The state every secret control starts in. */
export const KEEP_SECRET: SecretState = { mode: "keep", value: "" };

/**
 * Write a secret onto an outgoing payload.
 *
 * `keep` leaves the key off entirely, which is what preserves the stored
 * credential; `clear` sends `""`, which the API reads as "delete it".
 */
export function applySecret(
  body: Record<string, unknown>,
  key: string,
  state: SecretState,
): void {
  if (state.mode === "set") body[key] = state.value;
  else if (state.mode === "clear") body[key] = "";
}

export interface SecretFieldProps {
  label: string;
  /** The masked value from the API. Never a real credential. */
  masked?: string | null;
  state: SecretState;
  onChange: (next: SecretState) => void;
  hint?: ReactNode;
  disabled?: boolean;
  /** Field name sent to the API, shown so the audit trail is obvious. */
  name: string;
}

export function SecretField({
  label,
  masked,
  state,
  onChange,
  hint,
  disabled,
  name,
}: SecretFieldProps) {
  const stored = Boolean(masked);
  const inputId = `secret-${name}`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
        <code className="text-xs text-slate-600">{name}</code>
      </div>

      {state.mode === "keep" && (
        <div className="flex flex-wrap items-center gap-3 rounded-[0.6rem] border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="font-mono text-sm text-slate-700">
            {stored ? masked : "Not set"}
          </span>
          <span className="text-xs text-slate-600">
            {stored ? "Stored — left unchanged on save." : "No credential stored."}
          </span>
          <span className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onChange({ mode: "set", value: "" })}
            >
              {stored ? "Replace" : "Set"}
            </Button>
            {stored && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={disabled}
                onClick={() => onChange({ mode: "clear", value: "" })}
              >
                Clear
              </Button>
            )}
          </span>
        </div>
      )}

      {state.mode === "set" && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={inputId}
            type="password"
            autoComplete="off"
            className="flex-1"
            placeholder="New value"
            value={state.value}
            disabled={disabled}
            onChange={(event) => onChange({ mode: "set", value: event.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange(KEEP_SECRET)}
          >
            Cancel
          </Button>
        </div>
      )}

      {state.mode === "clear" && (
        <div className="flex flex-wrap items-center gap-3 rounded-[0.6rem] border border-red-200 bg-red-50 px-3 py-2">
          <span className="text-sm text-red-800">
            Will be deleted when you save.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            disabled={disabled}
            onClick={() => onChange(KEEP_SECRET)}
          >
            Undo
          </Button>
        </div>
      )}

      {hint && <p className="text-xs text-slate-600">{hint}</p>}
    </div>
  );
}
