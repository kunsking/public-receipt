import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getProjectByReceiptId } from "@/lib/data/projects";
import type {
  EvidenceObservationType,
  EvidenceVerificationStatus,
  PublicEvidenceItem,
} from "@/lib/domain/evidence";
import type { FctAreaCouncil } from "@/lib/domain/constants";
import { isReceiptId } from "@/lib/domain/project";
import { EVIDENCE_STORAGE_BUCKET } from "@/lib/evidence/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface PublicEvidenceRow {
  observation_type: EvidenceObservationType;
  description: string | null;
  area_council: FctAreaCouncil;
  locality: string | null;
  verification_status: EvidenceVerificationStatus;
  submitted_at: string;
  moderation_status: "approved";
  public_visibility: true;
  evidence_media: Array<{
    storage_path: string;
    mime_type: string | null;
    width: number | null;
    height: number | null;
  }>;
}

export type EvidenceImageSigner = (storagePath: string) => Promise<string | null>;

async function defaultImageSigner(storagePath: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from(EVIDENCE_STORAGE_BUCKET)
    .createSignedUrl(storagePath, 600);
  return error ? null : data.signedUrl;
}

export async function getPublicEvidenceByReceiptId(
  receiptId: string,
  client?: SupabaseClient,
  signImage: EvidenceImageSigner = defaultImageSigner,
): Promise<PublicEvidenceItem[] | null> {
  if (!isReceiptId(receiptId)) return null;

  const supabase = client ?? (await createSupabaseServerClient());
  const project = await getProjectByReceiptId(receiptId, supabase);
  if (!project) return null;

  const { data, error } = await supabase
    .from("evidence_submissions")
    .select(
      "observation_type, description, area_council, locality, verification_status, submitted_at, moderation_status, public_visibility, evidence_media(storage_path, mime_type, width, height)",
    )
    .eq("project_id", project.id)
    .eq("moderation_status", "approved")
    .eq("public_visibility", true)
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(`Unable to load public evidence: ${error.message}`);

  return Promise.all(
    ((data ?? []) as unknown as PublicEvidenceRow[]).map(async (row) => {
      const media = row.evidence_media[0] ?? null;
      return {
        observationType: row.observation_type,
        description: row.description,
        areaCouncil: row.area_council,
        locality: row.locality,
        verificationStatus: row.verification_status,
        submittedAt: row.submitted_at,
        imageUrl: media ? await signImage(media.storage_path) : null,
        imageWidth: media?.width ?? null,
        imageHeight: media?.height ?? null,
      } satisfies PublicEvidenceItem;
    }),
  );
}
