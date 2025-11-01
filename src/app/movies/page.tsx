// /movies/ - all movies with filtering
import {
  fetchMovies,
  MovieQuery,
  SortOption,
  sortOptions,
  fetchGenres,
  fetchMartialArts,
  fetchCountries,
} from '@/lib/data';
import MovieList from '@/components/MovieList';
import Sort from '@/components/Sort';
import SingleSelectFilter from '@/components/SingleSelectFilter';

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    'martial-art'?: string;
    genre?: string;
    country?: string;
    releaseYearFrom?: number;
    releaseYearTo?: number;
  }>;
}

//, to list multiple values for same key e.g. color=purple,pink
//= to separate key-value pairs e.g. category=dresses
//& to add additional parameters e.g. category=dresses&color=purple,pink
//- to separate words e.g. color-profile=dark-grey

export default async function Home({ searchParams }: PageProps) {
  const queryParams = await searchParams; //individuallry or like this? to name params or keep queryparams?

  //more validation later
  const martialArt = queryParams['martial-art'];
  const genre = queryParams.genre;
  const country = queryParams.country;

  const sort: SortOption =
    queryParams.sort && queryParams.sort in sortOptions ? (queryParams.sort as SortOption) : 'release-desc';

  const movieQuery: MovieQuery = {
    sort,
    martialArt,
    genre,
    country,
  };

  console.log(queryParams);
  //fetch all movies, genres, etc at once?
  const movies = await fetchMovies(movieQuery);
  const allGenres = await fetchGenres();
  const allMartialArts = await fetchMartialArts();
  const allCountries = await fetchCountries();
  console.log(allCountries.length);
  console.log(movies.length);
  if (!movies) return null;
  return (
    <div>
      <h1 className="text-4xl font-bold mb-12">All movies</h1>
      <Sort />
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
      <MovieList movies={movies} />
    </div>
  );
}
