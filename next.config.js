/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'image.tmdb.org',          pathname: '/**' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 86400,       // Cache optimized images for 24h
        deviceSizes: [320, 480, 640, 750, 1080],
        imageSizes: [64, 128, 192, 256, 342],
    },
    // Reduce bundle: only include used locales
    i18n: undefined,
    // Compress responses
    compress: true,
    // Strict mode catches double-render issues early
    reactStrictMode: true,
    experimental: {
        // Optimize package imports to reduce bundle size
        optimizePackageImports: ['framer-motion', 'lucide-react'],
    },
};

module.exports = nextConfig;
