"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
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

const HEARTBEAT_INTERVAL = 30_000; // save every 30s

export const VideoEmbedPlayer = ({ media }: VideoEmbedPlayerProps) => {
    const [activeServer, setActiveServer] = useState(servers[0].key);
    const [activeSeason, setActiveSeason] = useState(1);
    const [activeEpisode, setActiveEpisode] = useState(1);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const watchStartRef = useRef<number>(Date.now());
    const progressRef = useRef<number>(0);

    // Reset timer when stream changes
    useEffect(() => {
        watchStartRef.current = Date.now();
    }, [activeServer, activeSeason, activeEpisode]);

    // Heartbeat: save progress every 30s
    useEffect(() => {
        const interval = setInterval(async () => {
            const elapsed = Math.round((Date.now() - watchStartRef.current) / 1000);
            progressRef.current += elapsed;
            watchStartRef.current = Date.now();
            try {
                await fetch('/api/continue-watching', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tmdb_id: String(media.id),
                        media_type: media.media_type ?? 'movie',
                        title: media.title ?? media.name ?? '',
                        poster_path: media.poster_path,
                        progress_seconds: progressRef.current,
                        duration_seconds: 0,
                        ...(media.media_type === 'tv' ? { season_number: activeSeason, episode_number: activeEpisode } : {}),
                    }),
                });
            } catch { /* silent */ }
        }, HEARTBEAT_INTERVAL);
        return () => clearInterval(interval);
    }, [media, activeSeason, activeEpisode]);

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
                        transition={{ duration: 0.3 } }
                        src={streamUrl}
                        className="w-full h-full absolute top-0 left-0"
                        frameBorder="0"
                        allowFullScreen
                        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation"
                    />
                </AnimatePresence>
            </div>

            <div className="bg-gray-900 p-4 flex flex-wrap items-center justify-between">
                <div className="flex flex-wrap items-center space-x-2">
                    {servers.map(server => (
                        <button
                            key={server.key}
                            onClick={() => setActiveServer(server.key)}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeServer === server.key ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {server.name}
                        </button>
                    ))}
                </div>
                {officialTrailer && (
                    <button
                        onClick={() => setIsTrailerOpen(true)}
                        className='px-4 py-2 text-sm rounded-md bg-yellow-500 hover:bg-yellow-600 text-black transition-colors'>
                        Watch Trailer
                    </button>
                )}
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
                    <div className="flex space-x-2 border-b border-gray-700 mb-4">
                        {media.seasons.map(season => (
                            <button
                                key={season.id}
                                onClick={() => setActiveSeason(season.season_number)}
                                className={`pb-2 px-4 ${activeSeason === season.season_number ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}>
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

interface VideoEmbedPlayerProps {
    media: Media;
}

const servers = [
    { name: 'VidSrc', key: 'vidsrc' },
    { name: 'NexStream', key: 'nexstream' },
    { name: 'VidPhantom', key: 'vidphantom' },
    { name: '2Embed', key: '2embed' },
];

export const VideoEmbedPlayer = ({ media }: VideoEmbedPlayerProps) => {
    const [activeServer, setActiveServer] = useState(servers[0].key);
    const [activeSeason, setActiveSeason] = useState(1);
    const [activeEpisode, setActiveEpisode] = useState(1);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

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
                        transition={{ duration: 0.3 } }
                        src={streamUrl}
                        className="w-full h-full absolute top-0 left-0"
                        frameBorder="0"
                        allowFullScreen
                        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation"
                    />
                </AnimatePresence>
            </div>

            <div className="bg-gray-900 p-4 flex flex-wrap items-center justify-between">
                <div className="flex flex-wrap items-center space-x-2">
                    {servers.map(server => (
                        <button
                            key={server.key}
                            onClick={() => setActiveServer(server.key)}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeServer === server.key ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {server.name}
                        </button>
                    ))}
                </div>
                {officialTrailer && (
                    <button
                        onClick={() => setIsTrailerOpen(true)}
                        className='px-4 py-2 text-sm rounded-md bg-yellow-500 hover:bg-yellow-600 text-black transition-colors'>
                        Watch Trailer
                    </button>
                )}
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
                    <div className="flex space-x-2 border-b border-gray-700 mb-4">
                        {media.seasons.map(season => (
                            <button
                                key={season.id}
                                onClick={() => setActiveSeason(season.season_number)}
                                className={`pb-2 px-4 ${activeSeason === season.season_number ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}>
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
