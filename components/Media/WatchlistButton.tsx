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

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data: Array<{ tmdb_id: string }>) => {
        if (Array.isArray(data)) setInWatchlist(data.some((i) => i.tmdb_id === tmdbId));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tmdbId]);

  async function toggle() {
    setLoading(true);
    try {
      if (inWatchlist) {
        await fetch("/api/watchlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tmdb_id: tmdbId }) });
        setInWatchlist(false);
      } else {
        await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tmdb_id: tmdbId, media_type: mediaType, title, poster_path: posterPath }) });
        setInWatchlist(true);
      }
    } catch {}
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border border-white/20 hover:border-white/60 disabled:opacity-50"
      style={{ background: inWatchlist ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff" }}
    >
      {inWatchlist ? "✓ In Watchlist" : "+ Watchlist"}
    </button>
  );
}
