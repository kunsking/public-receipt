import type { Project, ProjectSource } from "@/lib/domain/project";

export const NO_IMPLEMENTATION_EVIDENCE =
  "NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE";

export const NO_IMPLEMENTATION_EVIDENCE_CAVEAT =
  "This does not mean the project was not implemented. It means Public Receipt does not currently have sufficient verified evidence to confirm implementation.";

export type EvidenceBadgeType =
  | "official"
  | "verified"
  | "corroborated"
  | "community"
  | "unverified"
  | "disputed";

export interface EvidenceSummary {
  communityReports: number;
  corroboratedReports: number;
  verifiedIndependent: number;
  disputed: boolean;
}

export interface PublicReceiptSource {
  documentTitle: string;
  publisher: string;
  publicationDate: string | null;
  budgetYear: number;
  documentType: string;
  sourcePage: string | null;
  sourceSection: string | null;
  sourceExcerpt: string;
  sourceUrl: string;
  indexedAt: string;
}

export interface PublicReceipt extends Omit<Project, "id" | "createdAt" | "updatedAt"> {
  id: string;
  source: PublicReceiptSource;
  evidenceSummary: EvidenceSummary;
}

export interface ReceiptLocation {
  primary: string;
  secondary: string | null;
  isPossibleMatch: boolean;
}

export function getReceiptDisplayTitle(receipt: Pick<PublicReceipt, "officialTitle" | "plainLanguageTitle">) {
  return receipt.plainLanguageTitle?.trim() || receipt.officialTitle;
}

export function getResponsibleInstitution(
  receipt: Pick<PublicReceipt, "agency" | "department" | "ministry">,
) {
  return (
    receipt.agency?.trim() ||
    receipt.department?.trim() ||
    receipt.ministry?.trim() ||
    "Not specified in indexed record"
  );
}

export function getReceiptLocation(
  receipt: Pick<PublicReceipt, "community" | "areaCouncil" | "state" | "locationConfidence">,
): ReceiptLocation {
  const councilName = receipt.areaCouncil?.endsWith("Area Council")
    ? receipt.areaCouncil
    : receipt.areaCouncil
      ? `${receipt.areaCouncil} Area Council`
      : null;
  const council = councilName ? `${councilName}, FCT` : receipt.state;

  return {
    primary: receipt.community?.trim() || council,
    secondary: receipt.community?.trim() ? council : null,
    isPossibleMatch: receipt.locationConfidence !== "high",
  };
}

export function hasVerifiedImplementationEvidence(summary: EvidenceSummary): boolean {
  return summary.verifiedIndependent > 0 || summary.corroboratedReports > 0;
}

export function mapPublicReceipt(
  project: Project,
  projectSource: ProjectSource,
  evidenceSummary: EvidenceSummary,
): PublicReceipt {
  return {
    id: project.id,
    receiptId: project.receiptId,
    budgetYear: project.budgetYear,
    projectCode: project.projectCode,
    officialTitle: project.officialTitle,
    plainLanguageTitle: project.plainLanguageTitle,
    plainLanguageDescription: project.plainLanguageDescription,
    amount: project.amount,
    currency: project.currency,
    sector: project.sector,
    ministry: project.ministry,
    department: project.department,
    agency: project.agency,
    state: project.state,
    areaCouncil: project.areaCouncil,
    community: project.community,
    locationRaw: project.locationRaw,
    locationConfidence: project.locationConfidence,
    dataConfidence: project.dataConfidence,
    source: {
      documentTitle: projectSource.sourceDocument.title,
      publisher: projectSource.sourceDocument.publisher,
      publicationDate: projectSource.sourceDocument.publishedOn,
      budgetYear: projectSource.sourceDocument.budgetYear,
      documentType: projectSource.sourceDocument.documentType,
      sourcePage: projectSource.sourcePage,
      sourceSection: projectSource.sourceSection,
      sourceExcerpt: projectSource.sourceExcerpt,
      sourceUrl: projectSource.sourceDocument.sourceUrl,
      indexedAt: projectSource.sourceDocument.accessedAt,
    },
    evidenceSummary,
  };
}
