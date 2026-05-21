"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Media } from '../../types/media';

interface VideoEmbedPlayerProps {
    media: Media;
}

const servers = [
    { name: 'VidSrc', key: 'vidsrc' },
    { name: 'NexStream', key: 'nexstream' },
    { name: 'VidPhantom', key: 'vidphantom' },
    { name: '2Embed', key: '2embed' },
];

const SAVE_INTERVAL = 20_000; // save every 20s

export const VideoEmbedPlayer = ({ media }: VideoEmbedPlayerProps) => {
    const [activeServer, setActiveServer] = useState(servers[0].key);
    const [activeSeason, setActiveSeason] = useState(1);
    const [activeEpisode, setActiveEpisode] = useState(1);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Track real elapsed time — only counts when tab is visible and user hasn't paused
    const sessionStartRef = useRef<number | null>(null);
    const accumulatedRef = useRef<number>(0); // seconds accumulated this episode
    const lastSavedRef = useRef<number>(0);

    // Reset when episode/server changes
    useEffect(() => {
        accumulatedRef.current = 0;
        lastSavedRef.current = 0;
        sessionStartRef.current = null;
        setIsPlaying(false);
    }, [activeServer, activeSeason, activeEpisode]);

    // Visibility API — pause counting when tab hidden
    useEffect(() => {
        function handleVisibility() {
            if (document.hidden) {
                if (sessionStartRef.current !== null) {
                    accumulatedRef.current += (Date.now() - sessionStartRef.current) / 1000;
                    sessionStartRef.current = null;
                }
            } else {
                if (isPlaying) sessionStartRef.current = Date.now();
            }
        }
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [isPlaying]);

    // Listen for postMessage from iframe players that support it (e.g. vidsrc sends play/pause events)
    useEffect(() => {
        function handleMessage(e: MessageEvent) {
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
                    setIsPlaying(false);
                }
                // Some players send currentTime
                if (typeof msg?.currentTime === 'number' && msg.currentTime > 0) {
                    accumulatedRef.current = msg.currentTime;
                }
            } catch { /* not JSON */ }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Auto-start counting after 3s (assume playing since we can't always detect it)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (sessionStartRef.current === null) {
                sessionStartRef.current = Date.now();
                setIsPlaying(true);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [activeServer, activeSeason, activeEpisode]);

    const saveProgress = useCallback(async () => {
        const current = accumulatedRef.current +
            (sessionStartRef.current !== null ? (Date.now() - sessionStartRef.current) / 1000 : 0);

        if (current - lastSavedRef.current < 5) return; // skip if less than 5s new progress
        lastSavedRef.current = current;

        try {
            await fetch('/api/continue-watching', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tmdb_id: String(media.id),
                    media_type: media.media_type ?? 'movie',
                    title: media.title ?? media.name ?? '',
                    poster_path: media.poster_path,
                    progress_seconds: Math.round(current),
                    duration_seconds: 0,
                    ...(media.media_type === 'tv' ? { season_number: activeSeason, episode_number: activeEpisode } : {}),
                }),
            });
        } catch { /* silent */ }
    }, [media, activeSeason, activeEpisode]);

    // Periodic save
    useEffect(() => {
        const interval = setInterval(saveProgress, SAVE_INTERVAL);
        return () => clearInterval(interval);
    }, [saveProgress]);

    // Save on unmount / page leave
    useEffect(() => {
        window.addEventListener('beforeunload', saveProgress);
        return () => {
            saveProgress();
            window.removeEventListener('beforeunload', saveProgress);
        };
    }, [saveProgress]);

    const streamUrl = useMemo(() => {
        const { media_type, id } = media;
        const params = new URLSearchParams();
        params.set('media_type', media_type || 'movie');
        params.set('provider', activeServer);
        if (media_type === 'tv') {
            params.set("s", String(activeSeason));
            params.set("e", String(activeEpisode));
        }
        return `/api/embed/${id}?${params.toString()}`;
    }, [media, activeServer, activeSeason, activeEpisode]);

    const officialTrailer = media.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    return (
        <div className="w-full">
            <div className="aspect-video bg-black relative">
                <AnimatePresence mode="wait">
                    <motion.iframe
                        key={streamUrl}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src={streamUrl}
                        className="w-full h-full absolute top-0 left-0"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen"
                        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation"
                    />
                </AnimatePresence>
            </div>

            <div className="bg-gray-900 p-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    {servers.map(server => (
                        <button
                            key={server.key}
                            onClick={() => setActiveServer(server.key)}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeServer === server.key ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {server.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    {isPlaying && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                            Tracking progress
                        </span>
                    )}
                    {officialTrailer && (
                        <button
                            onClick={() => setIsTrailerOpen(true)}
                            className='px-4 py-2 text-sm rounded-md bg-yellow-500 hover:bg-yellow-600 text-black transition-colors'>
                            Watch Trailer
                        </button>
                    )}
                </div>
            </div>

            <div className='p-4'>
                <div className='flex flex-wrap gap-2'>
                    {(media.genres || []).map((genre) => (
                        <span key={genre.id} className='px-2 py-1 text-xs rounded-full bg-gray-700'>
                            {genre.name}
                        </span>
                    ))}
                </div>
            </div>

            {media.media_type === 'tv' && media.seasons && (
                <div className="p-4 md:p-8">
                    <div className="flex space-x-2 border-b border-gray-700 mb-4 overflow-x-auto">
                        {media.seasons.map(season => (
                            <button
                                key={season.id}
                                onClick={() => setActiveSeason(season.season_number)}
                                className={`pb-2 px-4 whitespace-nowrap ${activeSeason === season.season_number ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}>
                                Season {season.season_number}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 gap-2">
                        {Array.from({ length: media.seasons.find(s => s.season_number === activeSeason)?.episode_count || 0 }, (_, i) => i + 1).map(episode => (
                            <button
                                key={episode}
                                onClick={() => setActiveEpisode(episode)}
                                className={`aspect-square rounded-md transition-colors ${activeEpisode === episode ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
                                {episode}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isTrailerOpen && officialTrailer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setIsTrailerOpen(false)}
                    >
                        <div className="aspect-video bg-black w-full max-w-4xl">
                            <iframe
                                src={`https://www.youtube.com/embed/${officialTrailer.key}?autoplay=1`}
                                title={officialTrailer.name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className='w-full h-full'
                            ></iframe>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
