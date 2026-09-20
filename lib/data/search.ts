import type { SupabaseClient } from "@supabase/supabase-js";

import type { SearchInterpretation } from "@/lib/ai/schemas";
import type { Project } from "@/lib/domain/project";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapProjectRow } from "@/lib/data/projects";

export interface SearchProjectResult {
  id: string;
  receiptId: string;
  budgetYear: number;
  officialTitle: string;
  plainLanguageTitle: string | null;
  amount: number | null;
  currency: string;
  sector: Project["sector"];
  areaCouncil: Project["areaCouncil"];
  dataConfidence: Project["dataConfidence"];
}
const CONFIDENCE_RANK: Record<Project["dataConfidence"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function normalizeSearchTerm(value: string): string | null {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  return normalized || null;
}

function toSearchResult(project: Project): SearchProjectResult {
  return {
    id: project.id,
    receiptId: project.receiptId,
    budgetYear: project.budgetYear,
    officialTitle: project.officialTitle,
    plainLanguageTitle: project.plainLanguageTitle,
    amount: project.amount,
    currency: project.currency,
    sector: project.sector,
    areaCouncil: project.areaCouncil,
    dataConfidence: project.dataConfidence,
  };
}

export async function searchProjects(
  interpretation: SearchInterpretation,
  client?: SupabaseClient,
): Promise<SearchProjectResult[]> {
  if (interpretation.needsClarification || interpretation.intent === "unknown") return [];

  const supabase = client ?? (await createSupabaseServerClient());
  let request = supabase.from("projects").select("*");

  if (interpretation.year) request = request.eq("budget_year", interpretation.year);
  if (interpretation.areaCouncil) {
    request = request.eq("area_council", interpretation.areaCouncil);
  }
  if (interpretation.sector && interpretation.sector !== "other") {
    request = request.eq("sector", interpretation.sector);
  }

  for (const rawTerm of interpretation.terms) {
    const term = normalizeSearchTerm(rawTerm);
    if (term) request = request.ilike("search_text", `%${term}%`);
  }

  const { data, error } = await request.order("receipt_id", { ascending: true }).limit(100);
  if (error) throw new Error(`Unable to search projects: ${error.message}`);

  return (data ?? [])
    .map((row) => mapProjectRow(row))
    .sort(
      (left, right) =>
        CONFIDENCE_RANK[left.dataConfidence] - CONFIDENCE_RANK[right.dataConfidence] ||
        left.receiptId.localeCompare(right.receiptId),
    )
    .map(toSearchResult);
}
