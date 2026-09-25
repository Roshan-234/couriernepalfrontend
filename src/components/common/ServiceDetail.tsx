import Link from "next/link";
import { FaCheck, FaBoxOpen } from "react-icons/fa";
import { services } from "@/lib/services";
export default function ServiceDetail({ slug }: { slug: string }) {
  const service = services.find((item) => item.slug === slug)!;
  return (
    <div className="container py-16 sm:py-20">
      <Link href="/services" className="text-sm text-teal-700">
        ← All services
      </Link>
      <div className="mt-10 grid items-start gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="eyebrow mb-4 text-teal-700">{service.title}</p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
            {service.intro}
          </h1>
          <p className="mt-6 max-w-lg leading-8 text-slate-500">
            {service.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/create-shipment" className="action">
              Create a shipment →
            </Link>
            <Link href="/contact" className="action action-outline">
              Talk to our team
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-[#f1f6f8] p-8 sm:p-10">
          <FaBoxOpen className="mb-7 text-4xl text-[#117b8e]" />
          <h2 className="text-2xl font-bold">Support for every step.</h2>
          <ul className="mt-7 space-y-5">
            {service.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm">
                <FaCheck className="shrink-0 text-[#117b8e]" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-[#ccdfe5] pt-5 text-xs leading-6 text-slate-500">
            Availability, transit times and pricing depend on the route and
            parcel. Contact us to confirm the details before booking.
          </p>
        </div>
      </div>
    </div>
  );
}
