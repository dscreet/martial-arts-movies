// /movies/ - all movies with filtering
import type { Metadata } from 'next';

import ControlsContainer from '@/components/ControlsContainer';
import MovieList from '@/components/MovieList';
import PaginationBar from '@/components/Pagination';
import SingleSelectFilter from '@/components/SingleSelectFilter';
import Sort from '@/components/Sort';
import {
  DECADES,
  fetchCountries,
  fetchGenres,
  fetchMartialArts,
  fetchMovies,
  type MovieQuery,
  type SortOption,
  sortOptions,
} from '@/lib/data';
import { baseMetadata } from '@/lib/seo';

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    'martial-art'?: string;
    genre?: string;
    country?: string;
    year?: string;
    page?: string;
  }>;
}

// google guidelines===
//, to list multiple values for same key e.g. color=purple,pink
//= to separate key-value pairs e.g. category=dresses
//& to add additional parameters e.g. category=dresses&color=purple,pink
//- to separate words e.g. color-profile=dark-grey

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const hasParams = Object.keys(await searchParams).length > 0;

  return {
    ...baseMetadata({
      title: 'All Martial Arts Movies | Browse the Complete Catalog',
      description:
        'Browse all martial arts movies in one place. Discover classic and modern films across fighting styles, countries, genres, and eras.',
      socialTitle: 'All Martial Arts Movies',
      socialDescription:
        'Browse the full martial arts movie catalog. Discover films by style, genre, country, and year.',
      url: '/movies',
    }),
    robots: {
      index: !hasParams,
      follow: true,
    },
  };
}

export default async function MoviesPage({ searchParams }: PageProps) {
  const { sort: sortParam, 'martial-art': martialArt, genre, country, year, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const sort: SortOption = sortParam && sortParam in sortOptions ? (sortParam as SortOption) : 'release-desc';

  const movieQuery: MovieQuery = {
    sort,
    martialArt,
    genre,
    country,
    year,
  };

  const [{ movies, totalPages }, allMartialArts, allGenres, allCountries] = await Promise.all([
    fetchMovies(movieQuery, currentPage),
    fetchMartialArts(),
    fetchGenres(),
    fetchCountries(),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold sm:mb-10 sm:text-4xl lg:mb-12">All movies</h1>
      <ControlsContainer>
        <div className="flex flex-wrap gap-4">
          <SingleSelectFilter
            label={'martial arts'}
            paramKey={'martial-art'}
            options={allMartialArts.map((m) => ({ id: m.id, name: m.name, value: m.slug }))}
          />
          <SingleSelectFilter
            label={'genres'}
            paramKey={'genre'}
            options={allGenres.map((g) => ({ id: g.id, name: g.name, value: g.slug }))}
          />
          <SingleSelectFilter
            label={'countries'}
            paramKey={'country'}
            options={allCountries.map((c) => ({ id: c.id, name: c.name, value: c.code }))}
          />
          <SingleSelectFilter label={'years'} paramKey={'year'} options={DECADES} />
        </div>
        <Sort />
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
