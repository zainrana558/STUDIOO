"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaDetails } from '../../types/media';

interface VideoEmbedPlayerProps {
    media: MediaDetails;
    initialSeason?: number;
    initialEpisode?: number;
}

const SERVERS = [
    { name: 'VidSrc',    key: 'vidsrc'    },
    { name: 'NexStream', key: 'nexstream' },
    { name: 'VidPhantom',key: 'vidphantom'},
    { name: '2Embed',    key: '2embed'    },
];

const TRUSTED_ORIGINS = [
    'https://vidsrc.cc', 'https://vidsrc.to', 'https://vidsrc.me',
    'https://vidphantom.com', 'https://www.2embed.cc', 'https://nexstream.site',
];

const SAVE_INTERVAL = 20_000;
const MAX_PROGRESS_SECONDS = 86400; // 24h hard cap — server-side validation mirror
const MAX_DURATION_SECONDS = 86400;

export const VideoEmbedPlayer = ({ media, initialSeason = 1, initialEpisode = 1 }: VideoEmbedPlayerProps) => {
    const [activeServer,  setActiveServer]  = useState(SERVERS[0].key);
    const [activeSeason,  setActiveSeason]  = useState(initialSeason);
    const [activeEpisode, setActiveEpisode] = useState(initialEpisode);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [isPlaying,     setIsPlaying]     = useState(false);
    const [watchedEpisodes, setWatchedEpisodes] = useState<Record<string, number>>({});

    const sessionStartRef = useRef<number | null>(null);
    const accumulatedRef  = useRef<number>(0);
    const lastSavedRef    = useRef<number>(0);
    // Debounce rapid episode switching — prevents DB connection exhaustion
    const saveTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Reset on episode/server change ──────────────────────────────────────
    useEffect(() => {
        accumulatedRef.current  = 0;
        lastSavedRef.current    = 0;
        sessionStartRef.current = null;
        setIsPlaying(false);
    }, [activeServer, activeSeason, activeEpisode]);

    // ── Fetch watched progress (TV only) — select specific columns, no SELECT * ──
    useEffect(() => {
        if (media.media_type !== 'tv') return;
        fetch('/api/continue-watching')
            .then(r => r.ok ? r.json() : [])
            .then((items: Array<{ tmdb_id: string; season_number?: number; episode_number?: number; progress_seconds?: number; duration_seconds?: number }>) => {
                const map: Record<string, number> = {};
                for (const item of items) {
                    if (item.tmdb_id !== String(media.id) || !item.season_number || !item.episode_number) continue;
                    const d = item.duration_seconds ?? 0;
                    map[`${item.season_number}-${item.episode_number}`] = d > 0
                        ? Math.min(1, (item.progress_seconds ?? 0) / d)
                        : 0;
                }
                setWatchedEpisodes(map);
            })
            .catch(() => {});
    }, [media.id, media.media_type]);

    // ── Auto-start tracking after 3s (iframe fallback) ──────────────────────
    useEffect(() => {
        const t = setTimeout(() => {
            if (sessionStartRef.current === null) {
                sessionStartRef.current = Date.now();
                setIsPlaying(true);
            }
        }, 3000);
        return () => clearTimeout(t);
    }, [activeServer, activeSeason, activeEpisode]);

    // ── Visibility API ───────────────────────────────────────────────────────
    useEffect(() => {
        const onVis = () => {
            if (document.hidden) {
                if (sessionStartRef.current !== null) {
                    accumulatedRef.current += (Date.now() - sessionStartRef.current) / 1000;
                    sessionStartRef.current = null;
                }
            } else if (isPlaying) {
                sessionStartRef.current = Date.now();
            }
        };
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, [isPlaying]);

    // ── saveProgress — debounced, validated ─────────────────────────────────
    const saveProgress = useCallback(async () => {
        const rawCurrent = accumulatedRef.current +
            (sessionStartRef.current !== null ? (Date.now() - sessionStartRef.current) / 1000 : 0);

        // Client-side validation mirrors server: clamp to sane range
        const current = Math.max(0, Math.min(rawCurrent, MAX_PROGRESS_SECONDS));
        if (current - lastSavedRef.current < 5) return;
        lastSavedRef.current = current;

        const rawDuration = media.media_type === 'movie'
            ? (media.runtime ?? 0) * 60
            : (media.episode_run_time?.[0] ?? 0) * 60;
        const duration = Math.max(0, Math.min(rawDuration, MAX_DURATION_SECONDS));

        try {
            await fetch('/api/continue-watching', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tmdb_id:          String(media.id),
                    media_type:       media.media_type ?? 'movie',
                    title:            media.title ?? media.name ?? '',
                    poster_path:      media.poster_path ?? null,
                    progress_seconds: Math.round(current),
                    duration_seconds: Math.round(duration),
                    ...(media.media_type === 'tv'
                        ? { season_number: activeSeason, episode_number: activeEpisode }
                        : {}),
                }),
            });
        } catch { /* silent — network blip should not crash */ }
    }, [media, activeSeason, activeEpisode]);

    // ── Periodic save ────────────────────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(saveProgress, SAVE_INTERVAL);
        return () => clearInterval(interval);
    }, [saveProgress]);

    // ── Save on page leave ───────────────────────────────────────────────────
    useEffect(() => {
        window.addEventListener('beforeunload', saveProgress);
        return () => {
            saveProgress();
            window.removeEventListener('beforeunload', saveProgress);
        };
    }, [saveProgress]);

    // ── postMessage — origin-validated ──────────────────────────────────────
    useEffect(() => {
        const onMsg = (e: MessageEvent) => {
            if (!TRUSTED_ORIGINS.some(o => e.origin.startsWith(o))) return;
            try {
                const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                if (msg?.event === 'play' || msg?.type === 'play') {
                    sessionStartRef.current = Date.now();
                    setIsPlaying(true);
                } else if (msg?.event === 'pause' || msg?.type === 'pause' || msg?.event === 'ended') {
                    if (sessionStartRef.current !== null) {
                        accumulatedRef.current += (Date.now() - sessionStartRef.current) / 1000;
                        sessionStartRef.current = null;
                    }
                    if (msg?.event === 'ended' && media.media_type === 'tv') {
                        const maxEp = media.seasons?.find(s => s.season_number === activeSeason)?.episode_count ?? 0;
                        if (activeEpisode < maxEp) setActiveEpisode(ep => ep + 1);
                    }
                    setIsPlaying(false);
                }
                if (typeof msg?.currentTime === 'number' && msg.currentTime > 0) {
                    accumulatedRef.current = Math.min(msg.currentTime, MAX_PROGRESS_SECONDS);
                }
            } catch { /* not JSON */ }
        };
        window.addEventListener('message', onMsg);
        return () => window.removeEventListener('message', onMsg);
    }, [media, activeSeason, activeEpisode]);

    // ── Keyboard shortcuts ───────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            const maxEp = media.seasons?.find(s => s.season_number === activeSeason)?.episode_count ?? 0;
            const maxS  = media.seasons?.length ?? 1;
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    setIsPlaying(p => !p);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (media.media_type === 'tv' && activeEpisode < maxEp) {
                        // Debounce rapid switching to avoid DB write flood
                        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                        saveTimerRef.current = setTimeout(saveProgress, 800);
                        setActiveEpisode(ep => ep + 1);
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (media.media_type === 'tv' && activeEpisode > 1) {
                        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                        saveTimerRef.current = setTimeout(saveProgress, 800);
                        setActiveEpisode(ep => ep - 1);
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (media.media_type === 'tv' && activeSeason < maxS) {
                        setActiveSeason(s => s + 1); setActiveEpisode(1);
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (media.media_type === 'tv' && activeSeason > 1) {
                        setActiveSeason(s => s - 1); setActiveEpisode(1);
                    }
                    break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [media, activeSeason, activeEpisode, saveProgress]);

    // ── Stream URL ───────────────────────────────────────────────────────────
    const streamUrl = useMemo(() => {
        const { media_type, id } = media;
        const p = new URLSearchParams();
        p.set('media_type', media_type || 'movie');
        p.set('provider', activeServer);
        if (media_type === 'tv') { p.set('s', String(activeSeason)); p.set('e', String(activeEpisode)); }
        return `/api/embed/${id}?${p.toString()}`;
    }, [media, activeServer, activeSeason, activeEpisode]);

    const officialTrailer = media.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const currentSeason   = media.seasons?.find(s => s.season_number === activeSeason);
    const maxEpisode      = currentSeason?.episode_count ?? 0;
    const hasNextEpisode  = media.media_type === 'tv' && activeEpisode < maxEpisode;

    return (
        <div className="w-full">

            {/* ── Player iframe ── */}
            <div className="aspect-video bg-black relative">
                <AnimatePresence mode="wait">
                    <motion.iframe
                        key={streamUrl}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src={streamUrl}
                        className="w-full h-full absolute top-0 left-0"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                        sandbox="allow-forms allow-pointer-lock allow-scripts allow-presentation allow-fullscreen allow-popups"
                        loading="lazy"
                        title={`${media.title ?? media.name ?? 'Video'} — ${activeServer}`}
                    />
                </AnimatePresence>
            </div>

            {/* ── Controls ── */}
            <div className="bg-gray-900 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-800">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-500 text-xs hidden sm:inline">Server:</span>
                    {SERVERS.map(s => (
                        <button key={s.key} onClick={() => setActiveServer(s.key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeServer === s.key ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>
                            {s.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {isPlaying && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" /> Tracking
                        </span>
                    )}
                    {hasNextEpisode && (
                        <button onClick={() => setActiveEpisode(ep => ep + 1)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-black hover:bg-gray-200 transition-colors">
                            Next Ep →
                        </button>
                    )}
                    {officialTrailer && (
                        <button onClick={() => setIsTrailerOpen(true)}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-yellow-500 hover:bg-yellow-400 text-black transition-colors">
                            Trailer
                        </button>
                    )}
                </div>
            </div>

            {/* ── Keyboard hints (desktop only) ── */}
            <div className="bg-gray-950 px-4 py-2 hidden md:flex items-center gap-4 text-gray-600 text-xs border-b border-gray-800">
                {media.media_type === 'tv' && (
                    <>
                        <span><kbd className="bg-gray-800 text-gray-400 px-1 rounded">←</kbd> <kbd className="bg-gray-800 text-gray-400 px-1 rounded">→</kbd> Episode</span>
                        <span><kbd className="bg-gray-800 text-gray-400 px-1 rounded">↑</kbd> <kbd className="bg-gray-800 text-gray-400 px-1 rounded">↓</kbd> Season</span>
                    </>
                )}
                <span><kbd className="bg-gray-800 text-gray-400 px-1 rounded">Space</kbd> Play/Pause</span>
            </div>

            {/* ── Genre tags ── */}
            {(media.genres ?? []).length > 0 && (
                <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-gray-800">
                    {media.genres!.map(g => (
                        <span key={g.id} className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-400">{g.name}</span>
                    ))}
                </div>
            )}

            {/* ── Season / Episode selector ── */}
            {media.media_type === 'tv' && media.seasons && (
                <div className="p-4 md:px-8 md:py-6">
                    {/* Season tabs */}
                    <div className="flex gap-1 border-b border-gray-800 mb-4 overflow-x-auto scrollbar-hide">
                        {media.seasons.map(season => (
                            <button key={season.id}
                                onClick={() => { setActiveSeason(season.season_number); setActiveEpisode(1); }}
                                className={`pb-2 px-4 text-sm whitespace-nowrap transition-colors ${activeSeason === season.season_number
                                    ? 'border-b-2 border-red-500 text-white font-medium'
                                    : 'text-gray-500 hover:text-gray-300'}`}>
                                S{season.season_number}
                            </button>
                        ))}
                    </div>

                    {/* Episode grid — 48px min touch, watched state */}
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                        {Array.from({ length: currentSeason?.episode_count ?? 0 }, (_, i) => i + 1).map(ep => {
                            const pct      = watchedEpisodes[`${activeSeason}-${ep}`] ?? 0;
                            const isWatched = pct >= 0.9;
                            const isPartial = pct > 0.05 && pct < 0.9;
                            const isActive  = activeEpisode === ep;
                            return (
                                <button key={ep} onClick={() => setActiveEpisode(ep)}
                                    title={`Episode ${ep}${isWatched ? ' ✓' : isPartial ? ` ${Math.round(pct * 100)}%` : ''}`}
                                    className={`relative min-h-[48px] rounded-md text-sm font-medium transition-all overflow-hidden
                                        ${isActive  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                                        : isWatched ? 'bg-gray-700 text-gray-400'
                                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>
                                    {ep}
                                    {isPartial && !isActive && (
                                        <span className="absolute bottom-0 left-0 h-0.5 bg-red-500" style={{ width: `${pct * 100}%` }} />
                                    )}
                                    {isWatched && !isActive && (
                                        <span className="absolute top-0.5 right-0.5 text-[8px] text-green-400">✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-gray-600 text-xs mt-3">
                        Season {activeSeason} · Ep {activeEpisode}/{currentSeason?.episode_count ?? '?'}
                        {currentSeason?.name && currentSeason.name !== `Season ${activeSeason}` && ` · ${currentSeason.name}`}
                    </p>
                </div>
            )}

            {/* ── Trailer modal ── */}
            <AnimatePresence>
                {isTrailerOpen && officialTrailer && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setIsTrailerOpen(false)}>
                        <div className="aspect-video bg-black w-full max-w-4xl relative">
                            <button onClick={() => setIsTrailerOpen(false)}
                                className="absolute -top-8 right-0 text-gray-400 hover:text-white text-sm">
                                ✕ Close
                            </button>
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${officialTrailer.key}?autoplay=1`}
                                title={officialTrailer.name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen className="w-full h-full"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
