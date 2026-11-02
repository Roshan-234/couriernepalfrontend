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
export const getPages = cache(async (): Promise<SitePage[]> => {
  const response = await fetch(`${backendUrl}/api/content/pages`, { headers: backendHeaders(), cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Content service is unavailable');
  return (await response.json()).pages;
});
const pageIndex = cache(async () => new Map((await getPages()).map(page => [page.path, page])));
export async function getPage(path: string) {
  const page = (await pageIndex()).get(path);
  if (!page) notFound();
  return page;
}
export async function pageMetadata(path: string): Promise<Metadata> {
  const page = await getPage(path);
  return { title: page.title, description: page.description, alternates: { canonical: path },
    openGraph: { title: page.title, description: page.description, url: path, type: 'website', images: ['/images/moonlight-freight-logo.jpg'] },
    twitter: { card: 'summary', title: page.title, description: page.description },
    ...(path === '/tracking' ? { robots: { index: false, follow: true } } : {}) };
}
