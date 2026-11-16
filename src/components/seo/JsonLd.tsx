import { serialize } from "@/lib/seo/serialize";

/**
 * Renders one or more JSON-LD blocks.
 *
 * Handles the escaping that hand-written script tags keep getting wrong;
 * see `serialize`.
 *
 * **This component used to read `headers()` for the CSP nonce, and that one
 * call was the single most expensive line in the application.** It is
 * rendered from the root layout, so every route in the tree inherited a
 * request-time dependency and Next could prerender none of them: 79 of 79
 * routes were server-rendered on demand and the build emitted no HTML at
 * all. On shared hosting that meant a React server render for every page
 * view, including every crawler hit on the ~119 URLs in the sitemap.
 *
 * The nonce is gone from here instead. Public pages are now static files,
 * and their Content-Security-Policy allows inline scripts rather than
 * requiring a per-request nonce — see `src/middleware.ts`, which still
 * issues the strict nonce policy for the signed-in areas, where a session
 * is actually at risk. A JSON-LD block is inert data, not executable code,
 * so it is not the part of that policy doing the work.
 */
export default function JsonLd({ data }: { data: unknown | unknown[] }) {
  const blocks = (Array.isArray(data) ? data : [data]).filter(Boolean);

  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(block) }}
        />
      ))}
    </>
  );
}
