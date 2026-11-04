/**
 * Where a dismissed notice is remembered, and for how long.
 *
 * The server holds none of this. `/notices/<id>/dismiss` answers with
 * `store: "local"` only when the visitor consented to preferences cookies,
 * and `store: "session"` otherwise, and that answer is the instruction this
 * module carries out. Writing a durable dismissal anyway would be storing a
 * preference about somebody who declined to be remembered.
 *
 * **Everything here can fail.** Safari in private mode throws on
 * `localStorage.setItem`, some managed browsers remove the property
 * entirely, and a visitor can disable site data. Every read and write is
 * wrapped, every failure degrades to "we do not know", and a visitor with no
 * storage at all still sees notices and can still close them — they simply
 * come back on the next page, which is the honest outcome rather than a
 * crash.
 *
 * **Impression caps are session-scoped on purpose.** `max_impressions` is
 * counted in `sessionStorage` whatever the consent answer is: a count that
 * dies with the tab, is never sent anywhere and identifies nobody is the
 * same bargain the server already makes for session dismissals. Capping
 * across sessions would need durable per-visitor storage, so when
 * preferences are refused the cap restarts — and this does not pretend
 * otherwise.
 */

const KEY = "mf.notices.v1";

export interface NoticeRecord {
  /** Set once the visitor closed it. */
  dismissed?: boolean;
  /**
   * Epoch milliseconds the dismissal lapses at. Absent means "this
   * browsing session", which is all a session-stored record can mean.
   */
  until?: number | null;
  /** Times this notice has been shown in this session. */
  seen?: number;
  /** The notice's `max_impressions`, remembered so the cap survives a reload. */
  cap?: number | null;
}

export type NoticeState = Record<string, NoticeRecord>;

type StorageKind = "local" | "session";

function storage(kind: StorageKind): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function readFrom(kind: StorageKind): NoticeState {
  const store = storage(kind);
  if (!store) return {};
  try {
    const raw = store.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as NoticeState;
  } catch {
    // Corrupt or unreadable is the same as absent. Throwing here would take
    // the whole notice surface down over a bad JSON blob.
    return {};
  }
}

function writeTo(kind: StorageKind, state: NoticeState): void {
  const store = storage(kind);
  if (!store) return;
  try {
    store.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Quota, private mode, blocked site data — the feature still works. */
  }
}

function update(kind: StorageKind, code: string, change: (record: NoticeRecord) => NoticeRecord) {
  const state = readFrom(kind);
  writeTo(kind, { ...state, [code]: change(state[code] ?? {}) });
}

/**
 * Both stores merged, durable first.
 *
 * A code can legitimately appear in both: dismissed in an earlier session
 * while preferences were granted, then seen again this session. The session
 * record wins on the counters, and a dismissal in either store counts.
 */
export function readNoticeState(): NoticeState {
  const durable = readFrom("local");
  const session = readFrom("session");
  const merged: NoticeState = { ...durable };
  for (const [code, record] of Object.entries(session)) {
    const existing = merged[code] ?? {};
    // A dismissal held in the session store has no expiry and must not
    // inherit a lapsed one from the durable store, or closing a notice
    // whose old durable dismissal has run out would do nothing.
    const sessionDismissal = Boolean(record.dismissed) && record.until == null;
    merged[code] = {
      dismissed: Boolean(existing.dismissed || record.dismissed),
      until: sessionDismissal ? null : (record.until ?? existing.until ?? null),
      seen: record.seen ?? existing.seen,
      cap: record.cap ?? existing.cap ?? null,
    };
  }
  return merged;
}

function isSuppressed(record: NoticeRecord, now: number): boolean {
  if (record.dismissed) {
    // `until` absent means a session-scoped dismissal, and this *is* that
    // session — sessionStorage would have been cleared otherwise.
    if (record.until == null || record.until > now) return true;
  }
  if (record.cap != null && record.cap > 0 && (record.seen ?? 0) >= record.cap) return true;
  return false;
}

/**
 * The codes to send as `?exclude=` so a dismissed notice never flashes up
 * before the browser has had a chance to hide it.
 */
export function suppressedCodes(now = Date.now()): string[] {
  return Object.entries(readNoticeState())
    .filter(([, record]) => isSuppressed(record, now))
    .map(([code]) => code)
    .sort();
}

/**
 * Remember a dismissal where the server said to put it.
 *
 * `dismiss_days` of zero — which is what the server returns whenever it is
 * not allowed to be durable — means the session store, no expiry recorded.
 */
export function rememberDismissal(
  code: string,
  store: StorageKind,
  dismissDays: number,
  now = Date.now(),
): void {
  if (store === "local" && dismissDays > 0) {
    update("local", code, (record) => ({
      ...record,
      dismissed: true,
      until: now + dismissDays * 24 * 60 * 60 * 1000,
    }));
    return;
  }
  update("session", code, (record) => ({ ...record, dismissed: true, until: null }));
}

/**
 * Count one showing against the frequency cap.
 *
 * `cap` is written alongside the counter so a later page load can decide
 * whether the notice is spent without having fetched it first — that is what
 * lets a capped notice go into `?exclude=` rather than being filtered out
 * after it has already rendered.
 */
export function countImpression(code: string, cap: number | null): void {
  update("session", code, (record) => ({
    ...record,
    seen: (record.seen ?? 0) + 1,
    cap: cap ?? record.cap ?? null,
  }));
}

/** Drop records whose dismissal has lapsed, so the key cannot grow forever. */
export function pruneExpired(now = Date.now()): void {
  const durable = readFrom("local");
  const kept = Object.fromEntries(
    Object.entries(durable).filter(([, record]) => record.until == null || record.until > now),
  );
  if (Object.keys(kept).length !== Object.keys(durable).length) writeTo("local", kept);
}
