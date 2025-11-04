import { prisma } from '@/lib/prisma';

export interface MovieQuery {
  primaryMartialArt?: string;
  sort?: SortOption;
  martialArt?: string;
  genre?: string;
  country?: string;
  year?: string; //currently decades
}

export const sortOptions = {
  'release-asc': { releaseDate: 'asc' },
  'release-desc': { releaseDate: 'desc' },
  'title-asc': { title: 'asc' },
  'title-desc': { title: 'desc' },
} as const;

export type SortOption = keyof typeof sortOptions;

export async function fetchMartialArts() {
  try {
    return await prisma.martialArt.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch martial arts:', error);
    throw new Error('Failed to fetch martial arts data');
  }
}

export async function fetchGenres() {
  try {
    return await prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch genres:', error);
    throw new Error('Failed to fetch genres data');
  }
}

// only fetch countries that have movies
export async function fetchCountries() {
  try {
    return await prisma.country.findMany({
      where: {
        movies: { some: {} },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    throw new Error('Failed to fetch countries data');
  }
}

export async function fetchMovies(query: MovieQuery = {}) {
  try {
    return await prisma.movie.findMany({
      where: {
        ...(query.primaryMartialArt && {
          primaryMartialArt: { slug: query.primaryMartialArt },
        }),
        ...(query.martialArt && {
          martialArts: { some: { slug: query.martialArt } },
        }),
        ...(query.genre && {
          genres: { some: { slug: query.genre } },
        }),
        ...(query.country && {
          countries: { some: { code: query.country } },
        }),
        ...(query.year === 'pre-1950' && {
          releaseDate: { lte: new Date(1950, 0, 1) },
        }),
        ...(query.year &&
          query.year !== 'pre-1950' && {
            releaseDate: {
              gte: new Date(Number(query.year), 0, 1),
              lte: new Date(Number(query.year) + 9, 11, 31),
            },
          }),
      },
      include: {
        primaryMartialArt: true,
        genres: true,
      },
      orderBy: sortOptions[query.sort || 'release-desc'],
      take: 100, //toremove
    });
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    throw new Error('Failed to fetch movies data');
  }
}

export async function fetchMovie(slug: string) {
  try {
    return await prisma.movie.findUnique({
      where: { slug },
      include: {
        martialArts: true,
        primaryMartialArt: true,
        genres: true,
        countries: true,
      },
    });
  } catch (error) {
    console.error('Failed to fetch movie:', error);
    throw new Error('Failed to fetch movie data');
  }
}
