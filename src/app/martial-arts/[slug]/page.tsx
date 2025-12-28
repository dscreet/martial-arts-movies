// e.g. /martial-arts/karate/ - movies where the main martial art is the slug
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import ControlsContainer from '@/components/ControlsContainer';
import MovieList from '@/components/MovieList';
import PaginationBar from '@/components/Pagination';
import Sort from '@/components/Sort';
import { fetchMartialArt, fetchMovies, type MovieQuery, type SortOption, sortOptions } from '@/lib/data';
import { baseMetadata } from '@/lib/seo';

const getMartialArtCached = cache(fetchMartialArt);

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const martialArt = await getMartialArtCached(slug);

  const hasParams = Object.keys(await searchParams).length > 0;

  if (!martialArt) {
    notFound();
  }

  const name = martialArt?.name;
  const title = `${name} Movies | Martial Arts Movie Catalog`;
  const description = `Browse the best ${name} movies of all time. Discover classic and modern ${name} films.`;

  return {
    ...baseMetadata({
      title,
      description,
      url: `/martial-arts/${slug}`,
    }),
    robots: {
      index: !hasParams,
      follow: true,
    },
  };
}

export default async function Home({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sort, page } = await searchParams;
  const currentPage = Number(page) || 1;

  const sortOption: SortOption = sort && sort in sortOptions ? (sort as SortOption) : 'release-desc';

  const movieQuery: MovieQuery = {
    primaryMartialArt: slug,
    sort: sortOption,
  };

  const martialArt = await getMartialArtCached(slug);
  if (!martialArt) notFound();

  const { movies, totalPages } = await fetchMovies(movieQuery, currentPage);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold sm:mb-10 sm:text-4xl lg:mb-12">{martialArt?.name} movies</h1>
      <ControlsContainer>
        <div className="sm:ml-auto">
          <Sort />
        </div>
      </ControlsContainer>
      {movies.length ? (
        <MovieList movies={movies} />
      ) : (
        <p className="p-2 text-lg text-muted-foreground">No movies found</p>
      )}
      <PaginationBar totalPages={totalPages} />
    </div>
  );
}
