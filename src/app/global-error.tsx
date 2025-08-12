'use client';

import { Button } from '@/components/common/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary-600">Oops! Something went wrong</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Error</h1>
        <p className="mt-6 text-base leading-7 text-gray-600">{error.message}</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button href="/" variant="ghost">
            Go back home
          </Button>
        </div>
      </div>
    </div>
  );
}
