import type { SupabaseClient } from "@supabase/supabase-js";

import { getProjectByReceiptId, getProjectSource } from "@/lib/data/projects";
import { isReceiptId } from "@/lib/domain/project";
import {
  type EvidenceSummary,
  mapPublicReceipt,
  type PublicReceipt,
} from "@/lib/domain/receipt";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface EvidenceRow {
  verification_status:
    | "community_report"
    | "corroborated"
    | "verified_independent"
    | "disputed";
  moderation_status: "pending" | "approved" | "rejected";
  public_visibility: boolean;
}

export const EMPTY_EVIDENCE_SUMMARY: EvidenceSummary = {
  communityReports: 0,
  corroboratedReports: 0,
  verifiedIndependent: 0,
  disputed: false,
};

function summariseEvidence(rows: EvidenceRow[]): EvidenceSummary {
  return rows.reduce<EvidenceSummary>(
    (summary, row) => {
      if (row.moderation_status !== "approved" || !row.public_visibility) return summary;
      if (row.verification_status === "verified_independent") summary.verifiedIndependent += 1;
      if (row.verification_status === "corroborated") {
        summary.corroboratedReports += 1;
      }
      if (row.verification_status === "community_report") summary.communityReports += 1;
      if (row.verification_status === "disputed") summary.disputed = true;
      return summary;
    },
    { ...EMPTY_EVIDENCE_SUMMARY },
  );
}

export async function getPublicReceiptByReceiptId(
  receiptId: string,
  client?: SupabaseClient,
): Promise<PublicReceipt | null> {
  if (!isReceiptId(receiptId)) return null;

  const supabase = client ?? (await createSupabaseServerClient());
  const project = await getProjectByReceiptId(receiptId, supabase);
  if (!project) return null;

  const [source, evidenceResult] = await Promise.all([
    getProjectSource(project.id, supabase),
    supabase
      .from("evidence_submissions")
      .select("verification_status, moderation_status, public_visibility")
      .eq("project_id", project.id)
      .eq("moderation_status", "approved")
      .eq("public_visibility", true),
  ]);

  if (!source) return null;
  if (evidenceResult.error) {
    throw new Error(`Unable to load receipt evidence summary: ${evidenceResult.error.message}`);
  }

  return mapPublicReceipt(
    project,
    source,
    summariseEvidence((evidenceResult.data ?? []) as EvidenceRow[]),
  );
}
