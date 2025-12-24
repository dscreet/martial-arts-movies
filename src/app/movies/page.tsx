// /movies/ - all movies with filtering
import type { Metadata } from 'next';

import ControlsContainer from '@/components/ControlsContainer';
import MovieList from '@/components/MovieList';
import PaginationBar from '@/components/Pagination';
import SingleSelectFilter from '@/components/SingleSelectFilter';
import Sort from '@/components/Sort';
import {
  fetchCountries,
  fetchGenres,
  fetchMartialArts,
  fetchMovies,
  type MovieQuery,
  type SortOption,
  sortOptions,
} from '@/lib/data';

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const hasParams = Object.keys(await searchParams).length > 0;

  const socialTitle = 'All Martial Arts Movies';
  const socialDescription =
    'Browse the full martial arts movie catalog. Discover films by style, genre, country, and year.';

  return {
    title: 'All Martial Arts Movies | Browse the complete catalog',
    description:
      'Browse all martial arts movies in one place. Discover classic and modern films across fighting styles, countries, genres, and eras.',
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url: '/movies',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
    },
    robots: {
      index: !hasParams,
      follow: true,
    },
    alternates: {
      canonical: '/movies',
    },
  };
}

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

//, to list multiple values for same key e.g. color=purple,pink
//= to separate key-value pairs e.g. category=dresses
//& to add additional parameters e.g. category=dresses&color=purple,pink
//- to separate words e.g. color-profile=dark-grey

export default async function Home({ searchParams }: PageProps) {
  const queryParams = await searchParams; //individuallry or like this? to name params or keep queryparams?
  const currentPage = Number(queryParams.page) || 1;

  //more validation later
  const martialArt = queryParams['martial-art'];
  const genre = queryParams.genre;
  const country = queryParams.country;
  const year = queryParams.year;

  const sort: SortOption =
    queryParams.sort && queryParams.sort in sortOptions ? (queryParams.sort as SortOption) : 'release-desc';

  const movieQuery: MovieQuery = {
    sort,
    martialArt,
    genre,
    country,
    year,
  };

  const DECADES = [
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

  // should page be a part of moviequery??
  //fetch all movies, genres, etc at once?
  const { movies, totalPages } = await fetchMovies(movieQuery, currentPage);
  const allMartialArts = await fetchMartialArts();
  const allGenres = await fetchGenres();
  const allCountries = await fetchCountries();
  //use countries from fetchMovies instead?

  return (
    <div>
      <h1 className="mb-12 text-4xl font-bold">All movies</h1>
      <ControlsContainer>
        <div className="flex flex-wrap items-center gap-4">
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
