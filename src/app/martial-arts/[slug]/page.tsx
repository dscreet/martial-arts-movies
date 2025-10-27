// e.g. /martial-arts/karate/ - movies where the main martial art is the slug
import { fetchMovies, MovieFilters } from '@/lib/data';
import { MovieList } from '@/components/MovieList';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{}>;
}

export default async function Home({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const filters = await searchParams;

  const movieFilters: MovieFilters = {
    primaryMartialArt: slug,
    ...filters,
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
      <MovieList movies={movies} />
    </div>
  );
}
