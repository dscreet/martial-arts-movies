import { fetchMoviesByMartialArt } from '@/lib/data';

export default async function Home({ params }) {
  const { slug } = await params;
  const martialArt = await fetchMoviesByMartialArt(slug);
  console.log(martialArt);
  return (
    <div>
      <ul>
        {martialArt.movies.map((movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
}
