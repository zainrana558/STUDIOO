import { themes } from '../../../lib/themes';

// Next.js passes params to loading.tsx via the segment folder name
// We read the slug from the URL pathname at build time isn't possible,
// so we use CSS vars already set by the layout instead.
const SkeletonCard = () => (
    <div className="w-40 h-60 flex-shrink-0 rounded-lg animate-pulse" style={{ background: 'color-mix(in srgb, var(--color-primary, #374151) 15%, #111)' }} />
);

const SkeletonRail = () => (
    <div className="py-8 px-8">
        <div className="h-7 w-48 mb-4 rounded animate-pulse" style={{ background: 'color-mix(in srgb, var(--color-primary, #374151) 20%, #111)' }} />
        <div className="flex space-x-4 overflow-hidden">
            {[...Array(7)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
    </div>
);

export default function Loading() {
    return (
        <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--color-secondary, #0f172a)' }}>
            {/* Hero Skeleton */}
            <div className="h-[60vh] md:h-[90vh] w-full animate-pulse flex flex-col justify-end p-8 md:p-12"
                style={{ background: 'linear-gradient(to top, var(--color-secondary, #0f172a), color-mix(in srgb, var(--color-secondary, #0f172a) 60%, transparent))' }}>
                <div className="h-10 w-2/3 md:w-1/3 rounded mb-4 animate-pulse"
                    style={{ background: 'color-mix(in srgb, var(--color-primary, #374151) 30%, #111)' }} />
                <div className="h-4 w-full max-w-xl rounded mb-2 animate-pulse"
                    style={{ background: 'color-mix(in srgb, var(--color-primary, #374151) 15%, #111)' }} />
                <div className="h-4 w-2/3 max-w-md rounded mb-6 animate-pulse"
                    style={{ background: 'color-mix(in srgb, var(--color-primary, #374151) 15%, #111)' }} />
                <div className="h-12 w-36 rounded-lg animate-pulse"
                    style={{ background: 'color-mix(in srgb, var(--color-primary, #374151) 40%, #111)' }} />
            </div>
            <div className="-mt-24 relative z-10">
                <SkeletonRail />
                <SkeletonRail />
                <SkeletonRail />
            </div>
        </div>
    );
}
