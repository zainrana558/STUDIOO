"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Ghost, Rocket, Home } from 'lucide-react';
import { Magnetic } from './Magnetic';

const navLinks = [
    { name: 'Anime', href: '/genre/anime', icon: Film },
    { name: 'Sci-Fi', href: '/genre/scifi', icon: Rocket },
    { name: 'Horror', href: '/genre/horror', icon: Ghost },
    { name: 'Classic', href: '/genre/cinematic_classic', icon: Home },
];

/**
 * A touch-optimized, sticky bottom navigation bar for mobile devices.
 * It is hidden on medium and larger screens.
 */
export const MobileBottomNav = () => {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-lg border-t border-white/10 z-50">
            <div className="flex justify-around items-center h-full">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link href={link.href} key={link.href} className="flex-1 flex justify-center items-center">
                            <Magnetic>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <link.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400'}`} />
                                    <span className={`text-[10px] transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-500'} ${isActive ? 'font-bold' : 'font-normal'}`}>
                                        {link.name}
                                    </span>
                                </div>
                            </Magnetic>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
