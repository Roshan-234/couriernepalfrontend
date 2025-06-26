import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Moonlight Freight Pvt. Ltd. Authentication',
  description: 'Sign in or create an account to access our services',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-8">
        {children}
      </div>
    </div>
  );
}
