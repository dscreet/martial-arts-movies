import type { MartialArt, PrismaClient } from '@prisma/client';
import type { Movie } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

import { fetchCountries, fetchMartialArt, fetchMartialArts, fetchMovie, fetchMovies } from '@/lib/data';
import prisma from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  default: mockDeep<PrismaClient>(),
}));

const prismaMock = vi.mocked(prisma, true);

beforeEach(() => {
  mockReset(prismaMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchMartialArts', () => {
  test('returns a list of martial arts when found', async () => {
    const mockResult = [
      { id: 1, name: 'Karate', slug: 'karate' },
      { id: 2, name: 'Kung Fu', slug: 'kung-fu' },
    ];
    prismaMock.martialArt.findMany.mockResolvedValue(mockResult);

    const result = await fetchMartialArts();

    expect(prismaMock.martialArt.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual(mockResult);
  });

  test('throws an error when Prisma throws internally', async () => {
    const dbError = new Error('DB connection failed');
    prismaMock.martialArt.findMany.mockRejectedValue(dbError);

    await expect(fetchMartialArts()).rejects.toThrow('Failed to fetch martial arts data');
  });
});

describe('fetchCountries', () => {
  test('returns countries with movies, ordered by name', async () => {
    const mockResult = [
      { id: 1, name: 'China', code: 'CN' },
      { id: 2, name: 'United Kingdom', code: 'UK' },
    ];
    prismaMock.country.findMany.mockResolvedValue(mockResult);

    const result = await fetchCountries();

    expect(prismaMock.country.findMany).toHaveBeenCalledWith({
      where: { movies: { some: {} } },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual(mockResult);
  });

  test('throws an error when Prisma throws internally', async () => {
    const dbError = new Error('DB connection failed');
    prismaMock.country.findMany.mockRejectedValue(dbError);

    await expect(fetchCountries()).rejects.toThrow('Failed to fetch countries data');
  });
});

describe('fetchMovies', () => {
  test('returns movies with pagination on default parameters', async () => {
    const mockMovies = [{ id: 1, title: 'Ip Man' }];
    prismaMock.movie.findMany.mockResolvedValue(mockMovies as Movie[]);
    prismaMock.movie.count.mockResolvedValue(42);

    const result = await fetchMovies();

    expect(prismaMock.movie.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { releaseDate: 'desc' },
      skip: 0,
      take: 20,
    });

    expect(prismaMock.movie.count).toHaveBeenCalledWith({
      where: {},
    });

    expect(result).toEqual({
      movies: mockMovies,
      totalPages: 3,
    });
  });

  test('applies primaryMartialArt filter correctly', async () => {
    prismaMock.movie.findMany.mockResolvedValue([]);

    await fetchMovies({ primaryMartialArt: 'karate' });

    expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          primaryMartialArt: { slug: 'karate' },
        },
      })
    );
  });

  test('applies martialArt relational filter correctly', async () => {
    prismaMock.movie.findMany.mockResolvedValue([]);

    await fetchMovies({ martialArt: 'Boxing' });

    expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { martialArts: { some: { slug: 'Boxing' } } },
      })
    );
  });

  test('applies genre relational filter correctly', async () => {
    prismaMock.movie.findMany.mockResolvedValue([]);

    await fetchMovies({ genre: 'action' });

    expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { genres: { some: { slug: 'action' } } },
      })
    );
  });

  test('applies country relational filter correctly', async () => {
    prismaMock.movie.findMany.mockResolvedValue([]);

    await fetchMovies({ country: 'jp' });

    expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { countries: { some: { code: 'jp' } } },
      })
    );
  });

  test('applies year pre-1950 filter correctly', async () => {
    prismaMock.movie.findMany.mockResolvedValue([]);

    await fetchMovies({ year: 'pre-1950' });

    expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { releaseDate: { lte: new Date(1950, 0, 1) } },
      })
    );
  });

  test('applies decade-based year filter correctly', async () => {
    prismaMock.movie.findMany.mockResolvedValue([]);

    await fetchMovies({ year: '1980' });

    expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          releaseDate: {
            gte: new Date(1980, 0, 1),
            lte: new Date(1989, 11, 31),
          },
        },
      })
    );
  });

  test('throws an error when Prisma throws internally', async () => {
    const dbError = new Error('DB connection failed');
    prismaMock.movie.findMany.mockRejectedValue(dbError);

    await expect(fetchMovies()).rejects.toThrow('Failed to fetch movies data');
  });
});

describe('fetchMartialArt', () => {
  test('returns martial art data when found', async () => {
    const mockResult = { name: 'Kung Fu' };
    prismaMock.martialArt.findUnique.mockResolvedValue(mockResult as unknown as MartialArt);

    const result = await fetchMartialArt('kung-fu');

    expect(prismaMock.martialArt.findUnique).toHaveBeenCalledWith({
      where: { slug: 'kung-fu' },
      select: { name: true },
    });
    expect(result).toEqual(mockResult);
  });

  test('returns null when martial art is not found', async () => {
    prismaMock.martialArt.findUnique.mockResolvedValue(null);

    const result = await fetchMartialArt('x');

    expect(result).toBeNull();
  });

  test('throws an error when Prisma throws internally', async () => {
    const dbError = new Error('DB connection failed');
    prismaMock.martialArt.findUnique.mockRejectedValue(dbError);

    await expect(fetchMartialArt('kung-fu')).rejects.toThrow('Failed to fetch martial art data');
  });
});

describe('fetchMovie', () => {
  test('returns movie data when found', async () => {
    const mockResult = {
      id: 1,
      title: 'Ip Man',
      slug: 'ip-man-x',
    };
    prismaMock.movie.findUnique.mockResolvedValue(mockResult as unknown as Movie);

    const result = await fetchMovie('ip-man-x');

    expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
      where: { slug: 'ip-man-x' },
      include: {
        martialArts: true,
        primaryMartialArt: true,
        genres: true,
        countries: true,
      },
    });
    expect(result).toEqual(mockResult);
  });

  test('returns null when movie is not found', async () => {
    prismaMock.movie.findUnique.mockResolvedValue(null);

    const result = await fetchMovie('x');

    expect(result).toBeNull();
  });

  test('throws an error when Prisma throws internally', async () => {
    const dbError = new Error('DB connection failed');
    prismaMock.movie.findUnique.mockRejectedValue(dbError);

    await expect(fetchMovie('ip-man-x')).rejects.toThrow('Failed to fetch movie data');
  });
});
