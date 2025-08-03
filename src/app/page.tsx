import { prisma } from '@/lib/prisma';

export default async function Home() {
  const movies = await prisma.movie.findMany();
  console.log(movies);
  return (
    <div>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
}
