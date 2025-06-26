'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
};

export default ProtectedRoute;