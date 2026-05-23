"use client";

import { useState, useEffect } from "react";

interface Props {
    tmdbId: string;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string;
}

export function WatchlistButton({ tmdbId, mediaType, title, posterPath }: Props) {
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check single item status — not the entire watchlist
    useEffect(() => {
        fetch(`/api/watchlist/check?tmdb_id=${tmdbId}`)
            .then(r => r.ok ? r.json() : { inWatchlist: false })
            .then(d => setInWatchlist(Boolean(d.inWatchlist)))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tmdbId]);

    async function toggle() {
        setLoading(true);
        const wasIn = inWatchlist;
        // Optimistic update
        setInWatchlist(!wasIn);
        try {
            if (wasIn) {
                const r = await fetch("/api/watchlist", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tmdb_id: tmdbId }),
                });
                if (!r.ok) setInWatchlist(wasIn); // revert on failure
            } else {
                const r = await fetch("/api/watchlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tmdb_id: tmdbId, media_type: mediaType, title, poster_path: posterPath }),
                });
                if (!r.ok) setInWatchlist(wasIn);
            }
        } catch {
            setInWatchlist(wasIn); // revert on network error
        }
        setLoading(false);
    }

    return (
        <button
            onClick={toggle}
            disabled={loading}
            aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border disabled:opacity-50
                ${inWatchlist
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-transparent border-white/20 hover:border-white/50 text-white'}`}>
            {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : inWatchlist ? '✓ Watchlisted' : '+ Watchlist'}
        </button>
    );
}
