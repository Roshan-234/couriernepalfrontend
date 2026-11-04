"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaLock } from "react-icons/fa";

import { Modal } from "@/components/kit";
import { useConsent } from "@/contexts/ConsentContext";
import type { ConsentCategory } from "@/lib/resources/consent";
import { cn } from "@/lib/utils";

/**
 * The detailed cookie dialog: every category the policy publishes, what it
 * is for, and a switch — except `necessary`, which is shown and explained
 * but cannot be turned off, because switching it off would mean switching
 * off signing in.
 *
 * Optional switches open from whatever the server currently records, which
 * for a visitor who has not decided is off. Nothing here is pre-ticked: a
 * box someone has to notice and clear is not consent (Art. 4(11)).
 *
 * "Withdraw all consent" sits in the same dialog as "Save choices" and is
 * one click, because withdrawing has to be as easy as giving (Art. 7(3)).
 */

function Switch({
  category,
  checked,
  disabled,
  onChange,
}: {
  category: ConsentCategory;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}) {
  const labelId = `consent-${category.key}-label`;
  const descriptionId = `consent-${category.key}-description`;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-4 last:border-b-0">
      <div className="min-w-0">
        <p id={labelId} className="flex items-center gap-2 font-semibold text-[color:var(--brand-navy)]">
          {category.label}
          {category.required && (
            <span className="chip gap-1.5 text-[0.7rem]">
              <FaLock aria-hidden="true" className="h-2.5 w-2.5" />
              Always on
            </span>
          )}
        </p>
        <p id={descriptionId} className="mt-1 max-w-[52ch] text-sm leading-6 text-slate-600">
          {category.description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative mt-1 h-7 w-12 shrink-0 rounded-full border transition-colors",
          checked
            ? "border-[color:var(--brand-teal)] bg-[color:var(--brand-teal)]"
            : "border-slate-300 bg-slate-200",
          disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left]",
            checked ? "left-[1.6rem]" : "left-0.5",
          )}
        />
        <span className="sr-only">{checked ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

export default function ConsentPreferences() {
  const { preferencesOpen, closePreferences, policy, allows, state, saving, save, withdraw } =
    useConsent();
  const [chosen, setChosen] = useState<Record<string, boolean>>({});

  // Reopening the dialog shows what the server holds right now, not what was
  // on screen last time it was closed.
  useEffect(() => {
    if (!preferencesOpen || !policy) return;
    const next: Record<string, boolean> = {};
    for (const category of policy.categories) {
      next[category.key] = category.required ? true : Boolean(allows[category.key as keyof typeof allows]);
    }
    setChosen(next);
  }, [preferencesOpen, policy, allows]);

  // `Modal` is always rendered and driven by `open`, the way the rest of the
  // app uses it. Mounting it already-open instead lets its focus-moving
  // animation frame fire before the portal exists, and focus silently stays
  // behind on the footer link that opened the dialog.
  const categories = policy?.categories ?? [];
  const selected = categories.filter((c) => !c.required && chosen[c.key]).map((c) => c.key);
  const decided = state === "decided" || state === "withdrawn";

  return (
    <Modal
      open={preferencesOpen}
      onClose={closePreferences}
      size="lg"
      title="Cookie settings"
      description={
        policy
          ? `Notice version ${policy.policy_version}. A choice lasts ${policy.lifetime_days} days, and you can change or withdraw it here at any time.`
          : undefined
      }
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="min-h-11 text-sm font-semibold text-red-700 underline underline-offset-4 hover:text-red-800 disabled:opacity-60"
            disabled={saving}
            onClick={() => void withdraw()}
          >
            Withdraw all consent
          </button>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Same two answers as the banner, same treatment as each other. */}
            <button
              type="button"
              className="action w-full"
              disabled={saving || !policy}
              onClick={() => void save(categories.filter((c) => !c.required).map((c) => c.key), "preferences")}
            >
              Accept all
            </button>
            <button
              type="button"
              className="action w-full"
              disabled={saving || !policy}
              onClick={() => void save(selected, "preferences")}
            >
              Save choices
            </button>
          </div>
        </div>
      }
    >
      {!policy ? (
        <p className="py-6 text-sm text-slate-600">Loading the current cookie notice…</p>
      ) : (
        <>
          <div className="divide-slate-200">
            {categories.map((category) => (
              <Switch
                key={category.key}
                category={category}
                checked={category.required ? true : Boolean(chosen[category.key])}
                disabled={category.required || saving}
                onChange={(next) => setChosen((current) => ({ ...current, [category.key]: next }))}
              />
            ))}
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-600">
            {decided
              ? "Your current choice is recorded on our servers, not in your browser, so it holds on every device you sign in from and can be withdrawn here."
              : "Nothing optional is on until you save a choice."}{" "}
            What each category covers is set out in the{" "}
            <Link className="font-semibold underline" href="/cookies">
              cookie notice
            </Link>
            , and what we do with the data in the{" "}
            <Link className="font-semibold underline" href="/privacy">
              privacy policy
            </Link>
            . To ask for a copy of your data, or its deletion, use{" "}
            <Link className="font-semibold underline" href="/data-requests">
              data requests
            </Link>
            .
          </p>
        </>
      )}
    </Modal>
  );
}
