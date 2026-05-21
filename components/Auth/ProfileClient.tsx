"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';

interface WatchItem {
    tmdb_id: string;
    media_type: string;
    title: string;
    poster_path?: string;
    progress_seconds?: number;
    duration_seconds?: number;
    season_number?: number;
    episode_number?: number;
}

interface ProfileClientProps {
    user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
    profile: { username?: string; avatar_url?: string } | null;
    continueWatching: WatchItem[];
    watchlist: WatchItem[];
}

export function ProfileClient({ user, profile, continueWatching, watchlist }: ProfileClientProps) {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    const displayName = profile?.username ?? String(user.user_metadata?.full_name ?? '') || user.email ?? 'User';
    const avatarUrl = user.user_metadata?.avatar_url ? String(user.user_metadata.avatar_url) : (profile?.avatar_url ?? undefined);

    return (
        <main className="min-h-screen bg-black text-white pt-24 pb-16 px-4 sm:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-10 max-w-5xl mx-auto">
                <div className="flex items-center gap-4">
                    {avatarUrl ? (
                        <Image src={avatarUrl} alt={displayName} width={64} height={64} className="rounded-full object-cover" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
                            {displayName[0]?.toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">{displayName}</h1>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-red-600 transition-colors text-sm font-semibold"
                >
                    Log Out
                </button>
            </div>

            {/* Continue Watching */}
            {continueWatching.length > 0 && (
                <section className="max-w-5xl mx-auto mb-12">
                    <h2 className="text-xl font-bold mb-4">Continue Watching</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {continueWatching.map((item) => (
                            <Link key={`${item.tmdb_id}-${item.media_type}`} href={`/${item.media_type}/${item.tmdb_id}${item.season_number ? `?s=${item.season_number}&e=${item.episode_number ?? 1}` : ''}`}>
                                <div className="group cursor-pointer">
                                    {item.poster_path ? (
                                        <div className="relative">
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                                alt={item.title}
                                                width={342} height={513}
                                                className="rounded-lg w-full object-cover group-hover:opacity-80 transition"
                                            />
                                            {item.duration_seconds && item.duration_seconds > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg">
                                                    <div
                                                        className="h-full bg-red-500 rounded-b-lg"
                                                        style={{ width: `${Math.min(100, (item.progress_seconds ?? 0) / item.duration_seconds * 100)}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg" />
                                    )}
                                    <p className="text-white text-sm mt-2 truncate">{item.title}</p>
                                    {item.season_number && (
                                        <p className="text-gray-400 text-xs">S{item.season_number} E{item.episode_number}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Watchlist */}
            <section className="max-w-5xl mx-auto">
                <h2 className="text-xl font-bold mb-4">My Watchlist</h2>
                {watchlist.length === 0 ? (
                    <p className="text-gray-500">Your watchlist is empty.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {watchlist.map((item) => (
                            <Link key={`${item.tmdb_id}-${item.media_type}`} href={`/${item.media_type}/${item.tmdb_id}`}>
                                <div className="group cursor-pointer">
                                    {item.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                            alt={item.title}
                                            width={342} height={513}
                                            className="rounded-lg w-full object-cover group-hover:opacity-80 transition"
                                        />
                                    ) : (
                                        <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg" />
                                    )}
                                    <p className="text-white text-sm mt-2 truncate">{item.title}</p>
                                    <p className="text-gray-400 text-xs capitalize">{item.media_type}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
