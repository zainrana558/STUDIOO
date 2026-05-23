import { themes } from "../lib/themes";
import { GenreSelector } from "../components/Genre/GenreSelector";

export default function HomePage() {
  return (
    <main>
      <GenreSelector themes={themes} />
    </main>
  );
}
