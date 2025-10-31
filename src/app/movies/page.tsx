// /movies/ - all movies with filtering
import { fetchMovies, MovieQuery, SortOption, sortOptions, fetchGenres } from '@/lib/data';
import MovieList from '@/components/MovieList';
import Sort from '@/components/Sort';
import MultiSelectFilter from '@/components/MultiSelectFilter';

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    genre?: string;
    martialArt?: string;
    country?: string;
    releaseYearFrom?: number;
    releaseYearTo?: number;
  }>;
}
//plural or singular??

//, to list multiple values for same key e.g. color=purple,pink
//= to separate key-value pairs e.g. category=dresses
//& to add additional parameters e.g. category=dresses&color=purple,pink
//- to separate words e.g. color-profile=dark-grey

export default async function Home({ searchParams }: PageProps) {
  const queryParams = await searchParams; //individuallry or like this? to name params or keep queryparams?

  //more validation later
  const selectedGenres = queryParams.genre?.split(',') ?? [];

  const sort: SortOption =
    queryParams.sort && queryParams.sort in sortOptions ? (queryParams.sort as SortOption) : 'release-desc';

  const movieQuery: MovieQuery = {
    sort,
    genre: selectedGenres,
  };

  console.log(queryParams);
  console.log(selectedGenres);
  //fetch all movies, genres, etc at once?
  const movies = await fetchMovies(movieQuery);
  const allGenres = await fetchGenres();
  console.log(movies.length);
  if (!movies) return null;
  return (
    <div>
      {/* maybe a better way of getting the martial art name */}
      <h1 className="text-4xl font-bold mb-12">All movies</h1>
      <Sort />
      <MultiSelectFilter label={'genre'} paramKey={'genre'} options={allGenres} />
      <MovieList movies={movies} />
    </div>
  );
}
