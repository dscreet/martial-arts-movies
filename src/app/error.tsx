'use client';

import { useEffect } from 'react';

import FallbackLayout from '@/components/FallbackLayout';

// metadata doesn't work here

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <title>Error</title>
      <FallbackLayout
        title="Something went wrong"
        description="An unexpected error occurred while loading this page. Please try again, or return to the home page."
        primaryAction={{ onClick: () => retry(), label: 'Try again' }}
        secondaryAction={{ href: '/', label: 'Go home' }}
      />
    </>
  );
}
