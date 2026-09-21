-- Keep transaction authors in the public user projection used by the UI.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  job_position text,
  phone text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.users (id, email, name)
select id, email, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name')
from auth.users
on conflict (id) do update
set email = excluded.email,
    name = coalesce(excluded.name, public.users.name);

alter table public.transactions
  drop constraint if exists transactions_created_by_fkey;

alter table public.transactions
  add constraint transactions_created_by_fkey
  foreign key (created_by) references public.users(id) on delete restrict;
