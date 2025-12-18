// e.g. /movies/karate-kid-legends-2025 - specific movie pages
import { fetchMovie } from '@/lib/data';
import Image from 'next/image';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Badge } from '@/components/ui/badge';

export default async function Home({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = await fetchMovie(slug);
  if (!movie) return null; //implement error page later

  const secondaryMartialArts = movie.martialArts.filter((ma) => ma.id !== movie.primaryMartialArt?.id);

  return (
    <div>
      {/* HERO SECTION */}
      <div className="relative h-[400px] w-fill">
        {/* <div className="relative h-[400px] w-screen left-1/2 right-1/2 -mx-[50vw] -mt-8"> */}
        {movie.backdropPath && (
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdropPath}`}
            alt={movie.title}
            fill
            className="object-cover brightness-90"
            preload
          />
        )}
        <div className="p-8 text-white absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end">
          {/* <div className="container "> */}
          <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
          <p className="text-xl text-white/80">{movie.releaseDate?.getFullYear()}</p>
        </div>
      </div>

      {/* CONTENT SECTION */}
      {/* <div className="container  border-violet-500 border-3"> */}
      {/* grid-cols-1 md:grid-cols... */}
      <div className="grid grid-cols-[300px_1fr] gap-8 py-8">
        {/* poster */}
        <div className="relative aspect-[2/3] w-full max-w-[300px] mx-auto">
          <ImageWithFallback
            src={
              movie.posterPath ? `https://image.tmdb.org/t/p/original${movie.posterPath}` : '/images/fallback-image.png'
            }
            fallbackSrc={'/images/fallback-image.png'}
            alt={movie.title}
            fill
            className="object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* MOVIE INFO */}
        <div className="space-y-6">
          {/* overview */}
          <div>
            <h2 className="text-2xl font-semibold mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
          </div>

          {/* primary martial art */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Primary martial art</h3>
            <Badge className="text-base">{movie.primaryMartialArt.name}</Badge>
          </div>

          {/* secondary martial arts */}
          {secondaryMartialArts && secondaryMartialArts.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Also features</h3>
              <div className="flex flex-wrap gap-2">
                {secondaryMartialArts.map((art) => (
                  <Badge key={art.id} variant="secondary">
                    {art.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* genres */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <Badge key={genre.id} variant="outline">
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* countries */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Countries</h3>
            <div className="flex flex-wrap gap-2">
              {movie.countries.map((country) => (
                <Badge key={country.id} variant="outline">
                  {country.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
