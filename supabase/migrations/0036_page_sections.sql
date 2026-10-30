-- ===========================================================================
-- 0036 — page sections: the order, visibility and custom blocks of each page
-- ===========================================================================
-- Every public page is a list of sections. Most are built into the code
-- (the hero, the broker directory, the FAQ…): a row of kind 'builtin' names
-- one and says where it goes and whether it shows. The others are blocks the
-- admin adds from the dashboard — cards, a call to action, a banner, a text
-- block — whose content lives in `config` (Arabic and English side by side).
--
-- A page with no rows renders exactly as the code lays it out, so nothing
-- changes until someone customises a page. Built-in sections the code adds
-- later and the saved list does not mention are appended, never lost.
--
-- Rows are public on purpose: the page has to know which built-in sections
-- are hidden. Nothing here is secret; a hidden custom block's text is
-- readable through the API, so drafts should not hold anything private.
-- Writes go through save_page_sections(), which replaces a page's list in
-- one transaction and only for admins.
-- ===========================================================================

create table if not exists public.page_sections (
  id         uuid primary key default gen_random_uuid(),
  page       text not null check (page ~ '^[a-z0-9-]{1,40}$'),
  position   int  not null,
  kind       text not null check (kind in ('builtin', 'cards', 'cta', 'banner', 'text')),
  builtin    text check (builtin is null or builtin ~ '^[a-z0-9-]{1,40}$'),
  is_visible boolean not null default true,
  config     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint page_sections_builtin_kind check ((kind = 'builtin') = (builtin is not null)),
  constraint page_sections_config_size check (pg_column_size(config) < 32768)
);

create index if not exists page_sections_page_idx on public.page_sections (page, position);

alter table public.page_sections enable row level security;

drop policy if exists "page_sections read" on public.page_sections;
create policy "page_sections read" on public.page_sections for select using (true);

drop policy if exists "page_sections admin write" on public.page_sections;
create policy "page_sections admin write" on public.page_sections
  for all using (public.is_admin()) with check (public.is_admin());

-- Replace one page's sections atomically. An empty array resets the page to
-- the layout in the code.
create or replace function public.save_page_sections(p_page text, p_sections jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if jsonb_typeof(p_sections) <> 'array' or jsonb_array_length(p_sections) > 40 then
    raise exception 'sections must be an array of at most 40 items';
  end if;

  delete from public.page_sections where page = p_page;

  insert into public.page_sections (page, position, kind, builtin, is_visible, config)
  select
    p_page,
    (t.ord - 1)::int,
    t.e ->> 'kind',
    nullif(t.e ->> 'builtin', ''),
    coalesce((t.e ->> 'is_visible')::boolean, true),
    coalesce(t.e -> 'config', '{}'::jsonb)
  from jsonb_array_elements(p_sections) with ordinality as t(e, ord);
end;
$$;

revoke all on function public.save_page_sections(text, jsonb) from public;
grant execute on function public.save_page_sections(text, jsonb) to authenticated;
