// e.g. /martial-arts/karate/ - movies where the main martial art is the slug
import { fetchMovies, MovieFilters, SortOption, sortOptions } from '@/lib/data';
import MovieList from '@/components/MovieList';
import Sort from '@/components/Sort';

interface PageProps {
  params: Promise<{ slug: string }>; //remove promei and try
  searchParams: Promise<{ sort?: string }>;
}

export default async function Home({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const filters = await searchParams;

  const sort: SortOption = filters.sort && filters.sort in sortOptions ? (filters.sort as SortOption) : 'release-desc';

  const movieFilters: MovieFilters = {
    primaryMartialArt: slug,
    sort,
    // ...filters,
  };

  console.log(slug);
  console.log(filters);
  const movies = await fetchMovies(movieFilters);
  console.log(movies.length);
  if (!movies) return null;
  return (
    <div>
      {/* maybe a better way of getting the martial art name */}
      <h1 className="text-4xl font-bold mb-12">{movies[0].primaryMartialArt.name} movies</h1>
      <Sort />
      <MovieList movies={movies} />
    </div>
  );
}
