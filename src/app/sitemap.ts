import type { MetadataRoute } from 'next';

import { fetchAllMovieSlugs, fetchMartialArts } from '@/lib/data';

const URL = 'https://martialmovies.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const martialArts = await fetchMartialArts();
  const movies = await fetchAllMovieSlugs();

  return [
    {
      url: `${URL}/`,
    },

    {
      url: `${URL}/movies`,
    },

    ...martialArts.map((ma) => ({
      url: `${URL}/martial-arts/${ma.slug}`,
    })),

    ...movies.map((movie) => ({
      url: `${URL}/movies/${movie.slug}`,
      lastModified: movie.updatedAt ?? new Date(),
    })),
  ];
}
