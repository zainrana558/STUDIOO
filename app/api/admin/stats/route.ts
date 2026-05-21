import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function isAdmin(userId: string): Promise<boolean> {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(s => s.trim()) ?? [];
  return adminIds.includes(userId);
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!await isAdmin(session.user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Use service role for admin queries if available
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { createClient } = await import('@supabase/supabase-js');
  const adminClient = createClient(url, adminKey!);

  const [
    { count: totalUsers },
    { count: totalWatchlistItems },
    { count: totalWatchHistory },
    { data: topWatched },
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('watchlists').select('*', { count: 'exact', head: true }),
    adminClient.from('continue_watching').select('*', { count: 'exact', head: true }),
    adminClient.from('continue_watching')
      .select('tmdb_id, media_type, title, poster_path')
      .order('updated_at', { ascending: false })
      .limit(10),
  ]);

  // Most added to watchlist
  const { data: topWatchlisted } = await adminClient
    .from('watchlists')
    .select('tmdb_id, title, media_type, poster_path')
    .limit(100);

  // Count frequency
  const wlFreq = new Map<string, { title: string; media_type: string; poster_path: string; count: number }>();
  for (const item of topWatchlisted ?? []) {
    const key = `${item.media_type}:${item.tmdb_id}`;
    const existing = wlFreq.get(key);
    if (existing) { existing.count++; }
    else { wlFreq.set(key, { title: item.title, media_type: item.media_type, poster_path: item.poster_path, count: 1 }); }
  }
  const topWatchlistedSorted = Array.from(wlFreq.values()).sort((a, b) => b.count - a.count).slice(0, 10);

  return NextResponse.json({
    stats: {
      totalUsers: totalUsers ?? 0,
      totalWatchlistItems: totalWatchlistItems ?? 0,
      totalWatchHistory: totalWatchHistory ?? 0,
    },
    topWatched: topWatched ?? [],
    topWatchlisted: topWatchlistedSorted,
  });
}
