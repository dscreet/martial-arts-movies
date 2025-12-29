import { notFound } from 'next/navigation';

export default function TestErrorPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  throw new Error('Test error for E2E testing');
}
