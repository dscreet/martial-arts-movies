import { render, screen } from '@testing-library/react';
import type { ImageProps } from 'next/image';
import { describe, expect, test, vi } from 'vitest';

import Home from '@/app/movies/[slug]/page';
import type { ImageWithFallbackProps } from '@/components/ImageWithFallback';
import { fetchMovie, fetchStreamingAvailability } from '@/lib/data';

vi.mock('next/image', () => ({
  default: ({ fill, preload, ...props }: ImageProps) => (
    <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}));

vi.mock('@/components/ImageWithFallback', () => ({
  default: ({ fill, fallbackSrc, ...props }: ImageWithFallbackProps) => (
    <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...rest }: { children?: React.ReactNode }) => <span {...rest}>{children}</span>,
}));

vi.mock('@/components/StreamingAvailability', () => ({
  default: () => <div>Streaming availability component</div>,
}));

vi.mock('@/lib/data', async () => ({
  fetchMovie: vi.fn(),
  fetchStreamingAvailability: vi.fn(),
}));

type Movie = NonNullable<Awaited<ReturnType<typeof fetchMovie>>>;

describe('Movie details page', () => {
  const mockMovie = {
    id: 1,
    tmdbId: 10,
    slug: 'karate-kid-legends-2025',
    title: 'Karate Kid Legends',
    releaseDate: new Date('2025-01-01'),
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
  } satisfies Partial<Movie>;

  const setupMocks = (movie = mockMovie as Movie, availabilityData = null) => {
    vi.clearAllMocks();
    vi.mocked(fetchMovie).mockResolvedValue(movie);
    vi.mocked(fetchStreamingAvailability).mockResolvedValue(availabilityData);
  };

  test('fetches movie using slug', async () => {
    setupMocks();

    await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });

    expect(fetchMovie).toHaveBeenCalledWith('karate-kid-x');
  });

  test('fetches streaming availability using movie id', async () => {
    setupMocks();

    await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });

    expect(fetchStreamingAvailability).toHaveBeenCalledWith(mockMovie.tmdbId);
  });

  test('renders title and release year', async () => {
    setupMocks();

    const ui = await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });
    render(ui);

    expect(screen.getByRole('heading', { level: 1, name: 'Karate Kid Legends' })).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  test('renders primary martial art', async () => {
    setupMocks();

    const ui = await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });
    render(ui);

    const primaryMartialArtSection = screen.getByRole('heading', { name: 'Primary martial art' }).closest('div');
    expect(primaryMartialArtSection).toHaveTextContent('Karate');
  });

  test('renders secondary martial arts when present', async () => {
    setupMocks();

    const ui = await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });
    render(ui);

    const secondaryMartialArtsSection = screen.getByRole('heading', { name: 'Also features' }).closest('div');
    expect(secondaryMartialArtsSection).toHaveTextContent('Kung Fu');
  });

  test('does not render secondary martial arts when none exist', async () => {
    setupMocks({
      ...mockMovie,
      martialArts: [mockMovie.primaryMartialArt],
    } as Movie);

    const ui = await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });
    render(ui);

    const secondaryMartialArtsSection = screen.queryByRole('heading', { name: 'Also features' });
    expect(secondaryMartialArtsSection).not.toBeInTheDocument();
  });

  test('renders where to watch section', async () => {
    setupMocks();

    const ui = await Home({ params: Promise.resolve({ slug: 'karate-kid-x' }) });
    render(ui);

    expect(screen.getByRole('heading', { name: 'Where to watch' })).toBeInTheDocument();
    expect(screen.getByText('Streaming availability component')).toBeInTheDocument();
  });

  //TODO: test error page
});
