"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaArrowRight, FaBars, FaTimes } from "react-icons/fa";
import Brand from "@/components/layout/Brand";
import { useAuth } from "@/contexts/AuthContext";
const links = [
  ["Services", "/services"],
  ["About us", "/about"],
  ["Pricing", "/pricing"],
  ["Track shipment", "/tracking"],
  ["Contact", "/contact"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { user } = useAuth();
  return (
    <>
      <div className="bg-[#383772] text-white">
        <div className="container flex items-center justify-between gap-4 py-2 text-xs">
          <span>Deliver your happiness to the world.</span>
          <a href="tel:+97715922458" className="shrink-0 whitespace-nowrap"><span className="hidden sm:inline">Let’s talk: </span>+977 1-5922458 ↗</a>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav aria-label="Main navigation" className="container">
          <div className="flex h-24 items-center justify-between gap-6">
            <Brand />
            <div className="hidden items-center gap-6 lg:flex">
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={path === href ? "page" : undefined}
                  className={`text-sm font-medium ${path === href ? "text-teal-700" : "text-slate-600 hover:text-teal-700"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="hidden items-center gap-5 lg:flex">
              <Link
                href={user ? "/dashboard" : "/auth/login"}
                className="text-sm font-semibold"
              >
                {user ? "My account" : "Log in"}
              </Link>
              <Link href="/dashboard/create-shipment" className="action action-accent">
                Ship with us <FaArrowRight />
              </Link>
            </div>
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="rounded-lg p-3 lg:hidden"
            >
              {open ? <FaTimes /> : <FaBars />}
            </button>
          </div>
          {open && (
            <div
              id="mobile-menu"
              className="grid gap-1 border-t py-4 lg:hidden"
              onClick={() => setOpen(false)}
            >
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-3 hover:bg-slate-50"
                >
                  {label}
                </Link>
              ))}
              <Link
                href={user ? "/dashboard" : "/auth/login"}
                className="px-3 py-3"
              >
                {user ? "My account" : "Log in / Register"}
              </Link>
              <Link href="/dashboard/create-shipment" className="action action-accent">
                Ship with us <FaArrowRight />
              </Link>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
