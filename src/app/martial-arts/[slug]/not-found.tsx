import NotFoundLayout from '@/components/NotFound';

export const metadata = {
  title: 'Martial Art Not Found',
  description: 'The martial art you’re looking for doesn’t exist.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <NotFoundLayout
      title="Martial art not found"
      description="The martial art you’re looking for doesn’t exist or may have been removed."
      primaryAction={{ href: '/', label: 'Browse martial arts' }}
      secondaryAction={{ href: '/movies', label: 'View all movies' }}
    />
  );
}
