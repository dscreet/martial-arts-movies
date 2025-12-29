import FallbackLayout from '@/components/FallbackLayout';

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you’re looking for doesn’t exist.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <FallbackLayout
      title="Page not found"
      description="The page you’re looking for doesn’t exist."
      primaryAction={{ href: '/', label: 'Go home' }}
    />
  );
}
