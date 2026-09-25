import TrackingInput from "@/components/tracking/TrackingInput";
import TrackingResult from "@/components/tracking/TrackingResult";
export const metadata = { title: "Track your shipment | Moonlight Freight" };
export default function TrackingPage() {
  return (
    <div className="container max-w-4xl py-14 sm:py-20">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-4 text-teal-700">
          EVERY STEP, A LITTLE CLOSER
        </p>
        <h1 className="text-4xl font-bold sm:text-5xl">
          Follow your delivery.
        </h1>
        <p className="mt-4 text-slate-500">
          One tracking number. The latest updates on your parcel’s journey.
        </p>
      </div>
      <div className="mb-8">
        <TrackingInput />
      </div>
      <TrackingResult />
    </div>
  );
}
