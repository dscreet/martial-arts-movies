// e.g. /movies/karate-kid-legends-2025 - specific movie pages
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import ImageWithFallback from '@/components/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { fetchAllMovieSlugs, fetchMovie } from '@/lib/data';
import { baseMetadata } from '@/lib/seo';

const getMovieCached = cache(fetchMovie);

// generates static pages for all movies at build time
export async function generateStaticParams() {
  const movies = await fetchAllMovieSlugs();
  return movies.map((movie) => ({ slug: movie.slug }));
}

// return 404 for slugs not pre-rendered at build time
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovieCached(slug);

  if (!movie) {
    notFound();
  }

  const yearValue = movie.releaseDate?.getFullYear();
  const year = yearValue ? ` (${yearValue})` : '';

  const title = `${movie.title}${year} | Martial Arts Movie`;
  const rawDescription = `${movie.title}${year} is a martial arts movie. ${movie.overview}`;
  const description =
    rawDescription.length > 160 ? rawDescription.slice(0, 160).replace(/\s+\S*$/, '…') : rawDescription;

  return {
    ...baseMetadata({
      title,
      description,
      url: `/movies/${slug}`,
      type: 'video.movie',
    }),
  };
}

export default async function Home({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = await getMovieCached(slug);
  if (!movie) notFound();

  const secondaryMartialArts = movie.martialArts.filter((ma) => ma.id !== movie.primaryMartialArt?.id);

  return (
    <div>
      {/* HERO SECTION */}
      <div className="relative h-[260px] w-full sm:h-[320px] lg:h-[400px]">
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
        <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 via-black/40 to-transparent p-4 text-white sm:p-6 lg:p-8">
          {/* <div className="container "> */}
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl lg:text-5xl">{movie.title}</h1>
          <p className="text-base text-white/80 sm:text-lg lg:text-xl">{movie.releaseDate?.getFullYear()}</p>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="grid grid-cols-1 gap-8 py-6 sm:py-8 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr]">
        {/* poster */}
        <div className="relative mx-auto aspect-2/3 w-full max-w-[220px] sm:max-w-[300px]">
          <ImageWithFallback
            src={
              movie.posterPath ? `https://image.tmdb.org/t/p/w1280${movie.posterPath}` : '/images/fallback-image.png'
            }
            fallbackSrc={'/images/fallback-image.png'}
            alt={movie.title}
            fill
            className="rounded-lg object-cover shadow-lg"
          />
        </div>

        {/* MOVIE INFO */}
        <div className="space-y-6">
          {/* overview */}
          <div>
            <h2 className="mb-3 text-xl font-semibold sm:text-2xl">Overview</h2>
            <p className="leading-relaxed text-muted-foreground">{movie.overview}</p>
          </div>

          {/* primary martial art */}
          <div>
            <h3 className="mb-2 text-lg font-semibold sm:text-xl">Primary martial art</h3>
            <Badge className="text-base">{movie.primaryMartialArt.name}</Badge>
          </div>

          {/* secondary martial arts */}
          {secondaryMartialArts && secondaryMartialArts.length > 0 && (
            <div>
              <h3 className="mb-2 text-lg font-semibold sm:text-xl">Also features</h3>
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
            <h3 className="mb-2 text-lg font-semibold sm:text-xl">Genres</h3>
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
            <h3 className="mb-2 text-lg font-semibold sm:text-xl">Countries</h3>
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
