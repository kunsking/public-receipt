import { resolve } from "node:path";

import { readAndValidateSeedFile } from "@/lib/data/seed";

export async function validateSeedFile(path: string): Promise<number> {
  const result = await readAndValidateSeedFile(path);

  if (!result.ok) {
    console.error(`Seed validation failed with ${result.errors.length} error(s):`);
    result.errors.forEach((error) => {
      const field = error.field ? ` [${error.field}]` : "";
      console.error(`- row ${error.row}${field}: ${error.message}`);
    });
    return 1;
  }

  console.log(`Seed validation passed: ${result.rows.length} record(s) in ${path}`);
  return 0;
}

async function main() {
  const path = resolve(process.cwd(), process.argv[2] ?? "data/seed/projects.csv");
  process.exitCode = await validateSeedFile(path);
}

void main();
