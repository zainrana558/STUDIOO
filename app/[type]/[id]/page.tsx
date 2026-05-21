
import { notFound } from 'next/navigation';
import { getMediaDetails } from '../../../lib/tmdb';
import { VideoEmbedPlayer } from '../../../components/Media/VideoEmbedPlayer';
import { WatchlistButton } from '../../../components/Media/WatchlistButton';
import { MediaDetails } from '../../../types/media';

type MediaPageProps = {
    params: { 
        type: 'movie' | 'tv';
        id: string;
     };
};

export default async function MediaPage({ params }: MediaPageProps) {
    const { type, id } = params;

    if (type !== 'movie' && type !== 'tv') {
        notFound();
    }

    const mediaDetails: MediaDetails | null = await getMediaDetails(type, id);

    if (!mediaDetails) {
        notFound();
    }

    return (
        <div className="bg-black min-h-screen text-white">
            <VideoEmbedPlayer media={mediaDetails} />
            <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                <WatchlistButton
                    tmdbId={String(mediaDetails.id)}
                    mediaType={type}
                    title={mediaDetails.title ?? mediaDetails.name ?? ''}
                    posterPath={mediaDetails.poster_path ?? undefined}
                />
            </div>
        </div>
    );
}
