
import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";

const ALLOWED_PATHS = [
  /^search\/multi$/,
  /^trending\/all\/week$/,
  /^movie\/[0-9]+$/,
  /^tv\/[0-9]+$/,
  /^discover\/movie$/,
  /^discover\/tv$/,
];

// TTLs in seconds per endpoint type
function getTTL(path: string): number {
  if (path.startsWith('search/')) return 60 * 5;         // 5 min
  if (path.startsWith('trending/')) return 60 * 30;      // 30 min
  if (path.startsWith('discover/')) return 60 * 60;      // 1 hour
  return 60 * 60 * 6;                                    // 6 hours for detail pages
}

async function getRatelimit() {
  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });
    return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '10s') });
  } catch {
    return null;
  }
}

function isAllowed(path: string) {
  return ALLOWED_PATHS.some((regex) => regex.test(path));
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const { searchParams } = new URL(request.url);
  const ip = request.ip ?? "127.0.0.1";

  try {
    const ratelimit = await getRatelimit();
    if (ratelimit) {
      const { success, limit, remaining, reset } = await ratelimit.limit(`ratelimit_tmdb_${ip}`);
      if (!success) {
        return NextResponse.json(
          { message: "Too many requests. Please try again later." },
          { status: 429, headers: { "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining), "X-RateLimit-Reset": String(reset) } }
        );
      }
    }
  } catch {
    console.warn("[TMDB_PROXY] Rate limit check failed, allowing request.");
  }

  if (!isAllowed(path)) {
    return NextResponse.json({ message: "This endpoint is not allowed." }, { status: 403 });
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    return NextResponse.json({ message: "TMDB API key is not configured." }, { status: 500 });
  }

  // Build cache key from path + query params (excluding api_key)
  const cacheKey = `tmdb:${path}:${searchParams.toString()}`;

  // Try cache first
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  const upstreamParams = new URLSearchParams(searchParams);
  upstreamParams.set("api_key", TMDB_API_KEY);
  const tmdbUrl = `https://api.themoviedb.org/3/${path}?${upstreamParams.toString()}`;

  try {
    const tmdbResponse = await fetch(tmdbUrl, { headers: { "Content-Type": "application/json" } });

    if (!tmdbResponse.ok) {
      const errorBody = await tmdbResponse.json().catch(() => ({ status_code: tmdbResponse.status, status_message: tmdbResponse.statusText }));
      return NextResponse.json(errorBody, { status: tmdbResponse.status });
    }

    const data = await tmdbResponse.json();

    // Store in cache
    await cacheSet(cacheKey, data, getTTL(path));

    return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ message: "Failed to fetch data from TMDB.", error: message }, { status: 500 });
  }
}
