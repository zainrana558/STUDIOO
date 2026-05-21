'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[GLOBAL_ERROR]', error);
    }, [error]);

    return (
        <html lang="en">
            <body className="bg-gray-950 text-white min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h2 className="text-3xl font-bold text-red-500 mb-4">Something went wrong!</h2>
                    <p className="text-gray-400 mb-6">
                        {error.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}