import { fetchMovie } from '@/lib/data';

export default async function Home({ params }) {
  const { id } = await params;
  const movie = await fetchMovie(id);
  console.log(movie);
  return (
    <div>
      <ul>{movie.overview}</ul>
    </div>
  );
}
