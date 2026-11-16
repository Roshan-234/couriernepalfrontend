import Workspace from "@/components/dashboard/Workspace";

// The signed-in areas keep the strict nonce-based Content-Security-Policy,
// and a nonce is minted per request, so these routes must render per
// request too. Marked explicitly rather than relied upon: these pages are
// client components and Next would otherwise happily prerender them, at
// which point their inline bootstrap scripts would carry no nonce and the
// policy would block the application from starting.
export const dynamic = 'force-dynamic';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Workspace admin>{children}</Workspace>;
}
