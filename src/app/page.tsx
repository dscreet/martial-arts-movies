// home page where martial arts cards will be displayed
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { fetchMartialArts } from '@/lib/data';

const socialTitle = 'Martial Arts Movies';
const socialDescription =
  'Discover Kung Fu, Karate, MMA and other martial arts films. Browse movies by fighting style, country, genre, and era.';

export const metadata: Metadata = {
  title: 'Martial Arts Movies | Kung Fu, Karate & MMA Films',
  description:
    'Browse a curated catalog of martial arts movies, organised by fighting style. Explore Kung Fu, Karate, MMA and more across countries, genres, and eras.',
  openGraph: {
    title: socialTitle,
    description: socialDescription,
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle,
    description: socialDescription,
  },
  alternates: {
    canonical: '/',
  },
};

export default async function Home() {
  const martialArts = await fetchMartialArts();
  return (
    <div>
      <h1 className="mb-12 text-center text-4xl font-bold">Explore Martial Arts</h1>
      <div className="grid grid-cols-5 gap-6">
        {martialArts.map((martialArt) => (
          <Link key={martialArt.id} href={`/martial-arts/${martialArt.slug}`}>
            <Card className="group transition-shadow hover:shadow-md">
              <CardContent className="relative h-40 overflow-hidden">
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
