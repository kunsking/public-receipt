import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { interpretQuery } from "@/lib/ai/interpret-query";
import { searchRequestSchema } from "@/lib/ai/schemas";
import { searchProjects } from "@/lib/data/search";

const NO_RESULT_MESSAGE = "No matching verified record is currently indexed.";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();

  try {
    const body: unknown = await request.json();
    const { query } = searchRequestSchema.parse(body);
    const { interpretation, fallbackUsed } = await interpretQuery(query);
    const results = await searchProjects(interpretation);
    const durationMs = Math.round(performance.now() - startedAt);

    console.info("search.completed", {
      requestId,
      interpretationSucceeded: true,
      fallbackUsed,
      resultCount: results.length,
      durationMs,
    });

    return NextResponse.json({
      interpretation,
      results,
      meta: {
        count: results.length,
        coverage: "selected_fct_2026",
        fallbackUsed,
        ...(results.length === 0 && !interpretation.needsClarification
          ? { message: NO_RESULT_MESSAGE }
          : {}),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(null, { status: 499 });
    }

    const durationMs = Math.round(performance.now() - startedAt);
    const validationError = error instanceof ZodError || error instanceof SyntaxError;

    console.warn("search.failed", {
      requestId,
      validationError,
      durationMs,
    });

    return NextResponse.json(
      {
        error: validationError
          ? error instanceof ZodError
            ? error.issues[0]?.message ?? "Invalid search request."
            : "Invalid search request."
          : "We couldn't search public records right now.",
      },
      { status: validationError ? 400 : 500 },
    );
  }
}
