import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fetchMovies, fetchMartialArt } from '@/lib/data';
import Home from '@/app/martial-arts/[slug]/page';

vi.mock('@/components/MovieList', () => ({
  default: ({ movies }: any) => (
    <div data-testid="movie-list">{!movies.length ? 'No movies found' : `${movies.length} movies`}</div>
  ),
}));

vi.mock('@/components/Pagination', () => ({
  default: ({ totalPages }: any) => <div data-testid="pagination">{totalPages}</div>,
}));

vi.mock('@/components/Sort', () => ({
  default: () => <div data-testid="sort" />,
}));

vi.mock('@/components/ControlsContainer', () => ({
  default: ({ children }: any) => <div data-testid="controls">{children}</div>,
}));

vi.mock('@/lib/data', async () => {
  const { sortOptions } = await vi.importActual('@/lib/data');
  return {
    fetchMartialArt: vi.fn(),
    fetchMovies: vi.fn(),
    sortOptions: sortOptions,
  };
});

describe('Martial Arts page', () => {
  const mockMartialArt = {
    id: 1,
    name: 'Karate',
    slug: 'karate',
  };

  const mockMovies = [
    { id: 1, title: 'The Karate Kid' },
    { id: 2, title: 'The Karate Kid 2' },
  ] as any;

  const setupMocks = (movies = mockMovies, totalPages = 5) => {
    vi.mocked(fetchMartialArt).mockResolvedValue(mockMartialArt);
    vi.mocked(fetchMovies).mockResolvedValue({
      movies: movies,
      totalPages: totalPages,
    });
  };

  test('uses default sort and page when params are missing', async () => {
    setupMocks();

    const ui = await Home({
      params: Promise.resolve({ slug: 'karate' }),
      searchParams: Promise.resolve({}),
    });

    render(ui);

    expect(fetchMartialArt).toHaveBeenCalledWith('karate');
    expect(fetchMovies).toHaveBeenCalledWith({ primaryMartialArt: 'karate', sort: 'release-desc' }, 1);

    expect(screen.getByRole('heading')).toHaveTextContent('Karate movies');
    expect(screen.getByTestId('pagination')).toHaveTextContent('5');
  });

  test('uses valid sort and page params when provided', async () => {
    setupMocks();

    await Home({
      params: Promise.resolve({ slug: 'karate' }),
      searchParams: Promise.resolve({ sort: 'title-asc', page: '5' }),
    });

    expect(fetchMovies).toHaveBeenCalledWith({ primaryMartialArt: 'karate', sort: 'title-asc' }, 5);
  });

  test('falls back to default sort and page when params are invalid', async () => {
    setupMocks();

    await Home({
      params: Promise.resolve({ slug: 'karate' }),
      searchParams: Promise.resolve({ sort: 'invalid-sort', page: 'x' }),
    });

    expect(fetchMovies).toHaveBeenCalledWith({ primaryMartialArt: 'karate', sort: 'release-desc' }, 1);
  });

  test('shows empty message when no movies', async () => {
    setupMocks([], 0);

    const ui = await Home({
      params: Promise.resolve({ slug: 'karate' }),
      searchParams: Promise.resolve({}),
    });

    render(ui);

    expect(screen.getByText('No movies found')).toBeInTheDocument();
  });
});
