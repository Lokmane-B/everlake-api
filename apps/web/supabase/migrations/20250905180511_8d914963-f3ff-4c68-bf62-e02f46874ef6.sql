
-- Enable needed extension for UUID generation
create extension if not exists pgcrypto;

-- 1) Roles enum for company membership
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('owner', 'admin', 'member');
  end if;
end$$;

-- 2) Profiles table (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can select/update only their own profile
create policy if not exists "Profiles: users read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "Profiles: users update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger to auto-insert a profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, null, null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3) Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  location text,
  logo_url text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists companies_created_by_idx on public.companies(created_by);

alter table public.companies enable row level security;

-- Membership table
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now()
);
create unique index if not exists company_members_unique_member on public.company_members(company_id, user_id);
create index if not exists company_members_company_idx on public.company_members(company_id);
create index if not exists company_members_user_idx on public.company_members(user_id);

alter table public.company_members enable row level security;

-- Security helper functions
create or replace function public.has_company_access(_user_id uuid, _company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_members
    where user_id = _user_id and company_id = _company_id
  );
$$;

create or replace function public.is_company_owner(_user_id uuid, _company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_members
    where user_id = _user_id and company_id = _company_id and role = 'owner'
  );
$$;

-- RLS policies
-- Companies: members can select; only owners can update/delete; anyone authenticated can insert their own company
create policy if not exists "Companies: members can select"
  on public.companies for select
  using (public.has_company_access(auth.uid(), id));

create policy if not exists "Companies: owners can update"
  on public.companies for update
  using (public.is_company_owner(auth.uid(), id))
  with check (public.is_company_owner(auth.uid(), id));

create policy if not exists "Companies: owners can delete"
  on public.companies for delete
  using (public.is_company_owner(auth.uid(), id));

create policy if not exists "Companies: authenticated can insert as creator"
  on public.companies for insert
  to authenticated
  with check (created_by = auth.uid());

-- Auto-add owner membership when a company is created
create or replace function public.handle_company_insert_add_owner()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.company_members (company_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_company_created_add_owner on public.companies;
create trigger on_company_created_add_owner
  after insert on public.companies
  for each row execute procedure public.handle_company_insert_add_owner();

drop trigger if exists set_updated_at_companies on public.companies;
create trigger set_updated_at_companies
  before update on public.companies
  for each row execute procedure public.set_updated_at();

-- Company members policies
create policy if not exists "Members: members can select"
  on public.company_members for select
  using (public.has_company_access(auth.uid(), company_id));

create policy if not exists "Members: owners manage membership"
  on public.company_members for all
  using (public.is_company_owner(auth.uid(), company_id))
  with check (public.is_company_owner(auth.uid(), company_id));

-- 4) Core business tables (all scoped to company_id)
-- Appels d'offres
create table if not exists public.appels_offres (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  sector text,
  budget numeric(14,2),
  status text,
  start_date date,
  end_date date,
  description text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists appels_offres_company_idx on public.appels_offres(company_id);

alter table public.appels_offres enable row level security;

create policy if not exists "AO: members select"
  on public.appels_offres for select
  using (public.has_company_access(auth.uid(), company_id));

create policy if not exists "AO: members insert"
  on public.appels_offres for insert
  to authenticated
  with check (public.has_company_access(auth.uid(), company_id) and created_by = auth.uid());

create policy if not exists "AO: members update"
  on public.appels_offres for update
  using (public.has_company_access(auth.uid(), company_id))
  with check (public.has_company_access(auth.uid(), company_id));

create policy if not exists "AO: members delete"
  on public.appels_offres for delete
  using (public.has_company_access(auth.uid(), company_id));

drop trigger if exists set_updated_at_ao on public.appels_offres;
create trigger set_updated_at_ao
  before update on public.appels_offres
  for each row execute procedure public.set_updated_at();

-- Devis
create table if not exists public.devis (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  number text,
  title text not null,
  client_name text,
  amount numeric(14,2),
  status text,
  issue_date date,
  due_date date,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists devis_company_idx on public.devis(company_id);

alter table public.devis enable row level security;

create policy if not exists "Devis: members select"
  on public.devis for select
  using (public.has_company_access(auth.uid(), company_id));

create policy if not exists "Devis: members write"
  on public.devis for all
  using (public.has_company_access(auth.uid(), company_id))
  with check (public.has_company_access(auth.uid(), company_id));

drop trigger if exists set_updated_at_devis on public.devis;
create trigger set_updated_at_devis
  before update on public.devis
  for each row execute procedure public.set_updated_at();

-- Commandes
create table if not exists public.commandes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  number text,
  title text not null,
  total numeric(14,2),
  status text,
  order_date date,
  delivery_date date,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists commandes_company_idx on public.commandes(company_id);

alter table public.commandes enable row level security;

create policy if not exists "Commandes: members access"
  on public.commandes for all
  using (public.has_company_access(auth.uid(), company_id))
  with check (public.has_company_access(auth.uid(), company_id));

drop trigger if exists set_updated_at_commandes on public.commandes;
create trigger set_updated_at_commandes
  before update on public.commandes
  for each row execute procedure public.set_updated_at();

-- Projets
create table if not exists public.projets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  status text,
  start_date date,
  end_date date,
  budget numeric(14,2),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projets_company_idx on public.projets(company_id);

alter table public.projets enable row level security;

create policy if not exists "Projets: members access"
  on public.projets for all
  using (public.has_company_access(auth.uid(), company_id))
  with check (public.has_company_access(auth.uid(), company_id));

drop trigger if exists set_updated_at_projets on public.projets;
create trigger set_updated_at_projets
  before update on public.projets
  for each row execute procedure public.set_updated_at();

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  type text,
  message text not null,
  read boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists notifications_company_idx on public.notifications(company_id);

alter table public.notifications enable row level security;

create policy if not exists "Notifications: members access"
  on public.notifications for all
  using (public.has_company_access(auth.uid(), company_id))
  with check (public.has_company_access(auth.uid(), company_id));

-- Inbox Conversations
create table if not exists public.inbox_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  partner_name text,
  last_message_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index if not exists inbox_conversations_company_idx on public.inbox_conversations(company_id);

alter table public.inbox_conversations enable row level security;

create policy if not exists "Conversations: members access"
  on public.inbox_conversations for all
  using (public.has_company_access(auth.uid(), company_id))
  with check (public.has_company_access(auth.uid(), company_id));

-- Inbox Messages
create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.inbox_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists inbox_messages_conversation_idx on public.inbox_messages(conversation_id);

alter table public.inbox_messages enable row level security;

-- Members who can see the conversation can see messages
create policy if not exists "Messages: select via conversation company"
  on public.inbox_messages for select
  using (public.has_company_access(auth.uid(), (select company_id from public.inbox_conversations c where c.id = conversation_id)));

create policy if not exists "Messages: insert via conversation company"
  on public.inbox_messages for insert
  to authenticated
  with check (
    public.has_company_access(auth.uid(), (select company_id from public.inbox_conversations c where c.id = conversation_id))
    and sender_id = auth.uid()
  );

-- Documents (metadata only; files will be stored via Storage later)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  url text not null,
  category text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index if not exists documents_company_idx on public.documents(company_id);

alter table public.documents enable row level security;

create policy if not exists "Documents: members access"
  on public.documents for all
  using (public.has_company_access(auth.uid(), company_id))
  with check (public.has_company_access(auth.uid(), company_id));

-- Contacts (Carnet de contacts)
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role text,
  notes text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contacts_company_idx on public.contacts(company_id);

alter table public.contacts enable row level security;

create policy if not exists "Contacts: members access"
  on public.contacts for all
  using (public.has_company_access(auth.uid(), company_id))
  with check (public.has_company_access(auth.uid(), company_id));

drop trigger if exists set_updated_at_contacts on public.contacts;
create trigger set_updated_at_contacts
  before update on public.contacts
  for each row execute procedure public.set_updated_at();

-- 5) Realtime configuration
-- Ensure full row data for updates
alter table public.companies replica identity full;
alter table public.company_members replica identity full;
alter table public.appels_offres replica identity full;
alter table public.devis replica identity full;
alter table public.commandes replica identity full;
alter table public.projets replica identity full;
alter table public.notifications replica identity full;
alter table public.inbox_conversations replica identity full;
alter table public.inbox_messages replica identity full;
alter table public.documents replica identity full;
alter table public.contacts replica identity full;

-- Add tables to supabase_realtime publication
alter publication supabase_realtime add table
  public.companies,
  public.company_members,
  public.appels_offres,
  public.devis,
  public.commandes,
  public.projets,
  public.notifications,
  public.inbox_conversations,
  public.inbox_messages,
  public.documents,
  public.contacts;
