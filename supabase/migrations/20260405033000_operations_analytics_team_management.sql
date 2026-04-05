create type "Digi".team_role as enum ('owner', 'admin', 'operator', 'analyst');
create type "Digi".invite_status as enum ('pending', 'revoked', 'accepted');
create type "Digi".import_job_status as enum ('validated', 'partial', 'failed');

alter table "Digi".spaces
add column archived_at timestamptz;

create table "Digi".team_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references "Digi".accounts (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  display_name text not null,
  phone text not null,
  role "Digi".team_role not null,
  status text not null default 'active' check (status in ('active')),
  joined_at timestamptz not null default timezone('utc', now()),
  last_active_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index team_members_phone_per_account
  on "Digi".team_members (account_id, phone);

create unique index team_members_owner_per_account
  on "Digi".team_members (account_id)
  where role = 'owner';

create table "Digi".team_invites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references "Digi".accounts (id) on delete cascade,
  invited_by uuid not null references auth.users (id) on delete restrict,
  display_name text not null,
  phone text not null,
  role "Digi".team_role not null,
  status "Digi".invite_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz
);

create unique index team_invites_pending_phone_per_account
  on "Digi".team_invites (account_id, phone)
  where status = 'pending';

create table "Digi".catalog_import_jobs (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references "Digi".accounts (id) on delete cascade,
  space_id uuid references "Digi".spaces (id) on delete set null,
  created_by uuid not null references auth.users (id) on delete restrict,
  file_name text not null,
  source text not null default 'csv' check (source in ('csv')),
  status "Digi".import_job_status not null,
  processed_rows integer not null default 0,
  accepted_rows integer not null default 0,
  rejected_rows integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table "Digi".catalog_import_rows (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references "Digi".catalog_import_jobs (id) on delete cascade,
  row_number integer not null,
  status text not null check (status in ('accepted', 'rejected')),
  space_name text not null default '',
  brand_name text not null default '',
  content_type text not null default '',
  title text not null default '',
  subtitle text not null default '',
  sku text not null default '',
  message text not null default '',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index catalog_import_jobs_account_idx
  on "Digi".catalog_import_jobs (account_id, created_at desc);

create index catalog_import_rows_job_idx
  on "Digi".catalog_import_rows (job_id, row_number asc);

create trigger team_members_set_updated_at
before update on "Digi".team_members
for each row execute function "Digi".set_updated_at();

create trigger team_invites_set_updated_at
before update on "Digi".team_invites
for each row execute function "Digi".set_updated_at();

create trigger catalog_import_jobs_set_updated_at
before update on "Digi".catalog_import_jobs
for each row execute function "Digi".set_updated_at();

grant select, insert, update on "Digi".team_members to authenticated, service_role;
grant select, insert, update on "Digi".team_invites to authenticated, service_role;
grant select, insert, update on "Digi".catalog_import_jobs to authenticated, service_role;
grant select, insert on "Digi".catalog_import_rows to authenticated, service_role;

alter table "Digi".team_members enable row level security;
alter table "Digi".team_invites enable row level security;
alter table "Digi".catalog_import_jobs enable row level security;
alter table "Digi".catalog_import_rows enable row level security;

create policy team_members_owner_read
  on "Digi".team_members
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = team_members.account_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy team_invites_owner_read
  on "Digi".team_invites
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = team_invites.account_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy catalog_import_jobs_owner_read
  on "Digi".catalog_import_jobs
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".accounts accounts
      where accounts.id = catalog_import_jobs.account_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy catalog_import_rows_owner_read
  on "Digi".catalog_import_rows
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".catalog_import_jobs jobs
      join "Digi".accounts accounts on accounts.id = jobs.account_id
      where jobs.id = catalog_import_rows.job_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create or replace function "Digi".sync_owner_team_member()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  update "Digi".team_members
  set
    user_id = new.owner_user_id,
    display_name = new.business_name || ' owner',
    phone = coalesce(new.primary_phone, team_members.phone),
    last_active_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  where account_id = new.id
    and role = 'owner';

  if not found then
    insert into "Digi".team_members (
      account_id,
      user_id,
      display_name,
      phone,
      role,
      last_active_at
    )
    values (
      new.id,
      new.owner_user_id,
      new.business_name || ' owner',
      coalesce(new.primary_phone, '+91 99999 99999'),
      'owner',
      timezone('utc', now())
    );
  end if;

  return new;
end;
$$;

create trigger accounts_sync_owner_team_member
after insert or update on "Digi".accounts
for each row execute function "Digi".sync_owner_team_member();

insert into "Digi".team_members (
  account_id,
  user_id,
  display_name,
  phone,
  role,
  last_active_at
)
select
  accounts.id,
  accounts.owner_user_id,
  accounts.business_name || ' owner',
  coalesce(accounts.primary_phone, '+91 99999 99999'),
  'owner',
  timezone('utc', now())
from "Digi".accounts accounts
where not exists (
  select 1
  from "Digi".team_members members
  where members.account_id = accounts.id
    and members.role = 'owner'
);

create or replace function public.digi_get_current_account_id()
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select id
  into v_account_id
  from "Digi".accounts
  where owner_user_id = v_user_id;

  if v_account_id is null then
    raise exception 'Account not found';
  end if;

  return v_account_id;
end;
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
        'archivedAt', spaces.archived_at,
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

create or replace function public.digi_create_brand_profile(
  p_name text,
  p_primary_color text,
  p_secondary_color text,
  p_font_family text,
  p_make_default boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_account_id uuid := public.digi_get_current_account_id();
  v_brand_id uuid;
begin
  if trim(coalesce(p_name, '')) = '' then
    raise exception 'Brand name is required';
  end if;

  if p_make_default then
    update "Digi".brand_profiles
    set is_default = false
    where account_id = v_account_id
      and is_default;
  end if;

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
    trim(p_name),
    p_primary_color,
    p_secondary_color,
    p_font_family,
    p_make_default
  )
  returning id into v_brand_id;

  return jsonb_build_object('brandId', v_brand_id);
end;
$$;

create or replace function public.digi_create_space(
  p_name text,
  p_brand_profile_id uuid,
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
  v_account_id uuid := public.digi_get_current_account_id();
  v_user_id uuid := auth.uid();
  v_space_id uuid;
  v_qr_slug text;
begin
  if trim(coalesce(p_name, '')) = '' then
    raise exception 'Space name is required';
  end if;

  if not exists (
    select 1
    from "Digi".brand_profiles
    where id = p_brand_profile_id
      and account_id = v_account_id
  ) then
    raise exception 'Brand profile not found';
  end if;

  v_qr_slug := public.digi_make_qr_slug(trim(p_name), v_user_id);

  while exists (
    select 1
    from "Digi".spaces
    where qr_slug = v_qr_slug
  ) loop
    v_qr_slug := public.digi_make_qr_slug(trim(p_name) || '-' || substring(gen_random_uuid()::text from 1 for 4), v_user_id);
  end loop;

  insert into "Digi".spaces (
    account_id,
    brand_profile_id,
    name,
    space_type,
    mode,
    qr_slug,
    default_session_duration_minutes,
    is_default,
    archived_at
  )
  values (
    v_account_id,
    p_brand_profile_id,
    trim(p_name),
    p_space_type,
    p_mode,
    v_qr_slug,
    p_default_session_duration_minutes,
    false,
    null
  )
  returning id into v_space_id;

  return jsonb_build_object('spaceId', v_space_id);
end;
$$;

create or replace function public.digi_assign_space_brand(
  p_space_id uuid,
  p_brand_profile_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_account_id uuid := public.digi_get_current_account_id();
begin
  if not exists (
    select 1
    from "Digi".spaces
    where id = p_space_id
      and account_id = v_account_id
  ) then
    raise exception 'Space not found';
  end if;

  if not exists (
    select 1
    from "Digi".brand_profiles
    where id = p_brand_profile_id
      and account_id = v_account_id
  ) then
    raise exception 'Brand profile not found';
  end if;

  update "Digi".spaces
  set
    brand_profile_id = p_brand_profile_id,
    updated_at = timezone('utc', now())
  where id = p_space_id;

  return jsonb_build_object(
    'spaceId', p_space_id,
    'brandProfileId', p_brand_profile_id
  );
end;
$$;

create or replace function public.digi_archive_space(
  p_space_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_account_id uuid := public.digi_get_current_account_id();
  v_active_count integer;
  v_archived_at timestamptz := timezone('utc', now());
begin
  select count(*)
  into v_active_count
  from "Digi".spaces
  where account_id = v_account_id
    and archived_at is null;

  if v_active_count <= 1 then
    raise exception 'At least one active space must remain';
  end if;

  if exists (
    select 1
    from "Digi".sessions sessions
    join "Digi".spaces spaces on spaces.id = sessions.space_id
    where spaces.id = p_space_id
      and spaces.account_id = v_account_id
      and sessions.status in ('live', 'ending')
  ) then
    raise exception 'End the live session before archiving this space';
  end if;

  update "Digi".spaces
  set
    archived_at = v_archived_at,
    is_default = false,
    updated_at = v_archived_at
  where id = p_space_id
    and account_id = v_account_id;

  if not found then
    raise exception 'Space not found';
  end if;

  if not exists (
    select 1
    from "Digi".spaces
    where account_id = v_account_id
      and archived_at is null
      and is_default
  ) then
    update "Digi".spaces
    set is_default = true
    where id = (
      select id
      from "Digi".spaces
      where account_id = v_account_id
        and archived_at is null
      order by created_at asc
      limit 1
    );
  end if;

  return jsonb_build_object(
    'spaceId', p_space_id,
    'archivedAt', v_archived_at
  );
end;
$$;

create or replace function public.digi_delete_space(
  p_space_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_account_id uuid := public.digi_get_current_account_id();
  v_space_count integer;
begin
  select count(*)
  into v_space_count
  from "Digi".spaces
  where account_id = v_account_id;

  if v_space_count <= 1 then
    raise exception 'At least one space must remain';
  end if;

  if exists (
    select 1
    from "Digi".sessions sessions
    join "Digi".spaces spaces on spaces.id = sessions.space_id
    where spaces.id = p_space_id
      and spaces.account_id = v_account_id
      and sessions.status in ('live', 'ending')
  ) then
    raise exception 'End the live session before deleting this space';
  end if;

  delete from "Digi".spaces
  where id = p_space_id
    and account_id = v_account_id;

  if not found then
    raise exception 'Space not found';
  end if;

  if not exists (
    select 1
    from "Digi".spaces
    where account_id = v_account_id
      and is_default
  ) then
    update "Digi".spaces
    set is_default = true
    where id = (
      select id
      from "Digi".spaces
      where account_id = v_account_id
      order by archived_at nulls first, created_at asc
      limit 1
    );
  end if;

  return jsonb_build_object(
    'spaceId', p_space_id,
    'deleted', true
  );
end;
$$;

create or replace function public.digi_invite_team_member(
  p_display_name text,
  p_phone text,
  p_role "Digi".team_role
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_account_id uuid := public.digi_get_current_account_id();
  v_user_id uuid := auth.uid();
  v_invite "Digi".team_invites%rowtype;
begin
  if trim(coalesce(p_display_name, '')) = '' then
    raise exception 'Display name is required';
  end if;

  if trim(coalesce(p_phone, '')) = '' then
    raise exception 'Phone is required';
  end if;

  update "Digi".team_invites
  set
    status = 'revoked',
    responded_at = timezone('utc', now())
  where account_id = v_account_id
    and phone = trim(p_phone)
    and status = 'pending';

  insert into "Digi".team_invites (
    account_id,
    invited_by,
    display_name,
    phone,
    role,
    status
  )
  values (
    v_account_id,
    v_user_id,
    trim(p_display_name),
    trim(p_phone),
    p_role,
    'pending'
  )
  returning * into v_invite;

  return jsonb_build_object(
    'id', v_invite.id,
    'displayName', v_invite.display_name,
    'phone', v_invite.phone,
    'role', v_invite.role,
    'status', v_invite.status,
    'invitedAt', v_invite.created_at,
    'respondedAt', v_invite.responded_at
  );
end;
$$;

create or replace function public.digi_remove_team_access(
  p_member_id uuid default null,
  p_invite_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_account_id uuid := public.digi_get_current_account_id();
begin
  if p_member_id is not null then
    delete from "Digi".team_members
    where id = p_member_id
      and account_id = v_account_id
      and role <> 'owner';

    if not found then
      raise exception 'Team member not found';
    end if;
  elsif p_invite_id is not null then
    update "Digi".team_invites
    set
      status = 'revoked',
      responded_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
    where id = p_invite_id
      and account_id = v_account_id;

    if not found then
      raise exception 'Invite not found';
    end if;
  else
    raise exception 'Team member or invite id is required';
  end if;

  return jsonb_build_object(
    'memberId', p_member_id,
    'inviteId', p_invite_id
  );
end;
$$;

create or replace function public.digi_record_catalog_import(
  p_space_id uuid,
  p_file_name text,
  p_processed_rows integer,
  p_accepted_rows integer,
  p_rejected_rows integer,
  p_status "Digi".import_job_status,
  p_rows jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_account_id uuid := public.digi_get_current_account_id();
  v_user_id uuid := auth.uid();
  v_job_id uuid;
  v_rows jsonb := '[]'::jsonb;
begin
  if p_space_id is not null and not exists (
    select 1
    from "Digi".spaces
    where id = p_space_id
      and account_id = v_account_id
  ) then
    raise exception 'Space not found';
  end if;

  insert into "Digi".catalog_import_jobs (
    account_id,
    space_id,
    created_by,
    file_name,
    status,
    processed_rows,
    accepted_rows,
    rejected_rows
  )
  values (
    v_account_id,
    p_space_id,
    v_user_id,
    trim(coalesce(p_file_name, 'catalog-import.csv')),
    p_status,
    coalesce(p_processed_rows, 0),
    coalesce(p_accepted_rows, 0),
    coalesce(p_rejected_rows, 0)
  )
  returning id into v_job_id;

  insert into "Digi".catalog_import_rows (
    job_id,
    row_number,
    status,
    space_name,
    brand_name,
    content_type,
    title,
    subtitle,
    sku,
    message,
    raw_payload
  )
  select
    v_job_id,
    coalesce((row_value->>'rowNumber')::integer, 0),
    coalesce(row_value->>'status', 'rejected'),
    coalesce(row_value->>'spaceName', ''),
    coalesce(row_value->>'brandName', ''),
    coalesce(row_value->>'contentType', ''),
    coalesce(row_value->>'title', ''),
    coalesce(row_value->>'subtitle', ''),
    coalesce(row_value->>'sku', ''),
    coalesce(row_value->>'message', ''),
    row_value
  from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) as row_value;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'rowNumber', rows.row_number,
        'status', rows.status,
        'spaceName', rows.space_name,
        'brandName', rows.brand_name,
        'contentType', rows.content_type,
        'title', rows.title,
        'subtitle', rows.subtitle,
        'sku', rows.sku,
        'message', rows.message
      )
      order by rows.row_number asc
    ),
    '[]'::jsonb
  )
  into v_rows
  from "Digi".catalog_import_rows rows
  where rows.job_id = v_job_id;

  return jsonb_build_object(
    'id', v_job_id,
    'fileName', trim(coalesce(p_file_name, 'catalog-import.csv')),
    'source', 'csv',
    'status', p_status,
    'processedRows', coalesce(p_processed_rows, 0),
    'acceptedRows', coalesce(p_accepted_rows, 0),
    'rejectedRows', coalesce(p_rejected_rows, 0),
    'createdAt', timezone('utc', now()),
    'spaceId', p_space_id,
    'rows', v_rows
  );
end;
$$;

create or replace function public.digi_get_operations_snapshot(
  p_range text default '30d'
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_account_id uuid := public.digi_get_current_account_id();
  v_since timestamptz := null;
  v_team_members jsonb := '[]'::jsonb;
  v_team_invites jsonb := '[]'::jsonb;
  v_import_jobs jsonb := '[]'::jsonb;
  v_session_history jsonb := '[]'::jsonb;
  v_recent_sessions jsonb := '[]'::jsonb;
  v_top_spaces jsonb := '[]'::jsonb;
  v_top_content jsonb := '[]'::jsonb;
  v_session_count integer := 0;
  v_active_spaces integer := 0;
  v_attendee_count integer := 0;
  v_total_views integer := 0;
  v_total_saves integer := 0;
  v_save_rate numeric := 0;
begin
  if p_range = '7d' then
    v_since := timezone('utc', now()) - interval '7 days';
  elsif p_range = '30d' then
    v_since := timezone('utc', now()) - interval '30 days';
  elsif p_range = 'all' then
    v_since := null;
  else
    raise exception 'Unsupported analytics range';
  end if;

  select count(*)
  into v_active_spaces
  from "Digi".spaces
  where account_id = v_account_id
    and archived_at is null;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', members.id,
        'displayName', members.display_name,
        'phone', members.phone,
        'role', members.role,
        'status', members.status,
        'joinedAt', members.joined_at,
        'lastActiveAt', members.last_active_at
      )
      order by
        case members.role
          when 'owner' then 0
          when 'admin' then 1
          when 'operator' then 2
          else 3
        end,
        members.created_at asc
    ),
    '[]'::jsonb
  )
  into v_team_members
  from "Digi".team_members members
  where members.account_id = v_account_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', invites.id,
        'displayName', invites.display_name,
        'phone', invites.phone,
        'role', invites.role,
        'status', invites.status,
        'invitedAt', invites.created_at,
        'respondedAt', invites.responded_at
      )
      order by invites.created_at desc
    ),
    '[]'::jsonb
  )
  into v_team_invites
  from "Digi".team_invites invites
  where invites.account_id = v_account_id
    and invites.status <> 'accepted';

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', jobs.id,
        'fileName', jobs.file_name,
        'source', jobs.source,
        'status', jobs.status,
        'processedRows', jobs.processed_rows,
        'acceptedRows', jobs.accepted_rows,
        'rejectedRows', jobs.rejected_rows,
        'createdAt', jobs.created_at,
        'spaceId', jobs.space_id,
        'rows', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'rowNumber', rows.row_number,
              'status', rows.status,
              'spaceName', rows.space_name,
              'brandName', rows.brand_name,
              'contentType', rows.content_type,
              'title', rows.title,
              'subtitle', rows.subtitle,
              'sku', rows.sku,
              'message', rows.message
            )
            order by rows.row_number asc
          )
          from "Digi".catalog_import_rows rows
          where rows.job_id = jobs.id
        ), '[]'::jsonb)
      )
      order by jobs.created_at desc
    ),
    '[]'::jsonb
  )
  into v_import_jobs
  from (
    select *
    from "Digi".catalog_import_jobs
    where account_id = v_account_id
    order by created_at desc
    limit 6
  ) as jobs;

  with filtered_sessions as (
    select
      sessions.id,
      sessions.space_id,
      spaces.name as space_name,
      sessions.status,
      sessions.started_at,
      coalesce(sessions.ended_at, sessions.ends_at) as ended_at
    from "Digi".sessions sessions
    join "Digi".spaces spaces on spaces.id = sessions.space_id
    where spaces.account_id = v_account_id
      and (
        v_since is null
        or coalesce(sessions.ended_at, sessions.started_at, sessions.created_at) >= v_since
      )
  ),
  session_metrics as (
    select
      filtered_sessions.id,
      filtered_sessions.space_id,
      filtered_sessions.space_name,
      filtered_sessions.status,
      filtered_sessions.started_at,
      filtered_sessions.ended_at,
      count(distinct events.attendee_ref) filter (where events.attendee_ref is not null) as attendee_count,
      count(*) filter (where events.event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received')) as total_views,
      count(*) filter (where events.event_name in ('content_saved', 'offline_save_queued')) as total_saves
    from filtered_sessions
    left join "Digi".session_activity_events events on events.session_id = filtered_sessions.id
    group by filtered_sessions.id, filtered_sessions.space_id, filtered_sessions.space_name, filtered_sessions.status, filtered_sessions.started_at, filtered_sessions.ended_at
  )
  select
    count(*),
    coalesce(sum(attendee_count), 0),
    coalesce(sum(total_views), 0),
    coalesce(sum(total_saves), 0),
    case
      when coalesce(sum(total_views), 0) = 0 then 0
      else round(coalesce(sum(total_saves), 0)::numeric / sum(total_views)::numeric, 2)
    end
  into v_session_count, v_attendee_count, v_total_views, v_total_saves, v_save_rate
  from session_metrics;

  with filtered_sessions as (
    select
      sessions.id,
      sessions.space_id,
      spaces.name as space_name,
      sessions.status,
      sessions.started_at,
      coalesce(sessions.ended_at, sessions.ends_at) as ended_at
    from "Digi".sessions sessions
    join "Digi".spaces spaces on spaces.id = sessions.space_id
    where spaces.account_id = v_account_id
      and (
        v_since is null
        or coalesce(sessions.ended_at, sessions.started_at, sessions.created_at) >= v_since
      )
  ),
  session_metrics as (
    select
      filtered_sessions.id,
      filtered_sessions.space_id,
      filtered_sessions.space_name,
      filtered_sessions.status,
      filtered_sessions.started_at,
      filtered_sessions.ended_at,
      count(distinct events.attendee_ref) filter (where events.attendee_ref is not null) as attendee_count,
      count(*) filter (where events.event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received')) as total_views,
      count(*) filter (where events.event_name in ('content_saved', 'offline_save_queued')) as total_saves
    from filtered_sessions
    left join "Digi".session_activity_events events on events.session_id = filtered_sessions.id
    group by filtered_sessions.id, filtered_sessions.space_id, filtered_sessions.space_name, filtered_sessions.status, filtered_sessions.started_at, filtered_sessions.ended_at
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'spaceId', top_spaces.space_id,
        'spaceName', top_spaces.space_name,
        'sessionCount', top_spaces.session_count,
        'attendeeCount', top_spaces.attendee_count,
        'totalViews', top_spaces.total_views,
        'totalSaves', top_spaces.total_saves
      )
      order by top_spaces.total_saves desc, top_spaces.total_views desc
    ),
    '[]'::jsonb
  )
  into v_top_spaces
  from (
    select
      space_id,
      max(space_name) as space_name,
      count(*) as session_count,
      coalesce(sum(attendee_count), 0) as attendee_count,
      coalesce(sum(total_views), 0) as total_views,
      coalesce(sum(total_saves), 0) as total_saves
    from session_metrics
    group by space_id
    order by total_saves desc, total_views desc
    limit 3
  ) as top_spaces;

  with filtered_sessions as (
    select sessions.id
    from "Digi".sessions sessions
    join "Digi".spaces spaces on spaces.id = sessions.space_id
    where spaces.account_id = v_account_id
      and (
        v_since is null
        or coalesce(sessions.ended_at, sessions.started_at, sessions.created_at) >= v_since
      )
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'contentId', content_stats.content_id,
        'title', content_stats.content_title,
        'views', content_stats.views,
        'saves', content_stats.saves
      )
      order by content_stats.saves desc, content_stats.views desc
    ),
    '[]'::jsonb
  )
  into v_top_content
  from (
    select
      events.content_id,
      max(events.content_title) as content_title,
      count(*) filter (where events.event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received')) as views,
      count(*) filter (where events.event_name in ('content_saved', 'offline_save_queued')) as saves
    from "Digi".session_activity_events events
    join filtered_sessions sessions on sessions.id = events.session_id
    where events.content_id is not null
      and events.content_title is not null
    group by events.content_id
    order by saves desc, views desc
    limit 3
  ) as content_stats;

  with filtered_sessions as (
    select
      sessions.id,
      sessions.space_id,
      spaces.name as space_name,
      sessions.status,
      sessions.started_at,
      coalesce(sessions.ended_at, sessions.ends_at) as ended_at
    from "Digi".sessions sessions
    join "Digi".spaces spaces on spaces.id = sessions.space_id
    where spaces.account_id = v_account_id
      and (
        v_since is null
        or coalesce(sessions.ended_at, sessions.started_at, sessions.created_at) >= v_since
      )
  ),
  session_metrics as (
    select
      filtered_sessions.id,
      filtered_sessions.space_id,
      filtered_sessions.space_name,
      filtered_sessions.status,
      filtered_sessions.started_at,
      filtered_sessions.ended_at,
      count(distinct events.attendee_ref) filter (where events.attendee_ref is not null) as attendee_count,
      count(*) filter (where events.event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received')) as total_views,
      count(*) filter (where events.event_name in ('content_saved', 'offline_save_queued')) as total_saves
    from filtered_sessions
    left join "Digi".session_activity_events events on events.session_id = filtered_sessions.id
    group by filtered_sessions.id, filtered_sessions.space_id, filtered_sessions.space_name, filtered_sessions.status, filtered_sessions.started_at, filtered_sessions.ended_at
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'sessionId', session_metrics.id,
        'spaceId', session_metrics.space_id,
        'spaceName', session_metrics.space_name,
        'status', session_metrics.status,
        'startedAt', session_metrics.started_at,
        'endedAt', session_metrics.ended_at,
        'attendeeCount', session_metrics.attendee_count,
        'totalViews', session_metrics.total_views,
        'totalSaves', session_metrics.total_saves,
        'topContent', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'contentId', content_stats.content_id,
              'title', content_stats.content_title,
              'views', content_stats.views,
              'saves', content_stats.saves
            )
            order by content_stats.saves desc, content_stats.views desc
          )
          from (
            select
              events.content_id,
              max(events.content_title) as content_title,
              count(*) filter (where events.event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received')) as views,
              count(*) filter (where events.event_name in ('content_saved', 'offline_save_queued')) as saves
            from "Digi".session_activity_events events
            where events.session_id = session_metrics.id
              and events.content_id is not null
              and events.content_title is not null
            group by events.content_id
            order by saves desc, views desc
            limit 3
          ) as content_stats
        ), '[]'::jsonb)
      )
      order by coalesce(session_metrics.ended_at, session_metrics.started_at) desc
    ),
    '[]'::jsonb
  )
  into v_session_history
  from session_metrics;

  select coalesce(
    (
      select jsonb_agg(value order by row_number)
      from (
        select value, row_number() over () as row_number
        from jsonb_array_elements(v_session_history)
        limit 4
      ) as recent_history
    ),
    '[]'::jsonb
  )
  into v_recent_sessions;

  return jsonb_build_object(
    'analytics', jsonb_build_object(
      'range', p_range,
      'sessionCount', v_session_count,
      'activeSpaces', v_active_spaces,
      'attendeeCount', v_attendee_count,
      'totalViews', v_total_views,
      'totalSaves', v_total_saves,
      'saveRate', v_save_rate,
      'topSpaces', v_top_spaces,
      'topContent', v_top_content,
      'recentSessions', v_recent_sessions
    ),
    'teamMembers', v_team_members,
    'teamInvites', v_team_invites,
    'importJobs', v_import_jobs,
    'sessionHistory', v_session_history
  );
end;
$$;

create or replace function public.digi_get_live_panel(
  p_space_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_space record;
  v_session record;
  v_attendees jsonb := '[]'::jsonb;
  v_metrics jsonb := '{}'::jsonb;
  v_pinned_item jsonb := null;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select
    spaces.id,
    spaces.qr_slug
  into v_space
  from "Digi".spaces spaces
  join "Digi".accounts accounts on accounts.id = spaces.account_id
  where accounts.owner_user_id = v_user_id
    and spaces.archived_at is null
    and (p_space_id is null or spaces.id = p_space_id)
  order by spaces.is_default desc, spaces.created_at asc
  limit 1;

  if not found then
    return null;
  end if;

  select
    sessions.id,
    sessions.space_id,
    sessions.status,
    sessions.duration_minutes,
    sessions.started_at,
    sessions.ends_at,
    sessions.ended_at
  into v_session
  from "Digi".sessions sessions
  where sessions.space_id = v_space.id
    and sessions.status in ('live', 'ending')
  order by sessions.created_at desc
  limit 1;

  if not found then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'attendeeRef', attendee_rows.attendee_ref,
        'attendeeName', attendee_rows.attendee_name,
        'joinedAt', attendee_rows.joined_at,
        'lastSeenAt', attendee_rows.last_seen_at
      )
      order by attendee_rows.last_seen_at desc
    ),
    '[]'::jsonb
  )
  into v_attendees
  from (
    select
      attendee_ref,
      max(attendee_name) as attendee_name,
      min(created_at) as joined_at,
      max(created_at) as last_seen_at
    from "Digi".session_activity_events
    where session_id = v_session.id
      and attendee_ref is not null
    group by attendee_ref
    order by max(created_at) desc
    limit 8
  ) as attendee_rows;

  select jsonb_build_object(
    'attendeeCount', count(distinct attendee_ref),
    'peakAttendeeCount', count(distinct attendee_ref),
    'totalViews', count(*) filter (where event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received')),
    'totalSaves', count(*) filter (where event_name in ('content_saved', 'offline_save_queued')),
    'saveRate',
      case
        when count(*) filter (where event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received')) = 0
          then 0
        else round(
          (
            count(*) filter (where event_name in ('content_saved', 'offline_save_queued'))
          )::numeric
          /
          (
            count(*) filter (where event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received'))
          )::numeric,
          2
        )
      end
  )
  into v_metrics
  from "Digi".session_activity_events
  where session_id = v_session.id;

  select
    case
      when session_live_state.pinned_content_id is null then null
      else jsonb_build_object(
        'id', session_live_state.pinned_content_id,
        'title', session_live_state.pinned_content_title,
        'subtitle', session_live_state.pinned_content_subtitle,
        'collectionId', session_live_state.pinned_collection_id,
        'screen', session_live_state.pinned_attendee_screen,
        'cardId', session_live_state.pinned_card_id,
        'productIndex', session_live_state.pinned_product_index
      )
    end
  into v_pinned_item
  from "Digi".session_live_state
  where session_id = v_session.id;

  return jsonb_build_object(
    'sessionId', v_session.id,
    'spaceId', v_session.space_id,
    'qrSlug', v_space.qr_slug,
    'status', v_session.status,
    'startedAt', v_session.started_at,
    'endsAt', v_session.ends_at,
    'endedAt', v_session.ended_at,
    'pinnedItem', v_pinned_item,
    'attendees', v_attendees,
    'recentAttendees', v_attendees,
    'metrics', coalesce(v_metrics, jsonb_build_object(
      'attendeeCount', 0,
      'peakAttendeeCount', 0,
      'totalViews', 0,
      'totalSaves', 0,
      'saveRate', 0
    )),
    'summary', null
  );
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
    and spaces.archived_at is null
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

  insert into "Digi".session_live_state (
    session_id,
    space_id
  )
  values (
    v_session_id,
    p_space_id
  )
  on conflict (session_id) do nothing;

  perform "Digi".log_session_event(
    v_session_id,
    p_space_id,
    'session_started',
    'host'
  );

  return jsonb_build_object(
    'sessionId', v_session_id,
    'status', 'live',
    'startedAt', v_started_at,
    'endsAt', v_ends_at,
    'attendeeUrl', '/s/' || v_space.qr_slug
  );
end;
$$;

grant execute on function public.digi_get_current_account_id() to authenticated, service_role;
grant execute on function public.digi_create_brand_profile(text, text, text, text, boolean) to authenticated, service_role;
grant execute on function public.digi_create_space(text, uuid, "Digi".space_type, "Digi".space_mode, integer) to authenticated, service_role;
grant execute on function public.digi_assign_space_brand(uuid, uuid) to authenticated, service_role;
grant execute on function public.digi_archive_space(uuid) to authenticated, service_role;
grant execute on function public.digi_delete_space(uuid) to authenticated, service_role;
grant execute on function public.digi_invite_team_member(text, text, "Digi".team_role) to authenticated, service_role;
grant execute on function public.digi_remove_team_access(uuid, uuid) to authenticated, service_role;
grant execute on function public.digi_record_catalog_import(uuid, text, integer, integer, integer, "Digi".import_job_status, jsonb) to authenticated, service_role;
grant execute on function public.digi_get_operations_snapshot(text) to authenticated, service_role;
