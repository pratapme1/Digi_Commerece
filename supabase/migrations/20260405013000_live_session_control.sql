create table "Digi".session_live_state (
  session_id uuid primary key references "Digi".sessions (id) on delete cascade,
  space_id uuid not null references "Digi".spaces (id) on delete cascade,
  pinned_content_id text,
  pinned_content_title text,
  pinned_content_subtitle text,
  pinned_collection_id text,
  pinned_attendee_screen text,
  pinned_card_id text,
  pinned_product_index integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table "Digi".session_activity_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references "Digi".sessions (id) on delete cascade,
  space_id uuid not null references "Digi".spaces (id) on delete cascade,
  event_name text not null,
  surface text not null check (surface in ('host', 'attendee')),
  attendee_ref text,
  attendee_name text,
  content_id text,
  content_title text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index session_live_state_space_idx
  on "Digi".session_live_state (space_id);

create index session_activity_events_session_idx
  on "Digi".session_activity_events (session_id, created_at desc);

create index session_activity_events_space_idx
  on "Digi".session_activity_events (space_id, created_at desc);

create index session_activity_events_attendee_idx
  on "Digi".session_activity_events (session_id, attendee_ref)
  where attendee_ref is not null;

create trigger session_live_state_set_updated_at
before update on "Digi".session_live_state
for each row execute function "Digi".set_updated_at();

grant select, insert, update on "Digi".session_live_state to authenticated, service_role;
grant select on "Digi".session_activity_events to authenticated, service_role;

alter table "Digi".session_live_state enable row level security;
alter table "Digi".session_activity_events enable row level security;

create policy session_live_state_owner_read
  on "Digi".session_live_state
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = session_live_state.space_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy session_live_state_owner_insert
  on "Digi".session_live_state
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = session_live_state.space_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy session_live_state_owner_update
  on "Digi".session_live_state
  for update
  to authenticated
  using (
    exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = session_live_state.space_id
        and accounts.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = session_live_state.space_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create policy session_activity_events_owner_read
  on "Digi".session_activity_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from "Digi".spaces spaces
      join "Digi".accounts accounts on accounts.id = spaces.account_id
      where spaces.id = session_activity_events.space_id
        and accounts.owner_user_id = auth.uid()
    )
  );

create or replace function "Digi".log_session_event(
  p_session_id uuid,
  p_space_id uuid,
  p_event_name text,
  p_surface text,
  p_attendee_ref text default null,
  p_attendee_name text default null,
  p_content_id text default null,
  p_content_title text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into "Digi".session_activity_events (
    session_id,
    space_id,
    event_name,
    surface,
    attendee_ref,
    attendee_name,
    content_id,
    content_title,
    metadata
  )
  values (
    p_session_id,
    p_space_id,
    p_event_name,
    p_surface,
    p_attendee_ref,
    p_attendee_name,
    p_content_id,
    p_content_title,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function public.digi_get_session_summary(
  p_session_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_session record;
  v_attendee_count integer := 0;
  v_total_views integer := 0;
  v_total_saves integer := 0;
  v_save_rate numeric := 0;
  v_top_content jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
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
  join "Digi".spaces spaces on spaces.id = sessions.space_id
  join "Digi".accounts accounts on accounts.id = spaces.account_id
  where sessions.id = p_session_id
    and accounts.owner_user_id = v_user_id;

  if not found then
    raise exception 'Session not found';
  end if;

  select count(distinct attendee_ref)
  into v_attendee_count
  from "Digi".session_activity_events
  where session_id = p_session_id
    and attendee_ref is not null;

  select count(*)
  into v_total_views
  from "Digi".session_activity_events
  where session_id = p_session_id
    and event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received');

  select count(*)
  into v_total_saves
  from "Digi".session_activity_events
  where session_id = p_session_id
    and event_name in ('content_saved', 'offline_save_queued');

  if v_total_views > 0 then
    v_save_rate := round((v_total_saves::numeric / v_total_views::numeric), 2);
  end if;

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
      content_id,
      max(content_title) as content_title,
      count(*) filter (where event_name in ('space_overview_viewed', 'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received')) as views,
      count(*) filter (where event_name in ('content_saved', 'offline_save_queued')) as saves
    from "Digi".session_activity_events
    where session_id = p_session_id
      and content_id is not null
      and content_title is not null
    group by content_id
    order by saves desc, views desc
    limit 3
  ) as content_stats;

  return jsonb_build_object(
    'sessionId', v_session.id,
    'status', v_session.status,
    'startedAt', v_session.started_at,
    'endedAt', coalesce(v_session.ended_at, v_session.ends_at),
    'durationMinutes', v_session.duration_minutes,
    'attendeeCount', v_attendee_count,
    'peakAttendeeCount', v_attendee_count,
    'totalViews', v_total_views,
    'totalSaves', v_total_saves,
    'saveRate', v_save_rate,
    'topContent', v_top_content,
    'shareText', format(
      'Live session summary: %s attendees, %s content views, %s saves.',
      v_attendee_count,
      v_total_views,
      v_total_saves
    )
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

create or replace function public.digi_pin_live_content(
  p_session_id uuid,
  p_content_id text,
  p_content_title text,
  p_content_subtitle text,
  p_collection_id text,
  p_attendee_screen text,
  p_card_id text,
  p_product_index integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_session record;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select
    sessions.id,
    sessions.space_id
  into v_session
  from "Digi".sessions sessions
  join "Digi".spaces spaces on spaces.id = sessions.space_id
  join "Digi".accounts accounts on accounts.id = spaces.account_id
  where sessions.id = p_session_id
    and accounts.owner_user_id = v_user_id;

  if not found then
    raise exception 'Session not found';
  end if;

  insert into "Digi".session_live_state (
    session_id,
    space_id,
    pinned_content_id,
    pinned_content_title,
    pinned_content_subtitle,
    pinned_collection_id,
    pinned_attendee_screen,
    pinned_card_id,
    pinned_product_index
  )
  values (
    v_session.id,
    v_session.space_id,
    p_content_id,
    p_content_title,
    p_content_subtitle,
    p_collection_id,
    p_attendee_screen,
    p_card_id,
    p_product_index
  )
  on conflict (session_id) do update
    set
      pinned_content_id = excluded.pinned_content_id,
      pinned_content_title = excluded.pinned_content_title,
      pinned_content_subtitle = excluded.pinned_content_subtitle,
      pinned_collection_id = excluded.pinned_collection_id,
      pinned_attendee_screen = excluded.pinned_attendee_screen,
      pinned_card_id = excluded.pinned_card_id,
      pinned_product_index = excluded.pinned_product_index,
      updated_at = timezone('utc', now());

  perform "Digi".log_session_event(
    v_session.id,
    v_session.space_id,
    'featured_item_changed',
    'host',
    null,
    null,
    p_content_id,
    p_content_title,
    jsonb_build_object('collectionId', p_collection_id, 'screen', p_attendee_screen)
  );

  return jsonb_build_object(
    'sessionId', v_session.id,
    'pinnedItem', jsonb_build_object(
      'id', p_content_id,
      'title', p_content_title,
      'subtitle', p_content_subtitle,
      'collectionId', p_collection_id,
      'screen', p_attendee_screen,
      'cardId', p_card_id,
      'productIndex', p_product_index
    )
  );
end;
$$;

create or replace function public.digi_end_live_session(
  p_session_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_session record;
  v_ended_at timestamptz := timezone('utc', now());
  v_summary jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select
    sessions.id,
    sessions.space_id
  into v_session
  from "Digi".sessions sessions
  join "Digi".spaces spaces on spaces.id = sessions.space_id
  join "Digi".accounts accounts on accounts.id = spaces.account_id
  where sessions.id = p_session_id
    and accounts.owner_user_id = v_user_id;

  if not found then
    raise exception 'Session not found';
  end if;

  update "Digi".sessions
  set
    status = 'ended',
    ended_at = v_ended_at,
    updated_at = v_ended_at
  where id = p_session_id;

  perform "Digi".log_session_event(
    p_session_id,
    v_session.space_id,
    'session_ended',
    'host'
  );

  v_summary := public.digi_get_session_summary(p_session_id);

  return jsonb_build_object(
    'sessionId', p_session_id,
    'status', 'ended',
    'endedAt', v_ended_at,
    'summary', v_summary
  );
end;
$$;

create or replace function public.digi_record_attendee_event(
  p_qr_slug text,
  p_attendee_ref text,
  p_attendee_name text default null,
  p_event_name text default 'presence_registered',
  p_content_id text default null,
  p_content_title text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_session record;
  v_recent_attendees jsonb := '[]'::jsonb;
  v_attendee_count integer := 0;
begin
  select
    sessions.id,
    sessions.space_id
  into v_session
  from "Digi".sessions sessions
  join "Digi".spaces spaces on spaces.id = sessions.space_id
  where spaces.qr_slug = p_qr_slug
    and sessions.status in ('live', 'ending')
  order by sessions.created_at desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'sessionId', null,
      'status', 'inactive',
      'attendeeCount', 0,
      'recentAttendees', '[]'::jsonb
    );
  end if;

  perform "Digi".log_session_event(
    v_session.id,
    v_session.space_id,
    p_event_name,
    'attendee',
    p_attendee_ref,
    nullif(p_attendee_name, ''),
    p_content_id,
    p_content_title
  );

  select count(distinct attendee_ref)
  into v_attendee_count
  from "Digi".session_activity_events
  where session_id = v_session.id
    and attendee_ref is not null;

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
  into v_recent_attendees
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

  return jsonb_build_object(
    'sessionId', v_session.id,
    'status', 'live',
    'attendeeCount', v_attendee_count,
    'recentAttendees', v_recent_attendees
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

grant execute on function "Digi".log_session_event(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) to authenticated, anon, service_role;

grant execute on function public.digi_get_session_summary(uuid) to authenticated, service_role;
grant execute on function public.digi_get_live_panel(uuid) to authenticated, service_role;
grant execute on function public.digi_pin_live_content(uuid, text, text, text, text, text, text, integer) to authenticated, service_role;
grant execute on function public.digi_end_live_session(uuid) to authenticated, service_role;
grant execute on function public.digi_record_attendee_event(text, text, text, text, text, text) to authenticated, anon, service_role;
grant execute on function public.digi_go_live(uuid, integer) to authenticated, service_role;
