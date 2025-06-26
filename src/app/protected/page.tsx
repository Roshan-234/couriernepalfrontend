'use client';

import { useEffect } from 'react';

export default function ProtectedPage() {
  useEffect(() => {
    alert('🎉 You are now logged in and on a protected page!');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome to the protected area!</h1>
    </div>
  );
}
