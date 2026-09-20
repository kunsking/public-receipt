import type { SupabaseClient } from "@supabase/supabase-js";

import { getProjectByReceiptId, getProjectSource } from "@/lib/data/projects";
import { isReceiptId } from "@/lib/domain/project";
import {
  type EvidenceSummary,
  mapPublicReceipt,
  type PublicReceipt,
} from "@/lib/domain/receipt";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PublicEvidenceStatus =
  | "Verified Evidence"
  | "Corroborated Community Evidence"
  | "Community Report"
  | "Unverified"
  | "Disputed";

interface EvidenceRow {
  trust_status: PublicEvidenceStatus;
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
      if (row.trust_status === "Verified Evidence") summary.verifiedIndependent += 1;
      if (row.trust_status === "Corroborated Community Evidence") {
        summary.corroboratedReports += 1;
      }
      if (row.trust_status === "Community Report") summary.communityReports += 1;
      if (row.trust_status === "Disputed") summary.disputed = true;
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
      .select("trust_status")
      .eq("project_id", project.id),
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
