import assert from "node:assert/strict";

import { createClient } from "@supabase/supabase-js";

import { fallbackInterpretQuery } from "@/lib/ai/fallback-query";
import { countProjects } from "@/lib/data/projects";
import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import { searchProjects } from "@/lib/data/search";
import { getReceiptShareData } from "@/lib/share/receipt-share";
import { getServerSupabaseConfig } from "@/lib/supabase/env";

const suggestions = [
  "Roads in Kwali",
  "Healthcare in Gwagwalada",
  "Schools in Bwari",
  "Water in Kwali",
];

async function main() {
  const config = getServerSupabaseConfig();
  const client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  assert.equal(await countProjects(client), 50);
  for (const suggestion of suggestions) {
    const results = await searchProjects(fallbackInterpretQuery(suggestion), client);
    assert(results.length > 0, `${suggestion} returned no hosted record`);
    console.log(`suggestion=${suggestion}; results=${results.length}`);
  }

  const receipt = await getPublicReceiptByReceiptId("PR-NG-FCT-2026-000001", client);
  assert(receipt, "Demo receipt is unavailable");
  const share = getReceiptShareData(receipt);
  assert.equal(share.allocation, "₦140,000,000");
  assert.equal(share.evidenceState, "NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE");
  assert.equal(receipt.source.documentTitle, "2026 Appropriation Act Details");

  console.log("hosted_projects=50");
  console.log("demo_receipt=PR-NG-FCT-2026-000001");
  console.log("share_allocation=₦140,000,000");
  console.log("share_evidence_state=NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Hosted M6 verification failed");
  process.exitCode = 1;
});
