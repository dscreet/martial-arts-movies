import { prisma } from '@/lib/prisma';

export interface MovieQuery {
  primaryMartialArt?: string;
  sort?: SortOption;
  //genres, countries, marial arts, release date, search term, sort by
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
      },
      include: {
        primaryMartialArt: true,
        genres: true,
      },
      orderBy,
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
