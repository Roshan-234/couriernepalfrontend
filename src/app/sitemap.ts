import type { MetadataRoute } from 'next';
import { getPages, siteUrl, backendUrl, backendHeaders } from '@/lib/content';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const response = await fetch(`${backendUrl}/api/content/article-index`, { headers: backendHeaders(), cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Unable to load article sitemap');
  const { articles }: { articles: { slug: string; updated_at: string | null }[] } = await response.json();
  const pages: MetadataRoute.Sitemap = (await getPages()).filter(page => page.path !== '/tracking').map(page => ({ url: siteUrl + page.path, lastModified: page.updated_at, changeFrequency: 'weekly', priority: page.path === '/' ? 1 : 0.7 }));
  return [...pages, ...articles.map(post => ({ url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`, ...(post.updated_at ? {lastModified: post.updated_at} : {}) }))];
}
