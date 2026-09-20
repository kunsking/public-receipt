import { searchInterpretationSchema, type SearchInterpretation, type SearchSector } from "@/lib/ai/schemas";
import type { FctAreaCouncil } from "@/lib/domain/constants";

const CLARIFICATION_QUESTION =
  "Do you mean the whole Federal Capital Territory or Abuja Municipal Area Council?";

const SECTOR_PATTERNS: ReadonlyArray<{ sector: SearchSector; pattern: RegExp }> = [
  { sector: "healthcare", pattern: /\b(?:health|healthcare|hospital|clinic|phc)\b/i },
  { sector: "education", pattern: /\b(?:school|schools|classroom|classrooms|education)\b/i },
  { sector: "roads_transport", pattern: /\b(?:road|roads|bridge|bridges|transport)\b/i },
  { sector: "water_sanitation", pattern: /\b(?:water|borehole|boreholes|sanitation)\b/i },
  { sector: "community_infrastructure", pattern: /\b(?:infrastructure|civic centre|civic center|solar lights?)\b/i },
];

const AREA_PATTERNS: ReadonlyArray<{
  areaCouncil: FctAreaCouncil;
  pattern: RegExp;
}> = [
  {
    areaCouncil: "Abuja Municipal Area Council",
    pattern: /\b(?:amac|abuja municipal(?: area council)?)\b/i,
  },
  { areaCouncil: "Abaji", pattern: /\babaji\b/i },
  { areaCouncil: "Bwari", pattern: /\bbwari\b/i },
  { areaCouncil: "Gwagwalada", pattern: /\bgwagwalada\b/i },
  { areaCouncil: "Kuje", pattern: /\bkuje\b/i },
  { areaCouncil: "Kwali", pattern: /\bkwali\b/i },
];

const REMOVED_TERMS = new Set([
  "a", "about", "allocation", "allocations", "and", "are", "at", "budget",
  "budgeted", "by", "capital", "did", "do", "fct", "federal", "find", "for",
  "government", "how", "in", "is", "me", "of", "project", "projects", "public",
  "receipt", "receipts", "show", "territory", "the", "to", "was", "were", "what",
  "which", "with",
]);

const RECOGNIZED_TOKENS = new Set([
  "abaji", "amac", "abuja", "municipal", "area", "council", "bwari", "gwagwalada",
  "kuje", "kwali", "health", "healthcare", "hospital", "clinic", "phc", "school",
  "schools", "classroom", "classrooms", "education", "road", "roads", "bridge",
  "bridges", "transport", "water", "borehole", "boreholes", "sanitation",
  "infrastructure", "civic", "centre", "center", "solar", "light", "lights",
]);

function extractTerms(query: string): string[] {
  const tokens = query.toLowerCase().match(/[a-z0-9][a-z0-9-]*/g) ?? [];
  return [...new Set(tokens)].filter(
    (token) =>
      token !== "2026" &&
      !REMOVED_TERMS.has(token) &&
      !RECOGNIZED_TOKENS.has(token),
  );
}
export function fallbackInterpretQuery(query: string): SearchInterpretation {
  const areaCouncil =
    AREA_PATTERNS.find(({ pattern }) => pattern.test(query))?.areaCouncil ?? null;
  const sector = SECTOR_PATTERNS.find(({ pattern }) => pattern.test(query))?.sector ?? null;
  const explicitFct = /\b(?:fct|federal capital territory|all fct)\b/i.test(query);
  const ambiguousAbuja = /\babuja\b/i.test(query) && !areaCouncil && !explicitFct;
  const receiptId = query.match(/\bPR-NG-FCT-2026-\d{6}\b/i)?.[0];
  const terms = receiptId ? [receiptId.toLowerCase()] : extractTerms(query);
  const mentionsProjects = /\b(?:project|projects|receipt|receipts)\b/i.test(query);

  return searchInterpretationSchema.parse({
    intent: receiptId
      ? "project_lookup"
      : areaCouncil || sector || terms.length > 0 || mentionsProjects || explicitFct
        ? "project_search"
        : "unknown",
    year: 2026,
    sector,
    areaCouncil,
    terms,
    needsClarification: ambiguousAbuja,
    clarificationQuestion: ambiguousAbuja ? CLARIFICATION_QUESTION : null,
    confidence: areaCouncil || sector || receiptId ? "high" : terms.length > 0 ? "medium" : "low",
  });
}
