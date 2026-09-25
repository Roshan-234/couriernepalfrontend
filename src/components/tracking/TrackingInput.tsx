"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
export default function TrackingInput() {
  const router = useRouter();
  const params = useSearchParams();
  const [id, setId] = useState(params.get("id") || "");
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        if (id.trim())
          router.push(`/tracking?id=${encodeURIComponent(id.trim())}`);
      }}
    >
      <label htmlFor="tracking-number" className="sr-only">
        Tracking number
      </label>
      <input
        id="tracking-number"
        className="field min-w-0 flex-1"
        required
        maxLength={100}
        value={id}
        onChange={(event) => setId(event.target.value)}
        placeholder="Enter your tracking number"
      />
      <button className="action">Track shipment →</button>
    </form>
  );
}
