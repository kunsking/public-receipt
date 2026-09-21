import { describe, expect, it } from "vitest";

import {
  evidenceSubmissionFieldsSchema,
  parseEvidenceSubmissionFormData,
} from "@/lib/evidence/schemas";

const validFields = {
  observationType: "appears_incomplete",
  description: "Walls are standing but no equipment is visible.",
  areaCouncil: "Kwali",
  locality: "Piri",
  approximateLat: null,
  approximateLng: null,
  acknowledgement: "true",
} as const;

describe("community evidence field validation", () => {
  it("accepts a canonical observation and Area Council", () => {
    expect(evidenceSubmissionFieldsSchema.parse(validFields)).toMatchObject({
      observationType: "appears_incomplete",
      areaCouncil: "Kwali",
    });
  });

  it.each([
    { ...validFields, observationType: "abandoned" },
    { ...validFields, observationType: undefined },
    { ...validFields, areaCouncil: "Lagos" },
    { ...validFields, description: "x".repeat(501) },
    { ...validFields, description: "<script>alert(1)</script>" },
    { ...validFields, approximateLat: "9.1", approximateLng: null },
  ])("rejects invalid or unsafe fields", (fields) => {
    expect(evidenceSubmissionFieldsSchema.safeParse(fields).success).toBe(false);
  });

  it("allows an optional description and locality", () => {
    expect(
      evidenceSubmissionFieldsSchema.parse({
        ...validFields,
        description: "  ",
        locality: "",
      }),
    ).toMatchObject({ description: null, locality: null });
  });

  it("ignores client-controlled trust and publication fields", () => {
    const formData = new FormData();
    Object.entries({
      ...validFields,
      approximateLat: "",
      approximateLng: "",
      verification_status: "verified_independent",
      moderation_status: "approved",
      public_visibility: "true",
    }).forEach(([key, value]) => formData.set(key, String(value)));

    const parsed = parseEvidenceSubmissionFormData(formData);
    expect(parsed).not.toHaveProperty("verification_status");
    expect(parsed).not.toHaveProperty("moderation_status");
    expect(parsed).not.toHaveProperty("public_visibility");
  });
});
