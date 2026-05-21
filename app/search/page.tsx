"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Media } from "../../types/media";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search/multi?query=${encodeURIComponent(query)}&page=1`);
        const data = await res.json();
        setResults(data.results?.filter((r: Media) => r.media_type === "movie" || r.media_type === "tv") ?? []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  }, [query]);

  return (
    <main className="min-h-screen bg-black pt-24 px-4 sm:px-8">
      <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
      <input
        autoFocus
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies & TV shows..."
        className="w-full max-w-2xl bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-white mb-8"
      />
      {loading && <p className="text-gray-400">Searching…</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((item) => (
          <Link key={item.id} href={`/${item.media_type}/${item.id}`}>
            <div className="group cursor-pointer">
              {item.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                  alt={item.title ?? item.name ?? ""}
                  width={342} height={513}
                  className="rounded-lg w-full object-cover group-hover:opacity-80 transition"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-sm">No Image</div>
              )}
              <p className="text-white text-sm mt-2 truncate">{item.title ?? item.name}</p>
              <p className="text-gray-400 text-xs capitalize">{item.media_type}</p>
            </div>
          </Link>
        ))}
      </div>
      {!loading && query && results.length === 0 && (
        <p className="text-gray-500 mt-8">No results for "{query}"</p>
      )}
    </main>
  );
}
