export const FCT_AREA_COUNCILS = [
  "Abaji",
  "Abuja Municipal Area Council",
  "Bwari",
  "Gwagwalada",
  "Kuje",
  "Kwali",
] as const;

export type FctAreaCouncil = (typeof FCT_AREA_COUNCILS)[number];

export const FCT_AREA_COUNCIL_ALIASES = {
  AMAC: "Abuja Municipal Area Council",
} as const satisfies Record<string, FctAreaCouncil>;

export const PROJECT_SECTORS = [
  "healthcare",
  "education",
  "roads_transport",
  "water_sanitation",
  "community_infrastructure",
] as const;

export type ProjectSector = (typeof PROJECT_SECTORS)[number];

export const CONFIDENCE_VALUES = ["high", "medium", "low"] as const;

export type ConfidenceValue = (typeof CONFIDENCE_VALUES)[number];

export function normalizeAreaCouncil(value: string): FctAreaCouncil | undefined {
  const trimmed = value.trim();
  const alias = FCT_AREA_COUNCIL_ALIASES[
    trimmed.toUpperCase() as keyof typeof FCT_AREA_COUNCIL_ALIASES
  ];

  if (alias) return alias;

  return FCT_AREA_COUNCILS.find(
    (areaCouncil) => areaCouncil.toLowerCase() === trimmed.toLowerCase(),
  );
}

export function isProjectSector(value: string): value is ProjectSector {
  return PROJECT_SECTORS.includes(value as ProjectSector);
}

export function isConfidenceValue(value: string): value is ConfidenceValue {
  return CONFIDENCE_VALUES.includes(value as ConfidenceValue);
}
