'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[GENRE_ERROR]', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
                <h2 className="text-3xl font-bold text-red-500 mb-4">Genre not found</h2>
                <p className="text-gray-400 mb-6">
                    {error.message || 'This genre does not exist'}
                </p>
                <button
                    onClick={() => reset()}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer mr-4"
                >
                    Try again
                </button>
                <Link href="/" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    Go home
                </Link>
            </div>
        </div>
    );
}