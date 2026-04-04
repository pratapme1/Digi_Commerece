create type "Digi".verification_tier as enum ('phone_verified', 'business_verified');
create type "Digi".space_type as enum ('meeting', 'event', 'store', 'restaurant', 'other');
create type "Digi".space_mode as enum ('identified', 'anonymous');
create type "Digi".session_status as enum ('draft', 'scheduled', 'live', 'ending', 'ended');

create or replace function "Digi".set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table "Digi".accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users (id) on delete cascade,
  business_name text not null,
  primary_phone text,
  verification_tier "Digi".verification_tier not null default 'phone_verified',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table "Digi".brand_profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references "Digi".accounts (id) on delete cascade,
  name text not null,
  logo_url text,
  primary_color text not null,
  secondary_color text not null,
  font_family text not null default 'Cormorant Garamond',
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint brand_profiles_primary_color_format check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint brand_profiles_secondary_color_format check (secondary_color ~ '^#[0-9A-Fa-f]{6}$')
);

create unique index brand_profiles_one_default_per_account
  on "Digi".brand_profiles (account_id)
  where is_default;

create table "Digi".spaces (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references "Digi".accounts (id) on delete cascade,
  brand_profile_id uuid not null references "Digi".brand_profiles (id) on delete restrict,
  name text not null,
  space_type "Digi".space_type not null,
  mode "Digi".space_mode not null,
  qr_slug text not null unique,
  default_session_duration_minutes integer not null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint spaces_default_duration_range check (default_session_duration_minutes between 15 and 240)
);

create unique index spaces_one_default_per_account
  on "Digi".spaces (account_id)
  where is_default;

create table "Digi".sessions (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references "Digi".spaces (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete restrict,
  status "Digi".session_status not null default 'draft',
  duration_minutes integer not null,
  scheduled_start_at timestamptz,
  started_at timestamptz,
  ends_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sessions_duration_range check (duration_minutes between 15 and 240)
);

create unique index sessions_one_active_per_space
  on "Digi".sessions (space_id)
  where status in ('live', 'ending');

create trigger accounts_set_updated_at
before update on "Digi".accounts
for each row execute function "Digi".set_updated_at();

create trigger brand_profiles_set_updated_at
before update on "Digi".brand_profiles
for each row execute function "Digi".set_updated_at();

create trigger spaces_set_updated_at
before update on "Digi".spaces
for each row execute function "Digi".set_updated_at();

create trigger sessions_set_updated_at
before update on "Digi".sessions
for each row execute function "Digi".set_updated_at();

grant usage on schema "Digi" to authenticated, service_role;
grant select, insert, update on all tables in schema "Digi" to authenticated, service_role;
grant usage, select on all sequences in schema "Digi" to authenticated, service_role;

alter default privileges in schema "Digi"
grant select, insert, update on tables to authenticated, service_role;

alter default privileges in schema "Digi"
grant usage, select on sequences to authenticated, service_role;

alter table "Digi".accounts enable row level security;
alter table "Digi".brand_profiles enable row level security;
alter table "Digi".spaces enable row level security;
alter table "Digi".sessions enable row level security;

create policy accounts_owner_read
  on "Digi".accounts
  for select
  to authenticated
  using (owner_user_id = auth.uid());

create policy accounts_owner_insert
  on "Digi".accounts
  for insert
  to authenticated
  with check (owner_user_id = auth.uid());

create policy accounts_owner_update
  on "Digi".accounts
  for update
  to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy brand_profiles_owner_read
  on "Digi".brand_profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = brand_profiles.account_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy brand_profiles_owner_insert
  on "Digi".brand_profiles
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = brand_profiles.account_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy brand_profiles_owner_update
  on "Digi".brand_profiles
  for update
  to authenticated
  using (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = brand_profiles.account_id
        and accounts.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = brand_profiles.account_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy spaces_owner_read
  on "Digi".spaces
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = spaces.account_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy spaces_owner_insert
  on "Digi".spaces
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = spaces.account_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy spaces_owner_update
  on "Digi".spaces
  for update
  to authenticated
  using (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = spaces.account_id
        and accounts.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = spaces.account_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy sessions_owner_read
  on "Digi".sessions
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = sessions.space_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy sessions_owner_insert
  on "Digi".sessions
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = sessions.space_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy sessions_owner_update
  on "Digi".sessions
  for update
  to authenticated
  using (
    exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = sessions.space_id
        and accounts.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = sessions.space_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create or replace function public.digi_slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, 'space')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.digi_make_qr_slug(label text, user_id uuid)
returns text
language sql
immutable
as $$
  select public.digi_slugify(label) || '-' || substring(replace(user_id::text, '-', '') from 1 for 6);
$$;

create or replace function public.digi_get_host_setup()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_account "Digi".accounts%rowtype;
  v_brand_profiles jsonb := '[]'::jsonb;
  v_spaces jsonb := '[]'::jsonb;
  v_live_session jsonb := null;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_account
  from "Digi".accounts
  where owner_user_id = v_user_id;

  if not found then
    return jsonb_build_object(
      'account', null,
      'brandProfiles', '[]'::jsonb,
      'spaces', '[]'::jsonb,
      'liveSession', null
    );
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', brand_profiles.id,
        'accountId', brand_profiles.account_id,
        'name', brand_profiles.name,
        'logoUrl', brand_profiles.logo_url,
        'primaryColor', brand_profiles.primary_color,
        'secondaryColor', brand_profiles.secondary_color,
        'fontFamily', brand_profiles.font_family,
        'isDefault', brand_profiles.is_default,
        'createdAt', brand_profiles.created_at,
        'updatedAt', brand_profiles.updated_at
      )
      order by brand_profiles.is_default desc, brand_profiles.created_at asc
    ),
    '[]'::jsonb
  )
  into v_brand_profiles
  from "Digi".brand_profiles
  where account_id = v_account.id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', spaces.id,
        'accountId', spaces.account_id,
        'brandProfileId', spaces.brand_profile_id,
        'name', spaces.name,
        'spaceType', spaces.space_type,
        'mode', spaces.mode,
        'qrSlug', spaces.qr_slug,
        'defaultSessionDurationMinutes', spaces.default_session_duration_minutes,
        'isDefault', spaces.is_default,
        'createdAt', spaces.created_at,
        'updatedAt', spaces.updated_at
      )
      order by spaces.is_default desc, spaces.created_at asc
    ),
    '[]'::jsonb
  )
  into v_spaces
  from "Digi".spaces
  where account_id = v_account.id;

  select jsonb_build_object(
    'id', sessions.id,
    'spaceId', sessions.space_id,
    'status', sessions.status,
    'durationMinutes', sessions.duration_minutes,
    'scheduledStartAt', sessions.scheduled_start_at,
    'startedAt', sessions.started_at,
    'endsAt', sessions.ends_at,
    'endedAt', sessions.ended_at,
    'createdAt', sessions.created_at,
    'updatedAt', sessions.updated_at
  )
  into v_live_session
  from "Digi".sessions sessions
  join "Digi".spaces spaces on spaces.id = sessions.space_id
  where spaces.account_id = v_account.id
    and sessions.status in ('live', 'ending')
  order by sessions.created_at desc
  limit 1;

  return jsonb_build_object(
    'account', jsonb_build_object(
      'id', v_account.id,
      'ownerUserId', v_account.owner_user_id,
      'businessName', v_account.business_name,
      'verificationTier', v_account.verification_tier,
      'primaryPhone', v_account.primary_phone,
      'createdAt', v_account.created_at,
      'updatedAt', v_account.updated_at
    ),
    'brandProfiles', v_brand_profiles,
    'spaces', v_spaces,
    'liveSession', v_live_session
  );
end;
$$;

create or replace function public.digi_save_host_setup(
  p_business_name text,
  p_brand_name text,
  p_primary_color text,
  p_secondary_color text,
  p_font_family text,
  p_space_name text,
  p_space_type "Digi".space_type,
  p_mode "Digi".space_mode,
  p_default_session_duration_minutes integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
  v_brand_id uuid;
  v_space_id uuid;
  v_qr_slug text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_default_session_duration_minutes < 15 or p_default_session_duration_minutes > 240 then
    raise exception 'Duration out of range';
  end if;

  select id
  into v_account_id
  from "Digi".accounts
  where owner_user_id = v_user_id;

  if v_account_id is null then
    insert into "Digi".accounts (owner_user_id, business_name)
    values (v_user_id, p_business_name)
    returning id into v_account_id;
  else
    update "Digi".accounts
    set business_name = p_business_name
    where id = v_account_id;
  end if;

  select id
  into v_brand_id
  from "Digi".brand_profiles
  where account_id = v_account_id
    and is_default
  order by created_at asc
  limit 1;

  if v_brand_id is null then
    insert into "Digi".brand_profiles (
      account_id,
      name,
      primary_color,
      secondary_color,
      font_family,
      is_default
    )
    values (
      v_account_id,
      coalesce(nullif(p_brand_name, ''), p_business_name),
      p_primary_color,
      p_secondary_color,
      p_font_family,
      true
    )
    returning id into v_brand_id;
  else
    update "Digi".brand_profiles
    set
      name = coalesce(nullif(p_brand_name, ''), p_business_name),
      primary_color = p_primary_color,
      secondary_color = p_secondary_color,
      font_family = p_font_family
    where id = v_brand_id;
  end if;

  select id, qr_slug
  into v_space_id, v_qr_slug
  from "Digi".spaces
  where account_id = v_account_id
    and is_default
  order by created_at asc
  limit 1;

  if v_qr_slug is null then
    v_qr_slug := public.digi_make_qr_slug(coalesce(nullif(p_space_name, ''), p_business_name), v_user_id);
  end if;

  if v_space_id is null then
    insert into "Digi".spaces (
      account_id,
      brand_profile_id,
      name,
      space_type,
      mode,
      qr_slug,
      default_session_duration_minutes,
      is_default
    )
    values (
      v_account_id,
      v_brand_id,
      coalesce(nullif(p_space_name, ''), p_business_name),
      p_space_type,
      p_mode,
      v_qr_slug,
      p_default_session_duration_minutes,
      true
    )
    returning id into v_space_id;
  else
    update "Digi".spaces
    set
      brand_profile_id = v_brand_id,
      name = coalesce(nullif(p_space_name, ''), p_business_name),
      space_type = p_space_type,
      mode = p_mode,
      default_session_duration_minutes = p_default_session_duration_minutes
    where id = v_space_id;
  end if;

  return public.digi_get_host_setup();
end;
$$;

create or replace function public.digi_go_live(
  p_space_id uuid,
  p_duration_minutes integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_space record;
  v_duration integer;
  v_session_id uuid;
  v_started_at timestamptz := timezone('utc', now());
  v_ends_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select
    spaces.id,
    spaces.qr_slug,
    spaces.default_session_duration_minutes
  into v_space
  from "Digi".spaces spaces
  join "Digi".accounts accounts on accounts.id = spaces.account_id
  where spaces.id = p_space_id
    and accounts.owner_user_id = v_user_id;

  if not found then
    raise exception 'Space not found';
  end if;

  v_duration := coalesce(p_duration_minutes, v_space.default_session_duration_minutes);

  if v_duration < 15 or v_duration > 240 then
    raise exception 'Duration out of range';
  end if;

  update "Digi".sessions
  set
    status = 'ended',
    ended_at = timezone('utc', now())
  where space_id = p_space_id
    and status in ('live', 'ending');

  v_ends_at := v_started_at + make_interval(mins => v_duration);

  insert into "Digi".sessions (
    space_id,
    created_by,
    status,
    duration_minutes,
    started_at,
    ends_at
  )
  values (
    p_space_id,
    v_user_id,
    'live',
    v_duration,
    v_started_at,
    v_ends_at
  )
  returning id into v_session_id;

  return jsonb_build_object(
    'sessionId', v_session_id,
    'status', 'live',
    'startedAt', v_started_at,
    'endsAt', v_ends_at,
    'attendeeUrl', '/s/' || v_space.qr_slug
  );
end;
$$;

grant execute on function public.digi_get_host_setup() to authenticated, service_role;
grant execute on function public.digi_save_host_setup(
  text,
  text,
  text,
  text,
  text,
  text,
  "Digi".space_type,
  "Digi".space_mode,
  integer
) to authenticated, service_role;
grant execute on function public.digi_go_live(uuid, integer) to authenticated, service_role;
