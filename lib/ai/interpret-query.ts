import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  searchInterpretationSchema,
  searchRequestSchema,
  type SearchInterpretation,
} from "@/lib/ai/schemas";
import { fallbackInterpretQuery } from "@/lib/ai/fallback-query";
import { SEARCH_INTERPRETER_PROMPT } from "@/lib/ai/prompts";

export interface QueryInterpretationResult {
  interpretation: SearchInterpretation;
  fallbackUsed: boolean;
}

export type ModelQueryInterpreter = (
  query: string,
) => Promise<SearchInterpretation>;

function applyDeterministicSafetyRules(
  query: string,
  modelInterpretation: SearchInterpretation,
): SearchInterpretation {
  const fallback = fallbackInterpretQuery(query);
  const terms = [...new Set([...modelInterpretation.terms, ...fallback.terms])];

  if (fallback.needsClarification) return fallback;

  return searchInterpretationSchema.parse({
    ...modelInterpretation,
    year: modelInterpretation.year ?? 2026,
    areaCouncil: fallback.areaCouncil ?? modelInterpretation.areaCouncil,
    sector: fallback.sector ?? modelInterpretation.sector,
    terms,
  });
}

async function interpretWithOpenAI(query: string): Promise<SearchInterpretation> {
  const model = process.env.OPENAI_MODEL;
  if (!model || !process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI interpretation is not configured");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.parse({
    model,
    store: false,
    input: [
      { role: "system", content: SEARCH_INTERPRETER_PROMPT },
      { role: "user", content: query },
    ],
    text: {
      format: zodTextFormat(searchInterpretationSchema, "public_receipt_search"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("The model returned no structured interpretation");
  }

  return searchInterpretationSchema.parse(response.output_parsed);
}

export async function interpretQuery(
  rawQuery: string,
  modelInterpreter?: ModelQueryInterpreter,
): Promise<QueryInterpretationResult> {
  const { query } = searchRequestSchema.parse({ query: rawQuery });
  const aiEnabled = process.env.ENABLE_AI === "true";
  const interpreter = modelInterpreter ?? (aiEnabled ? interpretWithOpenAI : null);

  if (interpreter) {
    try {
      return {
        interpretation: applyDeterministicSafetyRules(
          query,
          searchInterpretationSchema.parse(await interpreter(query)),
        ),
        fallbackUsed: false,
      };
    } catch {
      // Civic records remain searchable when model interpretation is unavailable or invalid.
    }
  }

  return { interpretation: fallbackInterpretQuery(query), fallbackUsed: true };
}
