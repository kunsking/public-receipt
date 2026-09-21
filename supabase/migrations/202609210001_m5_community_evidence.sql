begin;

alter table public.evidence_submissions
  add column observation_type text not null,
  add column area_council text not null,
  add column locality text,
  add column approximate_lat numeric(8, 5),
  add column approximate_lng numeric(8, 5),
  add column verification_status text not null default 'community_report',
  add column moderation_status text not null default 'pending',
  add column public_visibility boolean not null default false;

alter table public.evidence_submissions
  alter column description drop not null;

alter table public.evidence_submissions
  add constraint evidence_submissions_observation_type_check check (
    observation_type in (
      'work_started', 'appears_completed', 'appears_incomplete', 'cannot_locate', 'other'
    )
  ),
  add constraint evidence_submissions_description_length_check check (
    description is null or char_length(description) between 1 and 500
  ),
  add constraint evidence_submissions_area_council_check check (
    area_council in (
      'Abaji', 'Abuja Municipal Area Council', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'
    )
  ),
  add constraint evidence_submissions_locality_check check (
    locality is null or char_length(locality) between 1 and 120
  ),
  add constraint evidence_submissions_latitude_check check (
    approximate_lat is null or approximate_lat between -90 and 90
  ),
  add constraint evidence_submissions_longitude_check check (
    approximate_lng is null or approximate_lng between -180 and 180
  ),
  add constraint evidence_submissions_coordinate_pair_check check (
    (approximate_lat is null) = (approximate_lng is null)
  ),
  add constraint evidence_submissions_verification_status_check check (
    verification_status in (
      'community_report', 'corroborated', 'verified_independent', 'disputed'
    )
  ),
  add constraint evidence_submissions_moderation_status_check check (
    moderation_status in ('pending', 'approved', 'rejected')
  ),
  add constraint evidence_submissions_publication_check check (
    not public_visibility or moderation_status = 'approved'
  );

alter table public.evidence_media
  rename column evidence_submission_id to evidence_id;

alter table public.evidence_media
  add column mime_type text,
  add column width integer,
  add column height integer,
  add column file_size bigint;

alter table public.evidence_media
  add constraint evidence_media_mime_type_check check (
    mime_type is null or mime_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  add constraint evidence_media_width_check check (width is null or width > 0),
  add constraint evidence_media_height_check check (height is null or height > 0),
  add constraint evidence_media_file_size_check check (
    file_size is null or file_size between 1 and 5242880
  );

alter table public.verification_events
  rename column evidence_submission_id to evidence_id;

alter table public.verification_events
  add column previous_status text,
  add column new_status text not null default 'community_report',
  add column reason text,
  add column review_method text;

alter table public.verification_events
  add constraint verification_events_previous_status_check check (
    previous_status is null or previous_status in (
      'community_report', 'corroborated', 'verified_independent', 'disputed'
    )
  ),
  add constraint verification_events_new_status_check check (
    new_status in ('community_report', 'corroborated', 'verified_independent', 'disputed')
  ),
  add constraint verification_events_review_method_check check (
    review_method is null or review_method in (
      'submission', 'moderation', 'corroboration', 'independent_review'
    )
  );

drop policy if exists "Public can read reviewed evidence" on public.evidence_submissions;
drop policy if exists "Public can read media attached to reviewed evidence" on public.evidence_media;
drop policy if exists "Public can read verification history for reviewed evidence" on public.verification_events;

create policy "Public can read approved visible evidence" on public.evidence_submissions
for select to anon, authenticated using (
  moderation_status = 'approved' and public_visibility
);

create policy "Public can read media for approved visible evidence" on public.evidence_media
for select to anon, authenticated using (
  is_public and exists (
    select 1
    from public.evidence_submissions submission
    where submission.id = evidence_id
      and submission.moderation_status = 'approved'
      and submission.public_visibility
  )
);

create policy "Public can read history for approved visible evidence" on public.verification_events
for select to anon, authenticated using (
  exists (
    select 1
    from public.evidence_submissions submission
    where submission.id = evidence_id
      and submission.moderation_status = 'approved'
      and submission.public_visibility
  )
);

create index evidence_submissions_public_project_idx
  on public.evidence_submissions (project_id, moderation_status, public_visibility);
create index evidence_submissions_verification_status_idx
  on public.evidence_submissions (verification_status);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'evidence-private',
  'evidence-private',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.create_community_evidence(
  p_project_id uuid,
  p_observation_type text,
  p_area_council text,
  p_description text default null,
  p_locality text default null,
  p_approximate_lat numeric default null,
  p_approximate_lng numeric default null,
  p_storage_path text default null,
  p_mime_type text default null,
  p_width integer default null,
  p_height integer default null,
  p_file_size bigint default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  evidence_id uuid;
  evidence_title text;
begin
  evidence_title := case p_observation_type
    when 'work_started' then 'Work has started'
    when 'appears_completed' then 'Work appears completed'
    when 'appears_incomplete' then 'Work appears incomplete'
    when 'cannot_locate' then 'I could not locate the project'
    when 'other' then 'Something else'
    else null
  end;

  if evidence_title is null then
    raise exception 'invalid observation type';
  end if;

  if not exists (
    select 1 from public.projects where id = p_project_id
  ) then
    raise exception 'unknown project';
  end if;

  if (p_storage_path is null) <> (p_mime_type is null) or
     (p_storage_path is null) <> (p_width is null) or
     (p_storage_path is null) <> (p_height is null) or
     (p_storage_path is null) <> (p_file_size is null) then
    raise exception 'incomplete media metadata';
  end if;

  insert into public.evidence_submissions (
    project_id,
    title,
    description,
    location_text,
    trust_status,
    observation_type,
    area_council,
    locality,
    approximate_lat,
    approximate_lng,
    verification_status,
    moderation_status,
    public_visibility
  )
  values (
    p_project_id,
    evidence_title,
    nullif(trim(p_description), ''),
    concat_ws(', ', nullif(trim(p_locality), ''), p_area_council),
    'Community Report'::public.trust_label,
    p_observation_type,
    p_area_council,
    nullif(trim(p_locality), ''),
    p_approximate_lat,
    p_approximate_lng,
    'community_report',
    'pending',
    false
  )
  returning id into evidence_id;

  insert into public.verification_events (
    evidence_id,
    from_status,
    to_status,
    notes,
    previous_status,
    new_status,
    reason,
    review_method
  )
  values (
    evidence_id,
    null,
    'Community Report'::public.trust_label,
    'Citizen evidence submitted',
    null,
    'community_report',
    'citizen_submission',
    'submission'
  );

  if p_storage_path is not null then
    insert into public.evidence_media (
      evidence_id,
      storage_path,
      media_type,
      content_sha256,
      is_public,
      mime_type,
      width,
      height,
      file_size
    )
    values (
      evidence_id,
      p_storage_path,
      'image',
      null,
      false,
      p_mime_type,
      p_width,
      p_height,
      p_file_size
    );
  end if;

  return evidence_id;
end;
$$;

revoke execute on function public.create_community_evidence(
  uuid, text, text, text, text, numeric, numeric, text, text, integer, integer, bigint
) from public, anon, authenticated;

grant execute on function public.create_community_evidence(
  uuid, text, text, text, text, numeric, numeric, text, text, integer, integer, bigint
) to service_role;

commit;
