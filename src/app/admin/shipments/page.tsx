"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/kit";
import ShipmentsWorklist from "@/components/admin/operations/ShipmentsWorklist";

/**
 * The worklist reads its filters from the query string, so it sits behind a
 * Suspense boundary — `useSearchParams` suspends until the client router has
 * the URL, and without a boundary that would bubble to the whole admin shell.
 */
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6" aria-busy="true">
          <Skeleton height="2.25rem" width="14rem" />
          <Skeleton variant="rect" height="12rem" />
          <Skeleton variant="rect" height="24rem" />
        </div>
      }
    >
      <ShipmentsWorklist />
    </Suspense>
  );
}
