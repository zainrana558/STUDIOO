import { themes } from "../lib/themes";
import { GenreSelector } from "../components/GenreSelector";

/**
 * The main homepage that serves as a genre selection portal.
 * It's a Server Component that passes the available themes to a Client Component.
 */
export default function HomePage() {
  return (
    <main>
      <GenreSelector themes={themes} />
    </main>
  );
}
