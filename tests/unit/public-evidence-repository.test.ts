import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { getPublicEvidenceByReceiptId } from "@/lib/data/evidence";

const project = {
  id: "project-id",
  receipt_id: "PR-NG-FCT-2026-000001",
  budget_year: 2026,
  project_code: null,
  official_title: "Project",
  plain_language_title: null,
  plain_language_description: null,
  amount: "140000000",
  currency: "NGN",
  sector: "roads_transport",
  ministry: null,
  department: null,
  agency: null,
  state: "Federal Capital Territory",
  area_council: "Kwali",
  community: null,
  location_raw: "Kwali",
  location_confidence: "high",
  data_confidence: "high",
  created_at: "2026-09-20T00:00:00Z",
  updated_at: "2026-09-20T00:00:00Z",
};

type EvidenceFixture = Record<string, unknown> & {
  moderation_status: string;
  public_visibility: boolean;
};

function clientWithEvidence(rows: EvidenceFixture[]): SupabaseClient {
  return {
    from(table: string) {
      if (table === "projects") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: project, error: null }) }),
          }),
        };
      }
      if (table === "evidence_submissions") {
        const filters = new Map<string, unknown>();
        const builder = {
          eq(column: string, value: unknown) {
            filters.set(column, value);
            return builder;
          },
          async order() {
            return {
              data: rows.filter(
                (row) =>
                  (!filters.has("moderation_status") ||
                    row.moderation_status === filters.get("moderation_status")) &&
                  (!filters.has("public_visibility") ||
                    row.public_visibility === filters.get("public_visibility")),
              ),
              error: null,
            };
          },
        };
        return { select: () => builder };
      }
      throw new Error(`Unexpected table ${table}`);
    },
  } as unknown as SupabaseClient;
}

const baseEvidence = {
  observation_type: "appears_incomplete",
  description: "Walls are standing.",
  area_council: "Kwali",
  locality: "Piri",
  verification_status: "community_report",
  submitted_at: "2026-09-21T12:00:00Z",
  evidence_media: [],
};

describe("public evidence repository", () => {
  it("hides pending private reports", async () => {
    const evidence = await getPublicEvidenceByReceiptId(
      project.receipt_id,
      clientWithEvidence([
        { ...baseEvidence, moderation_status: "pending", public_visibility: false },
      ]),
      vi.fn(),
    );
    expect(evidence).toEqual([]);
  });

  it("returns only safe fields for approved public evidence", async () => {
    const signImage = vi.fn().mockResolvedValue("https://signed.example/evidence.jpg");
    const evidence = await getPublicEvidenceByReceiptId(
      project.receipt_id,
      clientWithEvidence([
        {
          ...baseEvidence,
          moderation_status: "approved",
          public_visibility: true,
          approximate_lat: 9.12345,
          approximate_lng: 7.12345,
          internal_notes: "do not expose",
          evidence_media: [
            {
              storage_path: "private/path.jpg",
              mime_type: "image/jpeg",
              width: 1200,
              height: 800,
            },
          ],
        },
      ]),
      signImage,
    );

    expect(signImage).toHaveBeenCalledWith("private/path.jpg");
    expect(evidence).toEqual([
      expect.objectContaining({
        observationType: "appears_incomplete",
        imageUrl: "https://signed.example/evidence.jpg",
      }),
    ]);
    expect(evidence?.[0]).not.toHaveProperty("storagePath");
    expect(evidence?.[0]).not.toHaveProperty("approximateLat");
    expect(evidence?.[0]).not.toHaveProperty("internalNotes");
  });

  it("rejects malformed receipts without querying", async () => {
    const from = vi.fn();
    await expect(
      getPublicEvidenceByReceiptId("not-a-receipt", { from } as unknown as SupabaseClient),
    ).resolves.toBeNull();
    expect(from).not.toHaveBeenCalled();
  });
});
