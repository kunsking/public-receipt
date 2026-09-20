import { describe, expect, it } from "vitest";

import {
  searchInterpretationSchema,
  searchRequestSchema,
} from "@/lib/ai/schemas";

const validInterpretation = {
  intent: "project_search",
  year: 2026,
  sector: "healthcare",
  areaCouncil: "Bwari",
  terms: [],
  needsClarification: false,
  clarificationQuestion: null,
  confidence: "high",
} as const;

describe("search request schema", () => {
  it("accepts a Bwari healthcare query", () => {
    expect(
      searchRequestSchema.parse({ query: "What healthcare projects were budgeted for Bwari?" }),
    ).toEqual({ query: "What healthcare projects were budgeted for Bwari?" });
  });

  it("rejects search input over 300 characters", () => {
    expect(() => searchRequestSchema.parse({ query: "x".repeat(301) })).toThrow(
      "300 characters or fewer",
    );
  });
});
describe("search interpretation schema", () => {
  it("accepts the strict Bwari healthcare interpretation", () => {
    expect(searchInterpretationSchema.parse(validInterpretation)).toEqual(validInterpretation);
  });

  it("rejects an invalid area council", () => {
    expect(
      searchInterpretationSchema.safeParse({
        ...validInterpretation,
        areaCouncil: "Lagos Island",
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid sector", () => {
    expect(
      searchInterpretationSchema.safeParse({
        ...validInterpretation,
        sector: "agriculture",
      }).success,
    ).toBe(false);
  });

  it("requires clarification copy when clarification is needed", () => {
    expect(
      searchInterpretationSchema.safeParse({
        ...validInterpretation,
        needsClarification: true,
      }).success,
    ).toBe(false);
  });
});
