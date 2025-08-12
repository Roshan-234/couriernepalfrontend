import './globals.css';
import '@fontsource/inter';
import '@fontsource/plus-jakarta-sans';
import { Suspense } from 'react';
import RootLayoutClient from '@/components/layout/RootLayoutClient';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Moonlight Freight Pvt. Ltd.',
  description: 'Global parcel & logistics management',
  keywords: ['logistics', 'freight', 'shipping', 'cargo', 'courier', 'nepal'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased" suppressHydrationWarning>
      <body className="h-full">
        <Suspense fallback={<LoadingSpinner />}>
          <RootLayoutClient>{children}</RootLayoutClient>
        </Suspense>
      </body>
    </html>
  );
}
