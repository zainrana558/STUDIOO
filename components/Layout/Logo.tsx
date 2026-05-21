"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Magnetic } from './Magnetic';

const pathVariants = {
    hidden: { pathLength: 0 },
    visible: { pathLength: 1 },
};

/**
 * The main Lumina logo. Inline SVG for theme-aware color morphing and animation.
 */
export const Logo = () => {
    return (
        <Magnetic>
            <Link href="/" aria-label="Home">
                <motion.svg
                    width="120"
                    height="40"
                    viewBox="0 0 120 40"
                    initial="hidden"
                    animate="visible"
                    className="cursor-pointer"
                >
                    {/* The "L" shape */}
                    <motion.path
                        d="M 10 10 L 10 30 L 30 30"
                        stroke="var(--color-primary, #00FF66)"
                        strokeWidth="3"
                        fill="none"
                        variants={pathVariants}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                    {/* The text "LUMINA" */}
                    <text x="35" y="28" fontFamily="Orbitron, sans-serif" fontSize="20" fill="var(--color-accent, #7000FF)" fontWeight="bold">
                        LUMINA
                    </text>
                </motion.svg>
            </Link>
        </Magnetic>
    );
};
