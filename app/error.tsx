'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[APP_ERROR]', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
                <h2 className="text-3xl font-bold text-red-500 mb-4">Something went wrong!</h2>
                <p className="text-gray-400 mb-6">
                    {error.message || 'An unexpected error occurred'}
                </p>
                <button
                    onClick={() => reset()}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                >
                    Try again
                </button>
                <div className="mt-4">
                    <a href="/" className="text-gray-500 hover:text-white underline">
                        Go home
                    </a>
                </div>
            </div>
        </div>
    );
}