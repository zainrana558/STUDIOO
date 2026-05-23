
import { NextRequest, NextResponse } from 'next/server';
import { getProviderUrl } from '@/lib/providers';

async function getRatelimit() {
  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { kv } = await import('@vercel/kv');
    return new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(10, '10s') });
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = request.ip ?? '127.0.0.1';

  try {
    const ratelimit = await getRatelimit();
    if (ratelimit) {
      const { success } = await ratelimit.limit(`ratelimit_embed_${ip}`);
      if (!success) {
        return new NextResponse(JSON.stringify({ message: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
      }
    }
  } catch {
    console.warn('[EMBED] Rate limit check failed, allowing request.');
  }

  const { searchParams } = new URL(request.url);
  const mediaType = searchParams.get('media_type');
  const provider = searchParams.get('provider');
  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';
  const { id } = params;

  if (!id || !mediaType || !provider) {
    return new NextResponse('Missing required parameters: id, media_type, provider', { status: 400 });
  }

  if (!/^\d+$/.test(season) || !/^\d+$/.test(episode)) {
    return new NextResponse('Invalid season or episode number', { status: 400 });
  }

  // Graceful degradation: if NexStream key is missing, fall back to vidsrc
  const resolvedProvider = (provider === 'nexstream' && !process.env.NEXSTREAM_API_KEY)
    ? 'vidsrc'
    : provider;

  try {
    const embedUrl = getProviderUrl(resolvedProvider, mediaType as 'movie' | 'tv', { id, s: season, e: episode });
    const redirectResponse = NextResponse.redirect(embedUrl, { status: 307 });
    // Pass NexStream API key as a request header — never in the URL
    if (resolvedProvider === 'nexstream' && process.env.NEXSTREAM_API_KEY) {
      redirectResponse.headers.set('X-API-Key', process.env.NEXSTREAM_API_KEY);
    }
    return redirectResponse;
  } catch (error) {
    console.error(`[EMBED_REDIRECT_ERROR] for provider ${resolvedProvider}:`, error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during URL construction.';
    return new NextResponse(JSON.stringify({ message: 'Failed to construct embed URL.', error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
