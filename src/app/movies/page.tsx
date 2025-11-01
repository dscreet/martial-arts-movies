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
import MultiSelectFilter from '@/components/MultiSelectFilter';

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    genre?: string;
    'martial-art'?: string;
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
  const selectedGenres = queryParams.genre?.split(',') ?? [];
  const selectedMartialArts = queryParams['martial-art']?.split(',') ?? [];
  const selectedCountries = queryParams.country?.split(',') ?? [];

  const sort: SortOption =
    queryParams.sort && queryParams.sort in sortOptions ? (queryParams.sort as SortOption) : 'release-desc';

  const movieQuery: MovieQuery = {
    sort,
    genre: selectedGenres,
    martialArt: selectedMartialArts,
    country: selectedCountries,
  };

  console.log(queryParams);
  console.log(selectedGenres);
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
      {/* maybe a better way of getting the martial art name */}
      <h1 className="text-4xl font-bold mb-12">All movies</h1>
      <Sort />
      <MultiSelectFilter
        label={'Genres'}
        paramKey={'genre'}
        options={allGenres.map((g) => ({ id: g.id, name: g.name, value: g.slug }))}
      />
      <MultiSelectFilter
        label={'Martial arts'}
        paramKey={'martial-art'}
        options={allMartialArts.map((m) => ({ id: m.id, name: m.name, value: m.slug }))}
      />
      <MultiSelectFilter
        label={'Countries'}
        paramKey={'country'}
        options={allCountries.map((c) => ({ id: c.id, name: c.name, value: c.code }))}
      />
      <MovieList movies={movies} />
    </div>
  );
}
