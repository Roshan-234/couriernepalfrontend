import Link from "next/link";
export const metadata = { title: "About us | Moonlight Freight" };
export default function Page() {
  return (
    <div className="container py-16 sm:py-20">
      <p className="eyebrow mb-4 text-teal-700">
        ROOTED IN NEPAL. CONNECTED TO THE WORLD.
      </p>
      <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
        Behind every parcel,
        <br />
        there’s a possibility.
      </h1>
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="space-y-5 leading-8 text-slate-500">
          <p>
            Courier Nepal, operated by Moonlight Freight Pvt. Ltd., helps people
            and businesses move documents, parcels and cargo from Nepal to their
            destinations.
          </p>
          <p>
            From our base in Nayabazar, Kathmandu, we bring a personal approach
            to logistics: understanding what you need to send, helping you
            choose a service, and keeping you informed along the way.
          </p>
          <Link href="/contact" className="action">
            Meet your shipping partner →
          </Link>
        </div>
        <div className="rounded-2xl bg-[#f1f6f8] p-8">
          <h2 className="text-2xl font-bold">What moves us</h2>
          {[
            [
              "Care",
              "Every shipment deserves attention, from preparation to delivery.",
            ],
            [
              "Clarity",
              "Useful information, clear next steps and someone to speak to.",
            ],
            [
              "Connection",
              "Helping people and businesses stay connected through delivery.",
            ],
          ].map(([title, text]) => (
            <div key={title} className="mt-7">
              <h3 className="font-semibold text-teal-800">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
