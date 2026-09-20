import { z } from "zod";

import { CONFIDENCE_VALUES, FCT_AREA_COUNCILS } from "@/lib/domain/constants";

export const SEARCH_QUERY_MAX_LENGTH = 300;
export const RECEIPT_QUESTION_MAX_LENGTH = 300;

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

export const receiptQuestionRequestSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, "Ask a question about this receipt.")
      .max(
        RECEIPT_QUESTION_MAX_LENGTH,
        `Receipt questions must be ${RECEIPT_QUESTION_MAX_LENGTH} characters or fewer.`,
      ),
  })
  .strict();

export const receiptAnswerStateSchema = z.enum([
  "supported",
  "partial",
  "unknown",
  "sensitive",
]);

export const receiptAnswerBasisTypeSchema = z.enum([
  "official_record",
  "source_excerpt",
  "verified_evidence",
  "corroborated_community_evidence",
  "community_report",
]);

export const receiptAnswerBasisSchema = z
  .object({
    type: receiptAnswerBasisTypeSchema,
    label: z.string().trim().min(1).max(180),
  })
  .strict();

export const receiptAnswerSchema = z
  .object({
    state: receiptAnswerStateSchema,
    answer: z.string().trim().min(1).max(1_200),
    basis: z.array(receiptAnswerBasisSchema).max(8),
    caveat: z.string().trim().min(1).max(500).nullable(),
    sourceRequired: z.boolean(),
  })
  .strict()
  .superRefine((value, context) => {
    if ((value.state === "supported" || value.state === "partial") && value.basis.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["basis"],
        message: "Supported answers require an evidence basis.",
      });
    }
  });

export const trustedReceiptContextSchema = z
  .object({
    receiptId: z.string(),
    budgetYear: z.number().int(),
    officialTitle: z.string(),
    plainLanguageTitle: z.string().nullable(),
    plainLanguageDescription: z.string().nullable(),
    amount: z.number().nullable(),
    currency: z.string(),
    projectCode: z.string().nullable(),
    sector: searchSectorSchema.exclude(["other"]),
    ministry: z.string().nullable(),
    department: z.string().nullable(),
    agency: z.string().nullable(),
    state: z.string(),
    areaCouncil: z.enum(FCT_AREA_COUNCILS).nullable(),
    community: z.string().nullable(),
    locationRaw: z.string(),
    locationConfidence: z.enum(CONFIDENCE_VALUES),
    dataConfidence: z.enum(CONFIDENCE_VALUES),
    source: z
      .object({
        documentTitle: z.string(),
        publisher: z.string(),
        publicationDate: z.string().nullable(),
        sourcePage: z.string().nullable(),
        sourceSection: z.string().nullable(),
        sourceExcerpt: z.string(),
        sourceUrl: z.string().url(),
      })
      .strict(),
    evidenceSummary: z
      .object({
        communityReports: z.number().int().nonnegative(),
        corroboratedReports: z.number().int().nonnegative(),
        verifiedIndependent: z.number().int().nonnegative(),
        disputed: z.boolean(),
      })
      .strict(),
  })
  .strict();

export type ReceiptQuestionRequest = z.infer<typeof receiptQuestionRequestSchema>;
export type ReceiptAnswer = z.infer<typeof receiptAnswerSchema>;
export type ReceiptAnswerState = z.infer<typeof receiptAnswerStateSchema>;
export type ReceiptAnswerBasisType = z.infer<typeof receiptAnswerBasisTypeSchema>;
export type TrustedReceiptContext = z.infer<typeof trustedReceiptContextSchema>;
