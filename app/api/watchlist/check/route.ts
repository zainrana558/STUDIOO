import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ inWatchlist: false });

    const tmdb_id = req.nextUrl.searchParams.get('tmdb_id');
    if (!tmdb_id || !/^\d+$/.test(tmdb_id)) {
        return NextResponse.json({ error: 'Invalid tmdb_id' }, { status: 400 });
    }

    const { data } = await supabase
        .from('watchlists')
        .select('tmdb_id')
        .eq('user_id', session.user.id)
        .eq('tmdb_id', tmdb_id)
        .maybeSingle();

    return NextResponse.json({ inWatchlist: Boolean(data) });
}
