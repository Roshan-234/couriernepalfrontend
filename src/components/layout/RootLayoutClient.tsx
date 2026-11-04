"use client";
import { Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConsentProvider } from "@/contexts/ConsentContext";
import ConsentBanner from "@/components/consent/ConsentBanner";
import ConsentPreferences from "@/components/consent/ConsentPreferences";
import SiteNotices from "@/components/ads/SiteNotices";
import PageViews from "@/components/analytics/PageViews";
import { ToastProvider } from "@/components/kit";
export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 30000 } },
      }),
  );
  const path = usePathname();
  const workspace = path.startsWith("/dashboard") || path.startsWith("/admin");
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {/* Inside the query client, because the decision is read from the
            server and cached like any other resource; outside the page, so
            the footer's "Cookie settings" and the banner share one state. */}
        <ConsentProvider>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <a href="#main-content" className="skip-link">
                Skip to content
              </a>
              {/* Above the navbar because a notice bar renders inline where
                  it sits: a closed border or a changed cut-off belongs at the
                  top of the page, not below the menu. The modal and the toast
                  portal to the body and ignore this position. */}
              <SiteNotices />
              {!workspace && <Navbar />}
              <main id="main-content" className="min-w-0 flex-1">
                {children}
              </main>
              {!workspace && <Footer />}
            </div>
            <ConsentBanner />
            <ConsentPreferences />
            {/* Suspense because useSearchParams opts a route out of static
                rendering otherwise; the component renders nothing, so the
                boundary never shows a fallback. */}
            <Suspense fallback={null}>
              <PageViews />
            </Suspense>
          </ToastProvider>
        </ConsentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
