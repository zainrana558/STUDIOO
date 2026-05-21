"use client";

import { Logo } from './Logo';
import { Magnetic } from './Magnetic';
import Link from 'next/link';

const navLinks = [
    { name: 'Anime', href: '/genre/anime' },
    { name: 'Cartoons', href: '/genre/cartoon' },
    { name: 'Sci-Fi', href: '/genre/scifi' },
    { name: 'Horror', href: '/genre/horror' },
    { name: 'Classic Cinema', href: '/genre/cinematic_classic' },
];

export const Navbar = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-transparent">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <Logo />
                <div className="flex items-center gap-4">
                    {navLinks.map((link) => (
                        <Magnetic key={link.href}>
                            <Link href={link.href} className="px-3 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors duration-300">
                                {link.name}
                            </Link>
                        </Magnetic>
                    ))}
                    <Magnetic>
                        <Link href="/search" className="px-3 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors duration-300" aria-label="Search">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                        </Link>
                    </Magnetic>
                    <Magnetic>
                        <Link href="/profile" className="px-3 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors duration-300" aria-label="Profile">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A10.97 10.97 0 0 1 12 15c2.59 0 4.973.899 6.879 2.386M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                            </svg>
                        </Link>
                    </Magnetic>
                    <Magnetic>
                        <Link href="/admin" className="px-3 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors duration-300" aria-label="Admin">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>
                    </Magnetic>
                </div>
            </nav>
        </header>
    );
};
