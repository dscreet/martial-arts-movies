import { prisma } from '@/lib/prisma';

export interface MovieQuery {
  primaryMartialArt?: string;
  sort?: SortOption;
  genre?: string[];
  martialArt?: string[];
  country?: string;
  releaseYearFrom?: string;
  releaseYearTo?: string;
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
    return await prisma.martialArt.findMany();
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

export async function fetchMovies(query: MovieQuery = {}) {
  try {
    const orderBy = sortOptions[query.sort || 'release-desc'];

    return await prisma.movie.findMany({
      where: {
        ...(query.primaryMartialArt && {
          primaryMartialArt: {
            slug: query.primaryMartialArt,
          },
        }),
        ...(query.genre?.length && {
          genres: {
            some: {
              slug: { in: query.genre },
            },
          },
        }),
        ...(query.martialArt?.length && {
          martialArts: {
            some: {
              slug: { in: query.martialArt },
            },
          },
        }),
      },
      include: {
        primaryMartialArt: true,
        genres: true,
      },
      orderBy,
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
        genres: true,
        countries: true,
        martialArts: true,
        primaryMartialArt: true,
      },
    });
  } catch (error) {
    console.error('Failed to fetch movie:', error);
    throw new Error('Failed to fetch movie data');
  }
}
