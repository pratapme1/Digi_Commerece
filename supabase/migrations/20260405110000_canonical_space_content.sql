create table if not exists "Digi".space_content_entries (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references "Digi".spaces (id) on delete cascade,
  source text not null check (source in ('seed', 'import')),
  content_type text not null check (content_type in ('product', 'contact', 'menu', 'story', 'offer')),
  title text not null,
  subtitle text not null default '',
  sku text,
  collection_id text not null,
  attendee_screen text not null check (attendee_screen in ('ps', 'cs', 'ms', 'ls')),
  card_id text not null,
  product_index integer,
  rank integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists space_content_entries_space_idx
  on "Digi".space_content_entries (space_id, rank asc, created_at asc);

create index if not exists space_content_entries_source_idx
  on "Digi".space_content_entries (space_id, source, content_type);

drop trigger if exists space_content_entries_set_updated_at on "Digi".space_content_entries;
create trigger space_content_entries_set_updated_at
before update on "Digi".space_content_entries
for each row execute function "Digi".set_updated_at();

grant select, insert, update, delete on "Digi".space_content_entries to authenticated, service_role;

alter table "Digi".space_content_entries enable row level security;

create policy space_content_entries_owner_read
  on "Digi".space_content_entries
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = space_content_entries.space_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create or replace function "Digi".space_content_collection_id(
  p_content_type text
)
returns text
language sql
immutable
as $$
  select case
    when p_content_type = 'product' then 'products'
    when p_content_type = 'contact' then 'contacts'
    when p_content_type = 'menu' then 'menu'
    else 'live'
  end;
$$;

create or replace function "Digi".space_content_screen(
  p_content_type text
)
returns text
language sql
immutable
as $$
  select case
    when p_content_type = 'product' then 'ps'
    when p_content_type = 'contact' then 'cs'
    when p_content_type = 'menu' then 'ms'
    else 'ls'
  end;
$$;

create or replace function "Digi".build_space_content_entries_json(
  p_space_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', entries.id,
        'spaceId', entries.space_id,
        'source', entries.source,
        'contentType', entries.content_type,
        'title', entries.title,
        'subtitle', entries.subtitle,
        'sku', entries.sku,
        'collectionId', entries.collection_id,
        'screen', entries.attendee_screen,
        'cardId', entries.card_id,
        'productIndex', entries.product_index,
        'rank', entries.rank,
        'metadata', entries.metadata
      )
      order by entries.rank asc, entries.created_at asc
    ),
    '[]'::jsonb
  )
  from "Digi".space_content_entries entries
  where entries.space_id = p_space_id;
$$;

create or replace function "Digi".promote_catalog_import_to_space_content(
  p_job_id uuid,
  p_space_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if p_space_id is null then
    return;
  end if;

  delete from "Digi".space_content_entries
  where space_id = p_space_id
    and source = 'import';

  insert into "Digi".space_content_entries (
    space_id,
    source,
    content_type,
    title,
    subtitle,
    sku,
    collection_id,
    attendee_screen,
    card_id,
    product_index,
    rank,
    metadata
  )
  select
    p_space_id,
    'import',
    rows.content_type,
    rows.title,
    rows.subtitle,
    nullif(rows.sku, ''),
    "Digi".space_content_collection_id(rows.content_type),
    "Digi".space_content_screen(rows.content_type),
    case
      when nullif(rows.sku, '') is not null then rows.sku
      else lower(regexp_replace(rows.title, '[^A-Za-z0-9]+', '-', 'g'))
    end,
    case
      when rows.content_type = 'product' then row_number() over (partition by rows.content_type order by rows.row_number) - 1
      else null
    end,
    row_number() over (order by rows.row_number) - 1,
    case
      when rows.content_type = 'product' then jsonb_build_object(
        'badge', 'Imported',
        'category', 'Catalog item',
        'price', 'Host-managed',
        'mrp', case when nullif(rows.sku, '') is not null then 'SKU ' || rows.sku else '' end,
        'discount', 'Imported',
        'moq', 'Imported via CSV',
        'margin', coalesce(nullif(rows.subtitle, ''), 'Host-managed item'),
        'specs', case
          when nullif(rows.sku, '') is not null then jsonb_build_array(jsonb_build_object('label', 'SKU', 'value', rows.sku))
          else jsonb_build_array(jsonb_build_object('label', 'Source', 'value', 'Imported catalog'))
        end
      )
      when rows.content_type = 'contact' then jsonb_build_object(
        'role', coalesce(nullif(rows.subtitle, ''), 'Host contact'),
        'company', 'Host workspace',
        'phone', 'Available from host',
        'email', 'Shared on request',
        'linkedin', 'Host-managed contact',
        'note', coalesce(nullif(rows.message, ''), 'Imported contact'),
        'verificationLabel', 'Host shared'
      )
      when rows.content_type = 'menu' then jsonb_build_object(
        'section', 'Imported menu',
        'price', case when nullif(rows.sku, '') is not null then 'SKU ' || rows.sku else '' end,
        'description', coalesce(nullif(rows.subtitle, ''), 'Imported menu item'),
        'tags', jsonb_build_array('Imported'),
        'serviceName', 'Current menu',
        'serviceDescription', 'Host-managed menu',
        'serviceDate', 'Today',
        'special', rows.row_number = (
          select min(inner_rows.row_number)
          from "Digi".catalog_import_rows inner_rows
          where inner_rows.job_id = p_job_id
            and inner_rows.status = 'accepted'
            and inner_rows.content_type = 'menu'
        )
      )
      else jsonb_build_object(
        'icon', case when rows.content_type = 'offer' then '★' else '•' end,
        'timestamp', coalesce(nullif(rows.subtitle, ''), 'Imported update'),
        'saveTitle', rows.title,
        'presenterLabel', 'Host spotlight',
        'spotlightEyebrow', case when rows.content_type = 'offer' then 'Featured offer' else 'Live update' end,
        'spotlightMeta', jsonb_build_array(
          jsonb_build_object('label', 'Source', 'value', 'Imported catalog'),
          jsonb_build_object('label', 'Type', 'value', rows.content_type)
        ),
        'timelineLabel', 'Live timeline'
      )
    end
  from "Digi".catalog_import_rows rows
  where rows.job_id = p_job_id
    and rows.status = 'accepted'
    and rows.content_type in ('product', 'contact', 'menu', 'story', 'offer')
  order by rows.row_number asc;
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

  perform "Digi".promote_catalog_import_to_space_content(v_job_id, p_space_id);

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

create or replace function public.digi_get_host_content_catalogs()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_account_id uuid := public.digi_get_current_account_id();
  v_catalogs jsonb := '[]'::jsonb;
begin
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'spaceId', spaces.id,
        'entries', "Digi".build_space_content_entries_json(spaces.id),
        'updatedAt', (
          select max(entries.updated_at)
          from "Digi".space_content_entries entries
          where entries.space_id = spaces.id
        )
      )
      order by spaces.created_at asc
    ),
    '[]'::jsonb
  )
  into v_catalogs
  from "Digi".spaces spaces
  where spaces.account_id = v_account_id;

  return jsonb_build_object(
    'catalogs', v_catalogs
  );
end;
$$;

create or replace function public.digi_get_attendee_room(
  p_qr_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_space record;
  v_session record;
  v_latest_session record;
  v_attendee_count integer := 0;
  v_pinned_item jsonb := null;
  v_brand_name text;
  v_brand_mark text;
  v_status text := 'inactive';
  v_content_entries jsonb := '[]'::jsonb;
begin
  select
    spaces.id,
    spaces.name,
    spaces.space_type,
    spaces.mode,
    spaces.qr_slug,
    brand_profiles.name as brand_name,
    brand_profiles.primary_color,
    brand_profiles.secondary_color,
    brand_profiles.font_family,
    accounts.verification_tier
  into v_space
  from "Digi".spaces spaces
  join "Digi".brand_profiles brand_profiles on brand_profiles.id = spaces.brand_profile_id
  join "Digi".accounts accounts on accounts.id = spaces.account_id
  where spaces.qr_slug = trim(coalesce(p_qr_slug, ''))
    and spaces.archived_at is null
  order by spaces.created_at desc
  limit 1;

  if not found then
    return null;
  end if;

  v_brand_name := coalesce(nullif(trim(v_space.brand_name), ''), v_space.name);
  v_brand_mark := upper(left(regexp_replace(v_brand_name, '[^A-Za-z0-9]+', '', 'g'), 2));
  v_content_entries := "Digi".build_space_content_entries_json(v_space.id);

  select
    sessions.id,
    sessions.status,
    sessions.started_at,
    sessions.ends_at,
    sessions.ended_at
  into v_session
  from "Digi".sessions sessions
  where sessions.space_id = v_space.id
    and sessions.status in ('live', 'ending')
  order by sessions.created_at desc
  limit 1;

  if found then
    v_status := v_session.status::text;

    select count(distinct attendee_ref)
    into v_attendee_count
    from "Digi".session_activity_events
    where session_id = v_session.id
      and attendee_ref is not null;

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
      'spaceId', v_space.id,
      'qrSlug', v_space.qr_slug,
      'attendeeUrl', '/s/' || v_space.qr_slug,
      'spaceName', v_space.name,
      'spaceType', v_space.space_type,
      'mode', v_space.mode,
      'verificationTier', v_space.verification_tier,
      'verificationLabel',
        case
          when v_space.verification_tier = 'business_verified' then 'Business verified'
          else 'Phone verified'
        end,
      'brand', jsonb_build_object(
        'name', v_brand_name,
        'mark', coalesce(nullif(v_brand_mark, ''), 'DG'),
        'primaryColor', v_space.primary_color,
        'secondaryColor', v_space.secondary_color,
        'fontFamily', v_space.font_family
      ),
      'status', v_status,
      'sessionId', v_session.id,
      'startedAt', v_session.started_at,
      'endsAt', v_session.ends_at,
      'endedAt', v_session.ended_at,
      'attendeeCount', v_attendee_count,
      'pinnedItem', v_pinned_item,
      'contentEntries', v_content_entries
    );
  end if;

  select
    sessions.id,
    sessions.status,
    sessions.started_at,
    sessions.ends_at,
    sessions.ended_at
  into v_latest_session
  from "Digi".sessions sessions
  where sessions.space_id = v_space.id
  order by sessions.created_at desc
  limit 1;

  if found and v_latest_session.status = 'ended' then
    v_status := 'ended';
  else
    v_status := 'inactive';
  end if;

  return jsonb_build_object(
    'spaceId', v_space.id,
    'qrSlug', v_space.qr_slug,
    'attendeeUrl', '/s/' || v_space.qr_slug,
    'spaceName', v_space.name,
    'spaceType', v_space.space_type,
    'mode', v_space.mode,
    'verificationTier', v_space.verification_tier,
    'verificationLabel',
      case
        when v_space.verification_tier = 'business_verified' then 'Business verified'
        else 'Phone verified'
      end,
    'brand', jsonb_build_object(
      'name', v_brand_name,
      'mark', coalesce(nullif(v_brand_mark, ''), 'DG'),
      'primaryColor', v_space.primary_color,
      'secondaryColor', v_space.secondary_color,
      'fontFamily', v_space.font_family
    ),
    'status', v_status,
    'sessionId', coalesce(v_latest_session.id, null),
    'startedAt', coalesce(v_latest_session.started_at, null),
    'endsAt', coalesce(v_latest_session.ends_at, null),
    'endedAt', coalesce(v_latest_session.ended_at, null),
    'attendeeCount', 0,
    'pinnedItem', null,
    'contentEntries', v_content_entries
  );
end;
$$;

grant execute on function public.digi_get_host_content_catalogs() to authenticated, service_role;
grant execute on function public.digi_record_catalog_import(uuid, text, integer, integer, integer, "Digi".import_job_status, jsonb) to authenticated, service_role;
grant execute on function public.digi_get_attendee_room(text) to authenticated, anon, service_role;
