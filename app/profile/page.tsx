import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { getProfile, getContinueWatching, getWatchlist } from '../../lib/database';
import { getRecommendations } from '../../lib/recommendations';
import { ProfileClient } from '../../components/Auth/ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) redirect('/login');

    const [profile, continueWatching, watchlist] = await Promise.allSettled([
        getProfile(session.user.id),
        getContinueWatching(session.user.id),
        getWatchlist(session.user.id),
    ]);

    const history = continueWatching.status === 'fulfilled' ? continueWatching.value ?? [] : [];
    const wl = watchlist.status === 'fulfilled' ? watchlist.value ?? [] : [];

    const recommendations = await getRecommendations(
        history.map((i: { tmdb_id: string; media_type: string }) => ({ tmdb_id: i.tmdb_id, media_type: i.media_type })),
        wl.map((i: { tmdb_id: string; media_type: string }) => ({ tmdb_id: i.tmdb_id, media_type: i.media_type }))
    ).catch(() => []);

    return (
        <ProfileClient
            user={session.user}
            profile={profile.status === 'fulfilled' ? profile.value : null}
            continueWatching={history}
            watchlist={wl}
            recommendations={recommendations}
        />
    );
}
