# Lumina — Architecture Overview

## Request Flow

```
Browser
  │
  ├─ Static assets → Vercel CDN (cached)
  │
  ├─ Page request → Next.js App Router
  │     ├─ middleware.ts        ← CSP headers + session guard (every request)
  │     ├─ Server Components    ← fetch TMDB data server-side (ISR, 1hr cache)
  │     └─ Client Components    ← interactive UI, theme morphing, player
  │
  └─ API calls → /api/*
        ├─ /api/tmdb/           ← TMDB proxy (Redis cached, rate limited)
        ├─ /api/embed/          ← Video provider URL router
        ├─ /api/watchlist/      ← Supabase CRUD (session-validated)
        ├─ /api/continue-watching/ ← Progress tracking (server-validated)
        └─ /api/recommendations/   ← Scoring engine (cached per user, 30min)
```

## Theme Engine

Each genre (`anime`, `cartoon`, `scifi`, `horror`, `cinematic_classic`) maps to a `Theme` object in `lib/themes.ts` containing:
- `colors` — primary, secondary, accent, background
- `fonts` — display font class, body font class
- `motion` — spring physics + cubic bezier for Framer Motion
- `styles` — card border radius

`ThemeProvider` reads the current pathname, looks up the matching theme, and injects CSS custom properties (`--color-primary`, etc.) onto `document.body`. All themed components consume these vars.

## Video Player Security Model

The iframe sandbox uses:
```
allow-forms allow-pointer-lock allow-scripts allow-presentation allow-fullscreen allow-popups
```

`allow-same-origin` is intentionally **excluded** to prevent sandbox escape.  
`postMessage` listeners validate `event.origin` against a whitelist of known provider domains before processing any message.

## Caching Strategy

| Layer | TTL | Fallback |
|---|---|---|
| TMDB search results | 5 min | In-memory |
| TMDB trending | 30 min | In-memory |
| TMDB discover | 1 hour | In-memory |
| TMDB detail pages | 6 hours | In-memory |
| User recommendations | 30 min | Re-compute |
| Next.js ISR (genre pages) | 1 hour | Stale-while-revalidate |
| next/image optimised | 24 hours | Vercel CDN |

## Admin Access

Set `ADMIN_USER_IDS` env var to a comma-separated list of Supabase user UUIDs.  
Admin routes use the `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) and are never exposed client-side.
