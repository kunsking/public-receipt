import { expect, test } from "@playwright/test";

test("golden discovery returns a real hosted receipt", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "What did government promise your community?" }),
  ).toBeVisible();

  await page.getByLabel("Ask about a project, place or public service").fill("Roads in Kwali");
  await page.getByRole("button", { name: "Find a Receipt" }).click();

  await expect(page).toHaveURL(/\/search\?q=Roads(?:\+|%20)in(?:\+|%20)Kwali/);
  await expect(page.getByText("Location: Kwali")).toBeVisible();
  await expect(page.getByText("Sector: Roads & transport")).toBeVisible();

  const knownCard = page.getByTestId("project-card").filter({
    hasText: "PR-NG-FCT-2026-000001",
  });
  await expect(knownCard).toBeVisible();
  await expect(knownCard.getByText("₦140,000,000")).toBeVisible();
  await expect(knownCard.getByRole("link", { name: "View Receipt" })).toHaveAttribute(
    "href",
    "/receipt/PR-NG-FCT-2026-000001",
  );
});

test("impossible civic claim returns the honest no-results state", async ({ page }) => {
  await page.goto("/search?q=%E2%82%A650%20billion%20dragon%20hospital%20in%20Bwari");

  await expect(page.getByTestId("no-results")).toBeVisible();
  await expect(page.getByTestId("project-card")).toHaveCount(0);
  await expect(page.getByText("We couldn't find a match")).toBeVisible();
  await expect(
    page.getByText(/No result does not mean no government project exists/),
  ).toBeVisible();
});

test("bare Abuja asks the citizen to choose scope", async ({ page }) => {
  await page.goto("/search?q=Projects%20in%20Abuja");

  await expect(
    page.getByRole("heading", {
      name: "Do you mean the whole Federal Capital Territory or Abuja Municipal Area Council?",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "All FCT" })).toBeVisible();
  await expect(page.getByRole("button", { name: "AMAC" })).toBeVisible();
  await expect(page.getByTestId("project-card")).toHaveCount(0);
});

test("search and results remain usable without horizontal overflow", async ({ page }) => {
  await page.goto("/search?q=Roads%20in%20Kwali");
  await expect(page.getByTestId("project-results")).toBeVisible();

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
  await expect(page.getByLabel("Area Council")).toBeVisible();
  await expect(page.getByLabel("Sector")).toBeVisible();
  await expect(page.getByRole("link", { name: "View Receipt" }).first()).toBeVisible();
});
