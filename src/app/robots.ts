import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/content';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/dashboard/', '/auth/', '/api/', '/tracking', '/protected'] }, sitemap: `${siteUrl}/sitemap.xml` };
}
