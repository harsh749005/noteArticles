-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

create table articles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  url        text not null,
  title      text not null,
  site_name  text not null default '',
  image_url  text,
  read_at    timestamptz not null default now(),
  unique (user_id, url)            -- the same link can't be saved twice
);

create index articles_newest_first on articles (user_id, read_at desc);

-- Each person can only see and change their own articles.
alter table articles enable row level security;
create policy "people manage their own articles"
  on articles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
