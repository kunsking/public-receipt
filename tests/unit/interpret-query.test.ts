import { describe, expect, it, vi } from "vitest";

import { fallbackInterpretQuery } from "@/lib/ai/fallback-query";
import { interpretQuery } from "@/lib/ai/interpret-query";

describe("deterministic query interpretation", () => {
  it.each([
    ["Healthcare in Bwari", "Bwari", "healthcare"],
    ["roads Kuje", "Kuje", "roads_transport"],
    ["schools AMAC", "Abuja Municipal Area Council", "education"],
    ["water Gwagwalada", "Gwagwalada", "water_sanitation"],
  ] as const)("parses %s", (query, areaCouncil, sector) => {
    expect(fallbackInterpretQuery(query)).toMatchObject({
      intent: "project_search",
      year: 2026,
      areaCouncil,
      sector,
      needsClarification: false,
    });
  });

  it("keeps unknown concepts as terms", () => {
    expect(fallbackInterpretQuery("₦50 billion dragon hospital in Bwari")).toMatchObject({
      areaCouncil: "Bwari",
      sector: "healthcare",
      terms: ["50", "billion", "dragon"],
    });
  });

  it("asks rather than silently resolving bare Abuja", () => {
    expect(fallbackInterpretQuery("Projects in Abuja")).toMatchObject({
      areaCouncil: null,
      needsClarification: true,
      clarificationQuestion:
        "Do you mean the whole Federal Capital Territory or Abuja Municipal Area Council?",
    });
  });

  it("uses a valid injected model interpretation", async () => {
    const modelInterpreter = vi.fn().mockResolvedValue({
      intent: "project_search",
      year: 2026,
      sector: "education",
      areaCouncil: "Abuja Municipal Area Council",
      terms: [],
      needsClarification: false,
      clarificationQuestion: null,
      confidence: "high",
    });

    await expect(interpretQuery("schools AMAC", modelInterpreter)).resolves.toMatchObject({
      fallbackUsed: false,
      interpretation: { areaCouncil: "Abuja Municipal Area Council" },
    });
  });

  it("falls back when model output is invalid", async () => {
    const modelInterpreter = vi.fn().mockResolvedValue({ areaCouncil: "invented" });

    await expect(interpretQuery("schools AMAC", modelInterpreter)).resolves.toMatchObject({
      fallbackUsed: true,
      interpretation: {
        sector: "education",
        areaCouncil: "Abuja Municipal Area Council",
      },
    });
  });

  it("does not let a model silently resolve bare Abuja", async () => {
    const modelInterpreter = vi.fn().mockResolvedValue({
      intent: "project_search",
      year: 2026,
      sector: null,
      areaCouncil: "Abuja Municipal Area Council",
      terms: [],
      needsClarification: false,
      clarificationQuestion: null,
      confidence: "high",
    });

    await expect(interpretQuery("Projects in Abuja", modelInterpreter)).resolves.toMatchObject({
      fallbackUsed: false,
      interpretation: {
        areaCouncil: null,
        needsClarification: true,
      },
    });
  });

  it("retains unknown terms even when a model drops them", async () => {
    const modelInterpreter = vi.fn().mockResolvedValue({
      intent: "project_search",
      year: 2026,
      sector: "healthcare",
      areaCouncil: "Bwari",
      terms: [],
      needsClarification: false,
      clarificationQuestion: null,
      confidence: "high",
    });

    await expect(
      interpretQuery("₦50 billion dragon hospital in Bwari", modelInterpreter),
    ).resolves.toMatchObject({
      fallbackUsed: false,
      interpretation: { terms: ["50", "billion", "dragon"] },
    });
  });

  it("rejects overlong input before invoking a model", async () => {
    const modelInterpreter = vi.fn();
    await expect(interpretQuery("x".repeat(301), modelInterpreter)).rejects.toThrow(
      "300 characters or fewer",
    );
    expect(modelInterpreter).not.toHaveBeenCalled();
  });
});
