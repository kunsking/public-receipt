import type { PublicReceipt } from "@/lib/domain/receipt";

export const demoReceipt: PublicReceipt = {
  id: "project-id",
  receiptId: "PR-NG-FCT-2026-000001",
  budgetYear: 2026,
  projectCode: "ERGP12238012",
  officialTitle:
    "CONSTRUCTION OF RURAL ROAD AT PIRI COMMUNITY, KWALI AREA COUNCIL, FCT SENATORIAL DISTRICT, ABUJA",
  plainLanguageTitle: null,
  plainLanguageDescription: null,
  amount: 140_000_000,
  currency: "NGN",
  sector: "roads_transport",
  ministry: "Federal Ministry of Industry, Trade and Investment",
  department: null,
  agency: null,
  state: "Federal Capital Territory",
  areaCouncil: "Kwali",
  community: "Piri",
  locationRaw: "Piri Community, Kwali Area Council, FCT Senatorial District, Abuja",
  locationConfidence: "high",
  dataConfidence: "high",
  source: {
    documentTitle: "2026 Appropriation Act Details",
    publisher: "Budget Office of the Federation, Federal Republic of Nigeria",
    publicationDate: "2026-08-10",
    budgetYear: 2026,
    documentType: "appropriation_act",
    sourcePage: "PDF 994; printed page 963",
    sourceSection: "Federal Ministry of Industry, Trade and Investment - HQTRS",
    sourceExcerpt:
      "ERGP12238012 CONSTRUCTION OF RURAL ROAD AT PIRI COMMUNITY, KWALI AREA COUNCIL, FCT SENATORIAL DISTRICT, ABUJA ONGOING 140,000,000",
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
