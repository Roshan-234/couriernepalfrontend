// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Moonlight Freight Pvt. Ltd.',
  description: 'Global parcel & logistics management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-900 text-white p-4 flex justify-between">
          <Link href="/" className="font-bold">Moonlight Freight Pvt. Ltd.</Link>
          <div className="space-x-4">
            <Link href="/auth/login" className="hover:underline">Login</Link>
            <Link href="/auth/register" className="hover:underline">Register</Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
