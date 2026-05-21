
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { themes, Theme } from '../../../lib/themes';
import { getTrending, getDiscoverMovies, getDiscoverTV } from '../../../lib/tmdb';
import { HeroBanner } from '../../../components/Media/HeroBanner';
import { MediaRail } from '../../../components/Media/MediaRail';
import { FilmGrain } from '../../../components/Media/FilmGrain';

// Re-generate this page on-demand, but cache for an hour to keep it fast
export const revalidate = 3600; // 1 hour

type GenrePageProps = {
    params: { slug: string };
};

/**
 * A dynamic page for each genre, using Server Components and ISR.
 * Fetches data from TMDB and renders it with a theme-specific UI.
 */
export default async function GenrePage({ params }: GenrePageProps) {
    const { slug } = params;
    const theme: Theme = themes[slug as keyof typeof themes];

    if (!theme) {
        notFound(); // Return a 404 if the genre doesn't exist
    }

    // Fetch all necessary data in parallel for performance.
    const [trendingMovies, trendingTV, moviesByGenre, tvByGenre] = await Promise.all([
        getTrending('movie'),
        getTrending('tv'),
        getDiscoverMovies(slug, 'popularity.desc'),
        getDiscoverTV(slug, 'popularity.desc')
    ]);

    const heroMedia = trendingMovies?.[0] || moviesByGenre?.[0];

    // Handle case where no content is available
    const hasContent = trendingMovies?.length || moviesByGenre?.length || trendingTV?.length || tvByGenre?.length;

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme?.colors?.background || '#0f172a' }}>
            {!hasContent && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                    <h2 className="text-3xl font-bold mb-4" style={{ color: theme?.colors?.primary || '#ef4444' }}>
                        No content available
                    </h2>
                    <p className="text-gray-400 mb-6">
                        We couldn&apos;t find any content for this genre right now.
                    </p>
                    <Link href="/" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                        Browse other genres
                    </Link>
                </div>
            )}

            {hasContent && (
                <>
                    {slug === 'horror' && <FilmGrain strength={0.07} opacity={0.15} />}

                    {heroMedia && (
                        <HeroBanner 
                            media={heroMedia} 
                            theme={theme} 
                        />
                    )}
                    
                    {/* Offset the main content to overlap with the hero banner */}
                    <div className="-mt-24 md:-mt-32 relative z-10">
                        {trendingMovies && <MediaRail title={`Trending Movies`} items={trendingMovies} theme={theme} />}
                        {trendingTV && <MediaRail title={`Trending TV Shows`} items={trendingTV} theme={theme} />}
                        {moviesByGenre && <MediaRail title={`New ${theme?.name} Movies`} items={moviesByGenre} theme={theme} />}
                        {tvByGenre && <MediaRail title={`New ${theme?.name} TV Shows`} items={tvByGenre} theme={theme} />}
                    </div>
                </>
            )}
        </div>
    );
}
