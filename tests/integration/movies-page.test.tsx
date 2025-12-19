import type { Movie } from '@prisma/client';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import Home from '@/app/movies/page';
import { fetchCountries, fetchGenres, fetchMartialArts, fetchMovies } from '@/lib/data';

vi.mock('@/components/MovieList', () => ({
  default: ({ movies }: { movies: Movie[] }) => (
    <div data-testid="movie-list">{!movies.length ? 'No movies found' : `${movies.length} movies`}</div>
  ),
}));

vi.mock('@/components/Pagination', () => ({
  default: ({ totalPages }: { totalPages: number }) => <div data-testid="pagination">{totalPages}</div>,
}));

vi.mock('@/components/Sort', () => ({
  default: () => <div data-testid="sort" />,
}));

vi.mock('@/components/SingleSelectFilter', () => ({
  default: () => <div data-testid="filter" />,
}));

vi.mock('@/components/ControlsContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="controls">{children}</div>,
}));

vi.mock('@/lib/data', async () => {
  const { sortOptions } = await vi.importActual('@/lib/data');
  return {
    fetchMovies: vi.fn(),
    fetchMartialArts: vi.fn(),
    fetchGenres: vi.fn(),
    fetchCountries: vi.fn(),
    sortOptions: sortOptions,
  };
});

describe('All movies page', () => {
  const mockMovies = [
    { id: 1, title: 'The Karate Kid' },
    { id: 2, title: 'The Karate Kid 2' },
  ] satisfies Partial<Movie>[];

  const setupMocks = (movies = mockMovies as Movie[], totalPages = 5) => {
    vi.mocked(fetchMovies).mockResolvedValue({ movies, totalPages });
    vi.mocked(fetchMartialArts).mockResolvedValue([]);
    vi.mocked(fetchGenres).mockResolvedValue([]);
    vi.mocked(fetchCountries).mockResolvedValue([]);
  };

  test('uses default sort and page when params are missing', async () => {
    setupMocks();

    const ui = await Home({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(fetchMovies).toHaveBeenCalledWith({ sort: 'release-desc' }, 1);

    expect(screen.getByRole('heading', { level: 1, name: 'All movies' })).toBeInTheDocument();
    expect(screen.getByTestId('movie-list')).toHaveTextContent('2 movies');
    expect(screen.getByTestId('pagination')).toHaveTextContent('5');
  });

  test('uses valid filters, sort and page params when provided', async () => {
    setupMocks();

    await Home({
      searchParams: Promise.resolve({
        sort: 'title-asc',
        'martial-art': 'karate',
        genre: 'action',
        country: 'US',
        year: '1980',
        page: '2',
      }),
    });

    expect(fetchMovies).toHaveBeenCalledWith(
      {
        sort: 'title-asc',
        martialArt: 'karate',
        genre: 'action',
        country: 'US',
        year: '1980',
      },
      2
    );
  });

  test('falls back to default sort and page when params are invalid', async () => {
    setupMocks();

    await Home({ searchParams: Promise.resolve({ sort: 'invalid-sort', page: 'x' }) });

    expect(fetchMovies).toHaveBeenCalledWith({ sort: 'release-desc' }, 1);
  });

  test('shows empty message when no movies', async () => {
    setupMocks([], 0);

    const ui = await Home({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByText('No movies found')).toBeInTheDocument();
  });
});
