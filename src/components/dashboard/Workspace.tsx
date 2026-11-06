"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Brand from "@/components/layout/Brand";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { errorMessage } from "@/lib/api";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

interface NavLink {
  label: string;
  href: string;
}

interface NavSection {
  heading: string | null;
  links: NavLink[];
}

/**
 * The admin side grew past the point where a flat list reads well, so links
 * are grouped by the job being done rather than by the API they happen to
 * call. Headings are rendered, not just spacing, so screen readers get the
 * same grouping.
 */
const ADMIN_NAV: NavSection[] = [
  { heading: null, links: [{ label: "Overview", href: "/admin/dashboard" }] },
  {
    heading: "Operations",
    links: [
      { label: "Shipments", href: "/admin/shipments" },
      { label: "Pickups", href: "/admin/pickups" },
      { label: "Riders", href: "/admin/riders" },
      { label: "Branches", href: "/admin/branches" },
    ],
  },
  {
    heading: "Finance",
    links: [
      { label: "Cash on delivery", href: "/admin/cod" },
      { label: "Remittances", href: "/admin/remittances" },
      { label: "Payments", href: "/admin/payments" },
      { label: "Rate cards", href: "/admin/rates" },
    ],
  },
  {
    heading: "Customers",
    links: [
      { label: "Users", href: "/admin/users" },
      { label: "Claims", href: "/admin/claims" },
    ],
  },
  {
    // The paperwork that travels with a shipment. Separate from Finance
    // because a packing list is the shipper's customs declaration, not a
    // charge, and the people who produce them are not the people chasing
    // remittances.
    heading: "Documents",
    links: [
      { label: "Packing lists", href: "/admin/packing-lists" },
      { label: "Freight bills", href: "/admin/freight-bills" },
    ],
  },
  {
    heading: "Integrations",
    links: [
      { label: "Carriers", href: "/admin/carriers" },
      { label: "Webhooks", href: "/admin/webhooks" },
      { label: "Notifications", href: "/admin/notifications" },
    ],
  },
  {
    heading: "Marketing",
    links: [
      { label: "Advert campaigns", href: "/admin/ads" },
      { label: "Ad placements", href: "/admin/ads/placements" },
      { label: "Advert performance", href: "/admin/ads/report" },
      { label: "Site notices", href: "/admin/notices" },
      { label: "Email contacts", href: "/admin/marketing/contacts" },
      { label: "Email campaigns", href: "/admin/marketing/campaigns" },
    ],
  },
  {
    // Separate from "Site" because these are answered to a regulator rather
    // than used to run the business, and whoever handles a data request
    // should not have to know it lives under a content heading.
    heading: "Privacy",
    links: [
      { label: "Consent register", href: "/admin/consent" },
      { label: "Data requests", href: "/admin/privacy" },
    ],
  },
  {
    heading: "Site",
    links: [
      { label: "Website analytics", href: "/admin/analytics" },
      { label: "Website content", href: "/admin/content" },
      { label: "Pricing rules", href: "/admin/pricing" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
];

const CUSTOMER_NAV: NavSection[] = [
  { heading: null, links: [{ label: "Overview", href: "/dashboard" }] },
  {
    heading: "Shipping",
    links: [
      { label: "My shipments", href: "/dashboard/shipments" },
      { label: "Create shipment", href: "/dashboard/create-shipment" },
      { label: "Book a pickup", href: "/dashboard/pickups" },
      { label: "Claims", href: "/dashboard/claims" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "My profile", href: "/dashboard/profile" },
      { label: "API keys", href: "/dashboard/api-keys" },
      { label: "Sessions", href: "/dashboard/sessions" },
    ],
  },
];

/** A link is current when the path is it, or sits beneath it. */
function isCurrent(path: string, href: string) {
  if (path === href) return true;
  // "/admin/dashboard" must not light up for "/admin/dashboard-something".
  return path.startsWith(href + "/");
}

export default function Workspace({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const path = usePathname();
  const { user, logout } = useAuth();
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const sections = admin ? ADMIN_NAV : CUSTOMER_NAV;

  // Navigating should close the drawer, or the next page opens behind it.
  useEffect(() => setMenuOpen(false), [path]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const nav = (
    <nav aria-label="Workspace" className="grid gap-5">
      {sections.map((section, index) => (
        <div key={section.heading ?? `section-${index}`} className="grid gap-1">
          {section.heading && (
            <h2 className="px-3 pt-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-teal-100/80">
              {section.heading}
            </h2>
          )}
          {section.links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={isCurrent(path, href) ? "page" : undefined}
              className={`rounded-lg px-3 py-3 text-sm transition-colors ${
                isCurrent(path, href)
                  ? "bg-white/15 font-semibold text-white"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="mt-6 grid gap-4 border-t border-white/15 pt-5 text-sm">
      <Link href="/" className="text-slate-200 hover:text-white">
        ← Back to website
      </Link>
      {user?.is_admin && (
        <Link
          href={admin ? "/dashboard" : "/admin/dashboard"}
          className="text-slate-200 hover:text-white"
        >
          {admin ? "Personal workspace" : "Admin workspace"} ↗
        </Link>
      )}
      <button
        type="button"
        className="text-left text-slate-200 hover:text-white"
        onClick={() => logout().catch((cause) => setError(errorMessage(cause)))}
      >
        Sign out
      </button>
      {error && (
        <p role="alert" className="text-sm text-yellow-200">
          {error}
        </p>
      )}
    </div>
  );

  return (
    <ProtectedRoute admin={admin}>
      <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
        {/* Mobile bar. The sidebar itself is hidden below lg. */}
        <div className="flex items-center justify-between gap-3 bg-[#383772] px-4 py-3 lg:hidden">
          <Brand inverse />
          <button
            type="button"
            className="min-h-[44px] rounded-lg border border-white/25 px-4 text-sm font-semibold text-white"
            aria-expanded={menuOpen}
            aria-controls="workspace-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        <aside
          id="workspace-nav"
          className={`bg-[#383772] p-5 text-white lg:block lg:min-h-screen lg:p-7 ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <div className="hidden lg:block">
            <Brand inverse />
            <p className="mb-6 mt-2 text-xs text-teal-100">
              {admin ? "Operations workspace" : "Your shipping workspace"}
            </p>
          </div>
          {nav}
          {footer}
        </aside>

        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-6 py-5">
            <span className="text-sm font-medium text-slate-800">
              Welcome, {user?.first_name}
            </span>
            <span className="text-xs text-slate-600">{user?.email}</span>
          </header>
          <div className="mx-auto max-w-7xl p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
