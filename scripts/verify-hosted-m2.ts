import { createClient } from "@supabase/supabase-js";

import { fallbackInterpretQuery } from "@/lib/ai/fallback-query";
import { countProjects } from "@/lib/data/projects";
import { searchProjects } from "@/lib/data/search";
import { getServerSupabaseConfig } from "@/lib/supabase/env";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const config = getServerSupabaseConfig();
  const client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const hostedCount = await countProjects(client);
  assert(hostedCount === 50, `Expected 50 hosted projects, received ${hostedCount}`);

  const goldenInterpretation = fallbackInterpretQuery("Roads in Kwali");
  const goldenResults = await searchProjects(goldenInterpretation, client);
  const demoReceipt = goldenResults.find(
    (project) => project.receiptId === "PR-NG-FCT-2026-000001",
  );
  assert(demoReceipt, "The hosted golden search did not return PR-NG-FCT-2026-000001");
  assert(demoReceipt.amount === 140_000_000, "The demo receipt allocation did not match M1");

  const healthcareResults = await searchProjects(
    fallbackInterpretQuery("Healthcare in Gwagwalada"),
    client,
  );
  assert(healthcareResults.length > 0, "The hosted healthcare search returned no records");

  const amac = fallbackInterpretQuery("Schools in AMAC");
  assert(
    amac.areaCouncil === "Abuja Municipal Area Council",
    "AMAC did not normalize to Abuja Municipal Area Council",
  );

  const ambiguousAbuja = fallbackInterpretQuery("Projects in Abuja");
  assert(ambiguousAbuja.needsClarification, "Bare Abuja did not require clarification");

  const dragonResults = await searchProjects(
    fallbackInterpretQuery("₦50 billion dragon hospital in Bwari"),
    client,
  );
  assert(dragonResults.length === 0, "The no-hallucination query returned a project");

  console.log(`Hosted projects searchable: ${hostedCount}`);
  console.log(
    `Golden query: Roads in Kwali -> ${goldenResults.map((project) => project.receiptId).join(", ")}`,
  );
  console.log(`Demo allocation: ${demoReceipt.amount}`);
  console.log(`Healthcare in Gwagwalada: ${healthcareResults.length} record(s)`);
  console.log(`AMAC normalized: ${amac.areaCouncil}`);
  console.log(`Bare Abuja clarification: ${ambiguousAbuja.clarificationQuestion}`);
  console.log(`Dragon hospital results: ${dragonResults.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Hosted M2 verification failed");
  process.exitCode = 1;
});
