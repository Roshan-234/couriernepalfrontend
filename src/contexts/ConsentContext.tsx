"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import {
  NO_CONSENT,
  getConsentPolicy,
  getConsentStatus,
  saveConsent,
  withdrawConsent,
  type ConsentAllowances,
  type ConsentPolicy,
  type ConsentSource,
  type ConsentState,
  type ConsentStatus,
} from "@/lib/resources/consent";

/**
 * The consent decision, read from the server on every page load.
 *
 * Two rules shape this file:
 *
 * * **No browser copy of the decision.** The cookie behind it is HttpOnly,
 *   so the only way to know what a visitor agreed to is to ask. Caching the
 *   answer in `localStorage` is the defect this replaced: it let the browser
 *   keep saying "accepted" after the row said otherwise, and it survived a
 *   withdrawal made from another tab.
 * * **Cheap.** This mounts on every page, so it makes exactly one request —
 *   `GET /api/consent/`. The policy document, which is only needed to draw
 *   the banner or the preferences dialog, is fetched only when one of those
 *   is actually on screen.
 */

export interface ConsentContextValue {
  /** `unknown` until the first answer arrives. */
  state: ConsentState;
  /** Per-category permission. Everything optional is false until granted. */
  allows: ConsentAllowances;
  loading: boolean;
  /** True when the banner should be on screen. */
  needsDecision: boolean;
  /** Categories and wording for the current policy version, once loaded. */
  policy: ConsentPolicy | undefined;
  /** A write is in flight. Both buttons disable together, never one. */
  saving: boolean;
  /** Record a decision. `[]` refuses everything optional. */
  save: (categories: string[], source?: ConsentSource) => Promise<void>;
  /** Withdraw consent entirely. */
  withdraw: () => Promise<void>;
  preferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

/** What we assume before the server has answered: nothing optional is on. */
const UNDECIDED: ConsentStatus = {
  state: "unknown",
  policy_version: "",
  categories: ["necessary"],
  needs_decision: false,
  allows: NO_CONSENT,
};

export function ConsentProvider({ children }: { children: ReactNode }) {
  const cache = useQueryClient();
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const status = useQuery({
    queryKey: queryKeys.consent.status,
    queryFn: getConsentStatus,
    // The answer only changes when this tab changes it, and every mutation
    // below writes the fresh state straight into the cache. Refetching on
    // focus or remount would cost a request per tab switch for nothing.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const current = status.data ?? UNDECIDED;
  // A failed request must not be read as consent. `needs_decision` stays
  // false while we do not know, so the banner waits rather than appearing
  // and then vanishing.
  const needsDecision = Boolean(status.data?.needs_decision);

  const policy = useQuery({
    queryKey: queryKeys.consent.policy,
    queryFn: getConsentPolicy,
    enabled: needsDecision || preferencesOpen,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const record = useMutation({
    mutationFn: ({ categories, source }: { categories: string[]; source: ConsentSource }) =>
      saveConsent(categories, source),
    // POST answers with the stored record, not with the visitor's state, so
    // the state is read back rather than assembled here. The server decides
    // what the row means.
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: queryKeys.consent.status });
    },
  });

  const revoke = useMutation({
    mutationFn: withdrawConsent,
    // DELETE answers with the state itself, so there is nothing to ask for.
    onSuccess: (next) => cache.setQueryData(queryKeys.consent.status, next),
  });

  const save = useCallback(
    async (categories: string[], source: ConsentSource = "banner") => {
      await record.mutateAsync({ categories, source });
      setPreferencesOpen(false);
    },
    [record],
  );

  const withdraw = useCallback(async () => {
    await revoke.mutateAsync();
    setPreferencesOpen(false);
  }, [revoke]);

  const value = useMemo<ConsentContextValue>(
    () => ({
      state: current.state,
      allows: current.allows ?? NO_CONSENT,
      loading: status.isPending,
      needsDecision,
      policy: policy.data,
      saving: record.isPending || revoke.isPending,
      save,
      withdraw,
      preferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [
      current.state,
      current.allows,
      status.isPending,
      needsDecision,
      policy.data,
      record.isPending,
      revoke.isPending,
      save,
      withdraw,
      preferencesOpen,
    ],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const value = useContext(ConsentContext);
  if (!value) throw new Error("useConsent must be used within a ConsentProvider");
  return value;
}
