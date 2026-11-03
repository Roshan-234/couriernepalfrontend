import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/content';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/dashboard/',
        '/auth/',
        '/api/',
        // The blog editor was reachable and indexable: it is not under the
        // middleware's protected-path regex and carried no robots metadata.
        '/blog/new/',
        '/blog/*/edit',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

/*
 * `/tracking` is deliberately no longer blocked.
 *
 * It was disallowed here, given `noindex` in its metadata and an
 * `X-Robots-Tag` by the middleware — three separate blocks on the page that
 * answers the highest-intent query this company gets ("track courier
 * nepal"). The page itself holds no customer data until someone enters a
 * tracking number, so there is nothing to protect by hiding it; results are
 * rendered client-side from an authenticated-by-number lookup and the page
 * carries its own noindex for a result view.
 */
