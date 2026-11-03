/**
 * Error helpers for the operations mutations.
 *
 * `errorMessage` already unwraps the API's `msg`/`message` body, but several
 * of these endpoints answer 409 for a refusal that the operator can act on —
 * an illegal status transition, a rider profile that already exists, a pickup
 * that has moved on. Those deserve their own wording rather than being
 * flattened into "Something went wrong", so the status code is read here.
 */

import axios from "axios";
import { errorMessage } from "@/lib/resources/client";

export function httpStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function isConflict(error: unknown): boolean {
  return httpStatus(error) === 409;
}

export interface FailureNotice {
  title: string;
  description: string;
}

/**
 * Title and detail for a toast. A 409 is titled as a refusal and keeps the
 * API's explanation; anything else falls back to `errorMessage`.
 */
export function failureNotice(
  error: unknown,
  action: string,
  conflictTitle = "The server refused this change",
): FailureNotice {
  const description = errorMessage(error, `${action} failed. Please try again.`);
  return {
    title: isConflict(error) ? conflictTitle : `Could not ${action}`,
    description,
  };
}
