-- Backfill per-note rows from the legacy `workspaces.notes jsonb` blob.
-- Idempotent: on conflict (user_id, client_id) do nothing.

insert into public.notes (
  user_id,
  client_id,
  title,
  body_text,
  body_html,
  folder,
  tags,
  favorite,
  archived,
  created_at,
  updated_at
)
select
  w.user_id,
  coalesce(note->>'id', gen_random_uuid()::text) as client_id,
  coalesce(note->>'title', '') as title,
  coalesce(note->>'body', '') as body_text,
  coalesce(note->>'bodyHtml', '') as body_html,
  coalesce(note->>'folder', 'כללי') as folder,
  coalesce(
    array(select jsonb_array_elements_text(case
      when jsonb_typeof(note->'tags') = 'array' then note->'tags'
      else '[]'::jsonb
    end)),
    '{}'::text[]
  ) as tags,
  coalesce((note->>'favorite')::boolean, false) as favorite,
  coalesce((note->>'archived')::boolean, false) as archived,
  coalesce((note->>'createdAt')::timestamptz, now()) as created_at,
  coalesce((note->>'updatedAt')::timestamptz, now()) as updated_at
from public.workspaces w
cross join lateral jsonb_array_elements(w.notes) as note
where jsonb_typeof(w.notes) = 'array'
on conflict (user_id, client_id) do nothing;

insert into public.article_notes (
  note_id,
  user_id,
  client_id,
  text,
  done,
  created_at,
  updated_at
)
select
  n.id as note_id,
  w.user_id,
  coalesce(article->>'id', gen_random_uuid()::text) as client_id,
  coalesce(article->>'text', '') as text,
  coalesce((article->>'done')::boolean, false) as done,
  coalesce((article->>'createdAt')::timestamptz, now()) as created_at,
  coalesce((article->>'updatedAt')::timestamptz, now()) as updated_at
from public.workspaces w
cross join lateral jsonb_array_elements(w.notes) as note
cross join lateral jsonb_array_elements(case
  when jsonb_typeof(note->'articleNotes') = 'array' then note->'articleNotes'
  else '[]'::jsonb
end) as article
join public.notes n on n.user_id = w.user_id and n.client_id = note->>'id'
where jsonb_typeof(w.notes) = 'array'
on conflict (user_id, client_id) do nothing;
