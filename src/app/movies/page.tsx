// /movies/ - all movies with filtering
import { fetchMovies, MovieFilters } from '@/lib/data';

interface PageProps {
  searchParams: Promise<{}>;
}

export default async function Home({ searchParams }: PageProps) {
  const filters: MovieFilters = await searchParams;

  //   const movieFilters: MovieFilters = {
  //     ...filters,
  //   };

  console.log(filters);
  const movies = await fetchMovies(filters);
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
