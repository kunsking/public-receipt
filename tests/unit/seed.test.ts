import { describe, expect, it } from "vitest";

import { SEED_HEADERS, validateSeedCsv } from "@/lib/data/seed";

const validValues = [
  "PR-NG-FCT-2026-000001",
  "2026",
  "ERGP12238012",
  "CONSTRUCTION OF RURAL ROAD AT PIRI COMMUNITY",
  "",
  "",
  "140000000",
  "NGN",
  "roads_transport",
  "Federal Ministry",
  "",
  "",
  "Federal Capital Territory",
  "Kwali",
  "Piri",
  "Piri Community, Kwali",
  "high",
  "high",
  "2026 Appropriation Act Details",
  "PDF 994; printed page 963",
  "Ministry section",
  "Official excerpt, with commas",
  "https://budgetoffice.gov.ng/example",
];

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function csvFor(...rows: string[][]): string {
  return `${SEED_HEADERS.join(",")}\n${rows.map((row) => row.map(escapeCsv).join(",")).join("\n")}`;
}

describe("seed CSV validation", () => {
  it("accepts a complete canonical row", () => {
    const result = validateSeedCsv(csvFor(validValues));
    expect(result.ok).toBe(true);
    expect(result.rows).toHaveLength(1);
  });

  it("detects duplicate receipt IDs", () => {
    const result = validateSeedCsv(csvFor(validValues, validValues));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.message === "Duplicate receipt ID")).toBe(true);
  });

  it.each([
    [3, "", "Official title is required"],
    [1, "2025", "Budget year must be 2026"],
    [6, "-1", "Amount must be a non-negative number"],
    [8, "agriculture", "Invalid sector"],
    [13, "Lagos Island", "Invalid FCT area council"],
    [16, "certain", "Invalid location confidence"],
    [17, "certain", "Invalid data confidence"],
    [21, "", "Source excerpt is required"],
    [22, "not-a-url", "A valid source URL is required"],
  ])("rejects invalid field %i", (index, value, message) => {
    const row = [...validValues];
    row[index as number] = value as string;
    const result = validateSeedCsv(csvFor(row));
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.message === message)).toBe(true);
  });

  it("rejects malformed rows", () => {
    const result = validateSeedCsv(csvFor(validValues.slice(0, -1)));
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.message).toContain("Malformed row");
  });
});
