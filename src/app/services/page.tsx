import Link from "next/link";
import { services } from "@/lib/services";
export const metadata = { title: "Our services | Moonlight Freight" };
export default function Page() {
  return (
    <div className="container py-16 sm:py-20">
      <p className="eyebrow mb-4 text-teal-700">THE RIGHT WAY TO GET THERE</p>
      <h1 className="text-4xl font-bold sm:text-5xl">
        Logistics for every chapter.
      </h1>
      <p className="mt-5 max-w-2xl leading-8 text-slate-500">
        A single parcel or a growing business. Find the support that fits your
        next delivery.
      </p>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="panel transition hover:border-teal-600 hover:shadow-md"
          >
            <span className="eyebrow text-teal-700">0{index + 1}</span>
            <h2 className="mb-4 mt-7 text-xl font-bold">{service.title}</h2>
            <p className="text-sm leading-7 text-slate-500">
              {service.description}
            </p>
            <span className="mt-6 block text-sm font-semibold text-teal-700">
              Explore service →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
