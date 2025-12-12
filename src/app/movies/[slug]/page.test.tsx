import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fetchMovie } from '@/lib/data';
import Home from '@/app/movies/[slug]/page';

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('@/components/ImageWithFallback', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...rest }: any) => <span {...rest}>{children}</span>,
}));

vi.mock('@/lib/data', async () => ({
  fetchMovie: vi.fn(),
}));

type Movie = NonNullable<Awaited<ReturnType<typeof fetchMovie>>>;

describe('Movie details page', () => {
  const mockMovie: Partial<Movie> = {
    id: 1,
    slug: 'karate-kid-legends-2025',
    title: 'Karate Kid Legends',
    overview: 'A reboot of the classic franchise.',
    releaseDate: new Date('2025-01-01'),
    posterPath: '/poster.jpg',
    backdropPath: '/backdrop.jpg',
    primaryMartialArt: { id: 1, name: 'Karate', slug: 'karate' },
    martialArts: [
      { id: 1, name: 'Karate', slug: 'karate' },
      { id: 2, name: 'Kung Fu', slug: 'kung-fu' },
    ],
    genres: [
      { id: 1, name: 'Action', slug: 'action' },
      { id: 2, name: 'Adventure', slug: 'adventure' },
    ],
    countries: [{ id: 1, name: 'United States of America', code: 'US' }],
  };

  test('fetches movie using slug', async () => {
    vi.mocked(fetchMovie).mockResolvedValue(mockMovie as Movie);

    await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });

    expect(fetchMovie).toHaveBeenCalledWith('karate-kid-x');
  });

  test('renders title and release year', async () => {
    vi.mocked(fetchMovie).mockResolvedValue(mockMovie as Movie);

    const ui = await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });
    render(ui);

    expect(screen.getByRole('heading', { level: 1, name: 'Karate Kid Legends' })).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  test('renders primary martial art', async () => {
    vi.mocked(fetchMovie).mockResolvedValue(mockMovie as Movie);

    const ui = await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });
    render(ui);

    const primaryMartialArtSection = screen.getByRole('heading', { name: 'Primary martial art' }).closest('div');
    expect(primaryMartialArtSection).toHaveTextContent('Karate');
  });

  test('renders secondary martial arts when present', async () => {
    vi.mocked(fetchMovie).mockResolvedValue(mockMovie as Movie);

    const ui = await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });
    render(ui);

    const secondaryMartialArtsSection = screen.getByRole('heading', { name: 'Also features' }).closest('div');
    expect(secondaryMartialArtsSection).toHaveTextContent('Kung Fu');
  });

  test('does not render secondary martial arts when none exist', async () => {
    vi.mocked(fetchMovie).mockResolvedValue({
      ...mockMovie,
      martialArts: [mockMovie.primaryMartialArt],
    } as Movie);

    const ui = await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });
    render(ui);

    const secondaryMartialArtsSection = screen.queryByRole('heading', { name: 'Also features' });
    expect(secondaryMartialArtsSection).not.toBeInTheDocument();
  });

  //TODO: test error page
});
