import type { SupabaseClient } from "@supabase/supabase-js";

import type { FctAreaCouncil, ProjectSector } from "@/lib/domain/constants";
import type { Project, ProjectSource } from "@/lib/domain/project";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ProjectDatabaseRow {
  id: string;
  receipt_id: string;
  budget_year: number;
  project_code: string | null;
  official_title: string;
  plain_language_title: string | null;
  plain_language_description: string | null;
  amount: number | string | null;
  currency: string;
  sector: ProjectSector;
  ministry: string | null;
  department: string | null;
  agency: string | null;
  state: string;
  area_council: FctAreaCouncil | null;
  community: string | null;
  location_raw: string;
  location_confidence: Project["locationConfidence"];
  data_confidence: Project["dataConfidence"];
  created_at: string;
  updated_at: string;
}

interface ProjectSourceDatabaseRow {
  id: string;
  project_id: string;
  source_document_id: string;
  source_page: string | null;
  source_section: string | null;
  source_excerpt: string;
  source_documents: {
    id: string;
    title: string;
    publisher: string;
    budget_year: number;
    document_type: string;
    source_url: string;
    published_on: string | null;
    accessed_at: string;
  };
}

export interface ListProjectsOptions {
  limit?: number;
  offset?: number;
}

export function mapProjectRow(row: ProjectDatabaseRow): Project {
  return {
    id: row.id,
    receiptId: row.receipt_id,
    budgetYear: row.budget_year,
    projectCode: row.project_code,
    officialTitle: row.official_title,
    plainLanguageTitle: row.plain_language_title,
    plainLanguageDescription: row.plain_language_description,
    amount: row.amount === null ? null : Number(row.amount),
    currency: row.currency,
    sector: row.sector,
    ministry: row.ministry,
    department: row.department,
    agency: row.agency,
    state: row.state,
    areaCouncil: row.area_council,
    community: row.community,
    locationRaw: row.location_raw,
    locationConfidence: row.location_confidence,
    dataConfidence: row.data_confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function clientOrDefault(client?: SupabaseClient) {
  return client ?? createSupabaseServerClient();
}

export async function getProjectByReceiptId(
  receiptId: string,
  client?: SupabaseClient,
): Promise<Project | null> {
  const supabase = await clientOrDefault(client);
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("receipt_id", receiptId)
    .maybeSingle();

  if (error) throw new Error(`Unable to load project ${receiptId}: ${error.message}`);
  return data ? mapProjectRow(data as ProjectDatabaseRow) : null;
}

export async function listProjects(
  options: ListProjectsOptions = {},
  client?: SupabaseClient,
): Promise<Project[]> {
  const supabase = await clientOrDefault(client);
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("receipt_id", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Unable to list projects: ${error.message}`);
  return ((data ?? []) as ProjectDatabaseRow[]).map(mapProjectRow);
}

export async function getProjectsByAreaCouncil(
  areaCouncil: FctAreaCouncil,
  options: ListProjectsOptions = {},
  client?: SupabaseClient,
): Promise<Project[]> {
  const supabase = await clientOrDefault(client);
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("area_council", areaCouncil)
    .order("receipt_id", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Unable to list projects for ${areaCouncil}: ${error.message}`);
  return ((data ?? []) as ProjectDatabaseRow[]).map(mapProjectRow);
}

export async function getProjectsBySector(
  sector: ProjectSector,
  options: ListProjectsOptions = {},
  client?: SupabaseClient,
): Promise<Project[]> {
  const supabase = await clientOrDefault(client);
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("sector", sector)
    .order("receipt_id", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Unable to list ${sector} projects: ${error.message}`);
  return ((data ?? []) as ProjectDatabaseRow[]).map(mapProjectRow);
}

export async function getProjectSource(
  projectId: string,
  client?: SupabaseClient,
): Promise<ProjectSource | null> {
  const supabase = await clientOrDefault(client);
  const { data, error } = await supabase
    .from("project_source_refs")
    .select("*, source_documents(*)")
    .eq("project_id", projectId)
    .eq("is_primary", true)
    .maybeSingle();

  if (error) throw new Error(`Unable to load project source: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as ProjectSourceDatabaseRow;
  return {
    id: row.id,
    projectId: row.project_id,
    sourceDocumentId: row.source_document_id,
    sourcePage: row.source_page,
    sourceSection: row.source_section,
    sourceExcerpt: row.source_excerpt,
    sourceDocument: {
      id: row.source_documents.id,
      title: row.source_documents.title,
      publisher: row.source_documents.publisher,
      budgetYear: row.source_documents.budget_year,
      documentType: row.source_documents.document_type,
      sourceUrl: row.source_documents.source_url,
      publishedOn: row.source_documents.published_on,
      accessedAt: row.source_documents.accessed_at,
    },
  };
}

export async function countProjects(client?: SupabaseClient): Promise<number> {
  const supabase = await clientOrDefault(client);
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  if (error) throw new Error(`Unable to count projects: ${error.message}`);
  return count ?? 0;
}
