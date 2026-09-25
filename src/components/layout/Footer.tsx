import Link from "next/link";
import Brand from "@/components/layout/Brand";
export default function Footer() {
  return (
    <footer className="bg-[#24234f] text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Brand inverse />
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
            Thoughtful logistics. Dependable deliveries.
            <br />
            Connecting people and businesses from Nepal to the world.
          </p>
          <p className="mt-5 text-xs text-slate-400">
            Operated by Moonlight Freight Pvt. Ltd.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-sm font-semibold">Explore</h2>
          <div className="grid gap-3 text-sm text-slate-300">
            {[
              ["Our services", "/services"],
              ["Track a shipment", "/tracking"],
              ["Get a quote", "/pricing"],
              ["About us", "/about"],
            ].map(([text, href]) => (
              <Link key={href} href={href}>
                {text}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-5 text-sm font-semibold">We’re here to help</h2>
          <div className="grid gap-3 text-sm text-slate-300">
            <a href="tel:+97715922458">+977 1-5922458</a>
            <a href="mailto:moonlightfreight@gmail.com" className="break-all">
              moonlightfreight@gmail.com
            </a>
            <span>Nayabazar, Kathmandu, Nepal</span>
            <Link href="/contact" className="text-[#ffda16]">
              Contact our team ↗
            </Link>
          </div>
        </div>
      </div>
      <div className="container border-t border-white/10 py-5 text-xs text-slate-400">
        © {new Date().getFullYear()} Moonlight Freight Pvt. Ltd. All rights
        reserved.
      </div>
    </footer>
  );
}
