create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type public.organization_type as enum ('school', 'nonprofit', 'business');
create type public.member_status as enum ('invited', 'active');
create type public.member_role as enum ('admin', 'member');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  type public.organization_type not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  school_district text,
  nonprofit_cause text,
  business_industry text,
  created_at timestamptz not null default now(),
  constraint organization_type_specific_fields check (
    (type = 'school' and school_district is not null and nonprofit_cause is null and business_industry is null)
    or (type = 'nonprofit' and nonprofit_cause is not null and school_district is null and business_industry is null)
    or (type = 'business' and business_industry is not null and school_district is null and nonprofit_cause is null)
  )
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email citext not null,
  status public.member_status not null default 'invited',
  role public.member_role not null default 'member',
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  constraint organization_members_email_not_blank check (char_length(trim(email::text)) > 0),
  constraint organization_members_joined_when_active check (
    (status = 'active' and joined_at is not null) or (status = 'invited' and joined_at is null)
  ),
  unique (organization_id, email)
);

create index organizations_created_by_idx on public.organizations(created_by);
create index organization_members_organization_id_idx on public.organization_members(organization_id);

create view public.organizations_with_member_counts
with (security_invoker = true) as
select
  organizations.*,
  count(organization_members.id)::integer as member_count
from public.organizations
left join public.organization_members
  on organization_members.organization_id = organizations.id
group by organizations.id;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create policy "admins can read their organizations"
on public.organizations
for select
to authenticated
using (created_by = auth.uid());

create policy "admins can create organizations"
on public.organizations
for insert
to authenticated
with check (created_by = auth.uid());

create policy "admins can update their organizations"
on public.organizations
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "admins can delete their organizations"
on public.organizations
for delete
to authenticated
using (created_by = auth.uid());

create policy "admins can read members for their organizations"
on public.organization_members
for select
to authenticated
using (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_members.organization_id
      and organizations.created_by = auth.uid()
  )
);

create policy "admins can create members for their organizations"
on public.organization_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_members.organization_id
      and organizations.created_by = auth.uid()
  )
);

create policy "admins can update members for their organizations"
on public.organization_members
for update
to authenticated
using (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_members.organization_id
      and organizations.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_members.organization_id
      and organizations.created_by = auth.uid()
  )
);

create policy "admins can delete members for their organizations"
on public.organization_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_members.organization_id
      and organizations.created_by = auth.uid()
  )
);
