"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AuthProvider } from "@/contexts/AuthContext";
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
        <div className="flex min-h-screen flex-col">
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          {!workspace && <Navbar />}
          <main id="main-content" className="min-w-0 flex-1">
            {children}
          </main>
          {!workspace && <Footer />}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
