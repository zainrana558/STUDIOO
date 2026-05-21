"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalWatchlistItems: number;
  totalWatchHistory: number;
}

interface MediaItem {
  tmdb_id?: string;
  id?: string | number;
  title: string;
  media_type: string;
  poster_path?: string;
  count?: number;
}

interface AdminData {
  stats: Stats;
  topWatched: MediaItem[];
  topWatchlisted: MediaItem[];
}

interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
}

type Tab = 'overview' | 'users';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}

function MediaRow({ item }: { item: MediaItem }) {
  const id = item.tmdb_id ?? item.id;
  return (
    <Link href={`/${item.media_type}/${id}`} className="flex items-center gap-3 hover:bg-gray-800 px-3 py-2 rounded-lg transition">
      {item.poster_path ? (
        <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} width={36} height={54} className="rounded object-cover" />
      ) : (
        <div className="w-9 h-14 bg-gray-700 rounded" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{item.title}</p>
        <p className="text-gray-500 text-xs capitalize">{item.media_type}</p>
      </div>
      {item.count && <span className="text-gray-400 text-xs">{item.count}x</span>}
    </Link>
  );
}

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<AdminData | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load stats'); setLoading(false); });
  }, []);

  useEffect(() => {
    if (tab === 'users' && users.length === 0) {
      fetch('/api/admin/users')
        .then(r => r.json())
        .then(setUsers)
        .catch(() => {});
    }
  }, [tab, users.length]);

  if (loading) return (
    <main className="min-h-screen bg-black text-white pt-24 px-8 flex items-center justify-center">
      <p className="text-gray-400">Loading dashboard…</p>
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-black text-white pt-24 px-8">
      <p className="text-red-400">{error}</p>
    </main>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Lumina platform overview</p>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition">← Back to site</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.id ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <StatCard label="Total Users" value={data.stats.totalUsers} />
              <StatCard label="Watchlist Items" value={data.stats.totalWatchlistItems} />
              <StatCard label="Watch History Entries" value={data.stats.totalWatchHistory} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top Watched */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-bold mb-4">Recently Watched</h2>
                <div className="space-y-1">
                  {data.topWatched.length === 0
                    ? <p className="text-gray-500 text-sm">No data yet</p>
                    : data.topWatched.map((item, i) => <MediaRow key={i} item={item} />)
                  }
                </div>
              </div>

              {/* Top Watchlisted */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-bold mb-4">Most Watchlisted</h2>
                <div className="space-y-1">
                  {data.topWatchlisted.length === 0
                    ? <p className="text-gray-500 text-sm">No data yet</p>
                    : data.topWatchlisted.map((item, i) => <MediaRow key={i} item={item} />)
                  }
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'users' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-gray-500 text-center">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 flex items-center gap-3">
                      {u.avatar_url ? (
                        <Image src={u.avatar_url} alt={u.username ?? 'User'} width={32} height={32} className="rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                          {(u.username ?? 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-white">{u.username ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{u.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-gray-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
