import { prisma } from '@/lib/prisma';

export interface MovieFilters {
  primaryMartialArt?: string;
  //genres, countries, marial arts, release date, search term, sort by
}

export async function fetchMartialArts() {
  try {
    return await prisma.martialArt.findMany();
  } catch (error) {
    console.error('Failed to fetch martial arts:', error);
    throw new Error('Failed to fetch martial arts data');
  }
}

export async function fetchMovies(filters: MovieFilters = {}) {
  try {
    return await prisma.movie.findMany({
      where: {
        ...(filters.primaryMartialArt && {
          primaryMartialArt: {
            slug: filters.primaryMartialArt,
          },
        }),
      },
      include: {
        primaryMartialArt: true,
        genres: true,
      },
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
