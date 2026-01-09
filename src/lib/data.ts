import prisma from '@/lib/prisma';

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

export const DECADES = [
  { id: 1, name: 'Pre 1950', value: 'pre-1950' },
  { id: 2, name: '1950s', value: '1950' },
  { id: 3, name: '1960s', value: '1960' },
  { id: 4, name: '1970s', value: '1970' },
  { id: 5, name: '1980s', value: '1980' },
  { id: 6, name: '1990s', value: '1990' },
  { id: 7, name: '2000s', value: '2000' },
  { id: 8, name: '2010s', value: '2010' },
  { id: 9, name: '2020+', value: '2020' },
];

export async function fetchMartialArts() {
  return await prisma.martialArt.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function fetchGenres() {
  return await prisma.genre.findMany({
    orderBy: { name: 'asc' },
  });
}

// only fetch countries that have movies
export async function fetchCountries() {
  return await prisma.country.findMany({
    where: {
      movies: { some: {} },
    },
    orderBy: { name: 'asc' },
  });
}

export async function fetchMovies(query: MovieQuery = {}, page = 1, pageSize = 20) {
  const orderBy = sortOptions[query.sort || 'release-desc'];
  const skip = (page - 1) * pageSize;

  const where = {
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
  };

  const [movies, totalCount] = await Promise.all([
    prisma.movie.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.movie.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return { movies, totalPages };
}

export async function fetchMartialArt(slug: string) {
  return await prisma.martialArt.findUnique({
    where: { slug },
    select: { name: true },
  });
}

export async function fetchMovie(slug: string) {
  return await prisma.movie.findUnique({
    where: { slug },
    include: {
      martialArts: true,
      primaryMartialArt: true,
      genres: true,
      countries: true,
    },
  });
}

export async function fetchAllMovieSlugs() {
  return prisma.movie.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });
}
