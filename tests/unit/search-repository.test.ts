import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { fallbackInterpretQuery } from "@/lib/ai/fallback-query";
import type { SearchInterpretation } from "@/lib/ai/schemas";
import { searchProjects } from "@/lib/data/search";

const rows = [
  {
    id: "project-1",
    receipt_id: "PR-NG-FCT-2026-000001",
    budget_year: 2026,
    project_code: "ROAD-1",
    official_title: "CONSTRUCTION OF RURAL ROAD AT PIRI COMMUNITY",
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
    location_raw: "Piri Community, Kwali",
    location_confidence: "high",
    data_confidence: "high",
    search_text: "road piri kwali",
    created_at: "2026-09-20T00:00:00.000Z",
    updated_at: "2026-09-20T00:00:00.000Z",
  },
  {
    id: "project-2",
    receipt_id: "PR-NG-FCT-2026-000028",
    budget_year: 2026,
    project_code: "HEALTH-1",
    official_title: "CONSTRUCTION OF HOSPITAL GATE PERIMETER FENCING",
    plain_language_title: null,
    plain_language_description: null,
    amount: "56000000.00",
    currency: "NGN",
    sector: "healthcare",
    ministry: "Federal Ministry of Health",
    department: null,
    agency: "University of Abuja Teaching Hospital",
    state: "Federal Capital Territory",
    area_council: "Gwagwalada",
    community: null,
    location_raw: "University of Abuja Teaching Hospital, Gwagwalada",
    location_confidence: "high",
    data_confidence: "high",
    search_text: "hospital healthcare gwagwalada",
    created_at: "2026-09-20T00:00:00.000Z",
    updated_at: "2026-09-20T00:00:00.000Z",
  },
];

class SearchBuilder {
  private matchingRows = [...rows];

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.matchingRows = this.matchingRows.filter(
      (row) => row[column as keyof typeof row] === value,
    );
    return this;
  }

  ilike(_column: string, pattern: string) {
    const term = pattern.replaceAll("%", "").toLowerCase();
    this.matchingRows = this.matchingRows.filter((row) => row.search_text.includes(term));
    return this;
  }

  order() {
    return this;
  }

  async limit(limit: number) {
    return { data: this.matchingRows.slice(0, limit), error: null };
  }
}

function mockClient(): SupabaseClient {
  return {
    from: () => new SearchBuilder(),
  } as unknown as SupabaseClient;
}

function interpretation(
  changes: Partial<SearchInterpretation>,
): SearchInterpretation {
  return {
    intent: "project_search",
    year: 2026,
    sector: null,
    areaCouncil: null,
    terms: [],
    needsClarification: false,
    clarificationQuestion: null,
    confidence: "high",
    ...changes,
  };
}

describe("deterministic project search", () => {
  it("filters by area council", async () => {
    const results = await searchProjects(
      interpretation({ areaCouncil: "Kwali" }),
      mockClient(),
    );
    expect(results.map((result) => result.receiptId)).toEqual(["PR-NG-FCT-2026-000001"]);
  });

  it("filters by sector", async () => {
    const results = await searchProjects(
      interpretation({ sector: "healthcare" }),
      mockClient(),
    );
    expect(results.map((result) => result.receiptId)).toEqual(["PR-NG-FCT-2026-000028"]);
  });

  it("combines area and sector filters", async () => {
    await expect(
      searchProjects(
        interpretation({ areaCouncil: "Gwagwalada", sector: "healthcare" }),
        mockClient(),
      ),
    ).resolves.toHaveLength(1);
  });

  it("returns no rows rather than fabricating a fallback project", async () => {
    await expect(
      searchProjects(interpretation({ areaCouncil: "Kuje" }), mockClient()),
    ).resolves.toEqual([]);
  });

  it("returns no result for the mandatory dragon-hospital query", async () => {
    const parsed = fallbackInterpretQuery("₦50 billion dragon hospital in Bwari");
    await expect(searchProjects(parsed, mockClient())).resolves.toEqual([]);
  });
});
