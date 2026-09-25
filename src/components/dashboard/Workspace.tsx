"use client";
import { useState } from "react";
import Link from "next/link";
import Brand from "@/components/layout/Brand";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { errorMessage } from "@/lib/api";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
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
  const links = admin
    ? [
        ["Overview", "/admin/dashboard"],
        ["Shipments", "/admin/shipments"],
        ["Users", "/admin/users"],
        ["Settings", "/admin/settings"],
      ]
    : [
        ["Overview", "/dashboard"],
        ["My shipments", "/dashboard/shipments"],
        ["Create shipment", "/dashboard/create-shipment"],
        ["My profile", "/dashboard/profile"],
      ];
  return (
    <ProtectedRoute admin={admin}>
      <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="bg-[#383772] p-5 text-white lg:min-h-screen lg:p-7">
          <Brand inverse />
          <p className="mb-6 mt-2 text-xs text-teal-100">
            {admin ? "Operations workspace" : "Your shipping workspace"}
          </p>
          <nav aria-label="Workspace" className="flex flex-wrap gap-2 lg:grid">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-3 text-sm ${path === href ? "bg-white/15 font-semibold" : "text-slate-200 hover:bg-white/10"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 grid gap-4 border-t border-white/15 pt-5 text-sm">
            <Link href="/">← Back to website</Link>
            {user?.is_admin && (
              <Link href={admin ? "/dashboard" : "/admin/dashboard"}>
                {admin ? "Personal workspace" : "Admin workspace"} ↗
              </Link>
            )}
            <button
              className="text-left"
              onClick={() =>
                logout().catch((error) => setError(errorMessage(error)))
              }
            >
              Sign out
            </button>
            {error && <p role="alert">{error}</p>}
          </div>
        </aside>
        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-6 py-5">
            <span className="text-sm font-medium">
              Welcome, {user?.first_name}
            </span>
            <span className="text-xs text-slate-500">{user?.email}</span>
          </header>
          <div className="mx-auto max-w-7xl p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
