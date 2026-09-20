import { expect, test } from "@playwright/test";

const DEMO_RECEIPT_ID = "PR-NG-FCT-2026-000001";

test("golden search opens a source-backed receipt and provenance page", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Ask about a project, place or public service").fill("Roads in Kwali");
  await page.getByRole("button", { name: "Find a Receipt" }).click();

  const knownCard = page.getByTestId("project-card").filter({ hasText: DEMO_RECEIPT_ID });
  await expect(knownCard).toBeVisible();
  await knownCard.getByRole("link", { name: "View Receipt" }).click();

  await expect(page).toHaveURL(`/receipt/${DEMO_RECEIPT_ID}`);
  await expect(page.getByText(DEMO_RECEIPT_ID)).toBeVisible();
  await expect(page.getByText("₦140,000,000").first()).toBeVisible();
  await expect(page.getByText("OFFICIAL RECORD", { exact: true })).toBeVisible();
  await expect(page.getByText("Piri").first()).toBeVisible();
  await expect(page.getByText("Kwali Area Council, FCT", { exact: true })).toBeVisible();
  await expect(page.getByText("2026 Appropriation Act Details", { exact: true })).toBeVisible();

  await page.locator(`a[href="/receipt/${DEMO_RECEIPT_ID}/source"]`).click();
  await expect(page).toHaveURL(`/receipt/${DEMO_RECEIPT_ID}/source`);
  await expect(page.getByTestId("source-excerpt")).toContainText("ERGP12238012");
  await expect(page.getByTestId("source-excerpt")).toContainText("140,000,000");
  await expect(page.getByText("PDF 994; printed page 963")).toBeVisible();

  await page.getByRole("link", { name: "Back to receipt" }).click();
  await expect(page).toHaveURL(`/receipt/${DEMO_RECEIPT_ID}`);
  await expect(page.getByTestId("implementation-state")).toHaveText(
    "NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE",
  );
  await expect(
    page.getByText(/This does not mean the project was not implemented/),
  ).toBeVisible();

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test("unknown and malformed receipt IDs return the safe receipt not-found state", async ({ page }) => {
  for (const path of [
    "/receipt/PR-NG-FCT-2026-999999",
    "/receipt/not-a-valid-receipt",
  ]) {
    await page.goto(path);
    await expect(page.getByText("PUBLIC RECEIPT NOT FOUND")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "We don't currently have a verified record for this receipt ID.",
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Search Public Records" })).toBeVisible();
    await expect(page.getByText("₦140,000,000")).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  }
});
