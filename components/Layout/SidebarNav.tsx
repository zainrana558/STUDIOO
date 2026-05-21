"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Ghost, Rocket, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { name: 'Anime', href: '/genre/anime', icon: Film },
    { name: 'Sci-Fi', href: '/genre/scifi', icon: Rocket },
    { name: 'Horror', href: '/genre/horror', icon: Ghost },
    { name: 'Classic', href: '/genre/cinematic_classic', icon: Home },
];

interface SidebarNavProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

/**
 * A collapsible sidebar navigation for laptop and desktop screens.
 */
export const SidebarNav = ({ isCollapsed, toggleCollapse }: SidebarNavProps) => {
    const pathname = usePathname();

    return (
        <aside className={`hidden md:flex flex-col justify-between fixed top-0 left-0 h-full bg-black/30 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div>
                <div className={`flex items-center justify-center h-20 border-b border-white/10 ${isCollapsed ? 'px-0' : 'pl-6 pr-4'}`}>
                   { !isCollapsed && <Logo /> }
                </div>
                <nav className="mt-4">
                    <ul>
                        {navLinks.map((link) => {
                            const isActive = pathname.startsWith(link.href);
                            return (
                                <li key={link.href} className="px-4 py-1">
                                    <Link href={link.href} className={`flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-[var(--color-primary)] text-black font-bold' : 'text-gray-300 hover:bg-white/10'} ${isCollapsed ? 'justify-center' : ''}`}>
                                        <link.icon className="w-5 h-5 flex-shrink-0" />
                                        <AnimatePresence>
                                            {!isCollapsed && (
                                                <motion.span 
                                                    initial={{ opacity: 0, x: -10 }} 
                                                    animate={{ opacity: 1, x: 0 }} 
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ duration: 0.2, delay: 0.1 }}
                                                    className="whitespace-nowrap"
                                                >
                                                    {link.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
            <div className="border-t border-white/10 p-4">
                <button onClick={toggleCollapse} className="w-full flex items-center gap-4 p-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors duration-200">
                    {isCollapsed ? <ChevronRight className="w-5 h-5 flex-shrink-0" /> : <ChevronLeft className="w-5 h-5 flex-shrink-0" />}
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} exit={{ opacity: 0 }}>
                                Collapse
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </aside>
    );
};
