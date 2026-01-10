// home page where martial arts cards will be displayed
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { fetchMartialArts } from '@/lib/data';
import { baseMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...baseMetadata({
    title: 'Martial Arts Movies | Kung Fu, Karate & MMA Films',
    description:
      'Browse a curated catalog of martial arts movies, organised by fighting style. Explore Kung Fu, Karate, MMA and more across countries, genres, and eras.',
    socialTitle: 'Martial Arts Movies',
    socialDescription:
      'Discover Kung Fu, Karate, MMA and other martial arts films. Browse movies by fighting style, country, genre, and era.',
    url: '/',
  }),
};

export default async function HomePage() {
  const martialArts = await fetchMartialArts();
  return (
    <div>
      <h1 className="mb-8 text-center text-3xl font-bold sm:mb-10 sm:text-4xl lg:mb-12">Explore Martial Arts</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
        {martialArts.map((martialArt) => (
          <Link key={martialArt.id} href={`/martial-arts/${martialArt.slug}`}>
            <Card className="group border-0 p-0 transition-shadow hover:shadow-md">
              <CardContent className="relative aspect-video overflow-hidden rounded-tr-md rounded-bl-md">
                <Image
                  src={`/images/${martialArt.slug}.webp`}
                  alt={martialArt.name}
                  fill
                  className="brightness-80 transition-transform duration-300 group-hover:scale-105 group-hover:brightness-60"
                />
                <CardTitle className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">
                  {martialArt.name}
                </CardTitle>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
