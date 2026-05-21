import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { getProfile, getContinueWatching, getWatchlist } from '../../lib/database';
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

    return (
        <ProfileClient
            user={session.user}
            profile={profile.status === 'fulfilled' ? profile.value : null}
            continueWatching={continueWatching.status === 'fulfilled' ? continueWatching.value ?? [] : []}
            watchlist={watchlist.status === 'fulfilled' ? watchlist.value ?? [] : []}
        />
    );
}
