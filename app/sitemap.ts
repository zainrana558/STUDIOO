import { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const GENRES = ['anime', 'cartoon', 'scifi', 'horror', 'cinematic_classic'];

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        ...GENRES.map(slug => ({
            url: `${BASE}/genre/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 0.9,
        })),
        { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];
}
