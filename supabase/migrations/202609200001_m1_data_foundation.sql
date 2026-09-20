begin;

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.trust_label as enum (
  'Official Record',
  'Verified Evidence',
  'Corroborated Community Evidence',
  'Community Report',
  'Unverified',
  'Disputed'
);

create table public.source_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  publisher text not null check (length(trim(publisher)) > 0),
  budget_year integer not null check (budget_year between 2000 and 2100),
  document_type text not null default 'appropriation_act',
  source_url text not null unique check (source_url ~ '^https?://'),
  published_on date,
  accessed_at timestamptz not null default now(),
  file_sha256 text check (file_sha256 is null or file_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  receipt_id text not null unique
    check (receipt_id ~ '^PR-NG-FCT-2026-[0-9]{6}$'),
  budget_year integer not null check (budget_year = 2026),
  project_code text,
  official_title text not null check (length(trim(official_title)) > 0),
  plain_language_title text,
  plain_language_description text,
  amount numeric(20, 2) check (amount is null or amount >= 0),
  currency char(3) not null default 'NGN',
  sector text not null check (sector in (
    'healthcare', 'education', 'roads_transport', 'water_sanitation',
    'community_infrastructure'
  )),
  ministry text,
  department text,
  agency text,
  state text not null default 'Federal Capital Territory',
  area_council text check (area_council is null or area_council in (
    'Abaji', 'Abuja Municipal Area Council', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'
  )),
  community text,
  location_raw text not null check (length(trim(location_raw)) > 0),
  location_confidence text not null check (location_confidence in ('high', 'medium', 'low')),
  data_confidence text not null check (data_confidence in ('high', 'medium', 'low')),
  search_text text generated always as (
    lower(
      coalesce(receipt_id, '') || ' ' || coalesce(project_code, '') || ' ' ||
      coalesce(official_title, '') || ' ' || coalesce(plain_language_title, '') || ' ' ||
      coalesce(plain_language_description, '') || ' ' || coalesce(ministry, '') || ' ' ||
      coalesce(department, '') || ' ' || coalesce(agency, '') || ' ' ||
      coalesce(state, '') || ' ' || coalesce(area_council, '') || ' ' ||
      coalesce(community, '') || ' ' || coalesce(location_raw, '')
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_source_refs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_document_id uuid not null references public.source_documents(id) on delete restrict,
  source_page text,
  source_section text,
  source_excerpt text not null check (length(trim(source_excerpt)) > 0),
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, source_document_id)
);

create table public.evidence_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  submitter_id uuid references auth.users(id) on delete set null,
  title text not null check (length(trim(title)) > 0),
  description text not null check (length(trim(description)) > 0),
  observed_on date,
  location_text text,
  trust_status public.trust_label not null default 'Community Report',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidence_media (
  id uuid primary key default gen_random_uuid(),
  evidence_submission_id uuid not null references public.evidence_submissions(id) on delete cascade,
  storage_path text not null unique check (length(trim(storage_path)) > 0),
  media_type text not null check (media_type in ('image', 'video', 'audio', 'document')),
  caption text,
  content_sha256 text check (content_sha256 is null or content_sha256 ~ '^[a-f0-9]{64}$'),
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.verification_events (
  id uuid primary key default gen_random_uuid(),
  evidence_submission_id uuid not null references public.evidence_submissions(id) on delete cascade,
  verifier_id uuid references auth.users(id) on delete set null,
  from_status public.trust_label,
  to_status public.trust_label not null,
  notes text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger source_documents_set_updated_at before update on public.source_documents
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger project_source_refs_set_updated_at before update on public.project_source_refs
for each row execute function public.set_updated_at();
create trigger evidence_submissions_set_updated_at before update on public.evidence_submissions
for each row execute function public.set_updated_at();

create index projects_search_text_trgm_idx on public.projects using gin (search_text gin_trgm_ops);
create index projects_area_council_idx on public.projects (area_council);
create index projects_sector_idx on public.projects (sector);
create index projects_budget_year_idx on public.projects (budget_year);
create index project_source_refs_project_idx on public.project_source_refs (project_id);
create index evidence_submissions_project_idx on public.evidence_submissions (project_id);
create index evidence_media_submission_idx on public.evidence_media (evidence_submission_id);
create index verification_events_submission_idx on public.verification_events (evidence_submission_id);

alter table public.source_documents enable row level security;
alter table public.projects enable row level security;
alter table public.project_source_refs enable row level security;
alter table public.evidence_submissions enable row level security;
alter table public.evidence_media enable row level security;
alter table public.verification_events enable row level security;

create policy "Public can read source documents" on public.source_documents
for select to anon, authenticated using (true);
create policy "Public can read projects" on public.projects
for select to anon, authenticated using (true);
create policy "Public can read project source references" on public.project_source_refs
for select to anon, authenticated using (true);
create policy "Public can read reviewed evidence" on public.evidence_submissions
for select to anon, authenticated using (
  trust_status in ('Verified Evidence', 'Corroborated Community Evidence', 'Disputed')
);
create policy "Public can read media attached to reviewed evidence" on public.evidence_media
for select to anon, authenticated using (
  is_public and exists (
    select 1 from public.evidence_submissions submission
    where submission.id = evidence_submission_id
      and submission.trust_status in ('Verified Evidence', 'Corroborated Community Evidence', 'Disputed')
  )
);
create policy "Public can read verification history for reviewed evidence" on public.verification_events
for select to anon, authenticated using (
  exists (
    select 1 from public.evidence_submissions submission
    where submission.id = evidence_submission_id
      and submission.trust_status in ('Verified Evidence', 'Corroborated Community Evidence', 'Disputed')
  )
);

revoke insert, update, delete, truncate, references, trigger
on public.source_documents, public.projects, public.project_source_refs,
public.evidence_submissions, public.evidence_media, public.verification_events
from anon, authenticated;

grant select on public.source_documents, public.projects, public.project_source_refs,
public.evidence_submissions, public.evidence_media, public.verification_events
to anon, authenticated;
grant usage on type public.trust_label to anon, authenticated;

commit;
