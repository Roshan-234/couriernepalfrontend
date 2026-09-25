"use client";
import TrackingInput from "@/components/tracking/TrackingInput";
import TrackingResult from "@/components/tracking/TrackingResult";
export default function TrackingComponent() {
  return (
    <div className="space-y-8">
      <TrackingInput />
      <TrackingResult />
    </div>
  );
}
