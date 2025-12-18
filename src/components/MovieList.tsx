import type { Movie } from '@prisma/client';
import Link from 'next/link';

import ImageWithFallback from '@/components/ImageWithFallback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MovieList({ movies }: { movies: Movie[] }) {
  return (
    <ul data-testid="movie-list" className="space-y-6">
      {movies.map((movie) => (
        <li key={movie.id}>
          <Link href={`/movies/${movie.slug}`}>
            {/* can modify border shadow and width from card */}
            <Card className="flex flex-row gap-0 overflow-hidden p-0">
              <div className="relative h-32 w-24 shrink-0">
                <ImageWithFallback
                  src={
                    movie.posterPath
                      ? `https://image.tmdb.org/t/p/original${movie.posterPath}`
                      : '/images/fallback-image.png'
                  }
                  fallbackSrc={'/images/fallback-image.png'}
                  alt={movie.title}
                  fill
                  className="brightness-80"
                />
              </div>

              <div className="flex flex-1 flex-col justify-center space-y-2">
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
  );
}
