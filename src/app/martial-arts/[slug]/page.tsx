// e.g. /martial-arts/karate/ - movies where the main martial art is the slug
import { fetchMovies, fetchMartialArt, MovieQuery, SortOption, sortOptions } from '@/lib/data';
import MovieList from '@/components/MovieList';
import Sort from '@/components/Sort';
import ControlsContainer from '@/components/ControlsContainer';

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
  const martialArt = await fetchMartialArt(slug);
  const { movies } = await fetchMovies(movieQuery);
  console.log(movies.length);
  if (!movies) return null;
  return (
    <div>
      <h1 className="text-4xl font-bold mb-12">{martialArt?.name} movies</h1>
      <ControlsContainer>
        <div className="ml-auto">
          <Sort />
        </div>
      </ControlsContainer>
      <MovieList movies={movies} />
    </div>
  );
}
