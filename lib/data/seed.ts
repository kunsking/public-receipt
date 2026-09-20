import { readFile } from "node:fs/promises";

import {
  isConfidenceValue,
  isProjectSector,
  normalizeAreaCouncil,
} from "@/lib/domain/constants";
import { isReceiptId } from "@/lib/domain/project";

export const SEED_HEADERS = [
  "receipt_id",
  "budget_year",
  "project_code",
  "official_title",
  "plain_language_title",
  "plain_language_description",
  "amount",
  "currency",
  "sector",
  "ministry",
  "department",
  "agency",
  "state",
  "area_council",
  "community",
  "location_raw",
  "location_confidence",
  "data_confidence",
  "source_document",
  "source_page",
  "source_section",
  "source_excerpt",
  "source_url",
] as const;

export type SeedHeader = (typeof SEED_HEADERS)[number];
export type SeedProjectRow = Record<SeedHeader, string>;

export interface SeedValidationError {
  row: number;
  field?: SeedHeader;
  message: string;
}

export type SeedValidationResult =
  | { ok: true; rows: SeedProjectRow[]; errors: [] }
  | { ok: false; rows: SeedProjectRow[]; errors: SeedValidationError[] };

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quoted) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0) throw new Error("Unexpected quote in unquoted field");
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("Unterminated quoted field");

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows.filter((values) => values.some((value) => value.trim() !== ""));
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateSeedCsv(input: string): SeedValidationResult {
  const errors: SeedValidationError[] = [];
  let records: string[][];

  try {
    records = parseCsv(input.replace(/^\uFEFF/, ""));
  } catch (error) {
    return {
      ok: false,
      rows: [],
      errors: [
        {
          row: 1,
          message: `Malformed CSV: ${error instanceof Error ? error.message : "unknown error"}`,
        },
      ],
    };
  }

  if (records.length === 0) {
    return {
      ok: false,
      rows: [],
      errors: [{ row: 1, message: "CSV is empty" }],
    };
  }

  const headers = records[0];
  if (
    headers.length !== SEED_HEADERS.length ||
    headers.some((header, index) => header !== SEED_HEADERS[index])
  ) {
    errors.push({ row: 1, message: "CSV headers do not match the canonical seed schema" });
  }

  const rows: SeedProjectRow[] = [];
  const receiptIds = new Set<string>();

  records.slice(1).forEach((values, rowIndex) => {
    const rowNumber = rowIndex + 2;
    if (values.length !== SEED_HEADERS.length) {
      errors.push({
        row: rowNumber,
        message: `Malformed row: expected ${SEED_HEADERS.length} fields, received ${values.length}`,
      });
      return;
    }

    const row = Object.fromEntries(
      SEED_HEADERS.map((header, index) => [header, values[index].trim()]),
    ) as SeedProjectRow;
    rows.push(row);

    if (!row.official_title) {
      errors.push({ row: rowNumber, field: "official_title", message: "Official title is required" });
    }
    if (row.budget_year !== "2026") {
      errors.push({ row: rowNumber, field: "budget_year", message: "Budget year must be 2026" });
    }
    if (!isReceiptId(row.receipt_id)) {
      errors.push({ row: rowNumber, field: "receipt_id", message: "Receipt ID has an invalid format" });
    } else if (receiptIds.has(row.receipt_id)) {
      errors.push({ row: rowNumber, field: "receipt_id", message: "Duplicate receipt ID" });
    }
    receiptIds.add(row.receipt_id);

    if (!row.source_url || !isValidUrl(row.source_url)) {
      errors.push({ row: rowNumber, field: "source_url", message: "A valid source URL is required" });
    }
    if (!row.source_excerpt) {
      errors.push({ row: rowNumber, field: "source_excerpt", message: "Source excerpt is required" });
    }
    if (row.amount) {
      const amount = Number(row.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        errors.push({ row: rowNumber, field: "amount", message: "Amount must be a non-negative number" });
      }
    }
    if (!isProjectSector(row.sector)) {
      errors.push({ row: rowNumber, field: "sector", message: "Invalid sector" });
    }
    if (row.area_council && !normalizeAreaCouncil(row.area_council)) {
      errors.push({ row: rowNumber, field: "area_council", message: "Invalid FCT area council" });
    }
    if (!isConfidenceValue(row.location_confidence)) {
      errors.push({ row: rowNumber, field: "location_confidence", message: "Invalid location confidence" });
    }
    if (!isConfidenceValue(row.data_confidence)) {
      errors.push({ row: rowNumber, field: "data_confidence", message: "Invalid data confidence" });
    }
  });

  return errors.length > 0 ? { ok: false, rows, errors } : { ok: true, rows, errors: [] };
}

export async function readAndValidateSeedFile(path: string): Promise<SeedValidationResult> {
  return validateSeedCsv(await readFile(path, "utf8"));
}

export function mapSeedRowToProjectInput(row: SeedProjectRow) {
  return {
    receipt_id: row.receipt_id,
    budget_year: Number(row.budget_year),
    project_code: row.project_code || null,
    official_title: row.official_title,
    plain_language_title: row.plain_language_title || null,
    plain_language_description: row.plain_language_description || null,
    amount: row.amount ? Number(row.amount) : null,
    currency: row.currency || "NGN",
    sector: row.sector,
    ministry: row.ministry || null,
    department: row.department || null,
    agency: row.agency || null,
    state: row.state || "Federal Capital Territory",
    area_council: row.area_council ? normalizeAreaCouncil(row.area_council) : null,
    community: row.community || null,
    location_raw: row.location_raw,
    location_confidence: row.location_confidence,
    data_confidence: row.data_confidence,
  };
}
