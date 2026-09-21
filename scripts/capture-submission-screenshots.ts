import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const receiptId = "PR-NG-FCT-2026-000001";
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const outputDirectory = resolve(process.cwd(), "docs/screenshots");

async function main() {
  await mkdir(outputDirectory, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

  await page.goto(baseUrl);
  await page.screenshot({ path: resolve(outputDirectory, "home.png"), fullPage: true });

  await page.goto(`${baseUrl}/search?q=Roads%20in%20Kwali`);
  await page.getByTestId("project-results").waitFor();
  await page.screenshot({ path: resolve(outputDirectory, "search-results.png"), fullPage: true });

  await page.goto(`${baseUrl}/receipt/${receiptId}`);
  await page.getByText("₦140,000,000").first().waitFor();
  await page.screenshot({ path: resolve(outputDirectory, "receipt.png"), fullPage: true });

  await page.goto(`${baseUrl}/receipt/${receiptId}/source`);
  await page.getByTestId("source-excerpt").waitFor();
  await page.screenshot({ path: resolve(outputDirectory, "source.png"), fullPage: true });

  await page.route(`**/api/receipt/${receiptId}/evidence`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 201,
      body: JSON.stringify({
        accepted: true,
        state: {
          verificationStatus: "community_report",
          moderationStatus: "pending",
          publicVisibility: false,
        },
      }),
    });
  });
  await page.goto(`${baseUrl}/receipt/${receiptId}/submit`);
  await page.getByLabel("Work appears incomplete").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel(/Tell us what you observed/).fill("Drainage work appears incomplete near the community road.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel(/Locality/).fill("Piri");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.screenshot({ path: resolve(outputDirectory, "evidence-review.png"), fullPage: true });
  await page.getByLabel("I understand that this is a community report and is not automatically verified.").check();
  await page.getByRole("button", { name: "Submit Evidence" }).click();
  await page.getByTestId("evidence-confirmation").waitFor();
  await page.screenshot({ path: resolve(outputDirectory, "evidence-confirmation.png"), fullPage: true });

  await page.goto(`${baseUrl}/receipt/${receiptId}/share`);
  await page.getByTestId("share-receipt-card").waitFor();
  await page.screenshot({ path: resolve(outputDirectory, "share.png"), fullPage: true });

  await browser.close();
  console.log(`Submission screenshots written to ${outputDirectory}`);
}

void main();
