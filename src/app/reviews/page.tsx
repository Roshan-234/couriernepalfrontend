import type { Metadata } from "next";

import PageShell from "@/components/seo/pages/PageShell";
import { GoogleBlock } from "@/components/reviews/GoogleBlock";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewsBrowser } from "@/components/reviews/ReviewsBrowser";
import { buildMetadata } from "@/lib/content";

/**
 * Customer reviews.
 *
 * Two sources on one page, kept visibly apart: the reviews written here,
 * which we moderate and answer, and the reviews on our Google listing,
 * which we may display with attribution and may not touch. There is no
 * combined score anywhere on this page, and the Google block disappears
 * entirely while no Places key is configured.
 *
 * **No `Review` or `AggregateRating` structured data.** Marking up reviews
 * that are unapproved — or seeded demo content — is against Google's
 * structured data policy, and at the time of writing there is nothing
 * approved to mark up. `PageShell` emits the breadcrumb trail and nothing
 * else. When there is a real body of published reviews the owner can decide
 * whether to add it; that decision is not this page's to make for them.
 */

const DESCRIPTION =
  "Reviews from Moonlight Freight customers shipping between Nepal and the rest of "
  + "the world, with our replies — and a form to write your own. Every review is read "
  + "by our team before it is published.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Customer Reviews",
    description: DESCRIPTION,
    path: "/reviews",
  });
}

export default function ReviewsPage() {
  return (
    <PageShell
      trail={[
        { name: "Home", path: "/" },
        { name: "Customer reviews", path: "/reviews" },
      ]}
      eyebrow="Customer reviews"
      title="What our customers say"
      intro={
        <>
          Moonlight Freight has been shipping out of Kathmandu for twenty years.
          What follows is what customers have written about it — the good runs
          and the ones that went wrong, with our answer underneath where we have
          one. Nothing here is published automatically: a person at the office
          reads every review first.
        </>
      }
    >
      <ReviewsBrowser />

      {/* Google's block renders nothing at all unless a Places key is
          configured, which is the state today. It carries its own heading,
          its own rating and the attribution Google requires. */}
      <GoogleBlock />

      <ReviewForm />
    </PageShell>
  );
}
