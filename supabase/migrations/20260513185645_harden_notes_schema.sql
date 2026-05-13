-- Pin the trigger function's search_path to mitigate search_path hijacking.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Hide tables from the anon GraphQL schema. RLS still governs row access for
-- authenticated users via the Supabase JS client.
revoke select on public.notes from anon;
revoke select on public.article_notes from anon;
revoke select on public.workspaces from anon;
