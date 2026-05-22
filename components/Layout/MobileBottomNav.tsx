"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Ghost, Rocket, Home, Tv, Search } from 'lucide-react';

const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Anime', href: '/genre/anime', icon: Film },
    { name: 'Cartoons', href: '/genre/cartoon', icon: Tv },
    { name: 'Sci-Fi', href: '/genre/scifi', icon: Rocket },
    { name: 'Horror', href: '/genre/horror', icon: Ghost },
    { name: 'Search', href: '/search', icon: Search },
];

export const MobileBottomNav = () => {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-white/10 z-50">
            <div className="flex justify-around items-center h-full px-1">
                {navLinks.map((link) => {
                    const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                    return (
                        <Link
                            href={link.href}
                            key={link.href}
                            className="flex-1 flex justify-center items-center min-h-[48px]"
                            aria-label={link.name}
                        >
                            <div className="flex flex-col items-center gap-0.5">
                                <link.icon
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}
                                    style={isActive ? { color: 'var(--color-primary, white)' } : undefined}
                                />
                                <span
                                    className={`text-[9px] transition-colors ${isActive ? 'font-bold text-white' : 'text-gray-600'}`}
                                    style={isActive ? { color: 'var(--color-primary, white)' } : undefined}
                                >
                                    {link.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
