import { createClient } from "@supabase/supabase-js";

import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import {
  getReceiptDisplayTitle,
  getReceiptLocation,
  getResponsibleInstitution,
} from "@/lib/domain/receipt";
import { formatNaira } from "@/lib/format";
import { getServerSupabaseConfig } from "@/lib/supabase/env";

const DEMO_RECEIPT_ID = "PR-NG-FCT-2026-000001";
const HEALTHCARE_RECEIPT_ID = "PR-NG-FCT-2026-000028";
const OPTIONAL_FIELDS_RECEIPT_ID = "PR-NG-FCT-2026-000002";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const { url, publishableKey } = getServerSupabaseConfig();
  const publicClient = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [demo, healthcare, optionalFields] = await Promise.all([
    getPublicReceiptByReceiptId(DEMO_RECEIPT_ID, publicClient),
    getPublicReceiptByReceiptId(HEALTHCARE_RECEIPT_ID, publicClient),
    getPublicReceiptByReceiptId(OPTIONAL_FIELDS_RECEIPT_ID, publicClient),
  ]);

  assert(demo, `Demo receipt ${DEMO_RECEIPT_ID} was not found`);
  assert(healthcare, `Healthcare receipt ${HEALTHCARE_RECEIPT_ID} was not found`);
  assert(optionalFields, `Optional-fields receipt ${OPTIONAL_FIELDS_RECEIPT_ID} was not found`);

  assert(demo.amount === 140_000_000, "Demo allocation does not match the verified seed");
  assert(formatNaira(demo.amount) === "₦140,000,000", "Demo amount formatting changed");
  assert(
    demo.officialTitle ===
      "CONSTRUCTION OF RURAL ROAD AT PIRI COMMUNITY, KWALI AREA COUNCIL, FCT SENATORIAL DISTRICT, ABUJA",
    "Demo official title does not match the verified seed",
  );
  assert(
    demo.source.sourceExcerpt.includes("ERGP12238012") &&
      demo.source.sourceExcerpt.includes("140,000,000"),
    "Demo source excerpt does not match its retained project reference",
  );
  assert(
    demo.source.sourceUrl ===
      "https://budgetoffice.gov.ng/index.php/2026-appropriation-act-details",
    "Demo source URL does not match the verified seed",
  );
  assert(demo.source.sourcePage, "Demo source page is missing");
  assert(demo.source.sourceSection, "Demo source section is missing");
  assert(
    demo.evidenceSummary.communityReports === 0 &&
      demo.evidenceSummary.corroboratedReports === 0 &&
      demo.evidenceSummary.verifiedIndependent === 0 &&
      !demo.evidenceSummary.disputed,
    "Demo evidence summary should be empty for M3",
  );

  assert(healthcare.sector === "healthcare", "Healthcare receipt has the wrong sector");
  assert(healthcare.areaCouncil === "Gwagwalada", "Healthcare receipt has the wrong location");
  assert(healthcare.source.sourceExcerpt.length > 0, "Healthcare receipt has no source excerpt");

  assert(optionalFields.plainLanguageTitle === null, "Expected missing plain-language title");
  assert(optionalFields.plainLanguageDescription === null, "Expected missing plain-language description");
  assert(optionalFields.community === null, "Expected missing optional community");
  assert(
    getReceiptDisplayTitle(optionalFields) === optionalFields.officialTitle,
    "Title fallback did not preserve official wording",
  );
  assert(
    getReceiptLocation(optionalFields).primary === "Kwali Area Council, FCT",
    "Location fallback did not use the area council",
  );
  assert(
    getResponsibleInstitution(optionalFields) === "FGC Kwali",
    "Institution fallback did not use the most specific stored value",
  );

  console.log("Hosted M3 verification passed");
  console.log(`- demo receipt: ${demo.receiptId}`);
  console.log(`- demo allocation: ${formatNaira(demo.amount)}`);
  console.log(`- demo source page: ${demo.source.sourcePage}`);
  console.log(`- evidence summary: ${JSON.stringify(demo.evidenceSummary)}`);
  console.log(`- healthcare receipt: ${healthcare.receiptId}`);
  console.log(`- optional-field fallback receipt: ${optionalFields.receiptId}`);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Hosted M3 verification failed");
  process.exitCode = 1;
});
