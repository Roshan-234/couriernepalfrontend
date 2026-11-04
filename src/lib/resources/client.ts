/**
 * Shared helpers for the typed endpoint wrappers in this directory.
 *
 * The Flask API grew in layers and does not return one list shape. Newer
 * endpoints send `{items, total, page, pages, per_page}`, the blog sends
 * `{data, meta}`, and the oldest ones send a bare array. Rather than making
 * every caller guess, `toPage` normalises all three.
 *
 * This lives in `resources/` and not `api/` because `src/lib/api.ts` already
 * exists — a directory of the same name would make `@/lib/api` ambiguous.
 */

import axios from "axios";
import api from "@/lib/api";
import type { Paginated } from "@/types/logistics";

export { errorMessage } from "@/lib/api";

/**
 * The HTTP status an error carries, or 0 when it never reached the server.
 *
 * `errorMessage` reads the body, which is enough for the endpoints that
 * answer JSON. A few do not — an over-sized upload is rejected by the
 * server before any handler runs — so a caller that has to tell one
 * failure from another needs the status itself.
 */
export function statusOf(error: unknown): number {
  return axios.isAxiosError(error) ? (error.response?.status ?? 0) : 0;
}

/** Query values that survive a trip through URLSearchParams. */
export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

/** Drop empty values so `?status=` never reaches the API as a filter. */
export function params(query: Query = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    out[key] = String(value);
  }
  return out;
}

export async function get<T>(path: string, query: Query = {}): Promise<T> {
  const { data } = await api.get<T>(path, { params: params(query) });
  return data;
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await api.post<T>(path, body ?? {});
  return data;
}

/**
 * POST a `multipart/form-data` body.
 *
 * `Content-Type` is deliberately not set: a multipart body is only
 * readable with the boundary the browser appends when it serialises the
 * `FormData` itself, and writing the header by hand loses it. The longer
 * timeout is for the upload plus the server-side re-encode, which the
 * 15s default would cut short on a slow connection.
 */
export async function postForm<T>(path: string, form: FormData): Promise<T> {
  const { data } = await api.post<T>(path, form, { timeout: 60_000 });
  return data;
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await api.put<T>(path, body ?? {});
  return data;
}

export async function patch<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<T>(path, body ?? {});
  return data;
}

export async function del<T>(path: string): Promise<T> {
  const { data } = await api.delete<T>(path);
  return data;
}

/** The envelopes the API is known to return for a collection. */
type ListShape<T> =
  | T[]
  | Paginated<T>
  | { data: T[]; meta?: { totalPages?: number; total?: number; page?: number } }
  | { items?: T[]; results?: T[]; logs?: T[]; total?: number; page?: number; pages?: number; per_page?: number };

/**
 * Coerce whatever a list endpoint returned into one page shape.
 *
 * A bare array is treated as a single complete page, which is correct for the
 * endpoints that are not paginated at all.
 */
export function toPage<T>(payload: ListShape<T>, perPage = 20): Paginated<T> {
  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length, page: 1, pages: 1, per_page: payload.length || perPage };
  }

  const record = payload as Record<string, unknown>;
  // Each module named its own collection key. Rather than make every caller
  // remember which, they are all accepted here.
  const items =
    (record.items as T[]) ??
    (record.data as T[]) ??
    (record.results as T[]) ??
    (record.logs as T[]) ??
    (record.claims as T[]) ??
    [];

  const meta = (record.meta ?? {}) as Record<string, unknown>;
  const total = Number(record.total ?? meta.total ?? items.length);
  const page = Number(record.page ?? meta.page ?? 1);
  const size = Number(record.per_page ?? perPage) || perPage;
  const pages = Number(record.pages ?? meta.totalPages ?? Math.max(1, Math.ceil(total / size)));

  return { items, total, page, pages, per_page: size };
}

/** Fetch a list endpoint and normalise it in one step. */
export async function getPage<T>(path: string, query: Query = {}): Promise<Paginated<T>> {
  const perPage = Number(query.per_page ?? 20) || 20;
  return toPage<T>(await get<ListShape<T>>(path, query), perPage);
}

/**
 * Fetch a collection and return just the rows.
 *
 * Several endpoints wrap an unpaginated list in `{items, total}` while others
 * return a bare array. Callers that only want the rows use this rather than
 * guessing, which is what made the first pass of these wrappers render empty
 * tables against perfectly good responses.
 */
export async function getList<T>(path: string, query: Query = {}): Promise<T[]> {
  return toPage<T>(await get<ListShape<T>>(path, query)).items;
}
