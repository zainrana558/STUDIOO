# Lumina — Streaming Platform

A full-stack streaming web app with a dynamic theme engine, Supabase backend, and sandboxed multi-provider video player.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase (PostgreSQL)

---

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
```

---

## Project Structure

```
├── app/                        # Next.js App Router pages & API routes
│   ├── [type]/[id]/            # Movie/TV detail & player page
│   ├── admin/                  # Admin dashboard (role-protected)
│   ├── api/
│   │   ├── admin/              # Admin stats & user management
│   │   ├── continue-watching/  # Playback progress CRUD
│   │   ├── embed/[id]/         # Video embed proxy & server switcher
│   │   ├── recommendations/    # Personalised recommendations engine
│   │   ├── tmdb/               # Cached TMDB API proxy
│   │   └── watchlist/          # Watchlist CRUD + single-item check
│   ├── auth/callback/          # Supabase OAuth callback handler
│   ├── genre/[slug]/           # Genre browse page (ISR, theme-aware)
│   ├── login/                  # Auth page
│   ├── profile/                # User profile, history, watchlist
│   ├── search/                 # Debounced full-text search
│   ├── layout.tsx              # Root layout, fonts, providers
│   ├── robots.ts               # SEO: crawler rules
│   └── sitemap.ts              # SEO: auto-generated sitemap
│
├── components/
│   ├── Admin/                  # AdminDashboard
│   ├── Auth/                   # LoginCard, ProfileClient
│   ├── Genre/                  # GenreSelector (homepage grid)
│   ├── Layout/                 # Navbar, SidebarNav, MobileBottomNav,
│   │                           # ResponsiveLayout, PageTransition, Logo, Magnetic
│   ├── Media/                  # HeroBanner, MediaCard, MediaGrid,
│   │                           # MediaRail, VideoEmbedPlayer, WatchlistButton,
│   │                           # FilmGrain
│   ├── providers/              # ThemeProvider (global CSS var injection)
│   └── UI/                     # Button (theme-aware primitive)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser-side Supabase client
│   │   └── server.ts           # Server-side Supabase client (SSR cookies)
│   ├── cache.ts                # Redis (Upstash) + in-memory LRU fallback
│   ├── database.ts             # All Supabase table queries (typed)
│   ├── providers.ts            # Video embed URL builders per provider
│   ├── recommendations.ts      # Scoring engine: history × TMDB recs
│   ├── themes.ts               # Theme definitions (colors, fonts, motion)
│   └── tmdb.ts                 # TMDB API helpers (discover, detail, search)
│
├── types/
│   └── media.ts                # Shared TypeScript interfaces (Media, MediaDetails)
│
├── styles/
│   └── globals.css             # Tailwind base + global CSS vars
│
├── public/                     # Static assets (favicon, og-image)
├── middleware.ts               # Auth session guard + CSP headers
├── next.config.js              # Image domains, bundle optimisation
├── tailwind.config.ts          # Font families, scrollbar-hide plugin
└── tsconfig.json               # Path aliases (@/ → root)
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (admin routes only) |
| `TMDB_API_KEY` | ✅ | TMDB v4 bearer token |
| `NEXSTREAM_API_KEY` | ✅ | NexStream embed key |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your production domain (e.g. `https://lumina.vercel.app`) |
| `ADMIN_USER_IDS` | ✅ | Comma-separated Supabase user UUIDs for admin access |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis URL (falls back to in-memory cache) |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis token |

---

## Key Features

| Feature | Where |
|---|---|
| Dynamic theme engine (5 genres) | `lib/themes.ts` + `components/providers/ThemeProvider.tsx` |
| Multi-provider sandboxed player | `components/Media/VideoEmbedPlayer.tsx` |
| Playback progress tracking | `app/api/continue-watching/` + Supabase |
| Personalised recommendations | `lib/recommendations.ts` + `app/api/recommendations/` |
| Redis-cached TMDB proxy | `app/api/tmdb/` + `lib/cache.ts` |
| Admin dashboard | `app/admin/` + `app/api/admin/` |
| Server-validated API routes | All POST routes in `app/api/` |
| Session-protected middleware | `middleware.ts` |

---

## Database Setup

Run the SQL in `docs/schema.sql` inside your Supabase SQL Editor before first use.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Add all environment variables from the table above
4. Add `https://your-domain.vercel.app/auth/callback` in Supabase → Auth → URL Configuration
5. Deploy
