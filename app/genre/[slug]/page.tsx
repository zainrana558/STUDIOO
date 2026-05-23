import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { themes, Theme } from '../../../lib/themes';
import { getDiscoverMovies, getDiscoverTV } from '../../../lib/tmdb';
import { HeroBanner } from '../../../components/Media/HeroBanner';
import { MediaRail } from '../../../components/Media/MediaRail';
import { FilmGrain } from '../../../components/Media/FilmGrain';
import { Media } from '../../../types/media';

export const revalidate = 3600;

type GenrePageProps = { params: { slug: string } };

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
    const theme = themes[params.slug as keyof typeof themes];
    if (!theme) return { title: 'Not Found' };
    return {
        title: `${theme.name} — Lumina`,
        description: theme.description,
    };
}

export default async function GenrePage({ params }: GenrePageProps) {
    const { slug } = params;
    const theme: Theme = themes[slug as keyof typeof themes];
    if (!theme) notFound();

    // Fetch genre-specific content in parallel — hero pulls from genre, not global trending
    let moviesByGenre: Media[] = [];
    let tvByGenre: Media[]     = [];

    try {
        [moviesByGenre, tvByGenre] = await Promise.all([
            getDiscoverMovies(slug, 'popularity.desc'),
            getDiscoverTV(slug, 'popularity.desc'),
        ]);
    } catch {
        // TMDB failure — show fallback UI instead of crashing
    }

    // Hero: best rated from genre movies, fallback to TV
    const heroMedia = moviesByGenre.find(m => (m.vote_average ?? 0) > 7 && m.backdrop_path)
        ?? moviesByGenre[0]
        ?? tvByGenre[0]
        ?? null;

    if (heroMedia) heroMedia.media_type = heroMedia.media_type ?? 'movie';

    // Top-rated variants
    let moviesByRating: Media[] = [];
    let tvByRating: Media[]     = [];
    try {
        [moviesByRating, tvByRating] = await Promise.all([
            getDiscoverMovies(slug, 'vote_average.desc'),
            getDiscoverTV(slug, 'vote_average.desc'),
        ]);
    } catch { /* non-critical */ }

    const hasContent = moviesByGenre.length || tvByGenre.length;

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
            {slug === 'horror' && <FilmGrain strength={0.07} opacity={0.15} />}

            {!hasContent ? (
                <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
                    <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.primary }}>
                        No content available right now
                    </h2>
                    <p className="text-gray-400 mb-6">Check back soon or try another genre.</p>
                    <Link href="/" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">
                        Browse genres
                    </Link>
                </div>
            ) : (
                <>
                    {heroMedia && <HeroBanner media={heroMedia} theme={theme} />}

                    <div className="-mt-20 md:-mt-28 relative z-10">
                        {moviesByGenre.length > 0 && (
                            <MediaRail title={`Popular ${theme.name} Movies`} items={moviesByGenre} theme={theme} />
                        )}
                        {tvByGenre.length > 0 && (
                            <MediaRail title={`Popular ${theme.name} TV Shows`} items={tvByGenre} theme={theme} />
                        )}
                        {moviesByRating.length > 0 && (
                            <MediaRail title={`Top Rated ${theme.name} Movies`} items={moviesByRating} theme={theme} />
                        )}
                        {tvByRating.length > 0 && (
                            <MediaRail title={`Top Rated ${theme.name} TV`} items={tvByRating} theme={theme} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
