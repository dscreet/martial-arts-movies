// home page where martial arts cards will be displayed
import { fetchMartialArts } from '@/lib/data';

export default async function Home() {
  const martialArts = await fetchMartialArts();
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
