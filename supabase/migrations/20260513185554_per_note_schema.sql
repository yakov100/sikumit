-- Per-note schema: one row per note instead of a single jsonb blob per user.
-- Adds optimistic-concurrency via `version`, soft delete via `deleted_at`,
-- idempotency via (user_id, client_id) and Realtime support.

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  title text not null default '',
  body_text text not null default '',
  body_html text not null default '',
  folder text not null default 'כללי',
  tags text[] not null default '{}',
  favorite boolean not null default false,
  archived boolean not null default false,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint notes_user_client_unique unique (user_id, client_id)
);

create index if not exists notes_user_updated_idx
  on public.notes (user_id, updated_at desc)
  where deleted_at is null;

create index if not exists notes_tags_idx
  on public.notes using gin (tags);

create table if not exists public.article_notes (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint article_notes_user_client_unique unique (user_id, client_id)
);

create index if not exists article_notes_note_idx on public.article_notes (note_id);

-- RLS

alter table public.notes enable row level security;
alter table public.article_notes enable row level security;

drop policy if exists "notes select own" on public.notes;
create policy "notes select own" on public.notes
  for select using (auth.uid() = user_id);

drop policy if exists "notes insert own" on public.notes;
create policy "notes insert own" on public.notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "notes update own" on public.notes;
create policy "notes update own" on public.notes
  for update using (auth.uid() = user_id);

drop policy if exists "notes delete own" on public.notes;
create policy "notes delete own" on public.notes
  for delete using (auth.uid() = user_id);

drop policy if exists "article_notes select own" on public.article_notes;
create policy "article_notes select own" on public.article_notes
  for select using (auth.uid() = user_id);

drop policy if exists "article_notes insert own" on public.article_notes;
create policy "article_notes insert own" on public.article_notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "article_notes update own" on public.article_notes;
create policy "article_notes update own" on public.article_notes
  for update using (auth.uid() = user_id);

drop policy if exists "article_notes delete own" on public.article_notes;
create policy "article_notes delete own" on public.article_notes
  for delete using (auth.uid() = user_id);

-- Auto-update updated_at

create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists notes_touch_updated_at on public.notes;
create trigger notes_touch_updated_at
  before update on public.notes
  for each row execute function public.touch_updated_at();

drop trigger if exists article_notes_touch_updated_at on public.article_notes;
create trigger article_notes_touch_updated_at
  before update on public.article_notes
  for each row execute function public.touch_updated_at();

-- Realtime
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.notes;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.article_notes;
    exception when duplicate_object then null;
    end;
  end if;
end$$;
