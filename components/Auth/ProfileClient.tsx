"use client";

import React from 'react';
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

interface RecItem {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    media_type?: string;
    vote_average?: number;
}

interface ProfileClientProps {
    user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
    profile: { username?: string; avatar_url?: string } | null;
    continueWatching: WatchItem[];
    watchlist: WatchItem[];
    recommendations: RecItem[];
}

function MediaGrid({ items, href }: { items: Array<{ id: string | number; title?: string; name?: string; poster_path?: string | null; media_type?: string; season_number?: number; episode_number?: number; progress_seconds?: number; duration_seconds?: number }>; href: (item: typeof items[0]) => string }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
                <Link key={item.id} href={href(item)}>
                    <div className="group cursor-pointer">
                        {item.poster_path ? (
                            <div className="relative">
                                <Image
                                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                    alt={item.title ?? item.name ?? ''}
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
                            <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-xs">No Image</div>
                        )}
                        <p className="text-white text-sm mt-2 truncate">{item.title ?? item.name}</p>
                        {item.season_number && (
                            <p className="text-gray-400 text-xs">S{item.season_number} E{item.episode_number}</p>
                        )}
                        {item.media_type && !item.season_number && (
                            <p className="text-gray-400 text-xs capitalize">{item.media_type}</p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}

export function ProfileClient({ user, profile, continueWatching, watchlist, recommendations }: ProfileClientProps) {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    const displayName = (profile?.username ?? String(user.user_metadata?.full_name ?? '')) || (user.email ?? 'User');
    const avatarUrl = user.user_metadata?.avatar_url ? String(user.user_metadata.avatar_url) : (profile?.avatar_url ?? undefined);

    return (
        <main className="min-h-screen bg-black text-white pt-24 pb-16 px-4 sm:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-10 max-w-6xl mx-auto">
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
                <section className="max-w-6xl mx-auto mb-12">
                    <h2 className="text-xl font-bold mb-4">Continue Watching</h2>
                    <MediaGrid
                        items={continueWatching.map(i => ({ ...i, id: i.tmdb_id }))}
                        href: (item) => {
            const base = `/${item.media_type}/${item.id}`;
            if (item.season_number) return `${base}?s=${item.season_number}&e=${item.episode_number ?? 1}`;
            return base;
        }
                    />
                </section>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <section className="max-w-6xl mx-auto mb-12">
                    <h2 className="text-xl font-bold mb-1">Recommended For You</h2>
                    <p className="text-gray-500 text-sm mb-4">Based on your watch history and watchlist</p>
                    <MediaGrid
                        items={recommendations}
                        href={(i) => `/${i.media_type ?? 'movie'}/${i.id}`}
                    />
                </section>
            )}

            {/* Watchlist */}
            <section className="max-w-6xl mx-auto">
                <h2 className="text-xl font-bold mb-4">My Watchlist</h2>
                {watchlist.length === 0 ? (
                    <p className="text-gray-500">Your watchlist is empty.</p>
                ) : (
                    <MediaGrid
                        items={watchlist.map(i => ({ ...i, id: i.tmdb_id }))}
                        href={(i) => `/${i.media_type}/${i.id}`}
                    />
                )}
            </section>
        </main>
    );
}
