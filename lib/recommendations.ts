import { cacheGet, cacheSet } from './cache';

interface WatchedItem {
  tmdb_id: string;
  media_type: string;
}

interface TMDBRecommendation {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
}

const TMDB_BASE = 'https://api.themoviedb.org/3';

async function fetchTMDB(endpoint: string): Promise<TMDBRecommendation[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(`${TMDB_BASE}/${endpoint}?api_key=${apiKey}&language=en-US&page=1`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch TMDB recommendations for a single item.
 */
async function getItemRecommendations(mediaType: string, tmdbId: string): Promise<TMDBRecommendation[]> {
  const cacheKey = `recs:item:${mediaType}:${tmdbId}`;
  const cached = await cacheGet<TMDBRecommendation[]>(cacheKey);
  if (cached) return cached;

  const results = await fetchTMDB(`${mediaType}/${tmdbId}/recommendations`);
  await cacheSet(cacheKey, results, 60 * 60 * 12); // 12 hours
  return results;
}

/**
 * Fetch TMDB similar items for a single item.
 */
async function getSimilarItems(mediaType: string, tmdbId: string): Promise<TMDBRecommendation[]> {
  const cacheKey = `recs:similar:${mediaType}:${tmdbId}`;
  const cached = await cacheGet<TMDBRecommendation[]>(cacheKey);
  if (cached) return cached;

  const results = await fetchTMDB(`${mediaType}/${tmdbId}/similar`);
  await cacheSet(cacheKey, results, 60 * 60 * 12);
  return results;
}

/**
 * Main recommendations function.
 * Takes the user's watch history + watchlist and returns a deduplicated,
 * scored list of recommended titles.
 *
 * Scoring logic:
 * - Each appearance of an item across multiple seed sources adds +1 score
 * - Items already watched/in-watchlist are excluded
 */
export async function getRecommendations(
  watchHistory: WatchedItem[],
  watchlist: WatchedItem[],
  limit = 20
): Promise<TMDBRecommendation[]> {
  const seenIds = new Set([
    ...watchHistory.map((i) => i.tmdb_id),
    ...watchlist.map((i) => i.tmdb_id),
  ]);

  // Use up to 5 most recent seeds to keep API calls reasonable
  const seeds = [...watchHistory, ...watchlist].slice(0, 5);

  if (seeds.length === 0) {
    // No history — return trending as fallback
    return fetchTMDB('trending/all/week');
  }

  const scoreMap = new Map<string, { item: TMDBRecommendation; score: number }>();

  // Process seeds sequentially in pairs — max 4 concurrent upstream requests at once
  // Prevents hitting TMDB 40req/10s limit when Redis is cold
  const chunkSize = 2;
  for (let i = 0; i < seeds.length; i += chunkSize) {
    const chunk = seeds.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (seed) => {
        const type = seed.media_type === 'movie' || seed.media_type === 'tv' ? seed.media_type : 'movie';
        const [recs, similar] = await Promise.all([
          getItemRecommendations(type, seed.tmdb_id),
          getSimilarItems(type, seed.tmdb_id),
        ]);

        for (const item of [...recs, ...similar]) {
          const key = `${item.media_type ?? type}:${item.id}`;
          if (seenIds.has(String(item.id))) continue;

          const existing = scoreMap.get(key);
          if (existing) {
            existing.score += 1;
          } else {
            scoreMap.set(key, {
              item: { ...item, media_type: item.media_type ?? type },
              score: 1,
            });
          }
        }
      })
    );
  }

  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score || (b.item.vote_average ?? 0) - (a.item.vote_average ?? 0))
    .slice(0, limit)
    .map((e) => e.item);
}
