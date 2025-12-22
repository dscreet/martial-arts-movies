import type { Movie } from '@prisma/client';
import { render, screen } from '@testing-library/react';
import type { ImageProps } from 'next/image';
import { describe, expect, test, vi } from 'vitest';

import MovieList from '@/components/MovieList';

vi.mock('next/image', () => ({
  default: ({ fill, ...props }: ImageProps) => <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />,
}));

describe('MovieList', () => {
  const createMockMovie = (overrides: Partial<Movie>): Movie =>
    ({
      id: 1,
      title: 'Test movie',
      slug: 'test-movie',
      posterPath: '/poster.jpg',
      overview: 'Movie overview',
      releaseDate: new Date('2000-01-01'),
      ...overrides,
    }) as Movie;

  test('renders the correct number of movies', () => {
    const movies = [createMockMovie({ id: 1 }), createMockMovie({ id: 2 }), createMockMovie({ id: 3 })];

    render(<MovieList movies={movies} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  test('renders the movie title', () => {
    const movie = createMockMovie({ title: 'Movie title' });

    render(<MovieList movies={[movie]} />);

    expect(screen.getByText('Movie title')).toBeInTheDocument();
  });

  test('renders the movie overview', () => {
    const movie = createMockMovie({ overview: 'Movie overview' });

    render(<MovieList movies={[movie]} />);

    expect(screen.getByText('Movie overview')).toBeInTheDocument();
  });

  test('renders release year when releaseDate exists', () => {
    const movie = createMockMovie({
      releaseDate: new Date('2020-01-01'),
    });

    render(<MovieList movies={[movie]} />);

    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  test('handles missing releaseDate properly', () => {
    const movie = createMockMovie({
      title: 'Test movie',
      releaseDate: null,
    });

    render(<MovieList movies={[movie]} />);

    expect(screen.getByText('Test movie')).toBeInTheDocument();
  });

  test('renders movie with TMDB poster URL when posterPath exists', () => {
    const movie = createMockMovie({ posterPath: '/example-path.jpg' });

    render(<MovieList movies={[movie]} />);

    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toMatch(/^https:\/\/image\.tmdb\.org\/t\/p\/.+\/example-path\.jpg$/);
  });

  test('handles missing posterPath properly', () => {
    const movie = createMockMovie({ posterPath: null });

    render(<MovieList movies={[movie]} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/fallback-image.png');
  });

  test('renders correct link to movie page', () => {
    const movie = createMockMovie({ slug: 'movie-slug' });

    render(<MovieList movies={[movie]} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/movies/movie-slug');
  });
});
