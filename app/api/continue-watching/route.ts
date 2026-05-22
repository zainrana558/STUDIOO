import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getContinueWatching, updatePlaybackProgress } from '@/lib/database';

const MAX_PROGRESS  = 86400;  // 24h
const MAX_DURATION  = 86400;
const MAX_TITLE_LEN = 255;
const VALID_TYPES   = new Set(['movie', 'tv']);

async function getUserId() {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

export async function GET() {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await getContinueWatching(userId);
    return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: Record<string, unknown>;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    // ── Server-side validation — never trust client-reported numbers ──────
    const tmdb_id          = String(body.tmdb_id ?? '').slice(0, 20);
    const media_type       = String(body.media_type ?? '');
    const title            = String(body.title ?? '').slice(0, MAX_TITLE_LEN);
    const poster_path      = body.poster_path ? String(body.poster_path).slice(0, 200) : null;
    const progress_seconds = Math.max(0, Math.min(Number(body.progress_seconds) || 0, MAX_PROGRESS));
    const duration_seconds = Math.max(0, Math.min(Number(body.duration_seconds) || 0, MAX_DURATION));
    const season_number    = body.season_number  ? Math.max(1, Math.min(Number(body.season_number)  || 1, 100))  : undefined;
    const episode_number   = body.episode_number ? Math.max(1, Math.min(Number(body.episode_number) || 1, 9999)) : undefined;

    if (!tmdb_id)                  return NextResponse.json({ error: 'Missing tmdb_id' },    { status: 400 });
    if (!VALID_TYPES.has(media_type)) return NextResponse.json({ error: 'Invalid media_type' }, { status: 400 });
    if (!title)                    return NextResponse.json({ error: 'Missing title' },      { status: 400 });
    // Reject nonsense: progress can't exceed duration when duration is known
    if (duration_seconds > 0 && progress_seconds > duration_seconds + 60) {
        return NextResponse.json({ error: 'progress_seconds exceeds duration' }, { status: 400 });
    }

    const data = await updatePlaybackProgress(userId, {
        tmdb_id, media_type: media_type as 'movie' | 'tv', title, poster_path: poster_path ?? undefined,
        progress_seconds, duration_seconds,
        ...(season_number  !== undefined ? { season_number }  : {}),
        ...(episode_number !== undefined ? { episode_number } : {}),
    });
    return NextResponse.json(data);
}
