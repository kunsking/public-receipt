import type {
  ConfidenceValue,
  FctAreaCouncil,
  ProjectSector,
} from "@/lib/domain/constants";

export const RECEIPT_ID_PATTERN = /^PR-NG-FCT-2026-\d{6}$/;

export function isReceiptId(value: string): boolean {
  return RECEIPT_ID_PATTERN.test(value);
}

export interface Project {
  id: string;
  receiptId: string;
  budgetYear: number;
  projectCode: string | null;
  officialTitle: string;
  plainLanguageTitle: string | null;
  plainLanguageDescription: string | null;
  amount: number | null;
  currency: string;
  sector: ProjectSector;
  ministry: string | null;
  department: string | null;
  agency: string | null;
  state: string;
  areaCouncil: FctAreaCouncil | null;
  community: string | null;
  locationRaw: string;
  locationConfidence: ConfidenceValue;
  dataConfidence: ConfidenceValue;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSource {
  id: string;
  projectId: string;
  sourceDocumentId: string;
  sourcePage: string | null;
  sourceSection: string | null;
  sourceExcerpt: string;
  sourceDocument: {
    id: string;
    title: string;
    publisher: string;
    budgetYear: number;
    documentType: string;
    sourceUrl: string;
    publishedOn: string | null;
    accessedAt: string;
  };
}
