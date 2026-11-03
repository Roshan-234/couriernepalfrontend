import { headers } from "next/headers";
import { serialize } from "@/lib/seo/serialize";

/**
 * Renders one or more JSON-LD blocks.
 *
 * Handles the two things hand-written script tags kept getting wrong: the
 * escaping (see `serialize`) and the per-request CSP nonce, without which
 * the `strict-dynamic` policy set by the middleware blocks the script.
 */
export default async function JsonLd({ data }: { data: unknown | unknown[] }) {
  const nonce = (await headers()).get("x-nonce") || "";
  const blocks = (Array.isArray(data) ? data : [data]).filter(Boolean);

  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          nonce={nonce}
          // The nonce exists only in the server-rendered HTML — React drops
          // it on the client, which otherwise logs a hydration mismatch it
          // says it "won't patch up". Harmless here: CSP is enforced when the
          // document is parsed, which has already happened by then.
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: serialize(block) }}
        />
      ))}
    </>
  );
}
