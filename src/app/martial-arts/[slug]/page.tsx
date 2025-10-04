// e.g. /martial-arts/karate/ - movies where the main martial art is the slug
import { fetchMovies, MovieFilters } from '@/lib/data';

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
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
}
