"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Media } from "../../types/media";

const SkeletonCard = () => (
    <div className="animate-pulse">
        <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg mb-2" />
        <div className="h-3 bg-gray-800 rounded w-3/4 mb-1" />
        <div className="h-3 bg-gray-800 rounded w-1/3" />
    </div>
);

export default function SearchPage() {
    const [query,   setQuery]   = useState("");
    const [results, setResults] = useState<Media[]>([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef    = useRef<HTMLInputElement>(null);

    // Focus on mount
    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        if (!query.trim()) { setResults([]); setError(false); return; }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            setError(false);
            try {
                const res = await fetch(`/api/tmdb/search/multi?query=${encodeURIComponent(query)}&page=1`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setResults(data.results?.filter((r: Media) => r.media_type === "movie" || r.media_type === "tv") ?? []);
            } catch {
                setError(true);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);
    }, [query]);

    return (
        <main className="min-h-screen bg-gray-950 pt-20 px-4 sm:px-8 pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">Search</h1>

                {/* Search input */}
                <div className="relative mb-8">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search movies & TV shows…"
                        className="w-full max-w-2xl bg-gray-900 text-white border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-base focus:outline-none focus:border-gray-400 transition-colors"
                    />
                    {query && (
                        <button onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xl leading-none">
                            ×
                        </button>
                    )}
                </div>

                {/* Skeleton grid while loading */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
                    <p className="text-red-400 mt-4">Search failed — please try again.</p>
                )}

                {/* Results */}
                {!loading && !error && results.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.map(item => (
                            <Link key={item.id} href={`/${item.media_type}/${item.id}`}>
                                <div className="group cursor-pointer">
                                    {item.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                            alt={item.title ?? item.name ?? ""}
                                            width={342} height={513}
                                            loading="lazy"
                                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
                                            className="rounded-lg w-full object-cover group-hover:opacity-80 transition"
                                        />
                                    ) : (
                                        <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-xs">No Image</div>
                                    )}
                                    <p className="text-white text-sm mt-2 truncate font-medium">{item.title ?? item.name}</p>
                                    <p className="text-gray-500 text-xs capitalize">{item.media_type}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && query.trim() && results.length === 0 && (
                    <div className="text-center mt-16">
                        <p className="text-gray-500 text-lg">No results for &ldquo;{query}&rdquo;</p>
                        <p className="text-gray-600 text-sm mt-2">Try a different title or spelling.</p>
                    </div>
                )}

                {/* Idle state */}
                {!query.trim() && (
                    <div className="text-center mt-16">
                        <p className="text-gray-600 text-4xl mb-4">🎬</p>
                        <p className="text-gray-500">Type to search for movies and TV shows.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
