"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Media } from '../../types/media';
import { Theme } from '../../lib/themes';

interface MediaCardProps {
  item: Media;
  theme: Theme;
}

/**
 * A reusable, theme-aware media card.
 * It adapts its visual style and hover animations based on the active genre theme.
 * It is a Client Component designed to receive theme data from a Server Component parent.
 */
export const MediaCard = ({ item, theme }: MediaCardProps) => {
  const imageUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '';
  const mediaType = item.media_type || 'movie';

  const themeOverlayEffects: Record<Theme['id'], string> = {
    anime: 'group-hover:shadow-[0_0_25px_var(--color-accent)] group-hover:border-2 group-hover:border-[var(--color-accent)]',
    cartoon: 'group-hover:scale-110',
    horror: 'before:content-[\'\'] before:absolute before:inset-0 before:bg-black before:opacity-0 group-hover:before:opacity-50 before:transition-opacity before:duration-500',
    scifi: 'group-hover:shadow-[0_0_20px_var(--color-primary)]',
    cinematic_classic: 'group-hover:sepia-[50%] group-hover:saturate-150',
    default: 'group-hover:brightness-110',
  };

  const themeTitleHoverColor: Record<Theme['id'], string> = {
    anime: 'group-hover:text-[var(--color-primary)]',
    cartoon: 'group-hover:text-[var(--color-primary)]',
    horror: 'group-hover:text-[var(--color-primary)]',
    scifi: 'group-hover:text-[var(--color-primary)]',
    cinematic_classic: 'group-hover:text-[var(--color-primary)]',
    default: 'group-hover:text-[var(--color-accent)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...theme.motion.spring, duration: 0.4 }}
    >
      <Link href={`/${mediaType}/${item.id}`} passHref>
        <motion.div
          className={`relative block w-full overflow-hidden group ${theme.styles.card.borderRadius}`}
          whileHover="hover"
          variants={{ hover: { scale: 1.05 } }}
          transition={{ ...theme.motion.spring, duration: 0.3 }}
        >
          <div className={`aspect-[2/3] bg-black/50 ${themeOverlayEffects[theme.id]} transition-all duration-300 ${theme.styles.card.borderRadius}`}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.title || item.name || ''}
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-gray-500 text-xs">No Image</span>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className={`text-white text-base font-bold truncate transition-colors duration-300 ${themeTitleHoverColor[theme.id]} ${theme.fonts.body}`}>
              {item.title || item.name}
            </h3>
            {item.release_date && (
              <p className={`text-gray-400 text-xs ${theme.fonts.body}`}>
                {item.release_date.substring(0, 4)}
              </p>
            )}
          </div>

        </motion.div>
      </Link>
    </motion.div>
  );
};
