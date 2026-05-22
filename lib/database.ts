
import { createSupabaseServerClient } from './supabase/server';

function getSupabase() {
    return createSupabaseServerClient();
}

// ==========================================
// WATCHLIST OPERATIONS
// ==========================================

export async function getWatchlist(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('watchlists')
        .select('tmdb_id, media_type, title, poster_path, added_at')
        .eq('user_id', userId)
        .order('added_at', { ascending: false })
        .limit(200);

    if (error) throw new Error(error.message);
    return data;
}

export async function addToWatchlist(userId: string, item: { tmdb_id: string; media_type: 'movie' | 'tv'; title: string; poster_path?: string }) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('watchlists')
        .insert([{ ...item, user_id: userId }])
        .select();

    if (error) throw new Error(error.message);
    return data;
}

export async function removeFromWatchlist(userId: string, tmdbId: string) {
    const supabase = getSupabase();
    const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId);

    if (error) throw new Error(error.message);
    return { success: true };
}

// ==========================================
// CONTINUE WATCHING OPERATIONS
// ==========================================

export async function getContinueWatching(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('continue_watching')
        .select('tmdb_id, media_type, title, poster_path, progress_seconds, duration_seconds, season_number, episode_number, episode_title, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(100);

    if (error) throw new Error(error.message);
    return data;
}

export async function updatePlaybackProgress(userId: string, progress: { tmdb_id: string; media_type: 'movie' | 'tv'; title: string; poster_path?: string; progress_seconds: number; duration_seconds: number; season_number?: number; episode_number?: number, episode_title?: string; }) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('continue_watching')
        .upsert({ ...progress, user_id: userId }, { onConflict: 'user_id,tmdb_id,media_type' })
        .select();

    if (error) throw new Error(error.message);
    return data;
}

// ==========================================
// PROFILE OPERATIONS
// ==========================================

export async function getProfile(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, created_at')
        .eq('id', userId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateProfile(userId: string, profileData: { username?: string; avatar_url?: string; }) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select();

    if (error) throw new Error(error.message);
    return data;
}
