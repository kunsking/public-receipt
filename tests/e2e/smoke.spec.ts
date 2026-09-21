import { expect, test } from "@playwright/test";

test("homepage exposes the core Public Receipt proposition", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Public Receipt — Every public project deserves a public receipt");
  await expect(page.getByText("PUBLIC RECEIPT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Every public project deserves a public receipt.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What did government promise your community?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Find a Receipt" })).toBeVisible();
  for (const suggestion of [
    "Roads in Kwali",
    "Healthcare in Gwagwalada",
    "Schools in Bwari",
    "Water in Kwali",
  ]) {
    await expect(page.getByRole("link", { name: suggestion })).toBeVisible();
  }
  await expect(page.locator('a[href="/explore"]')).toHaveCount(0);
  await expect(page.locator('a[href="/community"]')).toHaveCount(0);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#171717");

  const manifestResponse = await page.request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({
    name: "Public Receipt",
    short_name: "Public Receipt",
    display: "standalone",
    theme_color: "#171717",
    background_color: "#f7f4ee",
  });
  expect(manifest.icons).toContainEqual(
    expect.objectContaining({ src: "/icon", type: "image/png" }),
  );
  const iconResponse = await page.request.get("/icon");
  expect(iconResponse.ok()).toBe(true);
  expect(iconResponse.headers()["content-type"]).toContain("image/png");
});
