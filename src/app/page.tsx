// home page where martial arts cards will be displayed
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { fetchMartialArts } from '@/lib/data';

export default async function Home() {
  const martialArts = await fetchMartialArts();
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-12">Explore Martial Arts</h1>
      <div className="grid grid-cols-5 gap-6">
        {martialArts.map((martialArt) => (
          <Link key={martialArt.id} href={`/martial-arts/${martialArt.slug}`}>
            <Card className="group hover:shadow-md transition-shadow">
              <CardContent className="relative h-40 overflow-hidden">
                <Image
                  src={`/images/${martialArt.slug}.jpg`}
                  alt={martialArt.name}
                  fill
                  className="object-cover transition-transform transition-[filter] duration-300 group-hover:scale-105 brightness-80 group-hover:brightness-60"
                />
                <CardTitle className="absolute inset-0 flex items-center justify-center text-xl text-white font-semibold">
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
