import NotFoundLayout from '@/components/NotFound';

export const metadata = {
  title: 'Movie Not Found',
  description: 'The movie you’re looking for doesn’t exist.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <NotFoundLayout
      title="Movie not found"
      description="We couldn’t find this movie. It may have been removed, renamed, or never existed."
      primaryAction={{ href: '/movies', label: 'Browse all movies' }}
      secondaryAction={{ href: '/', label: 'Explore martial arts' }}
    />
  );
}
