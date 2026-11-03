import './globals.css';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import Analytics from '@/components/common/Analytics';
import JsonLd from '@/components/seo/JsonLd';
import { siteUrl, DEFAULT_OG_IMAGE } from '@/lib/content';
import { localBusiness, website } from '@/lib/seo/jsonld';
import { BUSINESS } from '@/lib/seo/business';

// Rendering is dynamic regardless of this flag, because the layout reads the
// per-request CSP nonce from headers(). The lever that actually matters for
// time-to-first-byte is caching the backend content fetch, which getPages
// now does — see CONTENT_REVALIDATE_SECONDS.
import '@fontsource/inter';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import { Suspense } from 'react';
import RootLayoutClient from '@/components/layout/RootLayoutClient';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'International Courier & Cargo from Nepal | Moonlight Freight',
    template: '%s | Moonlight Freight',
  },
  // International leads, because that is the business. Domestic delivery is
  // the feeder network underneath it and is named last.
  description:
    'Air and sea freight, express courier and excess baggage from Kathmandu to the '
    + 'world, plus customs-cleared imports into Nepal. Door-to-door to the USA, UK, '
    + 'Australia, the Gulf and beyond, with delivery onward to all 77 districts.',
  applicationName: 'Moonlight Freight',
  authors: [{ name: BUSINESS.legalName, url: siteUrl }],
  openGraph: {
    siteName: 'Moonlight Freight',
    locale: 'en_NP',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Moonlight Freight' }],
  },
  twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE] },
  robots: { index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') || '';
  return (
    <html lang="en" className="h-full scroll-smooth antialiased" suppressHydrationWarning>
      <body className="h-full">
        {/* The business and the site, declared once and referenced by @id
            from the Service, Article and Breadcrumb markup on inner pages. */}
        <JsonLd data={[localBusiness(siteUrl), website(siteUrl)]} />
        <Suspense fallback={null}><Analytics id={process.env.GA_MEASUREMENT_ID} nonce={nonce} siteUrl={siteUrl} /></Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <RootLayoutClient>{children}</RootLayoutClient>
        </Suspense>
      </body>
    </html>
  );
}
