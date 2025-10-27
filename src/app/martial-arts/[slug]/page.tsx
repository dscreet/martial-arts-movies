// e.g. /martial-arts/karate/ - movies where the main martial art is the slug
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
      {/* maybe a better way of getting the martial art name */}
      <h1 className="text-4xl font-bold mb-12">{movies[0].primaryMartialArt.name} movies</h1>

      <ul className="space-y-6">
        {movies.map((movie) => (
          <li key={movie.id}>
            <Link href={`/movies/${movie.slug}`}>
              {/* can modify border shadow and width from card */}
              <Card className="p-0 gap-0 flex-row flex overflow-hidden">
                <div className="relative w-24 h-32 flex-shrink-0">
                  {/* cover case of missing image or loading image*/}
                  <Image
                    src={`https://image.tmdb.org/t/p/original${movie.posterPath}`}
                    alt={movie.title}
                    fill
                    className="brightness-80"
                  />
                </div>

                <div className="flex flex-col justify-center flex-1 space-y-2">
                  <CardHeader className="text-lg">
                    <CardTitle className="hover:text-gray-500"> {movie.title}</CardTitle>
                    <CardDescription>{movie.releaseDate?.getFullYear()}</CardDescription>
                  </CardHeader>
                  <CardContent className="line-clamp-2 text-sm">{movie.overview}</CardContent>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
