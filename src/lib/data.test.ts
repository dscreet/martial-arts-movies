import { describe, test, expect, vi } from 'vitest';
import { prismaMock } from '@/__mocks__/prisma';
import { fetchMartialArt, fetchMartialArts, fetchCountries, fetchMovie, fetchMovies } from '@/lib/data';

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

describe('fetchMartialArt', () => {
  test('returns martial art data when found', async () => {
    const mockResult = { name: 'Kung Fu' };
    prismaMock.martialArt.findUnique.mockResolvedValue(mockResult as any);
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

  test('returns an empty array when no martial arts exist', async () => {
    prismaMock.martialArt.findMany.mockResolvedValue([]);
    const result = await fetchMartialArts();

    expect(result).toEqual([]);
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

  test('returns an empty array when no countries match', async () => {
    prismaMock.country.findMany.mockResolvedValue([]);
    const result = await fetchCountries();

    expect(result).toEqual([]);
  });

  test('throws an error when Prisma throws internally', async () => {
    const dbError = new Error('DB connection failed');
    prismaMock.country.findMany.mockRejectedValue(dbError);

    await expect(fetchCountries()).rejects.toThrow('Failed to fetch countries data');
  });
});

describe('fetchMovie', () => {
  test('returns movie data when found', async () => {
    const mockResult = {
      id: 1,
      title: 'Ip Man',
      slug: 'ip-man-x',
      primaryMartialArt: null,
      martialArts: [],
      genres: [],
      countries: [],
    };
    prismaMock.movie.findUnique.mockResolvedValue(mockResult as any);
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
