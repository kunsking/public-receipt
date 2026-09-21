import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import type { EvidenceSubmissionFields } from "@/lib/evidence/schemas";
import {
  EvidenceReceiptNotFoundError,
  EvidenceSubmissionError,
  submitCommunityEvidence,
} from "@/lib/evidence/submit";

const projectRow = {
  id: "project-id",
  receipt_id: "PR-NG-FCT-2026-000001",
  budget_year: 2026,
  project_code: "ERGP12238012",
  official_title: "Piri community road",
  plain_language_title: null,
  plain_language_description: null,
  amount: "140000000.00",
  currency: "NGN",
  sector: "roads_transport",
  ministry: "Federal Ministry",
  department: null,
  agency: null,
  state: "Federal Capital Territory",
  area_council: "Kwali",
  community: "Piri",
  location_raw: "Piri, Kwali",
  location_confidence: "high",
  data_confidence: "high",
  created_at: "2026-09-20T00:00:00.000Z",
  updated_at: "2026-09-20T00:00:00.000Z",
};

const fields: EvidenceSubmissionFields = {
  observationType: "appears_incomplete",
  description: "Walls are standing.",
  areaCouncil: "Kwali",
  locality: "Piri",
  approximateLat: null,
  approximateLng: null,
  acknowledgement: "true",
};

function mockClient(options: { project?: typeof projectRow | null; rpcError?: boolean } = {}) {
  const upload = vi.fn().mockResolvedValue({ data: {}, error: null });
  const remove = vi.fn().mockResolvedValue({ data: {}, error: null });
  const rpc = vi.fn().mockResolvedValue({
    data: options.rpcError ? null : "evidence-id",
    error: options.rpcError ? { message: "database unavailable" } : null,
  });
  const from = vi.fn((table: string) => {
    if (table !== "projects") throw new Error(`Unexpected table ${table}`);
    return {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: options.project === undefined ? projectRow : options.project,
            error: null,
          }),
        }),
      }),
    };
  });
  const client = {
    from,
    rpc,
    storage: { from: () => ({ upload, remove }) },
  } as unknown as SupabaseClient;
  return { client, from, rpc, upload, remove };
}

const processedImage = {
  data: Buffer.from("processed"),
  mimeType: "image/jpeg" as const,
  extension: "jpg" as const,
  width: 20,
  height: 10,
  fileSize: 9,
};

describe("community evidence submission service", () => {
  it("creates only the permitted initial state", async () => {
    const mocks = mockClient();
    const result = await submitCommunityEvidence(
      projectRow.receipt_id,
      {
        ...fields,
        verification_status: "verified_independent",
        moderation_status: "approved",
        public_visibility: true,
      } as EvidenceSubmissionFields,
      undefined,
      { client: mocks.client },
    );

    expect(result).toEqual({
      verificationStatus: "community_report",
      moderationStatus: "pending",
      publicVisibility: false,
    });
    expect(mocks.rpc).toHaveBeenCalledWith(
      "create_community_evidence",
      expect.not.objectContaining({
        verification_status: expect.anything(),
        moderation_status: expect.anything(),
        public_visibility: expect.anything(),
      }),
    );
    expect(mocks.from).toHaveBeenCalledTimes(1);
    expect(mocks.from).toHaveBeenCalledWith("projects");
  });

  it("uploads only processed bytes under a generated key", async () => {
    const mocks = mockClient();
    const processImage = vi.fn().mockResolvedValue(processedImage);
    const image = { name: "reporter-home.jpg" } as File;

    await submitCommunityEvidence(projectRow.receipt_id, fields, image, {
      client: mocks.client,
      processImage,
      createId: () => "safe-generated-id",
    });

    expect(mocks.upload).toHaveBeenCalledWith(
      "PR-NG-FCT-2026-000001/safe-generated-id.jpg",
      processedImage.data,
      expect.objectContaining({ contentType: "image/jpeg", upsert: false }),
    );
    expect(mocks.rpc).toHaveBeenCalledWith(
      "create_community_evidence",
      expect.objectContaining({
        p_storage_path: "PR-NG-FCT-2026-000001/safe-generated-id.jpg",
        p_mime_type: "image/jpeg",
        p_width: 20,
        p_height: 10,
        p_file_size: 9,
      }),
    );
    expect(JSON.stringify(mocks.rpc.mock.calls)).not.toContain("reporter-home.jpg");
  });

  it("removes an uploaded image when the atomic database call fails", async () => {
    const mocks = mockClient({ rpcError: true });
    await expect(
      submitCommunityEvidence(projectRow.receipt_id, fields, {} as File, {
        client: mocks.client,
        processImage: vi.fn().mockResolvedValue(processedImage),
        createId: () => "orphan",
      }),
    ).rejects.toBeInstanceOf(EvidenceSubmissionError);
    expect(mocks.remove).toHaveBeenCalledWith([
      "PR-NG-FCT-2026-000001/orphan.jpg",
    ]);
  });

  it("rejects an unknown receipt before image processing or storage", async () => {
    const mocks = mockClient({ project: null });
    const processImage = vi.fn();
    await expect(
      submitCommunityEvidence("PR-NG-FCT-2026-999999", fields, {} as File, {
        client: mocks.client,
        processImage,
      }),
    ).rejects.toBeInstanceOf(EvidenceReceiptNotFoundError);
    expect(processImage).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
