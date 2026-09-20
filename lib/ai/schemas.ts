import { z } from "zod";

import { CONFIDENCE_VALUES, FCT_AREA_COUNCILS } from "@/lib/domain/constants";

export const SEARCH_QUERY_MAX_LENGTH = 300;

export const searchRequestSchema = z
  .object({
    query: z
      .string()
      .trim()
      .min(1, "Enter a project, place or public service to search for.")
      .max(
        SEARCH_QUERY_MAX_LENGTH,
        `Search queries must be ${SEARCH_QUERY_MAX_LENGTH} characters or fewer.`,
      ),
  })
  .strict();

export const searchIntentSchema = z.enum([
  "project_search",
  "project_lookup",
  "unknown",
]);

export const searchSectorSchema = z.enum([
  "healthcare",
  "education",
  "roads_transport",
  "water_sanitation",
  "community_infrastructure",
  "other",
]);

export const searchInterpretationSchema = z
  .object({
    intent: searchIntentSchema,
    year: z.number().int().min(2000).max(2100).nullable(),
    sector: searchSectorSchema.nullable(),
    areaCouncil: z.enum(FCT_AREA_COUNCILS).nullable(),
    terms: z.array(z.string().trim().min(1).max(80)).max(12),
    needsClarification: z.boolean(),
    clarificationQuestion: z.string().trim().min(1).max(200).nullable(),
    confidence: z.enum(CONFIDENCE_VALUES),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.needsClarification && !value.clarificationQuestion) {
      context.addIssue({
        code: "custom",
        path: ["clarificationQuestion"],
        message: "A clarification question is required when clarification is needed.",
      });
    }

    if (!value.needsClarification && value.clarificationQuestion) {
      context.addIssue({
        code: "custom",
        path: ["clarificationQuestion"],
        message: "A clarification question is only allowed when clarification is needed.",
      });
    }
  });

export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SearchInterpretation = z.infer<typeof searchInterpretationSchema>;
export type SearchSector = z.infer<typeof searchSectorSchema>;
