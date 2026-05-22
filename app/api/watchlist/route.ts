import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '@/lib/database';

const VALID_TYPES = new Set(['movie', 'tv']);

async function getUserId() {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

export async function GET() {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await getWatchlist(userId);
    return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: Record<string, unknown>;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const tmdb_id    = String(body.tmdb_id ?? '').slice(0, 20);
    const media_type = String(body.media_type ?? '');
    const title      = String(body.title ?? '').slice(0, 255);
    const poster_path= body.poster_path ? String(body.poster_path).slice(0, 200) : undefined;

    if (!tmdb_id || !/^\d+$/.test(tmdb_id))     return NextResponse.json({ error: 'Invalid tmdb_id' },    { status: 400 });
    if (!VALID_TYPES.has(media_type))            return NextResponse.json({ error: 'Invalid media_type' }, { status: 400 });
    if (!title)                                  return NextResponse.json({ error: 'Missing title' },      { status: 400 });

    const data = await addToWatchlist(userId, { tmdb_id, media_type: media_type as 'movie' | 'tv', title, poster_path });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: Record<string, unknown>;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const tmdb_id = String(body.tmdb_id ?? '').slice(0, 20);
    if (!tmdb_id || !/^\d+$/.test(tmdb_id)) return NextResponse.json({ error: 'Invalid tmdb_id' }, { status: 400 });

    const data = await removeFromWatchlist(userId, tmdb_id);
    return NextResponse.json(data);
}
