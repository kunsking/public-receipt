import { describe, expect, it } from "vitest";
import { formatNaira } from "@/lib/format";

describe("formatNaira", () => {
  it("formats whole-naira allocations", () => {
    expect(formatNaira(85_000_000)).toBe("₦85,000,000");
  });
});
