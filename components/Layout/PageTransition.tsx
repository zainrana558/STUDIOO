"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Animation variants for the shutters.
const shutterVariants = {
    // State for when the shutters are closed, covering the screen
    closed: { y: '0%' },
    // State for when the shutters are open, revealing the screen
    open: (isTop: boolean) => ({ y: isTop ? '-100%' : '100%' }),
};

// Animation variants for the page content.
const contentVariants = {
    // Content is invisible when shutters are closed
    hidden: { opacity: 0 },
    // Content fades in as shutters open
    visible: { opacity: 1 },
};

const transition = {
    duration: 0.8,
    ease: [0.76, 0, 0.24, 1] as const
};

/**
 * Provides a "Cinema Shutter" page transition effect.
 * Two panels slide in from the top and bottom to cover the page,
 * then slide out to reveal the new content.
 */
export const PageTransition = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <div key={pathname} className="relative">
                {
                /* 
                  The page content is wrapped in a motion.div to fade it in 
                  after the shutters have started opening.
                */
                }
                <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ ...transition, duration: 0.5, delay: 0.3 }}
                >
                    {children}
                </motion.div>
                
                {
                /*
                  The two shutter divs cover the screen during page transitions.
                  They are controlled by AnimatePresence, animating to 'closed' on exit
                  and from 'closed' to 'open' on enter.
                */
                }
                <motion.div 
                    className="fixed top-0 left-0 w-full h-1/2 bg-[var(--color-secondary)] z-50"
                    custom={true} // isTop = true
                    variants={shutterVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    transition={transition}
                />
                <motion.div 
                    className="fixed bottom-0 left-0 w-full h-1/2 bg-[var(--color-secondary)] z-50"
                    custom={false} // isTop = false
                    variants={shutterVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    transition={transition}
                />
            </div>
        </AnimatePresence>
    );
};
