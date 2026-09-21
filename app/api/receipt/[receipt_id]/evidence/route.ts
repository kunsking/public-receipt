import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { isReceiptId } from "@/lib/domain/project";
import { EvidenceImageError } from "@/lib/evidence/image";
import { parseEvidenceSubmissionFormData } from "@/lib/evidence/schemas";
import {
  EvidenceReceiptNotFoundError,
  EvidenceSubmissionError,
  submitCommunityEvidence,
} from "@/lib/evidence/submit";

const MAX_MULTIPART_BYTES = 5 * 1024 * 1024 + 64 * 1024;

type EvidenceRouteContext = { params: Promise<{ receipt_id: string }> };

export async function POST(request: Request, context: EvidenceRouteContext) {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();
  const { receipt_id: receiptId } = await context.params;

  if (!isReceiptId(receiptId)) {
    return NextResponse.json({ error: "receipt_not_found" }, { status: 404 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
    return NextResponse.json({ error: "invalid_image" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const fields = parseEvidenceSubmissionFormData(formData);
    const imageEntry = formData.get("image");
    const image = imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : undefined;

    const state = await submitCommunityEvidence(receiptId, fields, image);
    console.info("evidence.submission.completed", {
      requestId,
      receiptId,
      imageAttached: Boolean(image),
      durationMs: Math.round(performance.now() - startedAt),
    });

    return NextResponse.json({ accepted: true, state }, { status: 201 });
  } catch (error) {
    const invalidFields = error instanceof ZodError;
    const invalidImage = error instanceof EvidenceImageError;
    const missingReceipt = error instanceof EvidenceReceiptNotFoundError;
    const unavailable = error instanceof EvidenceSubmissionError;

    console.warn("evidence.submission.failed", {
      requestId,
      receiptId,
      invalidFields,
      invalidImage,
      missingReceipt,
      unavailable,
      durationMs: Math.round(performance.now() - startedAt),
    });

    if (missingReceipt) {
      return NextResponse.json({ error: "receipt_not_found" }, { status: 404 });
    }
    if (invalidImage) {
      return NextResponse.json({ error: "invalid_image" }, { status: 400 });
    }
    if (invalidFields) {
      return NextResponse.json({ error: "invalid_evidence" }, { status: 400 });
    }
    return NextResponse.json({ error: "submission_unavailable" }, { status: 503 });
  }
}
