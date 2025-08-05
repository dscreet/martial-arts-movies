import { fetchMartialArts } from '@/lib/data';

export default async function Home() {
  const martialArts = await fetchMartialArts();
  console.log(martialArts);
  return (
    <div>
      <ul>
        {martialArts.map((martialArt) => (
          <li key={martialArt.id}>{martialArt.name}</li>
        ))}
      </ul>
    </div>
  );
}
