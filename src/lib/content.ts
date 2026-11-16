import 'server-only';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export interface SitePage {
  path: string; title: string; description: string; eyebrow: string; heading: string;
  intro: string; sections: { heading: string; body: string }[]; published: boolean;
  version: number; updated_at: string;
}
export const siteUrl = (process.env.SITE_URL || 'https://couriernepal.com').replace(/\/$/, '');
export const backendUrl = (process.env.BACKEND_ORIGIN || process.env.BACKEND_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
export const backendHeaders = () => ({ 'X-Backend-Key': process.env.BACKEND_PROXY_SECRET || '' });

// React's request-scoped cache shares one lookup between metadata and page rendering.
/**
 * How long a managed page may be served from cache.
 *
 * Every public request used to make its own call to Flask with `no-store`,
 * so time-to-first-byte depended on a shared-hosting Python process on every
 * single page view. Editors change this content rarely, so a few minutes of
 * staleness costs nothing and removes the backend from the hot path.
 */
export const CONTENT_REVALIDATE_SECONDS = 300;

/**
 * Every managed page, or an empty list when the backend cannot be reached.
 *
 * Returning empty rather than throwing is what lets these routes be
 * prerendered. The build runs in CI, where Flask is not running, and a
 * throw there fails the whole build — which is exactly what happened the
 * first time these pages became static: `connect ECONNREFUSED
 * 127.0.0.1:5000` on `/services/express` and no site at all.
 *
 * A page with no managed content still renders: `getPage` falls back to a
 * minimal record, so the route exists, the layout is right and the copy is
 * filled in by the next revalidation once Flask answers. A missing
 * paragraph is recoverable; a failed deployment is not.
 */
export const getPages = cache(async (): Promise<SitePage[]> => {
  try {
    const response = await fetch(`${backendUrl}/api/content/pages`, {
      headers: backendHeaders(),
      next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ['site-content'] },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    return (await response.json()).pages ?? [];
  } catch {
    return [];
  }
});
const pageIndex = cache(async () => new Map((await getPages()).map(page => [page.path, page])));

/**
 * One managed page.
 *
 * `notFound()` is reserved for the case where the content service answered
 * and simply has no such page — a genuine 404. When it answered with
 * nothing at all (CI, or Flask being down), every path would 404 and the
 * build would emit a site of error pages, so an empty index falls back to a
 * placeholder record instead and the real copy arrives on revalidation.
 */
export async function getPage(path: string): Promise<SitePage> {
  const index = await pageIndex();
  const page = index.get(path);
  if (page) return page;
  if (index.size === 0) {
    return {
      path, title: 'Moonlight Freight', description: '', eyebrow: '',
      heading: '', intro: '', sections: [], published: true, version: 0,
      updated_at: null,
    } as unknown as SitePage;
  }
  notFound();
}
/** The social image every page falls back to. */
export const DEFAULT_OG_IMAGE = '/og-default.jpg';

/**
 * Build page metadata.
 *
 * Next merges `openGraph` only one level deep, so a page that sets its own
 * block replaces the root one wholesale — which is how every page here lost
 * the `siteName` and `locale` declared in the root layout. Each of those is
 * repeated below rather than inherited.
 */
export function buildMetadata(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string | null;
  modifiedTime?: string | null;
}): Metadata {
  const image = options.image || DEFAULT_OG_IMAGE;
  // The root layout's title template already appends the brand. Pages that
  // spell it out as well render it twice, which eats the ~60 characters a
  // result actually shows. Strip it here rather than relying on every author
  // to remember.
  const title = options.title.replace(/\s*\|\s*Moonlight Freight\s*$/i, '').trim();
  // A title that still names the brand after that — "About Moonlight
  // Freight", say — would have it appended a second time by the template.
  // `absolute` opts that page out of the template entirely.
  const titleField = /moonlight freight/i.test(title) ? { absolute: title } : title;
  return {
    title: titleField,
    description: options.description,
    alternates: { canonical: options.path },
    openGraph: {
      title,
      description: options.description,
      url: options.path,
      type: options.type || 'website',
      siteName: 'Moonlight Freight',
      locale: 'en_NP',
      images: [{ url: image, width: 1200, height: 630, alt: options.title }],
      ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
      ...(options.modifiedTime ? { modifiedTime: options.modifiedTime } : {}),
    },
    twitter: {
      // A large card earns far more of the timeline than the square summary
      // the site was asking for.
      card: 'summary_large_image',
      title,
      description: options.description,
      images: [image],
    },
    ...(options.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export async function pageMetadata(path: string): Promise<Metadata> {
  const page = await getPage(path);
  return buildMetadata({ title: page.title, description: page.description, path });
}
