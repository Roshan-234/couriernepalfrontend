import PricingCalculator from "@/components/common/PricingCalculator";
export const metadata = { title: "Shipping rates | Moonlight Freight" };
export default function Page() {
  return (
    <div className="container max-w-3xl py-16 sm:py-20">
      <p className="eyebrow mb-4 text-center text-teal-700">
        PLAN YOUR NEXT DELIVERY
      </p>
      <h1 className="text-center text-4xl font-bold sm:text-5xl">
        A rate for your route.
      </h1>
      <p className="mb-10 mt-5 text-center leading-7 text-slate-500">
        Choose an available service to estimate shipping costs using our current
        rates.
      </p>
      <div className="panel">
        <PricingCalculator />
      </div>
    </div>
  );
}
