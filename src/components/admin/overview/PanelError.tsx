"use client";

/**
 * One panel's read failed. The rest of the dashboard is still useful, so the
 * failure is reported in place with a retry rather than taking the screen
 * down or disappearing into a toast the operator may have already dismissed.
 */

import { Button } from "@/components/kit";
import { errorMessage } from "@/lib/resources/client";

export interface PanelErrorProps {
  error: unknown;
  /** What could not be loaded, e.g. "the shipment trend". */
  subject: string;
  onRetry?: () => void;
}

export function PanelError({ error, subject, onRetry }: PanelErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
    >
      <p className="font-semibold">Could not load {subject}.</p>
      <p className="mt-1 text-red-800">{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default PanelError;
