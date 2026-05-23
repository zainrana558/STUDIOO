import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getMediaDetails } from '../../../lib/tmdb';
import { VideoEmbedPlayer } from '../../../components/Media/VideoEmbedPlayer';
import { WatchlistButton } from '../../../components/Media/WatchlistButton';
import { MediaDetails } from '../../../types/media';

type MediaPageProps = {
    params: { type: 'movie' | 'tv'; id: string };
    searchParams: { s?: string; e?: string };
};

export async function generateMetadata({ params }: MediaPageProps): Promise<Metadata> {
    const { type, id } = params;
    if (type !== 'movie' && type !== 'tv') return { title: 'Lumina' };
    const media = await getMediaDetails(type, id);
    if (!media) return { title: 'Not Found — Lumina' };
    const title = media.title ?? media.name ?? 'Lumina';
    return {
        title: `${title} — Lumina`,
        description: media.overview?.slice(0, 155) ?? `Watch ${title} on Lumina`,
        openGraph: {
            title,
            description: media.overview?.slice(0, 155) ?? '',
            images: media.backdrop_path
                ? [{ url: `https://image.tmdb.org/t/p/w1280${media.backdrop_path}` }]
                : [],
        },
    };
}

export default async function MediaPage({ params, searchParams }: MediaPageProps) {
    const { type, id } = params;

    if (type !== 'movie' && type !== 'tv') notFound();

    const mediaDetails: MediaDetails | null = await getMediaDetails(type, id);
    if (!mediaDetails) notFound();

    const initialSeason = searchParams.s ? parseInt(searchParams.s, 10) : 1;
    const initialEpisode = searchParams.e ? parseInt(searchParams.e, 10) : 1;

    const title = mediaDetails.title ?? mediaDetails.name ?? '';
    const year = (mediaDetails.release_date ?? mediaDetails.first_air_date ?? '').slice(0, 4);

    return (
        <div className="bg-gray-950 min-h-screen text-white pt-16">
            <div className="max-w-6xl mx-auto">
                {/* Title bar */}
                <div className="px-4 py-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {year}{mediaDetails.vote_average ? ` · ★ ${mediaDetails.vote_average.toFixed(1)}` : ''}
                            {type === 'tv' ? ' · TV Series' : ' · Movie'}
                        </p>
                    </div>
                    <WatchlistButton
                        tmdbId={String(mediaDetails.id)}
                        mediaType={type}
                        title={title}
                        posterPath={mediaDetails.poster_path ?? undefined}
                    />
                </div>

                {/* Player */}
                <VideoEmbedPlayer
                    media={mediaDetails}
                    initialSeason={initialSeason}
                    initialEpisode={initialEpisode}
                />

                {/* Overview */}
                {mediaDetails.overview && (
                    <div className="px-4 py-6 max-w-3xl">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Overview</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">{mediaDetails.overview}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
