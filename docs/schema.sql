-- ══════════════════════════════════════════════════════════════════════════════
-- Lumina — Supabase Database Schema
-- Run this entire file in Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Profiles ──────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- ── Watchlists ────────────────────────────────────────────────────────────────
create table if not exists watchlists (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  tmdb_id     text not null,
  media_type  text not null check (media_type in ('movie', 'tv')),
  title       text not null,
  poster_path text,
  added_at    timestamptz default now(),
  unique(user_id, tmdb_id)
);

-- ── Continue Watching ─────────────────────────────────────────────────────────
create table if not exists continue_watching (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users on delete cascade not null,
  tmdb_id          text not null,
  media_type       text not null check (media_type in ('movie', 'tv')),
  title            text not null,
  poster_path      text,
  progress_seconds integer default 0 check (progress_seconds >= 0),
  duration_seconds integer default 0 check (duration_seconds >= 0),
  season_number    integer check (season_number > 0),
  episode_number   integer check (episode_number > 0),
  episode_title    text,
  updated_at       timestamptz default now(),
  unique(user_id, tmdb_id, media_type)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table profiles         enable row level security;
alter table watchlists        enable row level security;
alter table continue_watching enable row level security;

create policy "Users manage own profile"
  on profiles for all using (auth.uid() = id);

create policy "Users manage own watchlist"
  on watchlists for all using (auth.uid() = user_id);

create policy "Users manage own history"
  on continue_watching for all using (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists watchlists_user_id_idx        on watchlists(user_id);
create index if not exists continue_watching_user_id_idx on continue_watching(user_id);
create index if not exists continue_watching_updated_idx on continue_watching(updated_at desc);

-- ── Auto-create profile on signup ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
