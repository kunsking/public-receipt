import { expect, test, type Page } from "@playwright/test";

const DEMO_RECEIPT_ID = "PR-NG-FCT-2026-000001";

async function askQuestion(page: Page, question: string) {
  const section = page.getByTestId("receipt-question");
  await section.getByLabel("Your question").fill(question);
  await section.getByRole("button", { name: "Check this receipt" }).click();
  return page.getByTestId("trusted-answer");
}

test("trusted receipt answers stay grounded in the official record", async ({ page }) => {
  await page.goto(`/receipt/${DEMO_RECEIPT_ID}`);

  const amountAnswer = await askQuestion(page, "How much was budgeted?");
  await expect(amountAnswer).toContainText("SUPPORTED BY OFFICIAL RECORD");
  await expect(amountAnswer).toContainText("₦140,000,000");
  await expect(amountAnswer.getByText("Based on")).toBeVisible();
  await expect(amountAnswer.getByRole("link", { name: "View official source" })).toBeVisible();

  const completionAnswer = await askQuestion(page, "Was this project completed?");
  await expect(completionAnswer).toContainText("NOT ESTABLISHED BY AVAILABLE EVIDENCE");
  await expect(completionAnswer).toContainText("does not currently have verified evidence");
  await expect(completionAnswer).toContainText("Budgeted ≠ Released ≠ Spent ≠ Completed.");

  const sensitiveAnswer = await askQuestion(page, "Who stole the money?");
  await expect(sensitiveAnswer).toContainText("NOT ESTABLISHED BY AVAILABLE EVIDENCE");
  await expect(sensitiveAnswer).toContainText("cannot determine");
  await expect(sensitiveAnswer).toContainText("does not support an accusation");
  await expect(sensitiveAnswer).not.toContainText("Federal Ministry of Works and Housing");

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test("the receipt remains usable when an answer is unavailable", async ({ page }) => {
  await page.route(`**/api/receipt/${DEMO_RECEIPT_ID}/ask`, async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "answer_unavailable" }),
    });
  });

  await page.goto(`/receipt/${DEMO_RECEIPT_ID}`);
  await askQuestion(page, "What colour is the road?");

  await expect(page.getByTestId("receipt-question").getByRole("alert")).toContainText(
    "Public Receipt couldn't answer that safely right now.",
  );
  await expect(page.getByText("₦140,000,000").first()).toBeVisible();
  await expect(page.getByText("2026 Appropriation Act Details", { exact: true })).toBeVisible();
  await expect(
    page.locator(`a[href="/receipt/${DEMO_RECEIPT_ID}/source"]`).first(),
  ).toBeVisible();
});
