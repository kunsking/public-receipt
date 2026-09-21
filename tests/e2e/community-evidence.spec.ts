import { expect, test } from "@playwright/test";

const DEMO_RECEIPT_ID = "PR-NG-FCT-2026-000001";

test("a resident can submit a clearly classified community report", async ({ page }) => {
  await page.route(`**/api/receipt/${DEMO_RECEIPT_ID}/evidence`, async (route) => {
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

  await page.goto(`/receipt/${DEMO_RECEIPT_ID}`);
  await page.getByRole("link", { name: /I know this project/ }).click();
  await expect(page).toHaveURL(`/receipt/${DEMO_RECEIPT_ID}/submit`);

  await page.getByLabel("Work appears incomplete").check();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel(/Add a photo/).setInputFiles({
    name: "not-an-image.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("not an image"),
  });
  await expect(
    page.getByText(
      "That image could not be accepted. Upload a JPEG, PNG or WebP image under 5 MB.",
      { exact: true },
    ),
  ).toBeVisible();

  await page.getByLabel(/Tell us what you observed/).fill("Drainage work appears incomplete.");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Area Council")).toHaveValue("Kwali");
  await page.getByLabel(/Locality/).fill("Piri");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText(/Review your submission/i)).toBeVisible();
  await expect(page.getByText("COMMUNITY REPORTED")).toBeVisible();
  await expect(page.getByText("UNVERIFIED")).toBeVisible();
  await page
    .getByLabel("I understand that this is a community report and is not automatically verified.")
    .check();
  await page.getByRole("button", { name: "Submit Evidence" }).click();

  await expect(page.getByText("Evidence received")).toBeVisible();
  await expect(page.getByText("PENDING REVIEW")).toBeVisible();
  await page
    .getByTestId("evidence-confirmation")
    .getByRole("link", { name: "Back to Receipt" })
    .click();

  await expect(page.getByText("₦140,000,000").first()).toBeVisible();
  await expect(page.getByText("OFFICIAL RECORD", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /View all community evidence/ }).click();
  await expect(page.getByText("No public community evidence yet")).toBeVisible();

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});
