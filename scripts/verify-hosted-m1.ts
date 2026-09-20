import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  getProjectByReceiptId,
  getProjectSource,
} from "@/lib/data/projects";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerSupabaseConfig } from "@/lib/supabase/env";

const DEMO_RECEIPT_ID = "PR-NG-FCT-2026-000001";
const RLS_PROBE_RECEIPT_ID = "PR-NG-FCT-2026-999999";

async function exactCount(
  client: SupabaseClient,
  table: "source_documents" | "projects" | "project_source_refs",
): Promise<number> {
  const { count, error } = await client
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) throw new Error(`Unable to count ${table}: ${error.message}`);
  return count ?? 0;
}

async function main() {
  const admin = createSupabaseAdminClient();
  const { url, publishableKey } = getServerSupabaseConfig();
  const publicClient = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [sourceDocuments, projects, sourceReferences] = await Promise.all([
    exactCount(admin, "source_documents"),
    exactCount(admin, "projects"),
    exactCount(admin, "project_source_refs"),
  ]);

  if (sourceDocuments !== 1 || projects !== 50 || sourceReferences !== 50) {
    throw new Error(
      `Unexpected hosted counts: ${sourceDocuments} source document(s), ${projects} project(s), ${sourceReferences} source reference(s)`,
    );
  }

  const [publicProjects, publicSourceReferences] = await Promise.all([
    exactCount(publicClient, "projects"),
    exactCount(publicClient, "project_source_refs"),
  ]);
  if (publicProjects !== projects || publicSourceReferences !== sourceReferences) {
    throw new Error("Public RLS reads did not return the expected civic records");
  }

  const demo = await getProjectByReceiptId(DEMO_RECEIPT_ID, publicClient);
  if (!demo) throw new Error(`Demo receipt ${DEMO_RECEIPT_ID} was not found`);

  const source = await getProjectSource(demo.id, publicClient);
  if (!source) throw new Error(`Demo receipt ${DEMO_RECEIPT_ID} has no primary source`);

  const { data: existingProbe, error: probeLookupError } = await admin
    .from("projects")
    .select("id")
    .eq("receipt_id", RLS_PROBE_RECEIPT_ID)
    .maybeSingle();
  if (probeLookupError) throw new Error(`Unable to prepare RLS probe: ${probeLookupError.message}`);
  if (existingProbe) throw new Error(`RLS probe receipt ${RLS_PROBE_RECEIPT_ID} already exists`);

  const { data: anonymousWrite, error: anonymousWriteError } = await publicClient
    .from("projects")
    .insert({
      receipt_id: RLS_PROBE_RECEIPT_ID,
      budget_year: 2026,
      official_title: "RLS verification probe",
      amount: 0,
      currency: "NGN",
      sector: "community_infrastructure",
      state: "Federal Capital Territory",
      location_raw: "RLS verification probe",
      location_confidence: "low",
      data_confidence: "low",
    })
    .select("id")
    .maybeSingle();

  if (!anonymousWriteError && anonymousWrite) {
    await admin.from("projects").delete().eq("id", anonymousWrite.id);
    throw new Error("Anonymous project insertion unexpectedly succeeded");
  }

  console.log("Hosted M1 verification passed");
  console.log(`- source documents: ${sourceDocuments}`);
  console.log(`- projects: ${projects}`);
  console.log(`- source references: ${sourceReferences}`);
  console.log(`- demo receipt: ${demo.receiptId} — ${demo.officialTitle}`);
  console.log(`- demo primary source: ${source.sourceDocument.title}`);
  console.log("- public civic reads: allowed");
  console.log("- anonymous protected writes: denied");
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
