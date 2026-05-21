'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Theme } from '../lib/themes';

interface GenreSelectorProps {
    themes: Record<string, Theme>;
}

/**
 * A client component that displays a grid of genres for the user to select.
 * Uses Framer Motion for engaging hover animations.
 */
export const GenreSelector = ({ themes }: GenreSelectorProps) => {
    const variants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.2 },
        },
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-2 text-center">Welcome to Lumina</h1>
            <p className="text-lg md:text-xl text-gray-400 mb-12 text-center">Select a genre to begin your cinematic journey.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.values(themes).map((theme) => (
                    <motion.div key={theme.id} variants={variants} whileHover="hover">
                        <Link href={`/genre/${theme.id}`} passHref>
                            <div 
                                className="block p-8 rounded-lg text-center transition-shadow duration-300 shadow-lg cursor-pointer h-full"
                                style={{ 
                                    backgroundColor: theme.colors.primary,
                                    color: theme.colors.background,
                                    boxShadow: `0 10px 25px -5px ${theme.colors.primary}40` // Softer shadow with theme color
                                }}
                            >
                                <span className="text-5xl mb-4 block">{theme.emoji}</span>
                                <h2 className={`text-3xl font-bold ${theme.fonts.display}`}>{theme.name}</h2>
                                <p className={`mt-2 ${theme.fonts.body}`}>{theme.description}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
