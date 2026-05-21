
/**
 * Provides a theme-aware, shimmering skeleton loader for genre pages.
 * This component is displayed instantly by Next.js while server-side data fetching occurs.
 */
export default function Loading() {
    const SkeletonCard = () => (
        <div className="w-40 h-60 flex-shrink-0 bg-gray-800 rounded-lg animate-pulse" />
    );

    const SkeletonRail = () => (
        <div className="p-4">
            <div className="h-8 w-1/4 bg-gray-700 mb-4 rounded animate-pulse" />
            <div className="flex space-x-4 overflow-hidden">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen w-full">
            {/* Hero Skeleton */}
            <div className="h-[60vh] bg-gray-900 w-full animate-pulse flex items-center justify-center">
                 <div className="w-1/2 h-16 bg-gray-700 rounded animate-pulse" />
            </div>

            {/* Rails Skeleton */}
            <SkeletonRail />
            <SkeletonRail />
            <SkeletonRail />
        </div>
    );
}
