import { expect, test } from "@playwright/test";

test("homepage exposes the core Public Receipt proposition", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "What did government promise your community?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Find a Receipt" })).toBeVisible();
});
