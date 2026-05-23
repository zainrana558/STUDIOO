
export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
}

export interface Season {
  id: number;
  season_number: number;
  episode_count?: number;
  name: string;
  poster_path?: string;
  overview?: string;
}

export interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  overview?: string;
  vote_average?: number;
  genres?: Genre[];
  videos?: { results: Video[] };
  seasons?: Season[];
}

export interface MediaDetails extends Media {
  runtime?: number;
  episode_run_time?: number[];
  status?: string;
  tagline?: string;
  imdb_id?: string;
}

export interface MediaListResponse {
    page: number;
    results: Media[];
    total_pages: number;
    total_results: number;
}

// TMDB API Response Types
export interface TMDBPaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export interface TMDBCredits {
    id: number;
    cast: Array<{
        adult: boolean;
        gender: number;
        id: number;
        known_for_department: string;
        name: string;
        original_name: string;
        popularity: number;
        profile_path: string | null;
        character: string;
        order: number;
    }>;
    crew: Array<{
        adult: boolean;
        gender: number;
        id: number;
        known_for_department: string;
        name: string;
        original_name: string;
        popularity: number;
        profile_path: string | null;
        job: string;
        department: string;
    }>;
}

export interface TMDBErrorResponse {
    status_code: number;
    status_message: string;
    success: boolean;
}
