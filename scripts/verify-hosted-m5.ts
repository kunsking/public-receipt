import assert from "node:assert/strict";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import { submitCommunityEvidence } from "@/lib/evidence/submit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerSupabaseConfig } from "@/lib/supabase/env";

const receiptId = "PR-NG-FCT-2026-000001";
const privateAllegation = "They stole everything.";

async function main() {
  const admin = createSupabaseAdminClient();
  const { url, publishableKey } = getServerSupabaseConfig();
  const publicClient = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: bucket, error: bucketError } = await admin.storage.getBucket("evidence-private");
  assert.ifError(bucketError);
  assert.equal(bucket.public, false);
  assert.equal(bucket.file_size_limit, 5 * 1024 * 1024);

  const { data: projectBefore, error: projectError } = await admin
    .from("projects")
    .select("*")
    .eq("receipt_id", receiptId)
    .single();
  assert.ifError(projectError);

  const { data: sourceRefsBefore, error: sourceRefsError } = await admin
    .from("project_source_refs")
    .select("*")
    .eq("project_id", projectBefore.id)
    .order("id");
  assert.ifError(sourceRefsError);

  const sourceIds = sourceRefsBefore.map((row) => row.source_document_id);
  const { data: sourcesBefore, error: sourcesError } = await admin
    .from("source_documents")
    .select("*")
    .in("id", sourceIds)
    .order("id");
  assert.ifError(sourcesError);

  let evidenceId: string | null = null;
  let storagePath: string | null = null;

  try {
    const imageBytes = await sharp({
      create: { width: 32, height: 24, channels: 3, background: "#315f6d" },
    })
      .jpeg()
      .withMetadata({ exif: { IFD0: { Artist: "Private verification metadata" } } })
      .toBuffer();
    const imageBuffer = imageBytes.buffer.slice(
      imageBytes.byteOffset,
      imageBytes.byteOffset + imageBytes.byteLength,
    ) as ArrayBuffer;
    const image = new File([imageBuffer], "user-controlled-name.jpg", {
      type: "image/jpeg",
    });

    const state = await submitCommunityEvidence(
      receiptId,
      {
        observationType: "appears_incomplete",
        description: privateAllegation,
        areaCouncil: "Kwali",
        locality: "Piri",
        approximateLat: null,
        approximateLng: null,
        acknowledgement: "true",
      },
      image,
      { client: admin },
    );
    assert.deepEqual(state, {
      verificationStatus: "community_report",
      moderationStatus: "pending",
      publicVisibility: false,
    });

    const { data: evidence, error: evidenceError } = await admin
      .from("evidence_submissions")
      .select("*")
      .eq("project_id", projectBefore.id)
      .eq("description", privateAllegation)
      .single();
    assert.ifError(evidenceError);
    evidenceId = evidence.id;
    assert.equal(evidence.verification_status, "community_report");
    assert.equal(evidence.moderation_status, "pending");
    assert.equal(evidence.public_visibility, false);

    const { data: event, error: eventError } = await admin
      .from("verification_events")
      .select("previous_status, new_status, reason, review_method")
      .eq("evidence_id", evidence.id)
      .single();
    assert.ifError(eventError);
    assert.deepEqual(event, {
      previous_status: null,
      new_status: "community_report",
      reason: "citizen_submission",
      review_method: "submission",
    });

    const { data: media, error: mediaError } = await admin
      .from("evidence_media")
      .select("storage_path, mime_type, width, height, file_size, is_public")
      .eq("evidence_id", evidence.id)
      .single();
    assert.ifError(mediaError);
    storagePath = media.storage_path;
    assert.equal(media.mime_type, "image/jpeg");
    assert.equal(media.is_public, false);
    assert(!media.storage_path.includes("user-controlled-name"));

    const { data: storedImage, error: downloadError } = await admin.storage
      .from("evidence-private")
      .download(media.storage_path);
    assert.ifError(downloadError);
    const storedMetadata = await sharp(Buffer.from(await storedImage.arrayBuffer())).metadata();
    assert.equal(storedMetadata.exif, undefined);
    assert.equal(storedMetadata.xmp, undefined);

    const { data: anonymouslyVisible, error: publicReadError } = await publicClient
      .from("evidence_submissions")
      .select("id")
      .eq("id", evidence.id);
    assert.ifError(publicReadError);
    assert.equal(anonymouslyVisibleLength(anonymouslyVisible), 0);

    const publicReceipt = await getPublicReceiptByReceiptId(receiptId, publicClient);
    assert(publicReceipt);
    assert.equal(publicReceipt.evidenceSummary.communityReports, 0);
    assert(!JSON.stringify(publicReceipt).includes(privateAllegation));

    const { error: anonymousInsertError } = await publicClient
      .from("evidence_submissions")
      .insert({
        project_id: projectBefore.id,
        title: "Unsafe direct insert",
        description: "Should be denied",
        observation_type: "work_started",
        area_council: "Kwali",
        verification_status: "verified_independent",
        moderation_status: "approved",
        public_visibility: true,
      });
    assert(anonymousInsertError, "Anonymous evidence insertion must be denied");

    const { data: projectAfter, error: projectAfterError } = await admin
      .from("projects")
      .select("*")
      .eq("id", projectBefore.id)
      .single();
    assert.ifError(projectAfterError);
    const { data: sourceRefsAfter, error: sourceRefsAfterError } = await admin
      .from("project_source_refs")
      .select("*")
      .eq("project_id", projectBefore.id)
      .order("id");
    assert.ifError(sourceRefsAfterError);
    const { data: sourcesAfter, error: sourcesAfterError } = await admin
      .from("source_documents")
      .select("*")
      .in("id", sourceIds)
      .order("id");
    assert.ifError(sourcesAfterError);
    assert.deepEqual(projectAfter, projectBefore);
    assert.deepEqual(sourceRefsAfter, sourceRefsBefore);
    assert.deepEqual(sourcesAfter, sourcesBefore);

    console.log("M5 hosted verification passed");
    console.log("bucket_private=true");
    console.log("initial_state=community_report/pending/false");
    console.log("pending_public_visibility=hidden");
    console.log("pending_ai_context=excluded");
    console.log("official_record_integrity=unchanged");
    console.log("processed_image_metadata=stripped");
    console.log("anonymous_direct_insert=denied");
  } finally {
    if (evidenceId) {
      const { error } = await admin.from("evidence_submissions").delete().eq("id", evidenceId);
      if (error) throw error;
    }
    if (storagePath) {
      const { error } = await admin.storage.from("evidence-private").remove([storagePath]);
      if (error) throw error;
    }
  }
}

function anonymouslyVisibleLength(rows: Array<{ id: string }> | null) {
  return rows?.length ?? 0;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "M5 hosted verification failed");
  process.exitCode = 1;
});
