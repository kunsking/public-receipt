import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  EvidenceReceiptNotFoundError,
  EvidenceSubmissionError,
  submitCommunityEvidence,
} from "@/lib/evidence/submit";

vi.mock("@/lib/evidence/submit", () => {
  class MockReceiptNotFoundError extends Error {}
  class MockSubmissionError extends Error {}
  return {
    EvidenceReceiptNotFoundError: MockReceiptNotFoundError,
    EvidenceSubmissionError: MockSubmissionError,
    submitCommunityEvidence: vi.fn(),
  };
});

import { POST } from "@/app/api/receipt/[receipt_id]/evidence/route";

const receiptId = "PR-NG-FCT-2026-000001";

function validFormData() {
  const formData = new FormData();
  formData.set("observationType", "appears_incomplete");
  formData.set("description", "Walls are standing.");
  formData.set("areaCouncil", "Kwali");
  formData.set("locality", "Piri");
  formData.set("approximateLat", "");
  formData.set("approximateLng", "");
  formData.set("acknowledgement", "true");
  return formData;
}

function request(formData: FormData, id = receiptId) {
  return POST(
    {
      headers: new Headers(),
      formData: async () => formData,
    } as Request,
    { params: Promise.resolve({ receipt_id: id }) },
  );
}

describe("POST /api/receipt/[receipt_id]/evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(submitCommunityEvidence).mockResolvedValue({
      verificationStatus: "community_report",
      moderationStatus: "pending",
      publicVisibility: false,
    });
  });

  it("accepts a valid text-only community observation", async () => {
    const response = await request(validFormData());
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      accepted: true,
      state: {
        verificationStatus: "community_report",
        moderationStatus: "pending",
        publicVisibility: false,
      },
    });
    expect(submitCommunityEvidence).toHaveBeenCalledWith(
      receiptId,
      expect.objectContaining({
        observationType: "appears_incomplete",
        areaCouncil: "Kwali",
      }),
      undefined,
    );
  });

  it.each([
    ["invalid observation", "observationType", "abandoned"],
    ["missing observation", "observationType", ""],
    ["invalid Area Council", "areaCouncil", "Lagos"],
    ["overlong description", "description", "x".repeat(501)],
  ])("rejects %s", async (_label, key, value) => {
    const body = validFormData();
    body.set(key, value);
    const response = await request(body);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_evidence" });
    expect(submitCommunityEvidence).not.toHaveBeenCalled();
  });

  it("rejects a malformed receipt before parsing or submitting", async () => {
    const response = await request(validFormData(), "not-a-receipt");
    expect(response.status).toBe(404);
    expect(submitCommunityEvidence).not.toHaveBeenCalled();
  });

  it("rejects an unknown canonical receipt", async () => {
    vi.mocked(submitCommunityEvidence).mockRejectedValue(new EvidenceReceiptNotFoundError());
    const response = await request(validFormData(), "PR-NG-FCT-2026-999999");
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "receipt_not_found" });
  });

  it("does not pass client-controlled state fields to the submission service", async () => {
    const body = validFormData();
    body.set("verification_status", "verified_independent");
    body.set("moderation_status", "approved");
    body.set("public_visibility", "true");
    const response = await request(body);
    expect(response.status).toBe(201);
    const submittedFields = vi.mocked(submitCommunityEvidence).mock.calls[0][1];
    expect(submittedFields).not.toHaveProperty("verification_status");
    expect(submittedFields).not.toHaveProperty("moderation_status");
    expect(submittedFields).not.toHaveProperty("public_visibility");
  });

  it("returns a safe failure without exposing database details", async () => {
    vi.mocked(submitCommunityEvidence).mockRejectedValue(new EvidenceSubmissionError());
    const response = await request(validFormData());
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "submission_unavailable" });
  });
});
