import type { MetadataRoute } from 'next';
import { getPages, siteUrl, backendUrl, backendHeaders } from '@/lib/content';
import { DISTRICTS } from '@/lib/seo/districts';
import { CORRIDORS } from '@/lib/seo/business';

/**
 * Rebuilt hourly rather than on every request. The previous version was
 * `force-dynamic` with `no-store`, so each crawler hit made two calls to
 * Flask on shared hosting, and a single failure threw — returning a 500 for
 * the whole sitemap instead of the pages it could still list.
 */
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** Static routes, with the priority reflecting what earns the company money. */
const STATIC_ROUTES: Array<[path: string, priority: number, freq: Entry['changeFrequency']]> = [
  ['/', 1.0, 'weekly'],
  ['/tracking', 0.9, 'monthly'],
  ['/pricing', 0.9, 'weekly'],
  ['/shipping', 0.95, 'weekly'],
  ['/services', 0.9, 'monthly'],
  ['/courier', 0.7, 'weekly'],
  ['/business', 0.8, 'monthly'],
  ['/branches', 0.7, 'monthly'],
  ['/contact', 0.7, 'monthly'],
  ['/faq', 0.7, 'monthly'],
  ['/prohibited-items', 0.6, 'monthly'],
  ['/customs-guide', 0.6, 'monthly'],
  ['/packing-guide', 0.6, 'monthly'],
  ['/about', 0.5, 'monthly'],
  ['/reviews', 0.5, 'weekly'],
  ['/blog', 0.6, 'daily'],
  ['/careers', 0.4, 'monthly'],
  ['/privacy', 0.3, 'yearly'],
  ['/cookies', 0.3, 'yearly'],
  ['/data-requests', 0.3, 'yearly'],
];

/**
 * Pages deliberately kept out.
 *
 * Every one of these carries `noindex`, and listing a noindexed page in a
 * sitemap is a contradictory signal. They stay in the route table above so
 * their priorities survive; remove a path from this set once its page is
 * finished and the flag comes off.
 *
 * `/terms` and `/refund-policy` are drafts pending the company's own legal
 * review. The rest still show [TO CONFIRM] markers where a commercial fact
 * belongs — see CONTENT-TO-CONFIRM.md — and half-written content indexed
 * under a twenty-year-old company's name costs more than a page Google has
 * not found yet.
 */
const EXCLUDED = new Set([
  '/terms',
  '/refund-policy',
  '/business',
  '/prohibited-items',
  '/customs-guide',
  '/packing-guide',
  '/careers',
]);

async function blogArticles(): Promise<Entry[]> {
  try {
    const response = await fetch(`${backendUrl}/api/content/article-index`, {
      headers: backendHeaders(),
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const { articles }: { articles: { slug: string; updated_at: string | null }[] } =
      await response.json();
    return articles.map((post) => ({
      url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      ...(post.updated_at ? { lastModified: post.updated_at } : {}),
    }));
  } catch {
    // A sitemap missing the blog is far better than no sitemap at all.
    return [];
  }
}

async function managedPages(): Promise<Entry[]> {
  try {
    return (await getPages())
      .filter((page) => !EXCLUDED.has(page.path))
      // The static table above already carries these with deliberate
      // priorities; the database copy would duplicate them.
      .filter((page) => !STATIC_ROUTES.some(([path]) => path === page.path))
      .map((page) => ({
        url: siteUrl + page.path,
        lastModified: page.updated_at,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const statics: Entry[] = STATIC_ROUTES.filter(([path]) => !EXCLUDED.has(path)).map(
    ([path, priority, changeFrequency]) => ({
      url: siteUrl + path,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  // The two location clusters. These are static data, so they are always
  // listed even when the backend is unreachable.
  // The domestic network is the feeder under the international business
  // rather than the headline, so districts sit below the corridors.
  const districts: Entry[] = DISTRICTS.map((district) => ({
    url: `${siteUrl}/courier/${district.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: district.zone === 'valley' ? 0.6 : district.zone === 'cities' ? 0.5 : 0.4,
  }));

  const corridors: Entry[] = CORRIDORS.flatMap((corridor) => [
    {
      url: `${siteUrl}/shipping/nepal-to-${corridor.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      // International is the core of the business; these lanes are the
      // pages that should rank.
      priority: 0.9,
    },
    {
      url: `${siteUrl}/shipping/to-nepal-from-${corridor.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
  ]);

  const [managed, articles] = await Promise.all([managedPages(), blogArticles()]);

  // De-duplicate on URL: a managed page and a static route could collide.
  const seen = new Set<string>();
  return [...statics, ...districts, ...corridors, ...managed, ...articles].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
