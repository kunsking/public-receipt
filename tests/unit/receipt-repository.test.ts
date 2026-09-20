import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";

const projectRow = {
  id: "project-id",
  receipt_id: "PR-NG-FCT-2026-000001",
  budget_year: 2026,
  project_code: "ERGP12238012",
  official_title: "CONSTRUCTION OF RURAL ROAD AT PIRI COMMUNITY",
  plain_language_title: null,
  plain_language_description: null,
  amount: "140000000.00",
  currency: "NGN",
  sector: "roads_transport",
  ministry: "Federal Ministry of Works",
  department: null,
  agency: null,
  state: "Federal Capital Territory",
  area_council: "Kwali",
  community: "Piri",
  location_raw: "Piri Community, Kwali",
  location_confidence: "high",
  data_confidence: "high",
  created_at: "2026-09-20T00:00:00.000Z",
  updated_at: "2026-09-20T00:00:00.000Z",
};

const sourceRow = {
  id: "source-ref-id",
  project_id: "project-id",
  source_document_id: "source-id",
  source_page: "1834",
  source_section: "Federal Ministry of Works",
  source_excerpt: "ERGP12238012 CONSTRUCTION OF RURAL ROAD AT PIRI COMMUNITY 140000000",
  source_documents: {
    id: "source-id",
    title: "Federal Republic of Nigeria 2026 Appropriation Act Details",
    publisher: "Budget Office of the Federation",
    budget_year: 2026,
    document_type: "appropriation_act",
    source_url: "https://budgetoffice.gov.ng/index.php/2026-appropriation-act-details",
    published_on: "2026-08-10",
    accessed_at: "2026-09-20T00:00:00.000Z",
  },
};

function mockClient(options: {
  project?: typeof projectRow | null;
  source?: typeof sourceRow | null;
  evidence?: Array<{ trust_status: string }>;
} = {}): SupabaseClient {
  const project = options.project === undefined ? projectRow : options.project;
  const source = options.source === undefined ? sourceRow : options.source;
  const evidence = options.evidence ?? [];

  return {
    from(table: string) {
      if (table === "projects") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: project, error: null }) }),
          }),
        };
      }
      if (table === "project_source_refs") {
        const builder = {
          eq: () => builder,
          maybeSingle: async () => ({ data: source, error: null }),
        };
        return { select: () => builder };
      }
      if (table === "evidence_submissions") {
        return {
          select: () => ({ eq: async () => ({ data: evidence, error: null }) }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  } as unknown as SupabaseClient;
}

describe("public receipt repository", () => {
  it("joins a known project to its immutable primary source", async () => {
    const receipt = await getPublicReceiptByReceiptId(
      "PR-NG-FCT-2026-000001",
      mockClient(),
    );

    expect(receipt?.receiptId).toBe("PR-NG-FCT-2026-000001");
    expect(receipt?.amount).toBe(140_000_000);
    expect(receipt?.source.sourceExcerpt).toBe(sourceRow.source_excerpt);
    expect(receipt?.source.sourceUrl).toBe(sourceRow.source_documents.source_url);
    expect(receipt?.source.sourcePage).toBe("1834");
  });

  it("returns null for an unknown receipt", async () => {
    await expect(
      getPublicReceiptByReceiptId(
        "PR-NG-FCT-2026-999999",
        mockClient({ project: null }),
      ),
    ).resolves.toBeNull();
  });

  it("rejects malformed IDs without querying the database", async () => {
    const from = vi.fn();
    const client = { from } as unknown as SupabaseClient;

    await expect(getPublicReceiptByReceiptId("not-a-receipt", client)).resolves.toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it("returns null when the project has no retained primary source", async () => {
    await expect(
      getPublicReceiptByReceiptId(
        "PR-NG-FCT-2026-000001",
        mockClient({ source: null }),
      ),
    ).resolves.toBeNull();
  });

  it("returns a safe empty evidence summary", async () => {
    const receipt = await getPublicReceiptByReceiptId(
      "PR-NG-FCT-2026-000001",
      mockClient(),
    );

    expect(receipt?.evidenceSummary).toEqual({
      communityReports: 0,
      corroboratedReports: 0,
      verifiedIndependent: 0,
      disputed: false,
    });
  });

  it("summarises only visible reviewed evidence states", async () => {
    const receipt = await getPublicReceiptByReceiptId(
      "PR-NG-FCT-2026-000001",
      mockClient({
        evidence: [
          { trust_status: "Verified Evidence" },
          { trust_status: "Corroborated Community Evidence" },
          { trust_status: "Community Report" },
          { trust_status: "Disputed" },
        ],
      }),
    );

    expect(receipt?.evidenceSummary).toMatchObject({
      communityReports: 1,
      corroboratedReports: 1,
      verifiedIndependent: 1,
      disputed: true,
    });
  });
});
