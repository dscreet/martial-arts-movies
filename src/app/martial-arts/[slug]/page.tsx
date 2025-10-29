// e.g. /martial-arts/karate/ - movies where the main martial art is the slug
import { fetchMovies, MovieQuery, SortOption, sortOptions } from '@/lib/data';
import MovieList from '@/components/MovieList';
import Sort from '@/components/Sort';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export default async function Home({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const sortOption: SortOption = sort && sort in sortOptions ? (sort as SortOption) : 'release-desc';

  const movieQuery: MovieQuery = {
    primaryMartialArt: slug,
    sort: sortOption,
  };

  console.log(slug);
  console.log(movieQuery);
  const movies = await fetchMovies(movieQuery);
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
