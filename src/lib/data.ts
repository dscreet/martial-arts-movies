import { prisma } from '@/lib/prisma';

export async function fetchMartialArts() {
  try {
    return await prisma.martialArt.findMany();
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch martial arts data.');
  }
}

// TODO: only fetch data that will be used on list page
// query movie instead?
export async function fetchMoviesByMartialArt(slug) {
  try {
    return await prisma.martialArt.findUnique({
      where: {
        name: slug,
      },
      include: {
        movies: {
          // include: {
          //   genres: true,
          //   primaryMartialArt: true,
          //   country: true,
          // },
        },
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch movies data.'); //change
  }
}

export async function fetchMovie(id) {
  const movieId = Number(id);
  if (!Number.isInteger(movieId) || movieId <= 0) {
    return null;
  }

  try {
    return await prisma.movie.findUnique({
      where: { id: movieId },
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch movie data.');
  }
}
