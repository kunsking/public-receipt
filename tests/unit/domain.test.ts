import { describe, expect, it } from "vitest";

import {
  isConfidenceValue,
  isProjectSector,
  normalizeAreaCouncil,
} from "@/lib/domain/constants";
import { isReceiptId } from "@/lib/domain/project";

describe("FCT domain constants", () => {
  it("normalizes the AMAC alias", () => {
    expect(normalizeAreaCouncil("AMAC")).toBe("Abuja Municipal Area Council");
  });

  it("accepts canonical councils and rejects non-FCT values", () => {
    expect(normalizeAreaCouncil("Kwali")).toBe("Kwali");
    expect(normalizeAreaCouncil("Lagos Island")).toBeUndefined();
  });

  it("validates sectors and confidence values", () => {
    expect(isProjectSector("healthcare")).toBe(true);
    expect(isProjectSector("agriculture")).toBe(false);
    expect(isConfidenceValue("high")).toBe(true);
    expect(isConfidenceValue("certain")).toBe(false);
  });
});

describe("receipt IDs", () => {
  it("accepts only the deterministic M1 format", () => {
    expect(isReceiptId("PR-NG-FCT-2026-000001")).toBe(true);
    expect(isReceiptId("PR-NG-FCT-2025-000001")).toBe(false);
    expect(isReceiptId("PR-NG-FCT-2026-1")).toBe(false);
  });
});
