import { expect, test } from "@playwright/test";

const RECEIPT_ID = "PR-NG-FCT-2026-000001";

test("a source-backed receipt can be previewed, copied and downloaded", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`/receipt/${RECEIPT_ID}`);
  await page.getByRole("link", { name: "Share receipt" }).click();

  await expect(page).toHaveURL(`/receipt/${RECEIPT_ID}/share`);
  const card = page.getByTestId("share-receipt-card");
  await expect(card).toContainText("PUBLIC RECEIPT");
  await expect(card).toContainText(RECEIPT_ID);
  await expect(card).toContainText("Piri");
  await expect(card).toContainText("₦140,000,000");
  await expect(card).toContainText("OFFICIAL RECORD");
  await expect(card).toContainText("NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE");
  await expect(card).not.toContainText(/FAILED PROJECT|ABANDONED PROJECT|CORRUPTION|STOLEN FUNDS/);

  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByRole("status")).toHaveText("Receipt link copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(`/receipt/${RECEIPT_ID}`);

  const image = await page.request.get(`/api/receipt/${RECEIPT_ID}/card`);
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
  expect((await image.body()).byteLength).toBeGreaterThan(5_000);

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});
