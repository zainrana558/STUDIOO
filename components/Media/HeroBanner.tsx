"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Media } from '../../types/media';
import { Theme } from '../../lib/themes';
import { Button } from '../UI/Button';

interface HeroBannerProps {
    media: Media;
    theme: Theme;
}

/**
 * A theme-aware hero banner with a parallax scroll effect, optimized with next/image.
 */
export const HeroBanner = ({ media, theme }: HeroBannerProps) => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div className="h-[60vh] md:h-[90vh] w-full relative overflow-hidden" style={{ background: theme.colors.secondary }}>
            <motion.div className="absolute inset-0 z-0" style={{ y }}>
                {media.backdrop_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`}
                        alt={media.title || media.name || 'Hero background'}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900" />
                )}
                <div 
                    className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"
                />
            </motion.div>

            <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12 text-white">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ...theme.motion.bezier }}
                    className={`text-4xl md:text-6xl font-bold mb-4 ${theme.fonts.display}`}
                    style={{ color: theme.colors.primary }}
                >
                    {media.title || media.name}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ...theme.motion.bezier }}
                    className="max-w-3xl text-lg md:text-xl mb-8"
                >
                    {media.overview || ''}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ...theme.motion.bezier }}
                >
                    <Link href={`/${media.media_type ?? 'movie'}/${media.id}`}>
                        <Button theme={theme} size="lg">Watch Now</Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};
