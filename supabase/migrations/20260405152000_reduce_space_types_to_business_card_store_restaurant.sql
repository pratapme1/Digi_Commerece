do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = '"Digi"'::regnamespace
      and typname = 'space_type_next'
  ) then
    create type "Digi".space_type_next as enum ('business_card', 'store', 'restaurant');
  end if;
end
$$;

update "Digi".spaces
set space_type = 'other'
where space_type::text = 'business_card';

alter table "Digi".spaces
  alter column space_type type "Digi".space_type_next
  using (
    case
      when space_type::text in ('meeting', 'event', 'other') then 'business_card'::"Digi".space_type_next
      else space_type::text::"Digi".space_type_next
    end
  );

drop function if exists public.digi_save_host_setup(
  text,
  text,
  text,
  text,
  text,
  text,
  "Digi".space_type,
  "Digi".space_mode,
  integer
);

drop function if exists public.digi_create_space(
  text,
  uuid,
  "Digi".space_type,
  "Digi".space_mode,
  integer
);

drop type "Digi".space_type;

alter type "Digi".space_type_next rename to space_type;

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

  if p_space_type not in ('business_card', 'store', 'restaurant') then
    raise exception 'Unsupported space type: %', p_space_type;
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

  if p_space_type not in ('business_card', 'store', 'restaurant') then
    raise exception 'Unsupported space type: %', p_space_type;
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

grant execute on function public.digi_create_space(
  text,
  uuid,
  "Digi".space_type,
  "Digi".space_mode,
  integer
) to authenticated, service_role;
