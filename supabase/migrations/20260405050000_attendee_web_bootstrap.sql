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
      'pinnedItem', v_pinned_item
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
    'pinnedItem', null
  );
end;
$$;

create or replace function public.digi_get_attendee_live_state(
  p_qr_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  return public.digi_get_attendee_room(p_qr_slug);
end;
$$;

grant execute on function public.digi_get_attendee_room(text) to authenticated, anon, service_role;
grant execute on function public.digi_get_attendee_live_state(text) to authenticated, anon, service_role;
