import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  AnswerUnavailableError,
  answerReceiptQuestion,
} from "@/lib/ai/answer-receipt-question";
import { receiptQuestionRequestSchema } from "@/lib/ai/schemas";
import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import { isReceiptId } from "@/lib/domain/project";

type AskRouteContext = { params: Promise<{ receipt_id: string }> };

export async function POST(request: Request, context: AskRouteContext) {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();
  const { receipt_id: receiptId } = await context.params;

  try {
    const body: unknown = await request.json();
    const { question } = receiptQuestionRequestSchema.parse(body);

    if (!isReceiptId(receiptId)) {
      return NextResponse.json({ error: "receipt_not_found" }, { status: 404 });
    }

    const receipt = await getPublicReceiptByReceiptId(receiptId);
    if (!receipt) {
      return NextResponse.json({ error: "receipt_not_found" }, { status: 404 });
    }

    const answer = await answerReceiptQuestion(question, receipt);
    console.info("receipt.answer.completed", {
      requestId,
      receiptId,
      state: answer.state,
      durationMs: Math.round(performance.now() - startedAt),
    });
    return NextResponse.json(answer);
  } catch (error) {
    const validationError = error instanceof ZodError || error instanceof SyntaxError;
    const unavailable = error instanceof AnswerUnavailableError;

    console.warn("receipt.answer.failed", {
      requestId,
      receiptId,
      validationError,
      unavailable,
      durationMs: Math.round(performance.now() - startedAt),
    });

    if (validationError) {
      return NextResponse.json({ error: "invalid_question" }, { status: 400 });
    }
    return NextResponse.json({ error: "answer_unavailable" }, { status: 503 });
  }
}
