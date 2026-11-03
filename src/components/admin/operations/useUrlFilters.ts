"use client";

/**
 * Filter state held in the URL query string.
 *
 * A worklist filtered down to "COD, out for delivery, Lalitpur" is something
 * an operator pastes into a chat message, so the state lives in the address
 * bar rather than in `useState`. `router.replace` keeps it out of the back
 * stack: Back should leave the page, not undo one dropdown.
 */

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface UrlFilters<K extends string> {
  /** Current value of every key, with defaults filled in. */
  values: Record<K, string>;
  /** Write a subset of keys. A value equal to its default is dropped. */
  apply: (patch: Partial<Record<K, string>>) => void;
  /** Back to defaults. */
  clear: () => void;
  /** How many keys sit away from their default, ignoring `exclude`. */
  activeCount: number;
}

/**
 * `defaults` must be a stable reference — declare it at module scope, not
 * inline in the component, or every render rebuilds the memo.
 *
 * `exclude` names keys that should not count towards `activeCount`, such as
 * the page number.
 */
export function useUrlFilters<K extends string>(
  defaults: Readonly<Record<K, string>>,
  exclude: readonly K[] = [],
): UrlFilters<K> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const values = useMemo(() => {
    const read = new URLSearchParams(query);
    const out = { ...defaults } as Record<K, string>;
    for (const key of Object.keys(defaults) as K[]) {
      const found = read.get(key);
      if (found !== null) out[key] = found;
    }
    return out;
  }, [defaults, query]);

  const apply = useCallback(
    (patch: Partial<Record<K, string>>) => {
      const next = new URLSearchParams(query);
      for (const key of Object.keys(patch) as K[]) {
        const value = patch[key];
        if (value === undefined || value === "" || value === defaults[key]) next.delete(key);
        else next.set(key, value);
      }
      const search = next.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [defaults, pathname, query, router],
  );

  const clear = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const activeCount = useMemo(
    () =>
      (Object.keys(defaults) as K[]).filter(
        (key) => !exclude.includes(key) && values[key] !== defaults[key],
      ).length,
    [defaults, exclude, values],
  );

  return { values, apply, clear, activeCount };
}
