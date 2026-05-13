-- Apply only AFTER the per-note schema is live, backfill ran, and no clients
-- still read from the legacy workspace blob (post PR4 cutover).

do $$
begin
  if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'workspaces') then
    alter publication supabase_realtime drop table public.workspaces;
  end if;
end$$;

drop table if exists public.workspaces cascade;
