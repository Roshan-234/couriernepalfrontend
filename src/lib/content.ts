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
export const backendUrl = (process.env.BACKEND_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
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

export const getPages = cache(async (): Promise<SitePage[]> => {
  const response = await fetch(`${backendUrl}/api/content/pages`, {
    headers: backendHeaders(),
    next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ['site-content'] },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Content service is unavailable');
  return (await response.json()).pages;
});
const pageIndex = cache(async () => new Map((await getPages()).map(page => [page.path, page])));
export async function getPage(path: string) {
  const page = (await pageIndex()).get(path);
  if (!page) notFound();
  return page;
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
  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: options.path },
    openGraph: {
      title: options.title,
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
      title: options.title,
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
