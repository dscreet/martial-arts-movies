import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Movie } from '@prisma/client';

export default function MovieList({ movies }: { movies: Movie[] }) {
  return (
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
  );
}
