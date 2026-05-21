/**
 * External configuration for video streaming providers.
 * Use environment variables to override defaults without code changes.
 */

type ProviderBuilder = (params: { id: string; s?: string; e?: string }) => string;

export interface ProviderConfig {
    name: string;
    key: string;
    buildUrl: ProviderBuilder;
}

const defaultProviders: Record<string, ProviderBuilder> = {
    vidsrc: ({ id, s, e }) => process.env.VIDSRC_URL || `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
    vidsrc_movie: ({ id }) => process.env.VIDSRC_MOVIE_URL || `https://vidsrc.cc/v2/embed/movie/${id}`,
    vidphantom: ({ id, s, e }) => process.env.VIDPHANTOM_URL || `https://vidphantom.com/embed/tv/${id}/${s}/${e}`,
    vidphantom_movie: ({ id }) => process.env.VIDPHANTOM_MOVIE_URL || `https://vidphantom.com/embed/movie/${id}`,
    '2embed': ({ id, s, e }) => process.env.TWOEMBED_URL || `https://www.2embed.cc/embed_tv?id=${id}&s=${s}&e=${e}`,
    '2embed_movie': ({ id }) => process.env.TWOEMBED_MOVIE_URL || `https://www.2embed.cc/embed/${id}`,
    nexstream: ({ id, s, e }) => {
        const apiKey = process.env.NEXSTREAM_API_KEY;
        if (!apiKey) {
            throw new Error('NEXSTREAM_API_KEY is not configured');
        }
        return `${process.env.NEXSTREAM_URL || 'https://nexstream.site'}/embed/tv/${id}/${s}/${e}?signature=${apiKey}&ref=lumina`;
    },
    nexstream_movie: ({ id }) => {
        const apiKey = process.env.NEXSTREAM_API_KEY;
        if (!apiKey) {
            throw new Error('NEXSTREAM_API_KEY is not configured');
        }
        return `${process.env.NEXSTREAM_URL || 'https://nexstream.site'}/embed/movie/${id}?signature=${apiKey}&ref=lumina`;
    },
};

export function getProviderUrl(
    provider: string,
    mediaType: 'movie' | 'tv',
    params: { id: string; s?: string; e?: string }
): string {
    const providerKey = mediaType === 'movie' ? `${provider}_movie` : provider;
    const builder = defaultProviders[providerKey];
    
    if (!builder) {
        throw new Error(`Invalid provider: ${provider}`);
    }
    
    return builder(params);
}

export function getAvailableProviders(): string[] {
    return Object.keys(defaultProviders).filter(k => !k.includes('_movie'));
}

export const providerDisplayNames: Record<string, string> = {
    vidsrc: 'VidSrc',
    nexstream: 'NexStream',
    vidphantom: 'VidPhantom',
    '2embed': '2Embed',
};