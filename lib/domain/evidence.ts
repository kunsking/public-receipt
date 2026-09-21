import type { FctAreaCouncil } from "@/lib/domain/constants";

export const EVIDENCE_OBSERVATION_TYPES = [
  "work_started",
  "appears_completed",
  "appears_incomplete",
  "cannot_locate",
  "other",
] as const;

export type EvidenceObservationType = (typeof EVIDENCE_OBSERVATION_TYPES)[number];

export const EVIDENCE_OBSERVATION_LABELS: Record<EvidenceObservationType, string> = {
  work_started: "Work has started",
  appears_completed: "Work appears completed",
  appears_incomplete: "Work appears incomplete",
  cannot_locate: "I could not locate the project",
  other: "Something else",
};

export type EvidenceVerificationStatus =
  | "community_report"
  | "corroborated"
  | "verified_independent"
  | "disputed";

export interface CommunityEvidenceInput {
  observationType: EvidenceObservationType;
  description: string | null;
  areaCouncil: FctAreaCouncil;
  locality: string | null;
  approximateLat: number | null;
  approximateLng: number | null;
}

export interface PublicEvidenceItem {
  observationType: EvidenceObservationType;
  description: string | null;
  areaCouncil: FctAreaCouncil;
  locality: string | null;
  verificationStatus: EvidenceVerificationStatus;
  submittedAt: string;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
}

export const INITIAL_EVIDENCE_STATE = {
  verificationStatus: "community_report",
  moderationStatus: "pending",
  publicVisibility: false,
} as const;
