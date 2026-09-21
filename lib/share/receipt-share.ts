import {
  getReceiptDisplayTitle,
  getReceiptLocation,
  NO_IMPLEMENTATION_EVIDENCE,
  type EvidenceSummary,
  type PublicReceipt,
} from "@/lib/domain/receipt";
import { formatNaira } from "@/lib/format";

export interface ReceiptShareData {
  receiptId: string;
  title: string;
  location: string;
  allocation: string;
  evidenceState: string;
}

export function getShareEvidenceState(summary: EvidenceSummary): string {
  if (summary.disputed) return "EVIDENCE DISPUTED";
  if (summary.verifiedIndependent > 0) {
    return "VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE";
  }
  if (summary.corroboratedReports > 0) {
    return "CORROBORATED COMMUNITY EVIDENCE AVAILABLE";
  }
  if (summary.communityReports > 0) return "COMMUNITY REPORTS AVAILABLE — UNVERIFIED";
  return NO_IMPLEMENTATION_EVIDENCE;
}

export function getReceiptShareData(receipt: PublicReceipt): ReceiptShareData {
  const location = getReceiptLocation(receipt);
  return {
    receiptId: receipt.receiptId,
    title: getReceiptDisplayTitle(receipt),
    location: [location.primary, location.secondary].filter(Boolean).join(", "),
    allocation: receipt.amount === null ? "Amount not specified" : formatNaira(receipt.amount),
    evidenceState: getShareEvidenceState(receipt.evidenceSummary),
  };
}
