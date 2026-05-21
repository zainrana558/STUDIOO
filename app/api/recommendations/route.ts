import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getContinueWatching, getWatchlist } from '@/lib/database';
import { getRecommendations } from '@/lib/recommendations';
import { cacheGet, cacheSet } from '@/lib/cache';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const cacheKey = `recs:user:${userId}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });

  const [history, watchlist] = await Promise.all([
    getContinueWatching(userId).catch(() => []),
    getWatchlist(userId).catch(() => []),
  ]);

  const recommendations = await getRecommendations(
    (history ?? []).map((i: { tmdb_id: string; media_type: string }) => ({ tmdb_id: i.tmdb_id, media_type: i.media_type })),
    (watchlist ?? []).map((i: { tmdb_id: string; media_type: string }) => ({ tmdb_id: i.tmdb_id, media_type: i.media_type }))
  );

  await cacheSet(cacheKey, recommendations, 60 * 30); // 30 min cache per user

  return NextResponse.json(recommendations);
}
