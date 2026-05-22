
import { Media, TMDBErrorResponse } from '../types/media';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const genreMap = {
    anime: { type: 'keyword', id: 210024 },
    cartoon: { type: 'genre', id: 16 },
    horror: { type: 'genre', id: 27 },
    scifi: { type: 'genre', id: [878, 14] },
    cinematic_classic: { type: 'genre', id: 36 },
};

interface TMDBResponse {
    results?: Media[];
    [key: string]: unknown;
}

async function fetchTMDB(endpoint: string, params: string = ''): Promise<Media[] | null> {
    if (!API_KEY) {
        console.error('Error: TMDB_API_KEY is not configured in your environment variables.');
        return null;
    }

    const url = `${BASE_URL}/${endpoint}?${params}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${API_KEY}`
        },
        next: { revalidate: 3600 }
    };

    const res = await fetch(url, options);

    if (!res.ok) {
        const errorData: TMDBErrorResponse = await res.json().catch(() => ({
            status_code: res.status,
            status_message: res.statusText,
            success: false
        }));
        console.error(`Failed to fetch from TMDB: ${errorData.status_message}`);
        return null;
    }

    const data = await res.json() as TMDBResponse;
    return data.results || null;
}

async function fetchTMDBDetail(endpoint: string, params: string = ''): Promise<Media | null> {
    if (!API_KEY) {
        console.error('Error: TMDB_API_KEY is not configured in your environment variables.');
        return null;
    }

    const url = `${BASE_URL}/${endpoint}?${params}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${API_KEY}`
        },
        next: { revalidate: 3600 }
    };

    const res = await fetch(url, options);

    if (!res.ok) {
        const errorData: TMDBErrorResponse = await res.json().catch(() => ({
            status_code: res.status,
            status_message: res.statusText,
            success: false
        }));
        console.error(`Failed to fetch from TMDB: ${errorData.status_message}`);
        return null;
    }

    return await res.json() as Media;
}

export async function getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<Media[]> {
    const data = await fetchTMDB(`trending/${mediaType}/${timeWindow}`);
    return data || [];
}

export async function discoverMedia(
    genreSlug: string,
    mediaType: 'movie' | 'tv' = 'movie',
    sort_by = 'popularity.desc'
): Promise<Media[]> {
    const genreInfo = genreMap[genreSlug as keyof typeof genreMap];
    if (!genreInfo) return [];

    let params = `language=en-US&sort_by=${sort_by}&include_adult=false&include_video=false&page=1`;

    if (genreInfo.type === 'keyword') {
        params += `&with_keywords=${genreInfo.id}`;
    } else {
        const genreIds = Array.isArray(genreInfo.id) ? genreInfo.id.join(',') : String(genreInfo.id);
        params += `&with_genres=${genreIds}`;
    }

    if (genreSlug === 'cartoon' && mediaType === 'movie') {
        params += '&certification_country=US&certification.lte=PG';
    }

    const endpoint = mediaType === 'movie' ? 'discover/movie' : 'discover/tv';
    return await fetchTMDB(endpoint, params) || [];
}

export async function getDiscover(genreSlug: string, sort_by = 'popularity.desc'): Promise<Media[]> {
    return discoverMedia(genreSlug, 'movie', sort_by);
}

export async function getDiscoverMovies(genreSlug: string, sort_by = 'popularity.desc'): Promise<Media[]> {
    return discoverMedia(genreSlug, 'movie', sort_by);
}

export async function getDiscoverTV(genreSlug: string, sort_by = 'popularity.desc'): Promise<Media[]> {
    return discoverMedia(genreSlug, 'tv', sort_by);
}

export async function getMediaDetails(type: 'movie' | 'tv', id: string): Promise<Media | null> {
    const params = 'append_to_response=videos,seasons';
    const media = await fetchTMDBDetail(`${type}/${id}`, params);
    if (!media) return null;
    media.media_type = type;
    return media;
}
