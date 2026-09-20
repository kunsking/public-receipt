import { beforeEach, describe, expect, it, vi } from "vitest";

import { interpretQuery } from "@/lib/ai/interpret-query";
import type { SearchInterpretation } from "@/lib/ai/schemas";
import { searchProjects } from "@/lib/data/search";

vi.mock("@/lib/ai/interpret-query", () => ({ interpretQuery: vi.fn() }));
vi.mock("@/lib/data/search", () => ({ searchProjects: vi.fn() }));

import { POST } from "@/app/api/search/route";

const interpretation: SearchInterpretation = {
  intent: "project_search",
  year: 2026,
  sector: "healthcare",
  areaCouncil: "Bwari",
  terms: ["dragon"],
  needsClarification: false,
  clarificationQuestion: null,
  confidence: "high",
};

describe("POST /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(interpretQuery).mockResolvedValue({ interpretation, fallbackUsed: true });
    vi.mocked(searchProjects).mockResolvedValue([]);
  });

  it("returns an explicit no-result contract without alternatives", async () => {
    const response = await POST(
      new Request("http://localhost/api/search", {
        method: "POST",
        body: JSON.stringify({ query: "₦50 billion dragon hospital in Bwari" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.results).toEqual([]);
    expect(body.meta).toMatchObject({
      count: 0,
      coverage: "selected_fct_2026",
      message: "No matching verified record is currently indexed.",
    });
  });

  it("rejects overlong requests before interpretation", async () => {
    const response = await POST(
      new Request("http://localhost/api/search", {
        method: "POST",
        body: JSON.stringify({ query: "x".repeat(301) }),
      }),
    );

    expect(response.status).toBe(400);
    expect(interpretQuery).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON as an invalid request", async () => {
    const response = await POST(
      new Request("http://localhost/api/search", {
        method: "POST",
        body: "{not-json",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid search request." });
  });
});
