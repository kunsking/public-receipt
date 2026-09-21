import { describe, expect, it } from "vitest";

import { demoReceipt } from "@/tests/fixtures/receipt";
import { getReceiptShareData, getShareEvidenceState } from "@/lib/share/receipt-share";

describe("receipt sharing", () => {
  it("derives the demo card only from canonical receipt fields", () => {
    expect(getReceiptShareData(demoReceipt)).toEqual({
      receiptId: "PR-NG-FCT-2026-000001",
      title: demoReceipt.officialTitle,
      location: "Piri, Kwali Area Council, FCT",
      allocation: "₦140,000,000",
      evidenceState: "NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE",
    });
  });

  it("uses cautious public evidence states in precedence order", () => {
    expect(getShareEvidenceState({ communityReports: 2, corroboratedReports: 0, verifiedIndependent: 0, disputed: false })).toBe("COMMUNITY REPORTS AVAILABLE — UNVERIFIED");
    expect(getShareEvidenceState({ communityReports: 2, corroboratedReports: 1, verifiedIndependent: 0, disputed: false })).toBe("CORROBORATED COMMUNITY EVIDENCE AVAILABLE");
    expect(getShareEvidenceState({ communityReports: 2, corroboratedReports: 1, verifiedIndependent: 1, disputed: false })).toBe("VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE");
    expect(getShareEvidenceState({ communityReports: 0, corroboratedReports: 0, verifiedIndependent: 0, disputed: true })).toBe("EVIDENCE DISPUTED");
  });
});
