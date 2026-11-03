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
          dangerouslySetInnerHTML={{ __html: serialize(block) }}
        />
      ))}
    </>
  );
}
