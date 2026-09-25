import Link from "next/link";
import Image from "next/image";
import {
  FaArrowRight,
  FaBoxOpen,
  FaGlobeAsia,
  FaTruck,
  FaCheck,
  FaArrowUp,
} from "react-icons/fa";
export const metadata = {
  title: "Moonlight Freight | Delivering possibilities",
  description:
    "Domestic and international courier services from Nepal. Track your parcel, book a shipment, and connect with our logistics team.",
};
const services = [
  {
    icon: FaTruck,
    name: "Domestic delivery",
    text: "From your doorstep to theirs. Courier solutions for shipments across Nepal.",
    href: "/services/domestic",
    number: "01",
  },
  {
    icon: FaGlobeAsia,
    name: "International shipping",
    text: "Make distance feel smaller. Send documents and parcels beyond borders.",
    href: "/services/international",
    number: "02",
  },
  {
    icon: FaBoxOpen,
    name: "Business logistics",
    text: "More room to grow. Delivery and fulfilment support for your business.",
    href: "/services/ecommerce",
    number: "03",
  },
];
export default function Home() {
  return (
    <div>
      <section className="brand-hero overflow-hidden">
        <div className="container grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-23">
          <div>
            <p className="eyebrow mb-6 flex items-center gap-2 text-[#106c7c]">
              <span className="h-2 w-2 rounded-full bg-[#117b8e]" /> YOUR WORLD,
              DELIVERED
            </p>
            <h1 className="max-w-xl text-5xl font-bold leading-[1.09] tracking-tight sm:text-6xl lg:text-[62px]">
              Happiness,
              <br />
              <span className="text-[#117b8e]">delivered.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-8 text-slate-600">
              Across Nepal or across the world, every delivery matters. We help
              your parcels move forward, so you can too.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard/create-shipment" className="action action-accent w-full sm:w-auto">
                Send a shipment <FaArrowRight />
              </Link>
              <Link href="/pricing" className="action action-outline w-full sm:w-auto">
                Explore shipping rates
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
              {["Careful handling", "Shipment tracking", "Local support"].map(
                (text) => (
                  <span key={text} className="flex items-center gap-2">
                    <FaCheck className="text-[#117b8e]" />
                    {text}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="brand-hero-card">
            <div className="brand-hero-label"><span /> FROM NEPAL TO THE WORLD</div>
            <Image src="/images/moonlight-freight-logo.jpg" alt="Moonlight Freight — Deliver Your Happiness To World" width={1081} height={1081} priority className="mx-auto w-full max-w-[380px]" sizes="(max-width: 640px) 85vw, 380px" />
            <div className="brand-hero-foot"><span>LOCAL CARE.</span><span className="text-[#117b8e]">GLOBAL CONNECTIONS. ↗</span></div>
          </div>
        </div>
      </section>
      <section className="border-b border-slate-200 bg-white">
        <div className="container grid items-center gap-6 py-8 md:grid-cols-[1fr_1.6fr]">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1f6f8] text-xl text-[#117b8e]">
              <FaBoxOpen />
            </span>
            <div>
              <h2 className="text-xl font-bold">Where’s your parcel?</h2>
              <p className="mt-1 text-sm text-slate-500">
                Follow its journey, every step of the way.
              </p>
            </div>
          </div>
          <form action="/tracking" className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="home-tracking" className="sr-only">
              Tracking number
            </label>
            <input
              id="home-tracking"
              name="id"
              required
              maxLength={100}
              className="field min-w-0 flex-1"
              placeholder="Enter your tracking number"
            />
            <button className="action" type="submit">
              Track shipment <FaArrowRight />
            </button>
          </form>
        </div>
      </section>
      <section className="container py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-3 text-[#117b8e]">
              BUILT AROUND YOUR NEEDS
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              One partner. Every delivery.
            </h2>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-3 text-sm font-semibold"
          >
            View all services <FaArrowRight />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {services.map(({ icon: Icon, ...service }) => (
            <Link
              key={service.href}
              href={service.href}
              className="group rounded-2xl border border-slate-200 bg-white p-8 transition hover:-translate-y-1 hover:border-[#117b8e] hover:shadow-lg"
            >
              <div className="mb-10 flex items-center justify-between">
                <Icon className="text-3xl text-[#117b8e]" />
                <span className="text-xs text-slate-400">{service.number}</span>
              </div>
              <h3 className="text-xl font-bold">{service.name}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                {service.text}
              </p>
              <span className="mt-7 flex items-center gap-3 text-sm font-semibold">
                Explore service{" "}
                <FaArrowRight className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container pb-20">
        <div className="grid gap-10 rounded-3xl bg-[#383772] p-8 text-white md:grid-cols-2 md:p-14">
          <div>
            <p className="eyebrow mb-4 text-[#ffda16]">
              LESS WORRY. MORE MOMENTUM.
            </p>
            <h2 className="max-w-md text-3xl font-bold leading-tight sm:text-4xl">
              Good things deserve
              <br />a reliable journey.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              A gift for someone special. An order for your next customer. Our
              team helps you find the right way to send it.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-3 text-sm font-semibold text-[#ffda16]"
            >
              Let’s plan your delivery <FaArrowRight />
            </Link>
          </div>
          <div className="grid gap-6">
            {[
              [
                "01",
                "Book your shipment",
                "Tell us where it’s going and what you’re sending.",
              ],
              [
                "02",
                "Prepare for pickup",
                "Pack your parcel and coordinate with our team.",
              ],
              [
                "03",
                "Follow the journey",
                "Use your tracking number to check the latest updates.",
              ],
            ].map(([n, title, text]) => (
              <div
                key={n}
                className="flex gap-5 border-b border-white/15 pb-6 last:border-0"
              >
                <span className="text-sm font-semibold text-[#ffda16]">
                  {n}
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-slate-200 bg-[#f1f6f8]">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-12">
          <div>
            <p className="eyebrow mb-3 text-[#117b8e]">
              YOUR NEXT CHAPTER STARTS HERE
            </p>
            <h2 className="text-3xl font-bold">Ready to get things moving?</h2>
          </div>
          <Link href="/dashboard/create-shipment" className="action">
            Create a shipment <FaArrowUp className="rotate-45" />
          </Link>
        </div>
      </section>
    </div>
  );
}
