"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Ghost, Rocket, Home, ChevronLeft, ChevronRight, Tv, Search, User, Clapperboard } from 'lucide-react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { name: 'Anime',   href: '/genre/anime',             icon: Film       },
    { name: 'Cartoon', href: '/genre/cartoon',           icon: Tv         },
    { name: 'Sci-Fi',  href: '/genre/scifi',             icon: Rocket     },
    { name: 'Horror',  href: '/genre/horror',            icon: Ghost      },
    { name: 'Classic', href: '/genre/cinematic_classic', icon: Clapperboard },
];

const bottomLinks = [
    { name: 'Search',  href: '/search',  icon: Search },
    { name: 'Profile', href: '/profile', icon: User   },
];

interface SidebarNavProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export const SidebarNav = ({ isCollapsed, toggleCollapse }: SidebarNavProps) => {
    const pathname = usePathname();

    const NavLink = ({ link }: { link: { name: string; href: string; icon: React.ElementType } }) => {
        const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
        return (
            <li className="px-3 py-0.5">
                <Link href={link.href}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200
                        ${isActive ? 'bg-[var(--color-primary,#ef4444)] text-black font-bold' : 'text-gray-300 hover:bg-white/10'}
                        ${isCollapsed ? 'justify-center' : ''}`}>
                    <link.icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15, delay: 0.05 }}
                                className="whitespace-nowrap text-sm font-medium">
                                {link.name}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </li>
        );
    };

    return (
        <aside className={`hidden md:flex flex-col justify-between fixed top-0 left-0 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-56'}`}>
            {/* Top: Logo + genre links */}
            <div>
                <div className={`flex items-center h-16 border-b border-white/10 ${isCollapsed ? 'justify-center px-0' : 'pl-5 pr-4'}`}>
                    {!isCollapsed && <Logo />}
                </div>
                <nav className="mt-3">
                    <ul>
                        {navLinks.map(link => <NavLink key={link.href} link={link} />)}
                    </ul>
                </nav>
            </div>

            {/* Bottom: Search, Profile, Collapse */}
            <div>
                <div className="border-t border-white/10 pt-2 pb-1">
                    <ul>
                        {bottomLinks.map(link => <NavLink key={link.href} link={link} />)}
                    </ul>
                </div>
                <div className="border-t border-white/10 p-3">
                    <button onClick={toggleCollapse}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-white/10 transition-colors duration-200">
                        {isCollapsed
                            ? <ChevronRight className="w-5 h-5 flex-shrink-0 mx-auto" />
                            : <><ChevronLeft className="w-5 h-5 flex-shrink-0" /><span className="text-sm">Collapse</span></>
                        }
                    </button>
                </div>
            </div>
        </aside>
    );
};
