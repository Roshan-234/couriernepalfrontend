import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/content";
import {
  InboundCorridorPage,
  OutboundCorridorPage,
  corridorContent,
  corridorPath,
  corridorRouteParams,
  directionContent,
  resolveCorridorRoute,
} from "@/components/seo/corridor";

/**
 * Both corridor directions, served from one dynamic segment.
 *
 * The public URLs are `/shipping/nepal-to-<country>` and
 * `/shipping/to-nepal-from-<country>`. Next.js has no support for a dynamic
 * segment carrying a literal prefix — `isDynamicRoute` only recognises a
 * segment that is entirely `[param]`, so a folder named `nepal-to-[country]`
 * would be registered as a literal path and every real URL would 404. The
 * two directions therefore share this segment and are separated by
 * `resolveCorridorRoute`, which keeps the URLs exactly as intended. The page
 * bodies themselves live in two completely separate components.
 */

type Props = { params: Promise<{ corridor: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return corridorRouteParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = resolveCorridorRoute((await params).corridor);
  if (!route) return buildMetadata({ title: "Not found", description: "", path: "/shipping", noindex: true });

  const content = corridorContent(route.corridor.slug);
  if (!content) return buildMetadata({ title: "Not found", description: "", path: "/shipping", noindex: true });

  const direction = directionContent(content, route.direction);
  return buildMetadata({
    title: direction.title,
    description: direction.description,
    path: corridorPath(route.direction, route.corridor.slug),
  });
}

export default async function Page({ params }: Props) {
  const route = resolveCorridorRoute((await params).corridor);
  if (!route) notFound();

  const content = corridorContent(route.corridor.slug);
  if (!content) notFound();

  return route.direction === "outbound" ? (
    <OutboundCorridorPage corridor={route.corridor} content={content} />
  ) : (
    <InboundCorridorPage corridor={route.corridor} content={content} />
  );
}
