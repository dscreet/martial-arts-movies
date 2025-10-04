// e.g. /movies/karate-kid-legends-2025 - specific movie pages
import { fetchMovie } from '@/lib/data';

export default async function Home({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log(params);
  console.log(slug);
  const movie = await fetchMovie(slug);
  if (!movie) return null;
  return (
    <div>
      <ul>{movie.title}</ul>
    </div>
  );
}
