import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EvidenceSummary } from "@/components/evidence/evidence-summary";
import { OfficialRecord } from "@/components/receipt/official-record";
import { ReceiptHeader } from "@/components/receipt/receipt-header";
import { SourceCitation } from "@/components/receipt/source-citation";
import {
  getReceiptDisplayTitle,
  getReceiptLocation,
  getResponsibleInstitution,
  type PublicReceipt,
} from "@/lib/domain/receipt";

const receipt: PublicReceipt = {
  id: "project-id",
  receiptId: "PR-NG-FCT-2026-000001",
  budgetYear: 2026,
  projectCode: "ERGP12238012",
  officialTitle: "CONSTRUCTION OF RURAL ROAD AT PIRI COMMUNITY",
  plainLanguageTitle: null,
  plainLanguageDescription: null,
  amount: 140_000_000,
  currency: "NGN",
  sector: "roads_transport",
  ministry: "Federal Ministry of Works",
  department: null,
  agency: null,
  state: "Federal Capital Territory",
  areaCouncil: "Kwali",
  community: "Piri",
  locationRaw: "Piri Community, Kwali",
  locationConfidence: "high",
  dataConfidence: "high",
  source: {
    documentTitle: "Federal Republic of Nigeria 2026 Appropriation Act Details",
    publisher: "Budget Office of the Federation",
    publicationDate: "2026-08-10",
    budgetYear: 2026,
    documentType: "appropriation_act",
    sourcePage: "1834",
    sourceSection: "Federal Ministry of Works",
    sourceExcerpt: "Stored source excerpt",
    sourceUrl: "https://budgetoffice.gov.ng/index.php/2026-appropriation-act-details",
    indexedAt: "2026-09-20T00:00:00.000Z",
  },
  evidenceSummary: {
    communityReports: 0,
    corroboratedReports: 0,
    verifiedIndependent: 0,
    disputed: false,
  },
};

describe("receipt field fallbacks", () => {
  it("falls back from plain-language title to official wording", () => {
    expect(getReceiptDisplayTitle(receipt)).toBe(receipt.officialTitle);
    expect(getReceiptDisplayTitle({ ...receipt, plainLanguageTitle: "Piri road works" })).toBe(
      "Piri road works",
    );
  });

  it("uses the most specific available institution", () => {
    expect(getResponsibleInstitution(receipt)).toBe("Federal Ministry of Works");
    expect(getResponsibleInstitution({ agency: null, department: null, ministry: null })).toBe(
      "Not specified in indexed record",
    );
  });

  it("falls back to area council when community is absent", () => {
    expect(getReceiptLocation({ ...receipt, community: null })).toMatchObject({
      primary: "Kwali Area Council, FCT",
      secondary: null,
    });
  });

  it("marks medium-confidence geography as a possible match", () => {
    expect(getReceiptLocation({ ...receipt, locationConfidence: "medium" }).isPossibleMatch).toBe(true);
  });
});

describe("receipt trust UI", () => {
  it("shows exact amount, identity, location and official-record label", () => {
    render(<ReceiptHeader receipt={receipt} />);
    expect(screen.getByText("PR-NG-FCT-2026-000001")).toBeInTheDocument();
    expect(screen.getByText("₦140,000,000")).toBeInTheDocument();
    expect(screen.getByText("Kwali Area Council, FCT")).toBeInTheDocument();
    expect(screen.getByText("OFFICIAL RECORD")).toBeInTheDocument();
  });

  it("uses the mandatory no-evidence state without inventing delivery status", () => {
    render(<EvidenceSummary summary={receipt.evidenceSummary} />);
    const status = screen.getByTestId("implementation-state");

    expect(status).toHaveTextContent("NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE");
    expect(screen.getByText(/This does not mean the project was not implemented/)).toBeInTheDocument();
    expect(status.textContent?.toLowerCase()).not.toMatch(/completed|abandoned|failed|ongoing|corrupt|stolen/);
  });

  it("renders institution fallback and tolerates a missing source page", () => {
    render(
      <>
        <OfficialRecord receipt={{ ...receipt, agency: null, department: null, ministry: null }} />
        <SourceCitation receipt={{ ...receipt, source: { ...receipt.source, sourcePage: null } }} />
      </>,
    );

    expect(screen.getByText("Not specified in indexed record")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View official source/ })).toHaveAttribute(
      "href",
      "/receipt/PR-NG-FCT-2026-000001/source",
    );
    expect(screen.queryByText("Page")).not.toBeInTheDocument();
  });
});
