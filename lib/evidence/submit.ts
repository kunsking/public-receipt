import { randomUUID } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getProjectByReceiptId } from "@/lib/data/projects";
import { INITIAL_EVIDENCE_STATE } from "@/lib/domain/evidence";
import { EVIDENCE_STORAGE_BUCKET } from "@/lib/evidence/constants";
import { processEvidenceImage, type ProcessedEvidenceImage } from "@/lib/evidence/image";
import type { EvidenceSubmissionFields } from "@/lib/evidence/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export class EvidenceReceiptNotFoundError extends Error {
  constructor() {
    super("The receipt does not exist");
    this.name = "EvidenceReceiptNotFoundError";
  }
}

export class EvidenceSubmissionError extends Error {
  constructor() {
    super("The evidence submission could not be saved");
    this.name = "EvidenceSubmissionError";
  }
}

export interface SubmitCommunityEvidenceDependencies {
  client?: SupabaseClient;
  processImage?: (file: File) => Promise<ProcessedEvidenceImage>;
  createId?: () => string;
}

export function createEvidenceStoragePath(
  receiptId: string,
  extension: ProcessedEvidenceImage["extension"],
  id: string = randomUUID(),
) {
  return `${receiptId}/${id}.${extension}`;
}

export async function submitCommunityEvidence(
  receiptId: string,
  fields: EvidenceSubmissionFields,
  image?: File,
  dependencies: SubmitCommunityEvidenceDependencies = {},
) {
  const client = dependencies.client ?? createSupabaseAdminClient();
  const project = await getProjectByReceiptId(receiptId, client);
  if (!project) throw new EvidenceReceiptNotFoundError();

  const processedImage = image
    ? await (dependencies.processImage ?? processEvidenceImage)(image)
    : null;
  const storagePath = processedImage
    ? createEvidenceStoragePath(
        receiptId,
        processedImage.extension,
        dependencies.createId?.() ?? randomUUID(),
      )
    : null;

  if (processedImage && storagePath) {
    const { error } = await client.storage
      .from(EVIDENCE_STORAGE_BUCKET)
      .upload(storagePath, processedImage.data, {
        cacheControl: "3600",
        contentType: processedImage.mimeType,
        upsert: false,
      });
    if (error) throw new EvidenceSubmissionError();
  }

  const { error } = await client.rpc("create_community_evidence", {
    p_project_id: project.id,
    p_observation_type: fields.observationType,
    p_area_council: fields.areaCouncil,
    p_description: fields.description,
    p_locality: fields.locality,
    p_approximate_lat: fields.approximateLat,
    p_approximate_lng: fields.approximateLng,
    p_storage_path: storagePath,
    p_mime_type: processedImage?.mimeType ?? null,
    p_width: processedImage?.width ?? null,
    p_height: processedImage?.height ?? null,
    p_file_size: processedImage?.fileSize ?? null,
  });

  if (error) {
    if (storagePath) {
      await client.storage.from(EVIDENCE_STORAGE_BUCKET).remove([storagePath]);
    }
    throw new EvidenceSubmissionError();
  }

  return { ...INITIAL_EVIDENCE_STATE };
}
