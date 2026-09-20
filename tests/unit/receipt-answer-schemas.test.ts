import { describe, expect, it } from "vitest";

import {
  receiptAnswerSchema,
  receiptQuestionRequestSchema,
} from "@/lib/ai/schemas";

const validAnswer = {
  state: "supported",
  answer: "The official record supports this answer.",
  basis: [{ type: "official_record", label: "2026 federal budget record" }],
  caveat: null,
  sourceRequired: true,
} as const;

describe("receipt question schema", () => {
  it("accepts and trims a valid question", () => {
    expect(receiptQuestionRequestSchema.parse({ question: "  How much was budgeted?  " })).toEqual({
      question: "How much was budgeted?",
    });
  });

  it("rejects an empty question", () => {
    expect(receiptQuestionRequestSchema.safeParse({ question: "   " }).success).toBe(false);
  });

  it("rejects a question over 300 characters", () => {
    expect(receiptQuestionRequestSchema.safeParse({ question: "x".repeat(301) }).success).toBe(false);
  });
});

describe("receipt answer schema", () => {
  it.each(["supported", "partial", "unknown", "sensitive"] as const)(
    "accepts the %s state",
    (state) => {
      const basis = state === "supported" || state === "partial" ? validAnswer.basis : [];
      expect(receiptAnswerSchema.safeParse({ ...validAnswer, state, basis }).success).toBe(true);
    },
  );

  it("rejects an unsupported answer state", () => {
    expect(receiptAnswerSchema.safeParse({ ...validAnswer, state: "confident" }).success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const incomplete = {
      state: validAnswer.state,
      basis: validAnswer.basis,
      caveat: validAnswer.caveat,
      sourceRequired: validAnswer.sourceRequired,
    };
    expect(receiptAnswerSchema.safeParse(incomplete).success).toBe(false);
  });

  it("requires an evidence basis for supported and partial answers", () => {
    expect(receiptAnswerSchema.safeParse({ ...validAnswer, basis: [] }).success).toBe(false);
  });
});
