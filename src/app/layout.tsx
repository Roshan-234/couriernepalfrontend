import './globals.css';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import Analytics from '@/components/common/Analytics';
import { siteUrl } from '@/lib/content';
export const dynamic = 'force-dynamic';
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
  title: { default: 'Moonlight Freight | Courier Nepal', template: '%s | Moonlight Freight' },
  description: 'Courier and freight services from Nepal. Book shipments and follow delivery updates with Moonlight Freight.',
  openGraph: { siteName: 'Moonlight Freight', locale: 'en_NP', type: 'website', images: ['/images/moonlight-freight-logo.jpg'] },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') || '';
  const organization = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Moonlight Freight Pvt. Ltd.', url: siteUrl, logo: siteUrl + '/images/moonlight-freight-logo.jpg' };
  return (
    <html lang="en" className="h-full scroll-smooth antialiased" suppressHydrationWarning>
      <body className="h-full">
        <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\u003c') }} />
        <Suspense fallback={null}><Analytics id={process.env.GA_MEASUREMENT_ID} nonce={nonce} siteUrl={siteUrl} /></Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <RootLayoutClient>{children}</RootLayoutClient>
        </Suspense>
      </body>
    </html>
  );
}
