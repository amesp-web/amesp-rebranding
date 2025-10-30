-- Tabela de eventos
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  banner_url text,
  photo_url text,
  location text,
  live_url text,
  signup_url text,
  schedule jsonb default '[]'::jsonb, -- [{date:"2024-08-30", items:[{time:"18:00", title:"Abertura", description:"..."}]}]
  stands jsonb default '[]'::jsonb, -- [{logo_url, name}]
  participants jsonb default '[]'::jsonb, -- [{logo_url, name}]
  sponsors jsonb default '[]'::jsonb, -- [{logo_url, name}]
  display_order int default 0,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.events enable row level security;


