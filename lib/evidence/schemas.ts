import { z } from "zod";

import { FCT_AREA_COUNCILS } from "@/lib/domain/constants";
import { EVIDENCE_OBSERVATION_TYPES } from "@/lib/domain/evidence";

export const EVIDENCE_DESCRIPTION_MAX_LENGTH = 500;
export const EVIDENCE_LOCALITY_MAX_LENGTH = 120;

const htmlPattern = /<\/?[a-z][^>]*>/i;

function optionalPlainText(maxLength: number, fieldName: string) {
  return z
    .string()
    .trim()
    .max(maxLength, `${fieldName} must be ${maxLength} characters or fewer.`)
    .refine((value) => !htmlPattern.test(value), `${fieldName} must be plain text.`)
    .transform((value) => value || null);
}

function optionalCoordinate(value: unknown): number | null | unknown {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}

export const evidenceSubmissionFieldsSchema = z
  .object({
    observationType: z.enum(EVIDENCE_OBSERVATION_TYPES),
    description: optionalPlainText(EVIDENCE_DESCRIPTION_MAX_LENGTH, "Description"),
    areaCouncil: z.enum(FCT_AREA_COUNCILS),
    locality: optionalPlainText(EVIDENCE_LOCALITY_MAX_LENGTH, "Locality"),
    approximateLat: z.preprocess(optionalCoordinate, z.number().min(-90).max(90).nullable()),
    approximateLng: z.preprocess(optionalCoordinate, z.number().min(-180).max(180).nullable()),
    acknowledgement: z.literal("true"),
  })
  .strip()
  .superRefine((value, context) => {
    if ((value.approximateLat === null) !== (value.approximateLng === null)) {
      context.addIssue({
        code: "custom",
        path: ["approximateLat"],
        message: "Approximate latitude and longitude must be supplied together.",
      });
    }
  });

export type EvidenceSubmissionFields = z.infer<typeof evidenceSubmissionFieldsSchema>;

export function parseEvidenceSubmissionFormData(formData: FormData): EvidenceSubmissionFields {
  return evidenceSubmissionFieldsSchema.parse({
    observationType: formData.get("observationType"),
    description: formData.get("description") ?? "",
    areaCouncil: formData.get("areaCouncil"),
    locality: formData.get("locality") ?? "",
    approximateLat: formData.get("approximateLat"),
    approximateLng: formData.get("approximateLng"),
    acknowledgement: formData.get("acknowledgement"),
  });
}
