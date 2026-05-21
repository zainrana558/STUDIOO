"use client";

import { motion } from 'framer-motion';
import { Media } from '../../types/media';
import { Theme } from '../../lib/themes';
import { MediaCard } from './MediaCard';

interface MediaRailProps {
    title: string;
    items: Media[];
    theme: Theme;
}

/**
 * A horizontal, scrollable rail for displaying a list of media with a staggered animation effect.
 */
export const MediaRail = ({ title, items, theme }: MediaRailProps) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Animate each card with a 0.1s delay
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 }, // Start transparent and slightly down
        visible: { opacity: 1, y: 0 },   // End opaque and at original position
    };

    return (
        <div className="py-8">
            <h2 className={`text-2xl font-bold px-8 mb-4 ${theme.fonts.display}`} style={{ color: theme.colors.primary }}>{title}</h2>
            <div className="overflow-x-auto pb-4 scrollbar-hide">
                <motion.div
                    className="flex space-x-4 px-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            className="w-40 md:w-48 flex-shrink-0"
                            variants={itemVariants} // Apply the item animation
                        >
                            <MediaCard item={item} theme={theme} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};
