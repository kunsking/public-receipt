import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AnswerUnavailableError,
  answerReceiptQuestion,
} from "@/lib/ai/answer-receipt-question";
import type { ReceiptAnswer } from "@/lib/ai/schemas";
import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import { demoReceipt } from "@/tests/fixtures/receipt";

vi.mock("@/lib/ai/answer-receipt-question", () => {
  class MockAnswerUnavailableError extends Error {}
  return {
    AnswerUnavailableError: MockAnswerUnavailableError,
    answerReceiptQuestion: vi.fn(),
  };
});
vi.mock("@/lib/data/receipts", () => ({ getPublicReceiptByReceiptId: vi.fn() }));

import { POST } from "@/app/api/receipt/[receipt_id]/ask/route";

const supportedAnswer: ReceiptAnswer = {
  state: "supported",
  answer: "The 2026 federal budget record lists ₦140,000,000 for this project.",
  basis: [{ type: "official_record", label: "2026 federal budget record" }],
  caveat: "Budgeted ≠ Released ≠ Spent ≠ Completed.",
  sourceRequired: true,
};

function request(body: string, receiptId = demoReceipt.receiptId) {
  return POST(
    new Request(`http://localhost/api/receipt/${receiptId}/ask`, {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ receipt_id: receiptId }) },
  );
}

describe("POST /api/receipt/[receipt_id]/ask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPublicReceiptByReceiptId).mockResolvedValue(demoReceipt);
    vi.mocked(answerReceiptQuestion).mockResolvedValue(supportedAnswer);
  });

  it("returns a validated receipt-scoped answer", async () => {
    const response = await request(JSON.stringify({ question: "How much was budgeted?" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(supportedAnswer);
    expect(getPublicReceiptByReceiptId).toHaveBeenCalledWith(demoReceipt.receiptId);
    expect(answerReceiptQuestion).toHaveBeenCalledWith("How much was budgeted?", demoReceipt);
  });

  it.each([
    { question: "" },
    { question: "x".repeat(301) },
  ])("rejects invalid questions before loading receipt context", async (body) => {
    const response = await request(JSON.stringify(body));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_question" });
    expect(getPublicReceiptByReceiptId).not.toHaveBeenCalled();
    expect(answerReceiptQuestion).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await request("{not-json");
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_question" });
  });

  it("rejects malformed receipt IDs before loading or answering", async () => {
    const response = await request(JSON.stringify({ question: "How much?" }), "not-a-receipt");
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "receipt_not_found" });
    expect(getPublicReceiptByReceiptId).not.toHaveBeenCalled();
    expect(answerReceiptQuestion).not.toHaveBeenCalled();
  });

  it("returns the safe contract for an unknown canonical receipt", async () => {
    vi.mocked(getPublicReceiptByReceiptId).mockResolvedValue(null);
    const response = await request(
      JSON.stringify({ question: "How much?" }),
      "PR-NG-FCT-2026-999999",
    );
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "receipt_not_found" });
    expect(answerReceiptQuestion).not.toHaveBeenCalled();
  });

  it("returns answer_unavailable without exposing provider errors", async () => {
    vi.mocked(answerReceiptQuestion).mockRejectedValue(new AnswerUnavailableError());
    const response = await request(JSON.stringify({ question: "Explain another detail" }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "answer_unavailable" });
  });
});
