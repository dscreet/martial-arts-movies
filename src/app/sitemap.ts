import type { MetadataRoute } from 'next';

import { fetchAllMovieSlugs, fetchMartialArts } from '@/lib/data';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [martialArts, movies] = await Promise.all([fetchMartialArts(), fetchAllMovieSlugs()]);

  return [
    {
      url: `${baseUrl}/`,
    },

    {
      url: `${baseUrl}/movies`,
    },

    ...martialArts.map((ma) => ({
      url: `${baseUrl}/martial-arts/${ma.slug}`,
    })),

    ...movies.map((movie) => ({
      url: `${baseUrl}/movies/${movie.slug}`,
      lastModified: movie.updatedAt ?? new Date(),
    })),
  ];
}
