"use client";

import { useRef } from 'react';
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

export const HeroBanner = ({ media, theme }: HeroBannerProps) => {
    // Scope scroll to the banner element only — not the whole page
    // Prevents expensive global scroll listener on every frame
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    const title   = media.title ?? media.name ?? '';
    const mediaType = media.media_type ?? 'movie';

    return (
        <div ref={ref} className="h-[60vh] md:h-[85vh] w-full relative overflow-hidden"
            style={{ background: theme.colors.secondary }}>

            {/* Parallax backdrop — scoped scroll */}
            <motion.div className="absolute inset-0 z-0 will-change-transform" style={{ y }}>
                {media.backdrop_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w1280${media.backdrop_path}`}
                        alt={title}
                        fill
                        priority
                        sizes="100vw"
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
                    />
                ) : (
                    <div className="w-full h-full" style={{ background: theme.colors.background }} />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${theme.colors.secondary} 0%, ${theme.colors.secondary}80 40%, transparent 100%)` }} />
            </motion.div>

            {/* Text content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-12 text-white max-w-4xl">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: theme.motion.bezier }}
                    className={`text-3xl md:text-6xl font-bold mb-3 leading-tight font-sans`}
                    style={{ color: theme.colors.primary }}>
                    {title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: theme.motion.bezier }}
                    className="text-sm md:text-base text-gray-200 mb-6 line-clamp-3 max-w-2xl leading-relaxed">
                    {media.overview ?? ''}
                </motion.p>
                <motion.div className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: theme.motion.bezier }}>
                    <Link href={`/${mediaType}/${media.id}`}>
                        <Button theme={theme} size="lg">▶ Watch Now</Button>
                    </Link>
                    {media.vote_average && media.vote_average > 0 && (
                        <span className="text-sm text-gray-300 bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm">
                            ★ {media.vote_average.toFixed(1)}
                        </span>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
