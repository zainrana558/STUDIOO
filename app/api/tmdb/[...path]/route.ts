
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PATHS = [
  /^search\/multi$/,
  /^trending\/all\/week$/,
  /^movie\/[0-9]+$/,
  /^tv\/[0-9]+$/,
];

async function getRatelimit() {
  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { kv } = await import('@vercel/kv');
    return new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(5, '10s') });
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
          { status: 429, statusText: "Too Many Requests", headers: { "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining), "X-RateLimit-Reset": String(reset) } }
        );
      }
    }
  } catch {
    console.warn("[TMDB_PROXY] Rate limit check failed, allowing request.");
  }

  if (!isAllowed(path)) {
    return NextResponse.json({ message: "This endpoint is not allowed." }, { status: 403, statusText: "Forbidden" });
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    return NextResponse.json({ message: "TMDB API key is not configured." }, { status: 500, statusText: "Internal Server Error" });
  }

  const upstreamParams = new URLSearchParams(searchParams);
  upstreamParams.set("api_key", TMDB_API_KEY);
  const tmdbUrl = `https://api.themoviedb.org/3/${path}?${upstreamParams.toString()}`;

  try {
    const tmdbResponse = await fetch(tmdbUrl, { headers: { "Content-Type": "application/json" } });

    if (!tmdbResponse.ok) {
      const errorBody = await tmdbResponse.json().catch(() => ({ status_code: tmdbResponse.status, status_message: tmdbResponse.statusText }));
      return NextResponse.json(errorBody, { status: tmdbResponse.status, statusText: tmdbResponse.statusText });
    }

    const data = await tmdbResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ message: `Failed to fetch data from TMDB.`, error: message }, { status: 500, statusText: "Internal Server Error" });
  }
}
