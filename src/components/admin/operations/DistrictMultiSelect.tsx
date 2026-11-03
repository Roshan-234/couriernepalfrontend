"use client";

/**
 * Coverage picker over Nepal's 77 districts.
 *
 * A native multi-select is unusable at this length — ctrl-clicking seventy
 * entries loses the whole selection on one stray click — so this is a
 * filterable list of checkboxes in a scroll box, grouped by province, with
 * the current selection summarised above it.
 */

import { useMemo, useState } from "react";
import { Checkbox, Input } from "@/components/kit";
import type { District } from "@/types/logistics";

export interface DistrictMultiSelectProps {
  /** District names, matching what the API stores and returns. */
  value: string[];
  onChange: (next: string[]) => void;
  districts: District[];
  loading?: boolean;
  disabled?: boolean;
  /** Ties the group to its `Field` label. */
  "aria-labelledby"?: string;
}

export function DistrictMultiSelect({
  value,
  onChange,
  districts,
  loading = false,
  disabled = false,
  "aria-labelledby": labelledBy,
}: DistrictMultiSelectProps) {
  const [filter, setFilter] = useState("");

  const grouped = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const matching = needle
      ? districts.filter(
          (district) =>
            district.name.toLowerCase().includes(needle) ||
            district.province.toLowerCase().includes(needle),
        )
      : districts;

    const map = new Map<string, District[]>();
    for (const district of matching) {
      const bucket = map.get(district.province) ?? [];
      bucket.push(district);
      map.set(district.province, bucket);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [districts, filter]);

  const selected = new Set(value);

  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    onChange([...next].sort());
  };

  return (
    <div role="group" aria-labelledby={labelledBy} className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-600">
          {value.length === 0
            ? "No districts selected — the whole country is left uncovered."
            : `${value.length} district${value.length === 1 ? "" : "s"} selected`}
        </p>
        {value.length > 0 && !disabled && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="min-h-11 text-xs font-semibold text-teal-800 underline underline-offset-4 hover:text-teal-700"
          >
            Clear all
          </button>
        )}
      </div>

      <Input
        type="search"
        value={filter}
        disabled={disabled || loading}
        placeholder="Filter districts or provinces"
        aria-label="Filter the district list"
        onChange={(event) => setFilter(event.target.value)}
      />

      <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-300 p-3">
        {loading ? (
          <p className="text-sm text-slate-600">Loading districts&hellip;</p>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-slate-600">No district matches that filter.</p>
        ) : (
          grouped.map(([province, members]) => (
            <fieldset key={province} className="mb-3 last:mb-0">
              <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                {province}
              </legend>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                {members.map((district) => (
                  <Checkbox
                    key={district.slug}
                    label={district.name}
                    checked={selected.has(district.name)}
                    disabled={disabled}
                    onChange={() => toggle(district.name)}
                  />
                ))}
              </div>
            </fieldset>
          ))
        )}
      </div>
    </div>
  );
}

export default DistrictMultiSelect;
