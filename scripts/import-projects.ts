import { resolve } from "node:path";

import {
  mapSeedRowToProjectInput,
  readAndValidateSeedFile,
  type SeedProjectRow,
} from "@/lib/data/seed";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface SourceDocumentRecord {
  id: string;
}

async function upsertSourceDocument(row: SeedProjectRow): Promise<SourceDocumentRecord> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("source_documents")
    .upsert(
      {
        title: row.source_document,
        publisher: "Budget Office of the Federation, Federal Republic of Nigeria",
        budget_year: Number(row.budget_year),
        document_type: "appropriation_act",
        source_url: row.source_url,
        published_on: "2026-08-10",
        accessed_at: new Date().toISOString(),
      },
      { onConflict: "source_url" },
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Source document upsert failed: ${error?.message ?? "missing result"}`);
  }
  return data as SourceDocumentRecord;
}

export async function importProjects(path: string): Promise<void> {
  const validation = await readAndValidateSeedFile(path);
  if (!validation.ok) {
    validation.errors.forEach((error) =>
      console.error(`row ${error.row}${error.field ? ` [${error.field}]` : ""}: ${error.message}`),
    );
    throw new Error(`Import aborted before database writes: ${validation.errors.length} invalid row(s)`);
  }

  console.log(`Validated ${validation.rows.length} record(s). Starting import...`);

  const supabase = createSupabaseAdminClient();
  const sourceDocuments = new Map<string, SourceDocumentRecord>();
  let projectCount = 0;
  let sourceReferenceCount = 0;

  for (const row of validation.rows) {
    let sourceDocument = sourceDocuments.get(row.source_url);
    if (!sourceDocument) {
      sourceDocument = await upsertSourceDocument(row);
      sourceDocuments.set(row.source_url, sourceDocument);
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .upsert(mapSeedRowToProjectInput(row), { onConflict: "receipt_id" })
      .select("id")
      .single();

    if (projectError || !project) {
      throw new Error(
        `Project ${row.receipt_id} upsert failed: ${projectError?.message ?? "missing result"}`,
      );
    }
    projectCount += 1;

    const { error: sourceReferenceError } = await supabase.from("project_source_refs").upsert(
      {
        project_id: project.id,
        source_document_id: sourceDocument.id,
        source_page: row.source_page || null,
        source_section: row.source_section || null,
        source_excerpt: row.source_excerpt,
        is_primary: true,
      },
      { onConflict: "project_id,source_document_id" },
    );

    if (sourceReferenceError) {
      throw new Error(
        `Source reference for ${row.receipt_id} failed: ${sourceReferenceError.message}`,
      );
    }
    sourceReferenceCount += 1;
  }

  console.log("Import complete");
  console.log(`- source documents upserted: ${sourceDocuments.size}`);
  console.log(`- projects upserted: ${projectCount}`);
  console.log(`- source references upserted: ${sourceReferenceCount}`);
}

async function main() {
  const path = resolve(process.cwd(), process.argv[2] ?? "data/seed/projects.csv");
  await importProjects(path);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
